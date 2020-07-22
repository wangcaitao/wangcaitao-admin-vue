export default interface ResourceDTO {
    /**
     * id
     */
    id: number

    /**
     * parentId
     */
    parentId: number

    /**
     * 名称
     */
    name: string

    /**
     * 类型编码
     */
    typeCode: string

    /**
     * 请求方式
     */
    requestMethod: string

    /**
     * 地址
     */
    url: string

    /**
     * 状态编码
     */
    statusCode: string

    /**
     * 图标地址
     */
    icon: string
}
