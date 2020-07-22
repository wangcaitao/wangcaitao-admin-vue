export default interface DictBO {
    /**
     * 编码
     */
    code: string

    /**
     * 名称
     */
    name: string

    /**
     * 子集
     */
    children: DictBO[]
}

