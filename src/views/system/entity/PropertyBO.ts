export default interface PropertyBO {
    /**
     * id
     */
    id: number

    /**
     * 属性名
     */
    name: string

    /**
     * 属性值
     */
    value: string

    /**
     * 说明
     */
    description: string

    /**
     * 创建时间
     */
    createGmt: string

    /**
     * 修改时间
     */
    modifiedGmt: string
}
