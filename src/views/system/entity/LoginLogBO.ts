export default interface LoginLogBO {
    /**
     * id
     */
    id: number

    /**
     * 登陆人姓名
     */
    loginUserName: string

    /**
     * 登陆人手机号码
     */
    loginUserPhoneNumber: string

    /**
     * IP
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
     * 登陆时间
     */
    createGmt: string
}
