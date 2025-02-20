import {
  BiLogoReact,
  BiLogoTypescript,
  BiLogoJavascript,
  BiLogoHtml5,
  BiLogoCss3,
  BiLogoLess,
  BiLogoSass,
  BiCodeCurly,
  BiLogoMarkdown,
  BiLogoPython,
  BiLogoJava,
  BiLogoCPlusPlus,
  BiLogoGoLang,
  BiCodeAlt,
  BiLogoPhp,
  BiLogoVuejs,
  BiCodeBlock,
} from 'react-icons/bi'

// 文件后缀-语言映射
export const LANGUAGE_MAP = {
  ts: 'typescript',
  cts: 'typescript',
  mts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  cjs: 'javascript',
  mjs: 'javascript',
  jsx: 'javascript',
  html: 'html',
  css: 'css',
  less: 'less',
  scss: 'sass',
  sass: 'sass',
  json: 'json',
  md: 'markdown',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rs: 'rust',
  php: 'php',
  rb: 'ruby',
  vue: 'html',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sh: 'shell',
  bash: 'shell',
  sql: 'sql',
} as const

export const LANGUAGE_ICON: Record<keyof typeof LANGUAGE_MAP, React.ReactElement> = {
  ts: <BiLogoTypescript className="text-[#3178C6]" />,
  cts: <BiLogoTypescript className="text-[#3178C6]" />,
  mts: <BiLogoTypescript className="text-[#3178C6]" />,
  tsx: <BiLogoReact className="text-[#3178C6]" />,
  js: <BiLogoJavascript className="text-[#F7DF1E]" />,
  cjs: <BiLogoJavascript className="text-[#F7DF1E]" />,
  mjs: <BiLogoJavascript className="text-[#F7DF1E]" />,
  jsx: <BiLogoReact className="text-[#F7DF1E]" />,
  html: <BiLogoHtml5 className="text-[#E34F26]" />,
  css: <BiLogoCss3 className="text-[#1572B6]" />,
  less: <BiLogoLess className="text-[#1D365D]" />,
  scss: <BiLogoSass className="text-[#CC6699]" />,
  sass: <BiLogoSass className="text-[#CC6699]" />,
  json: <BiCodeCurly />,
  md: <BiLogoMarkdown />,
  py: <BiLogoPython className="text-[#3776AB]" />,
  java: <BiLogoJava />,
  cpp: <BiLogoCPlusPlus className="text-[#00599C]" />,
  c: <BiLogoCPlusPlus className="text-[#A8B9CC]" />,
  go: <BiLogoGoLang className="text-[#00ADD8]" />,
  rs: <BiCodeAlt />,
  php: <BiLogoPhp className="text-[#777BB4]" />,
  rb: <BiCodeAlt className="text-[#CC342D]" />,
  vue: <BiLogoVuejs className="text-[#4FC08D]" />,
  yaml: <BiCodeAlt className="text-[#CB171E]" />,
  yml: <BiCodeAlt className="text-[#CB171E]" />,
  xml: <BiCodeAlt className="text-[#005FAD]" />,
  sh: <BiCodeBlock className="text-[#F15A24]" />,
  bash: <BiCodeBlock className="text-[#4EAA25]" />,
  sql: <BiCodeAlt className="text-[#4479A1]" />,
}
