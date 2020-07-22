import LocalStorageKeyConstant from "@/common/LocalStorageKeyConstant"
import DictBO from "@/common/DictBO"

export default class DictUtils {
    /**
     * 获取子集
     * @param parentCode 父级编码
     */
    static list(parentCode: string): DictBO[] {
        let children: DictBO[] = []
        const dicts: DictBO[] = JSON.parse(localStorage.getItem(LocalStorageKeyConstant.DICT) as string)
        for (const dict of dicts) {
            if (dict.code == parentCode) {
                children = dict.children

                break
            }
        }

        return children
    }
}
