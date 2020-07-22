<template>
    <div>
        <el-row>
            <el-col :span="4">
                <el-tree :data="treeData" :props="treeProps" node-key="id" highlight-current accordion ref="tree" @node-click="handlerNodeClick" />
            </el-col>
            <el-col :span="20">
                <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
                    <el-form-item label="状态" prop="statusCode">
                        <el-select v-model="queryModel.statusCode" placeholder="请选择" clearable style="width: 240px">
                            <el-option v-for="resourceStatusDict in resourceStatusDicts" :key="resourceStatusDict.code" :label="resourceStatusDict.name" :value="resourceStatusDict.code" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="search(1)" v-loading.fullscreen.lock="fullScreenLoading">搜索</el-button>
                        <el-button @click="reset">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-button-group>
                    <el-button type="primary" @click="handleAdd" v-if="showAddButton">新增</el-button>
                </el-button-group>
                <el-table :data="tableData" stripe border max-height="520px">
                    <el-table-column header-align="center" type="index" label="序号" width="50px" />
                    <el-table-column header-align="center" align="left" label="名称" prop="name" min-width="100px" />
                    <el-table-column header-align="center" align="center" label="类型" prop="type" min-width="50px" />
                    <el-table-column header-align="center" align="left" label="请求方式" prop="requestMethod" min-width="70px" />
                    <el-table-column header-align="center" align="left" label="地址" prop="url" min-width="180px" />
                    <el-table-column header-align="center" align="center" label="状态" prop="status" min-width="50px" />
                    <el-table-column header-align="center" align="left" label="图标" prop="icon" min-width="150px" />
                    <el-table-column header-align="center" align="center" label="创建时间" prop="createGmt" width="185px" />
                    <el-table-column header-align="center" align="center" label="修改时间" prop="modifiedGmt" width="185px" />
                    <el-table-column header-align="center" align="left" label="操作" fixed="right" :width="operationColumnWidth + 'px'" v-if="operationColumnWidth > 0">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="handleEdit(scope.row.id)" v-if="showEditButton">修改</el-button>
                            <el-button type="primary" @click="handlerUpdateStatus(scope.row.id, 1)" v-if="showUpdateStatusButton && scope.row.statusCode == '2'">启用</el-button>
                            <el-button type="primary" @click="handlerUpdateStatus(scope.row.id, 2)" v-if="showUpdateStatusButton && scope.row.statusCode == '1'">禁用</el-button>
                            <el-button type="primary" @click="handlerUpdateSort(scope.row.id, 1)" v-if="showUpdateSortButton">上移</el-button>
                            <el-button type="primary" @click="handlerUpdateSort(scope.row.id, 2)" v-if="showUpdateSortButton">下移</el-button>
                            <el-button type="danger" @click="handleDelete(scope.row.id)" v-if="showDeleteButton">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </el-col>
            <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px" :before-close="dialogClose" append-to-body>
                <el-form :model="dialogData" ref="dialogForm" label-width="auto" :rules="dialogRules">
                    <el-form-item label="名称" prop="name">
                        <el-input v-model="dialogData.name" placeholder="请输入名称" maxlength="30" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="类型" prop="typeCode">
                        <el-select v-model="dialogData.typeCode" placeholder="请选择" style="width: 240px">
                            <el-option v-for="resourceTypeDict in resourceTypeDicts" :key="resourceTypeDict.code" :label="resourceTypeDict.name" :value="resourceTypeDict.code" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="请求方式" prop="requestMethod">
                        <el-select v-model="dialogData.requestMethod" placeholder="请选择" style="width: 240px">
                            <el-option v-for="requestMethodDict in requestMethodDicts" :key="requestMethodDict.code" :label="requestMethodDict.name" :value="requestMethodDict.code" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="地址" prop="url">
                        <el-input v-model="dialogData.url" placeholder="请输入地址" maxlength="30" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="状态" prop="statusCode">
                        <el-select v-model="dialogData.statusCode" placeholder="请选择" style="width: 240px">
                            <el-option v-for="resourceStatusDict in resourceStatusDicts" :key="resourceStatusDict.code" :label="resourceStatusDict.name" :value="resourceStatusDict.code" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="图标" prop="icon">
                        <el-input v-model="dialogData.icon" placeholder="请输入图标" maxlength="30" style="width: 240px" />
                    </el-form-item>
                </el-form>
                <span slot="footer">
                    <el-button @click="dialogCancel">取消</el-button>
                    <el-button type="primary" @click="dialogConfirm">确定</el-button>
                </span>
            </el-dialog>
        </el-row>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { Form, Tree } from "element-ui"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import AuthorizeUtils from "@/common/AuthorizeUtils"
import CommonConstant from "@/common/CommonConstant"
import DictCodeConstant from "@/common/DictCodeConstant"
import DictUtils from "@/common/DictUtils"
import DictBO from "@/common/DictBO"
import ResourceTreeBO from "@/views/system/entity/ResourceTreeBO"
import ResourceBO from "@/views/system/entity/ResourceBO"
import ResourceDTO from "@/views/system/entity/ResourceDTO"

@Component
export default class Resource extends Vue {
    // 树数据
    treeData: ResourceTreeBO[] = []
    // 树属性
    treeProps = {
        children: "children",
        label: "name"
    }
    // 当前选中的节点
    currentNodeKey = 0
    // 加载中
    fullScreenLoading = false
    // 查询条件
    queryModel = {
        pageNum: 1,
        pageSize: 10,
        parentId: 0,
        statusCode: null
    }
    // 总行数
    rows = 0
    // 表格数据
    tableData: ResourceBO[] = []
    // 是否显示新增按钮
    showAddButton = AuthorizeUtils.hasAuthority("POST/resource")
    // 是否显示修改按钮
    showEditButton = AuthorizeUtils.hasAuthority("PUT/resource")
    // 是否显示删除按钮
    showDeleteButton = AuthorizeUtils.hasAuthority("DELETE/resource/{id}")
    // 是否显示修改排序按钮
    showUpdateSortButton = AuthorizeUtils.hasAuthority("PUT/resource-sort")
    // 是否显示修改状态按钮
    showUpdateStatusButton = AuthorizeUtils.hasAuthority("PUT/resource-status")
    // 资源状态字典
    resourceStatusDicts: DictBO[] = DictUtils.list(DictCodeConstant.RESOURCE_STATUS)
    //  资源类型字典
    resourceTypeDicts: DictBO[] = DictUtils.list(DictCodeConstant.RESOURCE_TYPE)
    // 请求方式字典
    requestMethodDicts: DictBO[] = DictUtils.list(DictCodeConstant.REQUEST_METHOD)
    // 操作列宽度
    operationColumnWidth = 0
    // 对话框标题
    dialogTitle = ""
    // 对话框是否显示
    dialogVisible = false
    // 对话框数据
    dialogData: ResourceDTO = {
        id: 0,
        parentId: 0,
        name: "",
        typeCode: "1",
        requestMethod: "GET",
        url: "",
        statusCode: "1",
        icon: ""
    }
    // 对话框校验
    dialogRules = {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }]
    }

    /**
     * created
     */
    created() {
        this.changedReload(1)
        this.operationColumnWidth = this.getOperationColumnWidth()
    }

    /**
     * 改变后重新加载
     */
    changedReload(pageNum: number) {
        AxiosUtils.get("/resource-tree").then((response) => {
            const result = response as Result<ResourceTreeBO[]>
            this.treeData = [{ id: 0, name: "资源树", children: [...result.data] }]

            this.search(pageNum)
            this.$nextTick(() => {
                ;(this.$refs["tree"] as Tree).setCurrentKey(this.currentNodeKey)
            })
        })
    }

    /**
     * 获取操作列宽度
     */
    getOperationColumnWidth(): number {
        let num = 0
        if (this.showEditButton) {
            num += 1
        }

        if (this.showDeleteButton) {
            num += 1
        }

        if (this.showUpdateStatusButton) {
            num += 1
        }

        if (this.showUpdateSortButton) {
            num += 2
        }

        return CommonConstant.OPERATION_COLUMN_WIDTH * num
    }

    /**
     * 修改每页大小
     */
    handleSizeChange(pageSize: number) {
        this.queryModel.pageSize = pageSize
        this.search(1)
    }

    /**
     * 修改当前页
     */
    handleCurrentChange(pageNum: number) {
        this.search(pageNum)
    }

    /**
     * 搜索
     */
    search(pageNum: number) {
        this.fullScreenLoading = true
        this.queryModel.pageNum = pageNum
        this.queryModel.parentId = this.currentNodeKey
        AxiosUtils.get("/resource", { params: this.queryModel }).then((response) => {
            const result = response as Result<ResourceBO[]>
            this.rows = result.rows
            this.tableData = result.data
            this.fullScreenLoading = false
        })
    }

    /**
     * 重置
     */
    reset() {
        ;(this.$refs["queryForm"] as Form).resetFields()
        this.search(1)
    }

    /**
     * 树节点点击
     */
    handlerNodeClick() {
        this.currentNodeKey = (this.$refs["tree"] as Tree).getCurrentKey()
        this.search(1)
    }

    /**
     * 新增
     */
    handleAdd() {
        this.dialogTitle = "新增"
        this.dialogVisible = true
    }

    /**
     * 修改
     */
    handleEdit(id: number) {
        this.dialogTitle = "修改"
        this.dialogVisible = true

        AxiosUtils.get("/resource/" + id).then((response) => {
            this.dialogData = (response as Result<ResourceDTO>).data
            this.dialogData.typeCode = this.dialogData.typeCode + ""
            this.dialogData.requestMethod = this.dialogData.requestMethod + ""
            this.dialogData.statusCode = this.dialogData.statusCode + ""
        })
    }

    /**
     * 删除
     */
    handleDelete(id: number) {
        this.$confirm("确定删除?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                AxiosUtils.delete("/resource/" + id).then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)

                    let pageNum = this.queryModel.pageNum
                    const pages = Math.floor((this.rows - 2) / this.queryModel.pageSize) + 1
                    if (pageNum > pages) {
                        pageNum = pages
                    }

                    this.changedReload(pageNum)
                })
            })
            .catch(() => {
                this.$message.info("已取消")
            })
    }

    /**
     * 修改排序
     */
    handlerUpdateSort(id: number, moveTypeCode: number) {
        AxiosUtils.put("/resource-sort", {
            id: id,
            moveTypeCode: moveTypeCode
        }).then(() => {
            this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
            this.changedReload(this.queryModel.pageNum)
        })
    }

    /**
     * 修改状态
     */
    handlerUpdateStatus(id: number, statusCode: number) {
        AxiosUtils.put("/resource-status", {
            id: id,
            statusCode: statusCode
        }).then(() => {
            this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
            this.changedReload(this.queryModel.pageNum)
        })
    }

    /**
     * 对话框关闭
     */
    dialogClose() {
        this.dialogVisible = false
        this.dialogData.id = 0
        ;(this.$refs["dialogForm"] as Form).resetFields()
    }

    /**
     * 对话框取消
     */
    dialogCancel() {
        this.dialogClose()
    }

    /**
     * 对话框确定
     */
    dialogConfirm() {
        ;(this.$refs["dialogForm"] as Form).validate((valid: boolean) => {
            if (valid) {
                if (this.dialogData.id == 0) {
                    this.dialogData.parentId = this.currentNodeKey
                    AxiosUtils.post("/resource", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.changedReload(1)
                    })
                } else {
                    AxiosUtils.put("/resource", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.changedReload(this.queryModel.pageNum)
                    })
                }
            }
        })
    }
}
</script>
