export default interface OperationLogBO {

    /**
     * id
     */
    id: number

    /**
     * 操作人姓名
     */
    operatorName: string

    /**
     * 操作人手机号码
     */
    operatorPhoneNumber: string

    /**
     * 操作模块
     */
    module: string

    /**
     * 操作类型
     */
    type: string

    /**
     * ip
     */
    ip: string

    /**
     * 地理位置
     */
    location: string

    /**
     * 操作系统
     */
    os: string

    /**
     * 浏览器
     */
    browser: string

    /**
     * 状态
     */
    status: string

    /**
     * 错误信息
     */
    errorMsg: string

    /**
     * 请求方式
     */
    requestMethod: string

    /**
     * 请求地址
     */
    requestUrl: string

    /**
     * 请求 content-type
     */
    requestContentType: string

    /**
     * 请求 user-agent
     */
    requestUserAgent: string

    /**
     * 请求参数
     */
    requestParam: string

    /**
     * 响应结果
     */
    responseResult: string

    /**
     * 耗时 (毫秒)
     */
    waitTime: number

    /**
     * 操作时间
     */
    createGmt: string
}
