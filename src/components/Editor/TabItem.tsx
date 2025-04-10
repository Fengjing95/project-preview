import { currentActiveEditorAtom, IEditorModel } from '@/store/editor'
import { MyTooltip } from '../MyTooltip'
import { getFileIcon, getFileNameFromPath } from '@/lib/getFileLang'
import { cn } from '@/lib/utils'
import { VscClose } from 'react-icons/vsc'
import { useEditorModel } from '@/hooks'
import { useAtom } from 'jotai'

interface IProps {
  data: {
    path: string
  } & IEditorModel
}

export function TabItem(props: IProps) {
  const { data } = props
  const name = getFileNameFromPath(data.path)
  const icon = getFileIcon(name)
  const { removeModel, setCurrentEditor } = useEditorModel()
  const [currentActiveEditor, setCurrentActiveEditor] = useAtom(currentActiveEditorAtom)

  function handleRemove(e: React.MouseEvent<SVGElement, MouseEvent>) {
    const modelMap = removeModel(data.path)
    if (data.path === currentActiveEditor) {
      // 当前激活的编辑器被关闭，切换到上一个编辑器
      const keys = Array.from(modelMap.keys())
      const prevPath = keys[keys.length - 1]
      setCurrentActiveEditor(prevPath)
    }
    e.stopPropagation()
  }

  // TODO: 拖动
  return (
    <MyTooltip message={data.path}>
      <div
        onClick={() => setCurrentEditor(data.path)}
        className={cn([
          'flex',
          'items-center',
          'px-2',
          'gap-1',
          { italic: data.editorType === 'temporary' },
          'group',
          'cursor-pointer',
          { 'bg-accent': currentActiveEditor === data.path },
          'select-none',
        ])}
      >
        {icon}
        {name}
        <VscClose
          onClick={handleRemove}
          className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-popover"
        />
      </div>
    </MyTooltip>
  )
}
