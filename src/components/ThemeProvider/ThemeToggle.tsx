import { useTheme } from '.'
import { BiMoon, BiSun } from 'react-icons/bi'
import { Button } from '@/components/ui/button.tsx'
import { MyTooltip } from '@/components/Tooltip'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <MyTooltip message="切换颜色模式">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (theme === 'dark') {
            setTheme('light')
          } else {
            setTheme('dark')
          }
        }}
      >
        <BiSun className="hidden [html.dark_&]:block" />
        <BiMoon className="hidden [html.light_&]:block" />
      </Button>
    </MyTooltip>
  )
}
