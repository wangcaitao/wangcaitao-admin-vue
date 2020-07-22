import Axios, { AxiosRequestConfig } from "axios"
import Router from "@/router"
import { Message } from "element-ui"
import LocalStorageKeyConstant from "./LocalStorageKeyConstant"

//#region common config
const instance = Axios.create({
    baseURL: process.env.VUE_APP_BASE_URL_API,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
})
//#endregion

/**
 * hander axios error
 * @param error error
 */
function handerAxiosError(error: any) {
    const errorCode = error.code
    const errorMessage = error.message

    if (errorCode === "ECONNABORTED" && errorMessage.indexOf("timeout") != -1) {
        return Promise.reject({
            code: 500,
            msg: "请求超时"
        })
    }

    return Promise.reject({
        code: errorCode,
        msg: errorMessage
    })
}

/**
 * hander unauthorized
 */
function handerUnauthorized() {
    Router.replace({
        path: process.env.VUE_APP_URL_LOGIN,
        query: {
            redirect: Router.currentRoute.fullPath
        }
    })
}

//#region request interceptor
instance.interceptors.request.use(
    function(config) {
        config.headers.common[process.env.VUE_APP_KEY_TOKEN] = localStorage.getItem(LocalStorageKeyConstant.TOKEN) || ""

        return config
    },

    function(error) {
        return handerAxiosError(error)
    }
)
//#endregion

//#region response interceptor
instance.interceptors.response.use(
    function(response) {
        const statusCode = response.status
        switch (statusCode) {
            case 200: {
                const result = response.data
                const code = result.code
                if (code == process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED) {
                    handerUnauthorized()

                    return Promise.reject(result)
                } else if (code == process.env.VUE_APP_STATUS_CODE_OK) {
                    return Promise.resolve(result)
                } else {
                    return Promise.reject(result)
                }
            }
            case 401: {
                handerUnauthorized()

                return Promise.reject({
                    code: process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED,
                    msg: "未认证"
                })
            }
            default: {
                return Promise.reject({
                    code: statusCode,
                    msg: response.statusText
                })
            }
        }
    },
    function(error) {
        return handerAxiosError(error)
    }
)
//#endregion

//#region http request
const AxiosUtils = {
    get(url: string, config?: AxiosRequestConfig) {
        return new Promise((resolve) => {
            instance
                .get(url, config)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    if (error.code != process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED) {
                        Message.error(error.msg)
                    }
                })
        })
    },
    post(url: string, data?: any, config?: AxiosRequestConfig) {
        return new Promise((resolve) => {
            instance
                .post(url, data, config)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    if (error.code != process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED) {
                        Message.error(error.msg)
                    }
                })
        })
    },
    put(url: string, data?: any, config?: AxiosRequestConfig) {
        return new Promise((resolve) => {
            instance
                .put(url, data, config)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    if (error.code != process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED) {
                        Message.error(error.msg)
                    }
                })
        })
    },
    delete(url: string, config?: AxiosRequestConfig) {
        return new Promise((resolve) => {
            instance
                .delete(url, config)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    if (error.code != process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED) {
                        Message.error(error.msg)
                    }
                })
        })
    }
}
//#endregion

export default AxiosUtils
