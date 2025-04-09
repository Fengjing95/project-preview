import { LANGUAGE_ICON, LANGUAGE_MAP } from '@/constants/language'
import { BiCodeAlt } from 'react-icons/bi'

/**
 * 根据文件名称返回文件语言类型
 * @param filename 文件名称
 * @returns
 */
export function getFileLang(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() as keyof typeof LANGUAGE_MAP
  return LANGUAGE_MAP[ext] || 'plaintext'
}

/**
 * 根据文件名返回文件图标
 * @param filename 文件名
 * @returns
 */
export function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() as keyof typeof LANGUAGE_ICON
  return LANGUAGE_ICON[ext] || <BiCodeAlt />
}

/**
 * 根据文件路径返回文件名
 * @param path 文件路径
 * @returns
 */
export function getFileNameFromPath(path: string) {
  return path.split('/').pop() || ''
}
