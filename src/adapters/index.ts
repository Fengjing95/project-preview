import { GiteeAdapter } from './GiteeAdapter'
import { GitHubAdapter } from './GitHubAdapter'
import { GitLabAdapter } from './GitLabAdapter'
import { RepositoryAdapter } from './RepositoryAdapter'

export enum RepositoryAdapterEnum {
  GITHUB = 'github',
  GITEE = 'gitee',
  GITLAB = 'gitlab',
}

const adapterMap: Record<string, new (token: string) => RepositoryAdapter> = {
  [RepositoryAdapterEnum.GITHUB]: GitHubAdapter,
  [RepositoryAdapterEnum.GITEE]: GiteeAdapter,
  [RepositoryAdapterEnum.GITLAB]: GitLabAdapter,
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
