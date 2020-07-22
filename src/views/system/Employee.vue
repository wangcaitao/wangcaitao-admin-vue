<template>
    <div>
        <el-row>
            <el-col :span="4">
                <el-tree :data="treeData" :props="treeProps" node-key="id" highlight-current accordion ref="tree" @node-click="handlerNodeClick" />
            </el-col>
            <el-col :span="20">
                <el-form :model="queryModel" ref="queryForm" inline label-width="auto">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="queryModel.name" clearable maxlength="30" placeholder="请输入姓名" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="手机号码" prop="loginUserPhoneNumber">
                        <el-input v-model="queryModel.loginUserPhoneNumber" clearable maxlength="11" placeholder="请输入手机号码" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="状态" prop="statusCode">
                        <el-select v-model="queryModel.statusCode" placeholder="请选择" clearable style="width: 240px">
                            <el-option v-for="employeeStatusDict in employeeStatusDicts" :key="employeeStatusDict.code" :label="employeeStatusDict.name" :value="employeeStatusDict.code" />
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
                    <el-table-column header-align="center" align="center" label="头像" width="50px">
                        <template slot-scope="scope">
                            <el-avatar :size="30" v-if="scope.row.avatarImgUrl" :src="scope.row.avatarImgUrl" />
                            <el-avatar :size="30" v-else>{{ scope.row.name.substr(0, 1) }}</el-avatar>
                        </template>
                    </el-table-column>
                    <el-table-column header-align="center" align="left" label="姓名" prop="name" min-width="100px" />
                    <el-table-column header-align="center" align="left" label="手机号码" prop="phoneNumber" min-width="120px" />
                    <el-table-column header-align="center" align="left" label="帐号状态" prop="accountStatus" min-width="50px" />
                    <el-table-column header-align="center" align="left" label="状态" prop="status" min-width="50px" />
                    <el-table-column header-align="center" align="left" label="部门" prop="departmentNames" min-width="100px" />
                    <el-table-column header-align="center" align="left" label="职位" prop="positionNames" min-width="100px" />
                    <el-table-column header-align="center" align="left" label="角色" prop="roleName" min-width="100px" />
                    <el-table-column header-align="center" align="left" label="性别" prop="gender" min-width="50px" />
                    <el-table-column header-align="center" align="left" label="工号" prop="jobNumber" min-width="100px" />
                    <el-table-column header-align="center" align="left" label="邮箱" prop="email" min-width="100px" />
                    <el-table-column header-align="center" align="center" label="创建时间" prop="createGmt" width="185px" />
                    <el-table-column header-align="center" align="center" label="修改时间" prop="modifiedGmt" width="185px" />
                    <el-table-column header-align="center" align="left" label="操作" fixed="right" :width="operationColumnWidth + 'px'" v-if="operationColumnWidth > 0">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="handleEdit(scope.row.id)" v-if="showEditButton">修改</el-button>
                            <el-button type="primary" @click="handlerUpdateAccountStatus(scope.row.id, 1)" v-if="showUpdateAccountStatusButton && scope.row.accountStatusCode == '2'">启用</el-button>
                            <el-button type="primary" @click="handlerUpdateAccountStatus(scope.row.id, 2)" v-if="showUpdateAccountStatusButton && scope.row.accountStatusCode == '1'">禁用</el-button>
                            <el-button type="primary" @click="handlerUpdateStatus(scope.row.id, 1)" v-if="showUpdateStatusButton && scope.row.statusCode == '2'">在职</el-button>
                            <el-button type="primary" @click="handlerUpdateStatus(scope.row.id, 2)" v-if="showUpdateStatusButton && scope.row.statusCode == '1'">离职</el-button>
                            <el-button type="danger" @click="handleResetPassword(scope.row.id)" v-if="showResetPasswordButton">重置密码</el-button>
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
                    <el-form-item label="手机号码" prop="phoneNumber">
                        <el-input v-model="dialogData.phoneNumber" placeholder="请输入手机号码" maxlength="11" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="帐号状态" prop="accountStatusCode">
                        <el-select v-model="dialogData.accountStatusCode" placeholder="请选择" style="width: 240px">
                            <el-option v-for="accountStatusDict in accountStatusDicts" :key="accountStatusDict.code" :label="accountStatusDict.name" :value="accountStatusDict.code" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态" prop="statusCode">
                        <el-select v-model="dialogData.statusCode" placeholder="请选择" style="width: 240px">
                            <el-option v-for="employeeStatusDict in employeeStatusDicts" :key="employeeStatusDict.code" :label="employeeStatusDict.name" :value="employeeStatusDict.code" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="性别" prop="genderCode">
                        <el-radio-group v-model="dialogData.genderCode">
                            <el-radio v-for="genderDict in genderDicts" :key="genderDict.code" :label="genderDict.code">{{ genderDict.name }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="工号" prop="jobNumber">
                        <el-input v-model="dialogData.jobNumber" placeholder="请输入工号" maxlength="30" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="dialogData.email" placeholder="请输入邮箱" maxlength="30" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="部门" prop="departmentIds">
                        <el-tree :data="treeData" :props="treeProps" node-key="id" show-checkbox check-strictly ref="checkTree" />
                    </el-form-item>
                    <el-form-item label="职位" prop="positionIds">
                        <el-select v-model="dialogData.positionIds" multiple placeholder="请选择" style="width: 240px">
                            <el-option v-for="position in positions" :key="position.id" :label="position.name" :value="position.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="角色" prop="roleId">
                        <el-select v-model="dialogData.roleId" placeholder="请选择" style="width: 240px">
                            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
                        </el-select>
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
import CommonRegexConstant from "@/common/CommonRegexConstant"
import DepartmentTreeBO from "@/views/system/entity/DepartmentTreeBO"
import EmployeeBO from "@/views/system/entity/EmployeeBO"
import EmployeeDTO from "@/views/system/entity/EmployeeDTO"
import PositionBO from "@/views/system/entity/PositionBO"
import RoleBO from "@/views/system/entity/RoleBO"

@Component
export default class Employee extends Vue {
    // 部门树数据
    treeData: DepartmentTreeBO[] = []
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
        departmentId: 0,
        statusCode: null,
        name: null,
        phoneNumber: null
    }
    // 总行数
    rows = 0
    // 表格数据
    tableData: EmployeeBO[] = []
    // 是否显示新增按钮
    showAddButton = AuthorizeUtils.hasAuthority("POST/employee")
    // 是否显示修改按钮
    showEditButton = AuthorizeUtils.hasAuthority("PUT/employee")
    // 是否显示修改帐号状态按钮
    showUpdateAccountStatusButton = AuthorizeUtils.hasAuthority("PUT/employee-account-status")
    // 是否显示修改状态按钮
    showUpdateStatusButton = AuthorizeUtils.hasAuthority("PUT/employee-status")
    // 是否显示重置密码按钮
    showResetPasswordButton = AuthorizeUtils.hasAuthority("PUT/employee-password")
    // 员工状态字典
    employeeStatusDicts: DictBO[] = DictUtils.list(DictCodeConstant.EMPLOYEE_STATUS)
    // 员工帐号状态字典
    accountStatusDicts: DictBO[] = DictUtils.list(DictCodeConstant.ACCOUNT_STATUS)
    // 性别字典
    genderDicts: DictBO[] = DictUtils.list(DictCodeConstant.GENDER)
    // 操作列宽度
    operationColumnWidth = 0
    // 对话框标题
    dialogTitle = ""
    // 对话框是否显示
    dialogVisible = false
    // 对话框数据
    dialogData: EmployeeDTO = {
        id: 0,
        name: "",
        phoneNumber: "",
        accountStatusCode: "1",
        statusCode: "1",
        genderCode: "2",
        departmentIds: [],
        positionIds: []
    }
    // 职位列表
    positions: PositionBO[] = []
    // 角色列表
    roles: RoleBO[] = []
    // 对话框校验
    dialogRules = {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        phoneNumber: [
            { required: true, message: "请输入手机号码", trigger: "blur" },
            { pattern: CommonRegexConstant.PHONE_NUMBER, message: "手机号码格式错误", trigger: "blur" }
        ],
        email: [{ pattern: CommonRegexConstant.EMAIL, message: "邮箱格式错误", trigger: "blur" }],
        positionIds: [{ required: true, message: "请选择职位", trigger: "blur" }]
    }

    /**
     * created
     */
    created() {
        this.getDepartmentTree()
        this.search(1)
        this.operationColumnWidth = this.getOperationColumnWidth()
        this.listPosition()
        this.listRole()
    }

    /**
     * 获取部门树
     */
    getDepartmentTree() {
        AxiosUtils.get("/department-tree").then((response) => {
            const result = response as Result<DepartmentTreeBO[]>
            this.treeData = [{ id: 0, name: "部门树", children: [...result.data] }]

            this.$nextTick(() => {
                ;(this.$refs["tree"] as Tree).setCurrentKey(this.currentNodeKey)
            })
        })
    }

    /**
     * 获取职位列表
     */
    listPosition() {
        AxiosUtils.get("/position", { params: { pagination: 0 } }).then((response) => {
            this.positions = (response as Result<PositionBO[]>).data
        })
    }

    /**
     * 获取角色列表
     */
    listRole() {
        AxiosUtils.get("/role", { params: { pagination: 0 } }).then((response) => {
            this.roles = (response as Result<RoleBO[]>).data
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

        if (this.showUpdateAccountStatusButton) {
            num += 1
        }

        if (this.showUpdateStatusButton) {
            num += 1
        }

        if (this.showResetPasswordButton) {
            num += 1.2
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
        this.queryModel.departmentId = this.currentNodeKey
        AxiosUtils.get("/employee", { params: this.queryModel }).then((response) => {
            const result = response as Result<EmployeeBO[]>
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

        AxiosUtils.get("/employee/" + id).then((response) => {
            this.dialogData = (response as Result<EmployeeDTO>).data
            this.dialogData.accountStatusCode = this.dialogData.accountStatusCode + ""
            this.dialogData.statusCode = this.dialogData.statusCode + ""
            this.dialogData.genderCode = this.dialogData.genderCode + ""
            ;(this.$refs["checkTree"] as Tree).setCheckedKeys(this.dialogData.departmentIds)
        })
    }

    /**
     * 修改帐号状态
     */
    handlerUpdateAccountStatus(id: number, accountStatusCode: number) {
        AxiosUtils.put("/employee-account-status", {
            id: id,
            accountStatusCode: accountStatusCode
        }).then(() => {
            this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
            this.search(this.queryModel.pageNum)
        })
    }

    /**
     * 修改状态
     */
    handlerUpdateStatus(id: number, statusCode: number) {
        AxiosUtils.put("/employee-status", {
            id: id,
            statusCode: statusCode
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
        ;(this.$refs["checkTree"] as Tree).setCheckedKeys([])
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
                const checkedKeys = (this.$refs["checkTree"] as Tree).getCheckedKeys()
                if (checkedKeys.length == 0) {
                    this.$message.error("请选择部门")

                    return
                }

                this.dialogData.departmentIds = checkedKeys

                if (this.dialogData.id == 0) {
                    AxiosUtils.post("/employee", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(1)
                    })
                } else {
                    AxiosUtils.put("/employee", this.dialogData).then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                        this.dialogClose()
                        this.search(this.queryModel.pageNum)
                    })
                }
            }
        })
    }

    /**
     * 重置密码
     */
    handleResetPassword(id: number) {
        this.$confirm("确定重置密码?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                AxiosUtils.put("employee-password", { id: id }).then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                })
            })
            .catch(() => {
                this.$message.info("已取消")
            })
    }
}
</script>
