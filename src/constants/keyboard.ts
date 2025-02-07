export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

export const KEY_MAP = {
  save: {
    key: [isMac ? 'meta.s' : 'ctrl.s'],
    show: isMac ? '⌘.S' : 'Ctrl.S',
    label: '保存文件',
  },
  fileTree: {
    key: [isMac ? 'meta.b' : 'ctrl.b'],
    show: isMac ? '⌘.B' : 'Ctrl.B',
    label: '打开/收起文件树',
  },
  terminal: {
    key: ['ctrl.graveaccent'],
    show: 'Ctrl.`',
    label: '打开/收起底栏',
  },
}
