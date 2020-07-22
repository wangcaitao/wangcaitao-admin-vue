import { RouteConfig } from "vue-router"

const SystemRouter: Array<RouteConfig> = [
    {
        path: "/employee",
        name: "Employee",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Employee.vue")
    },
    {
        path: "/department",
        name: "Department",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Department.vue")
    },
    {
        path: "/department-employee",
        name: "DepartmentEmployee",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/DepartmentEmployee.vue")
    },
    {
        path: "/role-employee",
        name: "RoleEmployee",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/RoleEmployee.vue")
    },
    {
        path: "/role",
        name: "Role",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Role.vue")
    },
    {
        path: "/position",
        name: "Position",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Position.vue")
    },
    {
        path: "/position-employee",
        name: "PositionEmployee",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/PositionEmployee.vue")
    },
    {
        path: "/resource",
        name: "Resource",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Resource.vue")
    },
    {
        path: "/property",
        name: "Property",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Property.vue")
    },
    {
        path: "/dict",
        name: "Dict",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/Dict.vue")
    },
    {
        path: "/login-log",
        name: "LoginLog",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/LoginLog.vue")
    },
    {
        path: "/operation-log",
        name: "OperationLog",
        component: () => import(/* webpackChunkName: "system-router" */ "@/views/system/OperationLog.vue")
    }
]

export default SystemRouter
