export default interface MenuBO {
    /**
     * id
     */
    id: number

    /**
     * 名称
     */
    name: string

    /**
     * 地址
     */
    url: string

    /**
     * 图标
     */
    icon: string

    /**
     * 子集数据
     */
    children: MenuBO[]
}
