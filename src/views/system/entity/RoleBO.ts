export default interface RoleBO {
    /**
     * id
     */
    id: number

    /**
     * 编码
     */
    code: number

    /**
     * 名称
     */
    name: number

    /**
     * 已勾选资源 ids
     */
    resourceIds?: number[]

    /**
     * 创建时间
     */
    createGmt: string

    /**
     * 修改时间
     */
    modifiedGmt: string
}
