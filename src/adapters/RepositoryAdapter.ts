import { FileSystemTree } from '@webcontainer/api'

export interface RepositoryAdapter {
  fetchRepository(
    owner: string,
    repo: string,
    path?: string,
  ): Promise<{
    files: Array<{
      path: string
      content: string
      type: 'file' | 'directory'
    }>
    fileSystem: FileSystemTree
  }>

  /**
   * 获取仓库的完整URL地址
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   */
  getRepositoryUrl(owner: string, repo: string): Promise<string>

  /**
   * 获取仓库所有者的详细信息
   * @param owner - 仓库所有者用户名
   */
  getOwnerInfo(owner: string): Promise<{
    avatar: string // 头像URL
    htmlUrl: string // 个人主页URL
    name: string // 用户名
    bio: string // 个人简介
    company?: string // 所属公司（可选）
    location?: string // 所在地（可选）
    blog?: string // 博客地址（可选）
    followers: number // 关注者数量
    following: number // 关注数量
  }>
}
