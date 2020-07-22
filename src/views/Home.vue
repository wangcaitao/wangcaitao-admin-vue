<template>
    <div>
        <div class="header">
            <div class="header-left">
                <div class="logo">
                    <el-image :src="require('@/assets/logo.png')" fit="scale-down" />
                </div>
                <div class="logo-content">{{ title }}</div>
            </div>
            <div class="header-right avatar">
                <el-dropdown trigger="click">
                    <el-avatar v-if="account.avatarImgUrl" :src="account.avatarImgUrl"></el-avatar>
                    <el-avatar v-else>{{ account.lastName }}</el-avatar>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item disabled>{{ account.name }}</el-dropdown-item>
                        <el-dropdown-item divided icon="el-icon-user" @click.native="gotoPersonalCenter">个人中心</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-switch-button" @click.native="logout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div>
            <div class="menu">
                <el-menu :default-active="activedMenu" router unique-opened mode="vertical" background-color="#545c64" text-color="#ffffff" active-text-color="#ffd04b">
                    <el-menu-item index="/index">
                        <i class="el-icon-s-home"></i>
                        <span slot="title">首页</span>
                    </el-menu-item>
                    <template v-for="firstLevelMenu in menus">
                        <el-submenu v-if="firstLevelMenu.url == ''" :key="firstLevelMenu.id" :index="firstLevelMenu.id.toString()">
                            <template slot="title">
                                <i :class="firstLevelMenu.icon"></i>
                                <span>{{ firstLevelMenu.name }}</span>
                            </template>
                            <template v-for="secondLevelMenu in firstLevelMenu.children">
                                <el-submenu v-if="secondLevelMenu.url == ''" :key="secondLevelMenu.id" :index="secondLevelMenu.id.toString()">
                                    <template slot="title">
                                        <i :class="secondLevelMenu.icon"></i>
                                        <span>{{ secondLevelMenu.name }}</span>
                                    </template>
                                    <el-menu-item v-for="thirdLevelMenu in secondLevelMenu.children" :key="thirdLevelMenu.id" :index="thirdLevelMenu.url.toString()">
                                        <i :class="thirdLevelMenu.icon"></i>
                                        <span slot="title">{{ thirdLevelMenu.name }}</span>
                                    </el-menu-item>
                                </el-submenu>
                                <el-menu-item v-else :key="secondLevelMenu.id" :index="secondLevelMenu.url.toString()">
                                    <i :class="secondLevelMenu.icon"></i>
                                    <span slot="title">{{ secondLevelMenu.name }}</span>
                                </el-menu-item>
                            </template>
                        </el-submenu>
                        <el-menu-item v-else :key="firstLevelMenu.id" :index="firstLevelMenu.url.toString()">
                            <i :class="firstLevelMenu.icon"></i>
                            <span slot="title">{{ firstLevelMenu.name }}</span>
                        </el-menu-item>
                    </template>
                </el-menu>
            </div>
            <div class="main">
                <div class="breadcrumb">
                    <el-breadcrumb separator-class="el-icon-arrow-right" style="padding-top: 7px">
                        <el-breadcrumb-item>首页</el-breadcrumb-item>
                        <el-breadcrumb-item v-for="(breadcrumbItem, index) in breadcrumbItems" :key="index">{{ breadcrumbItem }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="content">
                    <router-view />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import LocalStorageKeyConstant from "@/common/LocalStorageKeyConstant"
import MenuBO from "@/views/auth/entity/MenuBO"
import AxiosUtils from "@/common/AxiosUtils"
import Result from "@/common/Result"
import DictBO from "@/common/DictBO"

@Component
export default class Home extends Vue {
    // title
    title = process.env.VUE_APP_TITLE
    // 当前选中菜单
    activedMenu = "/index"
    // 菜单
    menus: MenuBO[] = []
    // 帐号信息
    account = {
        name: "",
        lastName: "",
        avatarImgUrl: ""
    }
    // path 与面包屑对应关系
    breadcrumbItemMap = new Map()
    // 面包屑
    breadcrumbItems: string[] = []

    /**
     * created
     */
    created() {
        //#region 默认 path 与面包屑对应关系
        this.breadcrumbItemMap.set("/profile", "个人中心")
        //#endregion

        this.menus = JSON.parse(localStorage.getItem(LocalStorageKeyConstant.MENU) as string)
        this.account.name = localStorage.getItem(LocalStorageKeyConstant.ACCOUNT_NAME) as string
        if (this.account.name) {
            this.account.lastName = this.account.name.substr(0, 1)
        }
        this.account.avatarImgUrl = localStorage.getItem(LocalStorageKeyConstant.ACCOUNT_AVATAR_IMG_URL) as string
        this.activedMenu = this.$router.currentRoute.path
        this.setBreadcrumbItemMap("", this.menus)
        this.setBreadcrumbItems(this.activedMenu)

        //#region 子页面 path 与面包屑对应关系
        this.breadcrumbItemMap.set("/position-employee", this.breadcrumbItemMap.get("/position") + ",关联员工")
        this.breadcrumbItemMap.set("/department-employee", this.breadcrumbItemMap.get("/department") + ",关联员工")
        this.breadcrumbItemMap.set("/role-employee", this.breadcrumbItemMap.get("/role") + ",关联员工")
        //#endregion

        AxiosUtils.get("/dict-tree").then((response) => {
            const result = response as Result<DictBO[]>
            localStorage.setItem(LocalStorageKeyConstant.DICT, JSON.stringify(result.data))
        })
    }

    /**
     * 监听路由
     */
    @Watch("$route")
    routeWatch(): void {
        this.setBreadcrumbItems(this.$route.path)
    }

    /**
     * 设置 path 与面包屑对应关系
     */
    setBreadcrumbItemMap(names: string, menus: MenuBO[]): void {
        if (!menus) {
            return
        }

        for (const menu of menus) {
            const currentNames = names == "" ? menu.name : names + "," + menu.name
            const children = menu.children
            if (children.length == 0) {
                this.breadcrumbItemMap.set(menu.url, currentNames)
            } else {
                this.setBreadcrumbItemMap(currentNames, children)
            }
        }
    }

    /**
     * 设置面包屑
     */
    setBreadcrumbItems(path: string): void {
        if (path == "/index") {
            this.breadcrumbItems = []
        } else {
            const names = this.breadcrumbItemMap.get(path)
            if (names) {
                this.breadcrumbItems = names.split(",")
            }
        }
    }

    /**
     * 个人中心
     */
    gotoPersonalCenter(): void {
        this.$router.replace({
            path: "/profile"
        })
    }

    /**
     * 退出
     */
    logout(): void {
        AxiosUtils.put("/logout").then(() => {
            localStorage.removeItem(LocalStorageKeyConstant.TOKEN)
            this.$router.replace({
                path: process.env.VUE_APP_URL_LOGIN
            })
        })
    }
}
</script>

<style scoped lang="less">
.header {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 50px;
    background-color: #545c64;
}

.header-left {
    float: left;
    width: 200px;
    height: 50px;
}

.header-right {
    float: right;
}

.logo {
    float: left;
    width: 50px;
    height: 50px;
    margin-left: 10px;
    margin-top: 5px;
}

.logo-content {
    margin-top: 15px;
    margin-left: 70px;
    color: #ffffff;
}

.avatar {
    width: 50px;
    height: 50px;
    margin-top: 5px;
}

.menu {
    position: fixed;
    left: 0px;
    top: 50px;
    bottom: 0px;
    width: 200px;
    background-color: #545c64;
    overflow: auto;
}

.main {
    position: fixed;
    left: 220px;
    right: 0px;
    top: 60px;
    bottom: 0px;
    overflow: auto;
}

.breadcrumb {
    height: 30px;
}

.content {
    margin-top: 20px;
}
</style>
