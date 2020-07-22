export default interface DepartmentTreeBO {
    /**
     * id
     */
    id: number

    /**
     * 名称
     */
    name: string

    /**
     * 子集
     */
    children: DepartmentTreeBO[]
}
