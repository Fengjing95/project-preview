import MyDialog from './dialog'
export type { MyDialogProps } from './dialog'
import alert from './alert'

const Dialog = MyDialog as typeof MyDialog & { alert: typeof alert }
// 为MyDialog添加alert方法的类型声明
Dialog.alert = alert

export default Dialog
