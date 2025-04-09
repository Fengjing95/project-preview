import { IEditorModel } from '@/store/editor'
import { MyTooltip } from '../MyTooltip'
import { getFileIcon, getFileNameFromPath } from '@/lib/getFileLang'

interface IProps {
  data: {
    path: string
  } & IEditorModel
}

export function TabItem(props: IProps) {
  const { data } = props
  const name = getFileNameFromPath(data.path)
  const icon = getFileIcon(name)

  return (
    <MyTooltip message={data.path}>
      <div className="flex items-center px-4 gap-1">
        {icon}
        {name}
      </div>
    </MyTooltip>
  )
}
