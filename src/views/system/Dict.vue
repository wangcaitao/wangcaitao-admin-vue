<template>
    <div>
        <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
            <el-form-item label="编码" prop="code">
                <el-input v-model="queryModel.code" clearable maxlength="30" placeholder="请输入编码" style="width: 240px" />
            </el-form-item>
            <el-form-item label="名称" prop="name">
                <el-input v-model="queryModel.name" clearable maxlength="30" placeholder="请输入名称" style="width: 240px" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search(1)" v-loading.fullscreen.lock="fullScreenLoading">搜索</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <el-button-group>
            <el-button @click="goBack" v-if="parentCode != ''">返回</el-button>
            <el-button type="primary" @click="handleAdd" v-if="showAddButton">新增</el-button>
        </el-button-group>
        <el-table :data="tableData" stripe border max-height="520px">
            <el-table-column header-align="center" type="index" label="序号" width="50px" />
            <el-table-column header-align="center" align="left" label="编码" prop="code" min-width="200px" />
            <el-table-column header-align="center" align="left" label="名称" prop="name" min-width="150px" />
            <el-table-column header-align="center" align="center" label="创建时间" prop="createGmt" width="185px" />
            <el-table-column header-align="center" align="center" label="修改时间" prop="modifiedGmt" width="185px" />
            <el-table-column header-align="center" align="left" label="操作" fixed="right" :width="operationColumnWidth + 'px'" v-if="operationColumnWidth > 0">
                <template slot-scope="scope">
                    <el-button type="primary" @click="handlerShowChildrenData(scope.row.code)" v-if="parentCode == ''">子集数据</el-button>
                    <el-button type="primary" @click="handleEdit(scope.row.id)" v-if="showEditButton">修改</el-button>
                    <el-button type="primary" @click="handlerUpdateSort(scope.row.id, 1)" v-if="showUpdateSortButton && parentCode != ''">上移</el-button>
                    <el-button type="primary" @click="handlerUpdateSort(scope.row.id, 2)" v-if="showUpdateSortButton && parentCode != ''">下移</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row.id)" v-if="showDeleteButton">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px" :before-close="dialogClose" append-to-body>
            <el-form :model="dialogData" ref="dialogForm" label-width="auto" :rules="dialogRules">
                <el-form-item label="编码" prop="code">
                    <el-input v-model="dialogData.code" placeholder="请输入编码" maxlength="30" style="width: 240px" />
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="dialogData.name" placeholder="请输入名称" maxlength="30" style="width: 240px" />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="dialogCancel">取消</el-button>
                <el-button type="primary" @click="dialogConfirm">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { Form } from "element-ui"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import AuthorizeUtils from "@/common/AuthorizeUtils"
import CommonConstant from "@/common/CommonConstant"
import DictBO from "@/views/system/entity/DictBO"
import DictDTO from "@/views/system/entity/DictDTO"

@Component
export default class Dict extends Vue {
    // 加载中
    fullScreenLoading = false
    // 查询条件
    queryModel = {
        pageNum: 1,
        pageSize: 10,
        parentCode: "",
        code: null,
        name: null
    }
    // 总行数
    rows = 0
    // 表格数据
    tableData: DictBO[] = []
    // 是否显示新增按钮
    showAddButton = AuthorizeUtils.hasAuthority("POST/dict")
    // 是否显示修改按钮
    showEditButton = AuthorizeUtils.hasAuthority("PUT/dict")
    // 是否显示删除按钮
    showDeleteButton = AuthorizeUtils.hasAuthority("DELETE/dict/{id}")
    // 是否显示修改排序按钮
    showUpdateSortButton = AuthorizeUtils.hasAuthority("PUT/dict-sort")
    // 操作列宽度
    operationColumnWidth = 0
    // 父级编码
    parentCode = ""
    // 对话框标题
    dialogTitle = ""
    // 对话框是否显示
    dialogVisible = false
    // 对话框数据
    dialogData: DictDTO = {
        id: 0,
        parentCode: "",
        name: "",
        code: ""
    }

    // 参数校验
    validateCode: object = (rule: object, value: string, callback: (e?: string) => void) => {
        if (this.dialogData.parentCode == "") {
            if (value == "") {
                callback("请输入编码")
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    // 对话框校验
    dialogRules = {
        code: [{ validator: this.validateCode, trigger: "blur" }],
        name: [{ required: true, message: "请输入名称", trigger: "blur" }]
    }

    /**
     * created
     */
    created() {
        this.operationColumnWidth = this.getOperationColumnWidth()
        this.search(1)
    }

    /**
     * 获取操作列宽度
     */
    getOperationColumnWidth(): number {
        let num = this.parentCode == "" ? 1.2 : 0
        if (this.showEditButton) {
            num += 1
        }

        if (this.showDeleteButton) {
            num += 1
        }

        if (this.showUpdateSortButton && this.parentCode != "") {
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
        AxiosUtils.get("/dict", { params: this.queryModel }).then((response) => {
            const result = response as Result<DictBO[]>
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

        AxiosUtils.get("/dict/" + id).then((response) => {
            this.dialogData = (response as Result<DictDTO>).data
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
                AxiosUtils.delete("/dict/" + id).then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)

                    let pageNum = this.queryModel.pageNum
                    const pages = Math.floor((this.rows - 2) / this.queryModel.pageSize) + 1
                    if (pageNum > pages) {
                        pageNum = pages
                    }

                    this.search(pageNum)
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
        AxiosUtils.put("/dict-sort", {
            id: id,
            moveTypeCode: moveTypeCode
        }).then(() => {
            this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
            this.search(this.queryModel.pageNum)
        })
    }

    /**
     * 获取子集数据
     */
    handlerShowChildrenData(code: string) {
        this.queryModel.parentCode = code
        this.parentCode = code
        this.operationColumnWidth = this.getOperationColumnWidth()
        this.search(1)
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
        this.dialogData.parentCode = this.parentCode
        ;(this.$refs["dialogForm"] as Form).validate((valid: boolean) => {
            if (valid) {
                if (this.dialogData.id == 0) {
                    AxiosUtils.post("/dict", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(1)
                    })
                } else {
                    AxiosUtils.put("/dict", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(this.queryModel.pageNum)
                    })
                }
            }
        })
    }

    /**
     * 返回父级
     */
    goBack() {
        this.queryModel.parentCode = ""
        this.parentCode = ""
        this.dialogData.parentCode = ""
        this.operationColumnWidth = this.getOperationColumnWidth()
        this.search(1)
    }
}
</script>
