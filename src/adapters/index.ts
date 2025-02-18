import { GiteeAdapter } from './GiteeAdapter'
import { GitHubAdapter } from './GitHubAdapter'
import { RepositoryAdapter } from './RepositoryAdapter'

const adapterMap: Record<string, new (token: string) => RepositoryAdapter> = {
  github: GitHubAdapter,
  gitee: GiteeAdapter,
}

/**
 * 根据仓库类型获取适配器
 * @param type 仓库类型
 * @returns
 */
export function getAdapter(type: string): new (token: string) => RepositoryAdapter {
  if (!(type in adapterMap)) {
    throw new Error(`不支持的仓库类型: ${type}`)
  }
  return adapterMap[type]
}
