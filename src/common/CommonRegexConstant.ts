export default class CommonRegexConstant {
    /**
     * 手机号码
     */
    public static readonly PHONE_NUMBER = "^1[3456789]\\d{9}$"

    /**
     * 邮箱
     */
    public static readonly EMAIL = "^([a-zA-Z0-9\\_\\-\\.]+)\\@([a-zA-Z0-9\\_\\-\\.]+)\\.([a-zA-Z]{2,5})$"
}
