export default interface Result<T> {
    /**
     * 状态码
     */
    code: number

    /**
     * 消息
     */
    msg: string

    /**
     * 当前页码. 仅在分页查询时返回
     */
    pageNum: number

    /**
     * 每页大小. 仅在分页查询时返回
     */
    pageSize: number

    /**
     * 总页数. 仅在分页查询时返回
     */
    pages: number

    /**
     * 总行数. 仅在分页查询时返回
     */
    rows: number

    /**
     * 数据
     */
    data: T
}
