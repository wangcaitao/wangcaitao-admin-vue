export default interface ResourceBO {
    /**
     * id
     */
    id: number

    /**
     * 名称
     */
    name: string

    /**
     * 类型
     */
    type: string

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
     * 状态
     */
    status: string

    /**
     * 图标地址
     */
    icon: string

    /**
     * 创建时间
     */
    createGmt: string

    /**
     * 修改时间
     */
    modifiedGmt: string
}
