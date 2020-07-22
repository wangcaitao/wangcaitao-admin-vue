import Vue from "vue"
import VueRouter, { RouteConfig } from "vue-router"
import SystemRouter from "./SystemRouter"

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/auth/Login.vue")
    },
    {
        path: "/",
        name: "Home",
        redirect: "/index",
        component: () => import("@/views/Home.vue"),
        children: [
            {
                path: "/index",
                name: "Index",
                component: () => import("@/views/Index.vue")
            },
            {
                path: "/profile",
                name: "Profile",
                component: () => import("@/views/personal-center/Profile.vue")
            },
            ...SystemRouter
        ]
    }
]

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
})

export default router
