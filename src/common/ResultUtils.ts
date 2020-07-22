import Result from "@/common/Result"
import Router from "@/router"
import { Message } from "element-ui"

export default class ResultUtils {
    /**
     * 获取 result.data
     * @param result result
     */
    static getData<T>(result: Result<T>): T {
        const code = result.code
        if (code == process.env.VUE_APP_STATUS_CODE_UNAUTHORIZED) {
            Router.replace({
                path: process.env.VUE_APP_URL_LOGIN,
                query: {
                    redirect: Router.currentRoute.fullPath
                }
            })
        } else if (code == process.env.VUE_APP_STATUS_CODE_OK) {
            return result.data
        } else {
            Message.error(result.msg)
        }

        return result.data
    }
}
