import LocalStorageKeyConstant from "@/common/LocalStorageKeyConstant"

export default class AuthorizeUtils {
    /**
     * 是否已授权. true: 已授权
     * @param value 授权路由
     */
    static hasAuthority(value: string): boolean {
        let result = false
        const authorizedResources: string[] = JSON.parse(localStorage.getItem(LocalStorageKeyConstant.AUTHORIZED_RESOURCES) as string)

        for (const authorizedResource of authorizedResources) {
            if (authorizedResource == value) {
                result = true

                break
            }
        }

        return result
    }
}
