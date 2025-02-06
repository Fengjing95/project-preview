import { KEY_MAP } from "@/constants/keyboard"
import { splitAndRenderCode } from "@/utils/dom"

export function Welcome() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center select-none">
      <div className="text-2xl mb-8">欢迎使用 Preview Code</div>

      {
        [KEY_MAP.fileTree, KEY_MAP.terminal].map((item, index) => {
          return (
            <div key={index} className="flex items-center gap-2">
              <span>{splitAndRenderCode(item.show, '.')} {item.label}</span>
            </div>
          )
        })
      }

      <div className="mt-8 text-sm text-secondary-foreground">
        在左侧文件树中选择文件可以进行编辑（不会持久化保存）
      </div>
    </div>
  )
}