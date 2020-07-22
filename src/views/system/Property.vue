<template>
    <div>
        <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
            <el-form-item label="属性名" prop="name">
                <el-input v-model="queryModel.name" clearable maxlength="30" placeholder="请输入属性名" style="width: 240px" />
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
            <el-table-column header-align="center" align="left" label="属性名" prop="name" min-width="220px" />
            <el-table-column header-align="center" align="left" label="属性值" prop="value" min-width="100px" />
            <el-table-column header-align="center" align="left" label="描述" prop="description" min-width="200px" show-overflow-tooltip />
            <el-table-column header-align="center" align="center" label="创建时间" prop="createGmt" width="185px" />
            <el-table-column header-align="center" align="center" label="修改时间" prop="modifiedGmt" width="185px" />
            <el-table-column header-align="center" align="left" label="操作" fixed="right" :width="operationColumnWidth + 'px'" v-if="operationColumnWidth > 0">
                <template slot-scope="scope">
                    <el-button type="primary" @click="handleEdit(scope.row.id)" v-if="showEditButton">修改</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row.id)" v-if="showDeleteButton">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px" :before-close="dialogClose" append-to-body>
            <el-form :model="dialogData" ref="dialogForm" label-width="auto" :rules="dialogRules">
                <el-form-item label="属性名" prop="name">
                    <el-input v-model="dialogData.name" placeholder="请输入属性名" maxlength="30" style="width: 240px" />
                </el-form-item>
                <el-form-item label="属性值" prop="value">
                    <el-input v-model="dialogData.value" placeholder="请输入属性值" maxlength="30" style="width: 240px" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="dialogData.description" placeholder="请输入描述" type="textarea" :rows="5" maxlength="200" show-word-limit style="width: 240px" />
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
import PropertyBO from "@/views/system/entity/PropertyBO"
import PropertyDTO from "@/views/system/entity/PropertyDTO"

@Component
export default class Property extends Vue {
    // 加载中
    fullScreenLoading = false
    // 查询条件
    queryModel = {
        pageNum: 1,
        pageSize: 10,
        name: null
    }
    // 总行数
    rows = 0
    // 表格数据
    tableData: PropertyBO[] = []
    // 是否显示新增按钮
    showAddButton = AuthorizeUtils.hasAuthority("POST/property")
    // 是否显示修改按钮
    showEditButton = AuthorizeUtils.hasAuthority("PUT/property")
    // 是否显示删除按钮
    showDeleteButton = AuthorizeUtils.hasAuthority("DELETE/property/{id}")
    // 操作列宽度
    operationColumnWidth = 0
    // 对话框标题
    dialogTitle = ""
    // 对话框是否显示
    dialogVisible = false
    // 对话框数据
    dialogData: PropertyDTO = {
        id: 0,
        name: "",
        value: "",
        description: ""
    }
    // 对话框校验
    dialogRules = {
        name: [{ required: true, message: "请输入属性名", trigger: "blur" }],
        value: [{ required: true, message: "请输入属性值", trigger: "blur" }]
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
        let num = 0
        if (this.showEditButton) {
            num += 1
        }

        if (this.showDeleteButton) {
            num += 1
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
        AxiosUtils.get("/property", { params: this.queryModel }).then((response) => {
            const result = response as Result<PropertyBO[]>
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

        AxiosUtils.get("/property/" + id).then((response) => {
            this.dialogData = (response as Result<PropertyDTO>).data
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
                AxiosUtils.delete("/property/" + id).then(() => {
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
                    AxiosUtils.post("/property", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(1)
                    })
                } else {
                    AxiosUtils.put("/property", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(this.queryModel.pageNum)
                    })
                }
            }
        })
    }
}
</script>
