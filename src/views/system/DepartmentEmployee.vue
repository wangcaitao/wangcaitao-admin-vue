<template>
    <div>
        <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
            <el-form-item label="员工姓名" prop="employeeName">
                <el-input v-model="queryModel.employeeName" clearable maxlength="30" placeholder="请输入员工姓名" style="width: 240px" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phoneNumber">
                <el-input v-model="queryModel.phoneNumber" clearable maxlength="11" placeholder="请输入手机号码" style="width: 240px" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search(1)" v-loading.fullscreen.lock="fullScreenLoading">搜索</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <el-button-group>
            <el-button @click="goBack">返回</el-button>
            <el-button type="primary" @click="handleBatchRelation" :disabled="buttonStatus" v-if="showBatchRelationButton && relationStatusCode == '0'">批量关联</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="buttonStatus" v-if="showBatchDeleteButton && relationStatusCode == '1'">批量删除</el-button>
        </el-button-group>
        <el-tabs v-model="relationStatusCode" @tab-click="handleTabClick">
            <el-tab-pane label="已关联" name="1" />
            <el-tab-pane label="未关联" name="0" />
        </el-tabs>
        <el-table :data="tableData" stripe border max-height="520px" @selection-change="handleSelectionChange">
            <el-table-column header-align="center" align="center" type="selection" width="40px" />
            <el-table-column header-align="center" type="index" label="序号" width="50px" />
            <el-table-column header-align="center" align="center" label="部门" prop="departmentName" min-width="100px" v-if="relationStatusCode == '1'" />
            <el-table-column header-align="center" align="left" label="员工姓名" prop="employeeName" min-width="100px" />
            <el-table-column header-align="center" align="center" label="手机号码" prop="phoneNumber" min-width="120px" />
        </el-table>
        <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { Form } from "element-ui"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import AuthorizeUtils from "@/common/AuthorizeUtils"
import DepartmentEmployeeBO from "@/views/system/entity/DepartmentEmployeeBO"

@Component
export default class DepartmentEmployee extends Vue {
    // 加载中
    fullScreenLoading = false
    // 查询条件
    queryModel = {
        pageNum: 1,
        pageSize: 10,
        departmentId: 0,
        relationStatusCode: "1",
        employeeName: null,
        phoneNumber: null
    }
    // departmentId
    departmentId = 0
    // 关联状态
    relationStatusCode = "1"
    // 总行数
    rows = 0
    // 表格数据
    tableData: DepartmentEmployeeBO[] = []
    // 按钮状态. 默认禁用
    buttonStatus = true
    // 多选选中 ids
    selectedIds: number[] = []
    // 多选选中 employeeIds
    selectedEmployeeIds: number[] = []
    // 是否显示批量删除按钮
    showBatchDeleteButton = AuthorizeUtils.hasAuthority("DELETE/department-employee")
    // 是否显示批量关联按钮
    showBatchRelationButton = AuthorizeUtils.hasAuthority("POST/department-employee")

    /**
     * created
     */
    created() {
        this.departmentId = Number(this.$route.query.departmentId)
        if (isNaN(this.departmentId)) {
            this.$message.error("参数错误")
            this.goBack()

            return
        }

        this.search(1)
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
        this.queryModel.departmentId = this.departmentId
        this.queryModel.relationStatusCode = this.relationStatusCode
        AxiosUtils.get("/department-employee", { params: this.queryModel }).then((response) => {
            const result = response as Result<DepartmentEmployeeBO[]>
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
     * 表格多选
     */
    handleSelectionChange(selectedRows: DepartmentEmployeeBO[]) {
        this.selectedIds = []
        this.selectedEmployeeIds = []

        if (selectedRows.length <= 0) {
            this.buttonStatus = true
        } else {
            this.buttonStatus = false
            if (this.relationStatusCode == "0") {
                for (const selectedRow of selectedRows) {
                    this.selectedEmployeeIds.push(selectedRow.employeeId)
                }
            } else if (this.relationStatusCode == "1") {
                for (const selectedRow of selectedRows) {
                    this.selectedIds.push(selectedRow.id)
                }
            }
        }
    }

    /**
     * tab 点击
     */
    handleTabClick() {
        this.search(1)
    }

    /**
     * 批量关联
     */
    handleBatchRelation() {
        this.$confirm("确定关联?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                AxiosUtils.post("/department-employee", {
                    departmentId: this.departmentId,
                    employeeIds: this.selectedEmployeeIds
                }).then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                    this.buttonStatus = true

                    let pageNum = this.queryModel.pageNum
                    const pages = Math.floor((this.rows - this.selectedEmployeeIds.length - 1) / this.queryModel.pageSize) + 1
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
     * 批量删除
     */
    handleBatchDelete() {
        this.$confirm("确定删除?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                AxiosUtils.delete("/department-employee", {
                    data: this.selectedIds
                }).then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                    this.buttonStatus = true

                    let pageNum = this.queryModel.pageNum
                    const pages = Math.floor((this.rows - this.selectedIds.length - 1) / this.queryModel.pageSize) + 1
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
     * 返回父级
     */
    goBack() {
        this.$router.replace({
            path: "/department"
        })
    }
}
</script>
