export default interface EmployeeBO {
    /**
     * id
     */
    id: number

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
     * 帐号状态编码
     */
    accountStatusCode: string

    /**
     * 帐号状态
     */
    accountStatus: string

    /**
     * 状态编码
     */
    statusCode: string

    /**
     * 状态
     */
    status: string

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
    gender: string

    /**
     * 已勾选部门 ids
     */
    departmentIds: number[]

    /**
     * 部门名称, 英文逗号分开
     */
    departmentNames: string

    /**
     * 已选择职位 ids
     */
    positionIds: number[]

    /**
     * 职位名称, 英文逗号分开
     */
    positionNames: string

    /**
     * 已选择角色 id
     */
    roleId: number

    /**
     * 角色名称
     */
    roleName: string

    /**
     * 创建时间
     */
    createGmt: string

    /**
     * 修改时间
     */
    modifiedGmt: string
}
