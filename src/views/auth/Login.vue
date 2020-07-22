<template>
    <div class="login">
        <el-form :model="loginModel" :rules="rules" ref="loginForm" class="login-center">
            <el-form-item prop="phoneNumber">
                <el-input v-model="loginModel.phoneNumber" placeholder="请输入手机号码" />
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginModel.password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="login" class="login-button" :loading="buttonLoading">登陆</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { Form } from "element-ui"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import AuthBO from "@/views/auth/entity/AuthBO"
import LocalStorageKeyConstant from "@/common/LocalStorageKeyConstant"
import CommonRegexConstant from "@/common/CommonRegexConstant"

@Component
export default class Login extends Vue {
    // 按钮是否加载中
    buttonLoading = false
    // 请求参数
    loginModel = {
        phoneNumber: "",
        password: ""
    }
    // 参数校验
    rules = {
        phoneNumber: [
            { required: true, message: "请输入手机号码", trigger: "blur" },
            { pattern: CommonRegexConstant.PHONE_NUMBER, message: "手机号码格式错误", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
    }

    /**
     * 登陆
     */
    login() {
        ;(this.$refs["loginForm"] as Form).validate((valid: boolean) => {
            if (valid) {
                this.buttonLoading = true
                AxiosUtils.post("/login", this.loginModel).then((response) => {
                    const result = response as Result<AuthBO>
                    const authBo = result.data
                    localStorage.setItem(LocalStorageKeyConstant.TOKEN, authBo.token)
                    localStorage.setItem(LocalStorageKeyConstant.MENU, JSON.stringify(authBo.menus))
                    localStorage.setItem(LocalStorageKeyConstant.AUTHORIZED_RESOURCES, JSON.stringify(authBo.authorizedResources))
                    localStorage.setItem(LocalStorageKeyConstant.ACCOUNT_NAME, authBo.name)
                    localStorage.setItem(LocalStorageKeyConstant.ACCOUNT_AVATAR_IMG_URL, authBo.avatarImgUrl)

                    this.buttonLoading = false

                    this.$router.replace({
                        path: (this.$route.query.redirect as string) || "/"
                    })
                })
            }
        })
    }
}
</script>

<style scoped lang="less">
.login {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    width: 100%;
    height: 100%;
    background: #ffffff;
}

.login-center {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    width: 240px;
    height: 200px;
    margin: auto;
}

.login-button {
    width: 240px;
}
</style>
