import { useTheme } from "."
import { Toggle } from "../ui/toggle"
import { BiMoon, BiSun } from "react-icons/bi"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Toggle
      aria-label="主题"
      title="主题"
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
    </Toggle>
  )
}
