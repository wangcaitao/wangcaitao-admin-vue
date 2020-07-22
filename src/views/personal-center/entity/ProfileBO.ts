export default interface ProfileBO {

    /**
     * 姓名
     */
    name: string

    /**
     * 手机号码
     */
    phoneNumber: string

    /**
     * 头像
     */
    avatarImgUrl: string

    /**
     * 工号
     */
    jobNumber: string

    /**
     * 邮箱
     */
    email: string

    /**
     * 性别编码
     */
    genderCode: string

    /**
     * 性别
     */
    gender: string,

    /**
     * 部门名称
     */
    departmentNames: string[]

    /**
     * 职位名称
     */
    positionNames: string[]

    /**
     * 创建时间
     */
    createGmt: string
}
