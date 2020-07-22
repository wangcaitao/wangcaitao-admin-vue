export default interface ResourceTreeBO {
    /**
     * id
     */
    id: number

    /**
     * 名称
     */
    name: string

    /**
     * 子集数据
     */
    children: ResourceTreeBO[]
}
