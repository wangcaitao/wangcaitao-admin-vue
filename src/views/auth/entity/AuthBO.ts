import MenuBO from "@/views/auth/entity/MenuBO"

export default interface AuthBO {
    /**
     * token
     */
    token: string

    /**
     * 姓名
     */
    name: string

    /**
     * 头像
     */
    avatarImgUrl: string

    /**
     * 菜单
     */
    menus: MenuBO[]

    /**
     * 已授权资源
     */
    authorizedResources: string[]
}
