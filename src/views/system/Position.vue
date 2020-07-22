<template>
    <div>
        <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
            <el-form-item label="名称" prop="name">
                <el-input v-model="queryModel.name" clearable maxlength="30" placeholder="请输入名称" style="width: 240px" />
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
            <el-table-column header-align="center" align="left" label="名称" prop="name" min-width="240px" />
            <el-table-column header-align="center" align="center" label="创建时间" prop="createGmt" width="185px" />
            <el-table-column header-align="center" align="center" label="修改时间" prop="modifiedGmt" width="185px" />
            <el-table-column header-align="center" align="left" label="操作" fixed="right" :width="operationColumnWidth + 'px'" v-if="operationColumnWidth > 0">
                <template slot-scope="scope">
                    <el-button type="primary" @click="handleEdit(scope.row.id)" v-if="showEditButton">修改</el-button>
                    <el-button type="primary" @click="handlerUpdateSort(scope.row.id, 1)" v-if="showUpdateSortButton">上移</el-button>
                    <el-button type="primary" @click="handlerUpdateSort(scope.row.id, 2)" v-if="showUpdateSortButton">下移</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row.id)" v-if="showDeleteButton">删除</el-button>
                    <el-button type="primary" @click="handleRelationEmployee(scope.row.id)" v-if="showRelationEmployeeButton">关联员工</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px" :before-close="dialogClose" append-to-body>
            <el-form :model="dialogData" ref="dialogForm" label-width="auto" :rules="dialogRules">
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
import PositionBO from "@/views/system/entity/PositionBO"
import PositionDTO from "@/views/system/entity/PositionDTO"

@Component
export default class Position extends Vue {
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
    tableData: PositionBO[] = []
    // 是否显示新增按钮
    showAddButton = AuthorizeUtils.hasAuthority("POST/position")
    // 是否显示修改按钮
    showEditButton = AuthorizeUtils.hasAuthority("PUT/position")
    // 是否显示删除按钮
    showDeleteButton = AuthorizeUtils.hasAuthority("DELETE/position/{id}")
    // 是否显示修改排序按钮
    showUpdateSortButton = AuthorizeUtils.hasAuthority("PUT/position-sort")
    // 是否显示关联员工按钮
    showRelationEmployeeButton = AuthorizeUtils.hasAuthority("GET/position-employee")
    // 操作列宽度
    operationColumnWidth = 0
    // 对话框标题
    dialogTitle = ""
    // 对话框是否显示
    dialogVisible = false
    // 对话框数据
    dialogData: PositionDTO = {
        id: 0,
        name: ""
    }
    // 对话框校验
    dialogRules = {
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
        let num = 0
        if (this.showEditButton) {
            num += 1
        }

        if (this.showDeleteButton) {
            num += 1
        }

        if (this.showRelationEmployeeButton) {
            num += 1.5
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
        AxiosUtils.get("/position", { params: this.queryModel }).then((response) => {
            const result = response as Result<PositionBO[]>
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

        AxiosUtils.get("/position/" + id).then((response) => {
            this.dialogData = (response as Result<PositionDTO>).data
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
                AxiosUtils.delete("/position/" + id).then(() => {
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
        AxiosUtils.put("/position-sort", {
            id: id,
            moveTypeCode: moveTypeCode
        }).then(() => {
            this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
            this.search(this.queryModel.pageNum)
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
                    AxiosUtils.post("/position", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(1)
                    })
                } else {
                    AxiosUtils.put("/position", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(this.queryModel.pageNum)
                    })
                }
            }
        })
    }

    /**
     * 关联员工
     */
    handleRelationEmployee(id: number) {
        this.$router.replace({
            path: "/position-employee",
            query: {
                positionId: id + ""
            }
        })
    }
}
</script>
