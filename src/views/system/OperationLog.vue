<template>
    <div>
        <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
            <el-form-item label="操作人姓名" prop="operatorName">
                <el-input v-model="queryModel.operatorName" clearable maxlength="30" placeholder="请输入操作人姓名" style="width: 240px" />
            </el-form-item>
            <el-form-item label="操作人手机号码" prop="operatorPhoneNumber">
                <el-input v-model="queryModel.operatorPhoneNumber" clearable maxlength="30" placeholder="请输入操作人手机号码" style="width: 240px" />
            </el-form-item>
            <el-form-item label="状态" prop="statusCode">
                <el-select v-model="queryModel.statusCode" placeholder="请选择" clearable style="width: 240px">
                    <el-option v-for="operationStatusDict in operationStatusDicts" :key="operationStatusDict.code" :label="operationStatusDict.name" :value="operationStatusDict.code" />
                </el-select>
            </el-form-item>
            <el-form-item label="请求方式" prop="requestMethod">
                <el-select v-model="queryModel.requestMethod" placeholder="请选择" clearable style="width: 240px">
                    <el-option v-for="requestMethodDict in requestMethodDicts" :key="requestMethodDict.code" :label="requestMethodDict.name" :value="requestMethodDict.code" />
                </el-select>
            </el-form-item>
            <el-form-item label="请求地址" prop="requestUrl">
                <el-input v-model="queryModel.requestUrl" clearable maxlength="30" placeholder="请输入请求地址" style="width: 240px" />
            </el-form-item>
            <el-form-item label="操作日期" prop="createGmt">
                <el-date-picker v-model="createGmt" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" style="width: 240px" />
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
            <el-table-column header-align="center" align="left" label="操作人姓名" prop="operatorName" min-width="100px" />
            <el-table-column header-align="center" align="center" label="操作人手机号码" prop="operatorPhoneNumber" min-width="120px" />
            <el-table-column header-align="center" align="left" label="操作模块" prop="module" min-width="260px" />
            <el-table-column header-align="center" align="left" label="操作类型" prop="type" min-width="100px" />
            <el-table-column header-align="center" align="left" label="IP" prop="ip" min-width="130px" />
            <el-table-column header-align="center" align="left" label="地理位置" prop="location" min-width="150px" />
            <el-table-column header-align="center" align="left" label="操作系统" prop="os" min-width="100px" />
            <el-table-column header-align="center" align="left" label="浏览器" prop="browser" min-width="120px" />
            <el-table-column header-align="center" align="left" label="状态" prop="status" min-width="50px" />
            <el-table-column header-align="center" align="left" label="错误信息" prop="errorMsg" min-width="150px" show-overflow-tooltip />
            <el-table-column header-align="center" align="left" label="请求方式" prop="requestMethod" min-width="100px" />
            <el-table-column header-align="center" align="left" label="请求地址" prop="requestUrl" min-width="200px" />
            <el-table-column header-align="center" align="left" label="耗时 (毫秒)" prop="waitTime" min-width="100px" />
            <el-table-column header-align="center" align="center" label="操作时间" prop="createGmt" width="185px" />
            <el-table-column header-align="center" align="left" label="操作" fixed="right" :width="operationColumnWidth + 'px'" v-if="operationColumnWidth > 0">
                <template slot-scope="scope">
                    <el-button type="primary" @click="handleDetails(scope.row.id)" v-if="showDetailsButton">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="rows > 0" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 30, 50, 100]" :total="rows" :current-page="queryModel.pageNum" :page-size="queryModel.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" :before-close="dialogClose" append-to-body>
            <el-form :model="dialogData" ref="dialogForm" label-width="auto">
                <el-form-item label="操作人姓名">{{ dialogData.operatorName }}</el-form-item>
                <el-form-item label="操作人手机号码">{{ dialogData.operatorPhoneNumber }}</el-form-item>
                <el-form-item label="操作模块">{{ dialogData.module }}</el-form-item>
                <el-form-item label="操作类型">{{ dialogData.type }}</el-form-item>
                <el-form-item label="IP">{{ dialogData.ip }}</el-form-item>
                <el-form-item label="地理位置">{{ dialogData.location }}</el-form-item>
                <el-form-item label="操作系统">{{ dialogData.os }}</el-form-item>
                <el-form-item label="浏览器">{{ dialogData.browser }}</el-form-item>
                <el-form-item label="请求方式">{{ dialogData.requestMethod }}</el-form-item>
                <el-form-item label="请求地址">{{ dialogData.requestUrl }}</el-form-item>
                <el-form-item label="请求 content-type">{{ dialogData.requestContentType }}</el-form-item>
                <el-form-item label="请求 user-agent">{{ dialogData.requestUserAgent }}</el-form-item>
                <el-form-item label="请求参数">{{ dialogData.requestParam }}</el-form-item>
                <el-form-item label="响应结果">{{ dialogData.responseResult }}</el-form-item>
                <el-form-item label="耗时 (毫秒)">{{ dialogData.waitTime }}</el-form-item>
                <el-form-item label="状态">{{ dialogData.status }}</el-form-item>
                <el-form-item label="错误信息">{{ dialogData.errorMsg }}</el-form-item>
                <el-form-item label="操作时间">{{ dialogData.createGmt }}</el-form-item>
            </el-form>
        </el-dialog>
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
import CommonConstant from "@/common/CommonConstant"
import OperationLogBO from "@/views/system/entity/OperationLogBO"

@Component
export default class OperationLog extends Vue {
    // 加载中
    fullScreenLoading = false
    // 查询条件
    queryModel = {
        pageNum: 1,
        pageSize: 10,
        operatorName: null,
        operatorPhoneNumber: null,
        statusCode: null,
        requestMethod: null,
        requestUrl: null,
        startCreateGmt: null,
        endCreateGmt: null
    }
    // 操作日期
    createGmt = []
    // 操作状态字典
    operationStatusDicts: DictBO[] = DictUtils.list(DictCodeConstant.OPERATION_STATUS)
    // 请求方式字典
    requestMethodDicts: DictBO[] = DictUtils.list(DictCodeConstant.REQUEST_METHOD)
    // 总行数
    rows = 0
    // 表格数据
    tableData: OperationLogBO[] = []
    // 按钮状态. 默认禁用
    buttonStatus = true
    // 多选选中 ids
    selectedIds: number[] = []
    // 是否显示批量删除按钮
    showBatchDeleteButton = AuthorizeUtils.hasAuthority("DELETE/operation-log")
    // 是否显示清空按钮
    showEmptyButton = AuthorizeUtils.hasAuthority("DELETE/operation-log-empty")
    // 是否显示详情按钮
    showDetailsButton = AuthorizeUtils.hasAuthority("GET/operation-log/{id}")
    // 操作列宽度
    operationColumnWidth = 0
    // 对话框标题
    dialogTitle = ""
    // 对话框是否显示
    dialogVisible = false
    // 对话框数据
    dialogData: OperationLogBO = {
        id: 0,
        operatorName: "",
        operatorPhoneNumber: "",
        module: "",
        type: "",
        ip: "",
        location: "",
        os: "",
        browser: "",
        status: "",
        errorMsg: "",
        requestMethod: "",
        requestUrl: "",
        requestContentType: "",
        requestUserAgent: "",
        requestParam: "",
        responseResult: "",
        waitTime: 0,
        createGmt: ""
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
        if (this.showDetailsButton) {
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
        if (this.createGmt.length > 0) {
            this.queryModel.startCreateGmt = this.createGmt[0]
            this.queryModel.endCreateGmt = this.createGmt[1]
        }

        this.fullScreenLoading = true
        this.queryModel.pageNum = pageNum
        AxiosUtils.get("/operation-log", { params: this.queryModel }).then((response) => {
            const result = response as Result<OperationLogBO[]>
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
        this.createGmt = []
        this.search(1)
    }
    /**
     * 表格多选
     */
    handleSelectionChange(selectedRows: OperationLogBO[]) {
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
                AxiosUtils.delete("/operation-log", {
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
                AxiosUtils.delete("/operation-log-empty").then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                    this.search(1)
                })
            })
            .catch(() => {
                this.$message.info("已取消")
            })
    }

    /**
     * 详情
     */
    handleDetails(id: number) {
        this.dialogTitle = "详情"
        this.dialogVisible = true

        AxiosUtils.get("/operation-log/" + id).then((response) => {
            this.dialogData = (response as Result<OperationLogBO>).data
        })
    }

    /**
     * 对话框关闭
     */
    dialogClose() {
        this.dialogVisible = false
    }
}
</script>
