export default interface EmployeeDTO {
    /**
     * id
     */
    id?: number

    /**
     * 姓名
     */
    name: string

    /**
     * 手机号码
     */
    phoneNumber: string

    /**
     * 帐号状态编码
     */
    accountStatusCode: string

    /**
     * 状态编码
     */
    statusCode: string

    /**
     * 工号
     */
    jobNumber?: string

    /**
     * 邮箱
     */
    email?: string

    /**
     * 性别编码
     */
    genderCode: string

    /**
     * 已勾选部门 ids
     */
    departmentIds: number[]

    /**
     * 已选择职位 ids
     */
    positionIds: number[]

    /**
     * 已选择角色 id
     */
    roleId?: number
}
