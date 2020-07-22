<template>
    <div>
        <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
            <el-form-item label="用户姓名" prop="loginUserName">
                <el-input v-model="queryModel.loginUserName" clearable maxlength="30" placeholder="请输入用户姓名" style="width: 240px" />
            </el-form-item>
            <el-form-item label="用户手机号码" prop="loginUserPhoneNumber">
                <el-input v-model="queryModel.loginUserPhoneNumber" clearable maxlength="11" placeholder="请输入用户手机号码" style="width: 240px" />
            </el-form-item>
            <el-form-item label="登陆日期" prop="createGmt">
                <el-date-picker v-model="queryModel.createGmt" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" style="width: 240px" />
            </el-form-item>
            <el-form-item label="状态" prop="statusCode">
                <el-select v-model="queryModel.statusCode" placeholder="请选择" clearable style="width: 240px">
                    <el-option v-for="loginStatusDict in loginStatusDicts" :key="loginStatusDict.code" :label="loginStatusDict.name" :value="loginStatusDict.code" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search(1)" v-loading.fullscreen.lock="fullScreenLoading">搜索</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <el-button-group>
            <el-button type="danger" @click="handleBatchDelete" :disabled="buttonStatus" v-if="showBatchDeleteButton">批量删除</el-button>
            <el-button type="danger" @click="handleEmpty" v-if="showEmptyButton">清空</el-button>
        </el-button-group>
        <el-table :data="tableData" stripe border max-height="520px" @selection-change="handleSelectionChange">
            <el-table-column header-align="center" align="center" type="selection" width="40px" />
            <el-table-column header-align="center" type="index" label="序号" width="50px" />
            <el-table-column header-align="center" align="left" label="用户姓名" prop="loginUserName" min-width="100px" />
            <el-table-column header-align="center" align="center" label="用户手机号码" prop="loginUserPhoneNumber" min-width="120px" />
            <el-table-column header-align="center" align="left" label="IP" prop="ip" min-width="130px" />
            <el-table-column header-align="center" align="left" label="地理位置" prop="location" min-width="150px" />
            <el-table-column header-align="center" align="left" label="操作系统" prop="os" min-width="100px" />
            <el-table-column header-align="center" align="left" label="浏览器" prop="browser" min-width="120px" />
            <el-table-column header-align="center" align="center" label="状态" prop="status" min-width="50px" />
            <el-table-column header-align="center" align="left" label="错误信息" prop="errorMsg" min-width="150px" />
            <el-table-column header-align="center" align="center" label="登陆时间" prop="createGmt" width="185px" />
        </el-table>
        <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { Form } from "element-ui"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import DictCodeConstant from "@/common/DictCodeConstant"
import DictUtils from "@/common/DictUtils"
import DictBO from "@/common/DictBO"
import AuthorizeUtils from "@/common/AuthorizeUtils"
import LoginLogBO from "@/views/system/entity/LoginLogBO"

@Component
export default class LoginLog extends Vue {
    // 加载中
    fullScreenLoading = false
    // 查询条件
    queryModel = {
        pageNum: 1,
        pageSize: 10,
        loginUserName: null,
        loginUserPhoneNumber: null,
        statusCode: null,
        createGmt: null,
        startCreateGmt: null,
        endCreateGmt: null
    }
    // 总行数
    rows = 0
    // 表格数据
    tableData: LoginLogBO[] = []
    // 登陆状态字典
    loginStatusDicts: DictBO[] = DictUtils.list(DictCodeConstant.LOGIN_STATUS)
    // 按钮状态. 默认禁用
    buttonStatus = true
    // 多选选中 ids
    selectedIds: number[] = []
    // 是否显示批量删除按钮
    showBatchDeleteButton = AuthorizeUtils.hasAuthority("DELETE/login-log")
    // 是否显示清空按钮
    showEmptyButton = AuthorizeUtils.hasAuthority("DELETE/login-log-empty")

    /**
     * created
     */
    created() {
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
        const createGmt = this.queryModel.createGmt
        if (createGmt != null) {
            this.queryModel.startCreateGmt = createGmt[0]
            this.queryModel.endCreateGmt = createGmt[1]
            this.queryModel.createGmt = null
        }

        this.fullScreenLoading = true
        this.queryModel.pageNum = pageNum
        AxiosUtils.get("/login-log", { params: this.queryModel }).then((response) => {
            const result = response as Result<LoginLogBO[]>
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
    handleSelectionChange(selectedRows: LoginLogBO[]) {
        this.selectedIds = []

        if (selectedRows.length <= 0) {
            this.buttonStatus = true
        } else {
            this.buttonStatus = false
            for (const selectedRow of selectedRows) {
                this.selectedIds.push(selectedRow.id)
            }
        }
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
                AxiosUtils.delete("/login-log", {
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
     * 清空
     */
    handleEmpty() {
        this.$confirm("确定清空? 清空后仅保留最近一个月数据.", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                AxiosUtils.delete("/login-log-empty").then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                    this.search(1)
                })
            })
            .catch(() => {
                this.$message.info("已取消")
            })
    }
}
</script>
