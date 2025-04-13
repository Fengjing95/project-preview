import { createRoot } from 'react-dom/client'
import MyDialog from '.'

interface AlertOptions {
  title?: string
  content?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const alert = (options: AlertOptions) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const handleConfirm = () => {
    options.onConfirm?.()
    root.unmount()
    container.remove()
  }

  const handleCancel = () => {
    options.onCancel?.()
    root.unmount()
    container.remove()
  }

  root.render(
    <MyDialog
      open={true}
      title={options.title}
      content={options.content}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />,
  )
}

export default alert
