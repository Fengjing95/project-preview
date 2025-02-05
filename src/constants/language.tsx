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
} from "react-icons/bi";

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
  vue: 'vue',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sh: 'shell',
  bash: 'shell',
  sql: 'sql'
} as const;

export const LANGUAGE_ICON: Record<keyof typeof LANGUAGE_MAP, React.ReactElement> = {
  ts: <BiLogoTypescript />,
  cts: <BiLogoTypescript />,
  mts: <BiLogoTypescript />,
  tsx: <BiLogoReact />,
  js: <BiLogoJavascript />,
  cjs: <BiLogoJavascript />,
  mjs: <BiLogoJavascript />,
  jsx: <BiLogoReact />,
  html: <BiLogoHtml5 />,
  css: <BiLogoCss3 />,
  less: <BiLogoLess />,
  scss: <BiLogoSass />,
  sass: <BiLogoSass />,
  json: <BiCodeCurly />,
  md: <BiLogoMarkdown />,
  py: <BiLogoPython />,
  java: <BiLogoJava />,
  cpp: <BiLogoCPlusPlus />,
  c: <BiLogoCPlusPlus />,
  go: <BiLogoGoLang />,
  rs: <BiCodeAlt />,
  php: <BiLogoPhp />,
  rb: <BiCodeAlt />,
  vue: <BiLogoVuejs />,
  yaml: <BiCodeAlt />,
  yml: <BiCodeAlt />,
  xml: <BiCodeAlt />,
  sh: <BiCodeBlock />,
  bash: <BiCodeBlock />,
  sql: <BiCodeAlt />,
}
