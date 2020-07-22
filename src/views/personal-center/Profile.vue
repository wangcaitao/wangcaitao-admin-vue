<template>
    <div>
        <el-tabs v-model="activeName" :before-leave="beforLeaveTab">
            <el-tab-pane label="个人信息" name="profile">
                <el-form :model="profileModel" label-width="auto">
                    <el-form-item>
                        <el-upload :action="upload.action" :headers="upload.headers" :data="upload.data" :accept="upload.accept" name="file" :show-file-list="false" :on-success="handleUploadSuccess" :before-upload="handlerBeforeUpload">
                            <el-avatar :size="100" v-if="profileModel.avatarImgUrl" :src="profileModel.avatarImgUrl" />
                            <el-avatar :size="100" v-else>{{ profileModel.name.substr(0, 1) }}</el-avatar>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="姓名">{{ profileModel.name }}</el-form-item>
                    <el-form-item label="手机号码">{{ profileModel.phoneNumber }}</el-form-item>
                    <el-form-item label="性别">{{ profileModel.gender }}</el-form-item>
                    <el-form-item label="邮箱">{{ profileModel.email }}</el-form-item>
                    <el-form-item label="工号" v-if="profileModel.jobNumber">{{ profileModel.jobNumber }}</el-form-item>
                    <el-form-item label="部门" v-if="profileModel.departmentNames.length > 0">
                        <el-tag v-for="departmentName in profileModel.departmentNames" :key="departmentName">{{ departmentName }}</el-tag>
                    </el-form-item>
                    <el-form-item label="职位" v-if="profileModel.positionNames.length > 0">
                        <el-tag v-for="positionName in profileModel.positionNames" :key="positionName">{{ positionName }}</el-tag>
                    </el-form-item>
                    <el-form-item label="创建时间">{{ profileModel.createGmt }}</el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改信息" name="updateProfile">
                <el-form :model="profileModel" ref="profileForm" label-width="auto" :rules="profileFormRules">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="profileModel.name" placeholder="请输入姓名" maxlength="10" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="手机号码" prop="phoneNumber">
                        <el-input v-model="profileModel.phoneNumber" placeholder="请输入手机号码" maxlength="11" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="性别" prop="genderCode">
                        <el-radio-group v-model="profileModel.genderCode">
                            <el-radio v-for="genderDict in genderDicts" :key="genderDict.code" :label="genderDict.code">{{ genderDict.name }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="profileModel.email" placeholder="请输入邮箱" maxlength="30" style="width: 240px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="updateProfileCancel">取消</el-button>
                        <el-button type="primary" @click="updateProfileConfirm">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="updatePassword">
                <el-form :model="passwordModel" ref="passwordForm" label-width="auto" :rules="passwordFormRules">
                    <el-form-item label="原密码" prop="originalPassword">
                        <el-input v-model="passwordModel.originalPassword" placeholder="请输入原密码" show-password maxlength="16" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                        <el-input v-model="passwordModel.newPassword" placeholder="请输入新密码 6-16 个字符" show-password maxlength="16" style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input v-model="passwordModel.confirmPassword" placeholder="请输入确认密码 6-16 个字符" show-password maxlength="16" style="width: 240px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="updatePasswordCancel">取消</el-button>
                        <el-button type="primary" @click="updatePasswordConfirm">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { Form } from "element-ui"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import ResultUtils from "@/common/ResultUtils"
import ProfileBO from "@/views/personal-center/entity/ProfileBO"
import LocalStorageKeyConstant from "@/common/LocalStorageKeyConstant"
import CommonRegexConstant from "@/common/CommonRegexConstant"
import DictCodeConstant from "@/common/DictCodeConstant"
import DictUtils from "@/common/DictUtils"
import DictBO from "@/common/DictBO"
import File from "@/common/File"

@Component
export default class Profile extends Vue {
    // 默认选中 tab
    activeName = "profile"
    // 对话框标题
    dialogTitle = ""
    // 对话框是否可见
    dialogVisible = false
    // 性别字典
    genderDicts: DictBO[] = DictUtils.list(DictCodeConstant.GENDER)
    // 个人信息
    profileModel: ProfileBO = {
        name: "",
        phoneNumber: "",
        avatarImgUrl: "",
        jobNumber: "",
        email: "",
        genderCode: "2",
        gender: "",
        departmentNames: [],
        positionNames: [],
        createGmt: ""
    }
    // 密码
    passwordModel = {
        originalPassword: null,
        newPassword: null,
        confirmPassword: null
    }
    // 修改个人信息表单参数校验
    profileFormRules = {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        phoneNumber: [
            { required: true, message: "请输入手机号码", trigger: "blur" },
            { pattern: CommonRegexConstant.PHONE_NUMBER, message: "手机号码格式错误", trigger: "blur" }
        ],
        email: [{ pattern: CommonRegexConstant.EMAIL, message: "邮箱格式错误", trigger: "blur" }]
    }
    // 修改密码表单参数校验
    passwordFormRules = {
        originalPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
        newPassword: [
            { required: true, message: "请输入新密码", trigger: "blur" },
            { min: 6, max: 16, message: "长度在 6 到 16 个字符", trigger: "blur" }
        ],
        confirmPassword: [
            { required: true, message: "请输入确认密码", trigger: "blur" },
            { min: 6, max: 16, message: "长度在 6 到 16 个字符", trigger: "blur" }
        ]
    }
    // 上传参数
    upload = {
        action: process.env.VUE_APP_BASE_URL_API + "/upload",
        headers: {
            token: localStorage.getItem(LocalStorageKeyConstant.TOKEN) || ""
        },
        data: {
            prefix: "avatar"
        },
        accept: ".jpg, .jpeg, .png, .JPG, .JPEG, .PNG"
    }

    /**
     * created
     */
    created(): void {
        this.getAccountProfile()
    }

    /**
     * 获取个人信息
     */
    getAccountProfile(): void {
        AxiosUtils.get("/account-profile").then((response) => {
            const result = response as Result<ProfileBO>
            this.profileModel = result.data
            this.profileModel.genderCode = this.profileModel.genderCode + ""
        })
    }

    /**
     * 上传之前
     */
    handlerBeforeUpload(file: File) {
        const fileType = file.type
        if (fileType != "image/jpeg" && fileType != "image/jpg" && fileType != "image/png") {
            this.$message.error("文件格式错误. 支持 jpeg, jpg, png")
            return false
        }

        const fileSize = file.size
        if (fileSize / 1024 / 1024 > 2) {
            this.$message.error("文件大小不能超过 2M")
        }
    }

    /**
     * 上传成功
     */
    handleUploadSuccess(result: Result<string>) {
        const avatarImgUrl = ResultUtils.getData(result)
        if (avatarImgUrl) {
            this.profileModel.avatarImgUrl = avatarImgUrl
            AxiosUtils.put("/account-avatar", { avatarImgUrl: avatarImgUrl }).then(() => {
                this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
            })
        }
    }

    /**
     * 修改信息 - 取消
     */
    updateProfileCancel(): void {
        ;(this.$refs["profileForm"] as Form).resetFields()
        this.activeName = "profile"
        this.getAccountProfile()
    }

    /**
     * 修改信息 - 确定
     */
    updateProfileConfirm(): void {
        ;(this.$refs["profileForm"] as Form).validate((valid: boolean) => {
            if (valid) {
                AxiosUtils.put("/account", {
                    name: this.profileModel.name,
                    phoneNumber: this.profileModel.phoneNumber,
                    genderCode: this.profileModel.genderCode,
                    email: this.profileModel.email
                }).then(() => {
                    this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE)
                    this.updateProfileCancel()
                })
            }
        })
    }

    /**
     * 修改密码 - 取消
     */
    updatePasswordCancel(): void {
        ;(this.$refs["passwordForm"] as Form).resetFields()
        this.activeName = "profile"
        this.getAccountProfile()
    }

    /**
     * 修改密码 - 确定
     */
    updatePasswordConfirm(): void {
        ;(this.$refs["passwordForm"] as Form).validate((valid: boolean) => {
            if (valid) {
                if (this.passwordModel.newPassword != this.passwordModel.confirmPassword) {
                    this.$message.error("新密码与确认密码不一致")

                    return
                }

                AxiosUtils.put("/account-password", this.passwordModel).then(() => {
                    AxiosUtils.put("/logout").then(() => {
                        this.$message.success(process.env.VUE_APP_SUCCESS_MESSAGE + ", 请重新登陆")
                        localStorage.removeItem(LocalStorageKeyConstant.TOKEN)
                        this.$router.replace({
                            path: process.env.VUE_APP_URL_LOGIN
                        })
                    })
                })
            }
        })
    }

    /**
     * tab 切换
     */
    beforLeaveTab(activeName: string, oldActiveName: string) {
        if (oldActiveName == "updateProfile") {
            this.updateProfileCancel()
        } else if (oldActiveName == "updatePassword") {
            this.updatePasswordCancel()
        }
    }
}
</script>
