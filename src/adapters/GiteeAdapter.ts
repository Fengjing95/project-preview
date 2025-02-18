import { RepositoryAdapter } from './RepositoryAdapter'
import { FileSystemTree } from '@webcontainer/api'

/**
 * Gitee仓库适配器，用于获取Gitee仓库中的文件内容
 * 实现了RepositoryAdapter接口，提供统一的仓库访问方法
 */
export class GiteeAdapter implements RepositoryAdapter {
  private baseUrl = 'https://gitee.com/api/v5'
  private token?: string

  /**
   * 创建Gitee适配器实例
   * @param token - Gitee访问令牌，可选参数。如果提供，将用于认证访问
   */
  constructor(token?: string) {
    this.token = token
  }

  /**
   * 发起API请求
   * @param endpoint - API端点
   * @returns Promise<Response>
   */
  private async request<T = any>(endpoint: string): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (this.token) {
      if (url.includes('?')) {
        url += `&access_token=${this.token}`
      } else {
        url += `?access_token=${this.token}`
      }
    }
    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`Gitee API request failed: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取单个文件的内容
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   * @param path - 文件路径
   * @params sha - 文件的SHA值
   * @returns 包含文件信息的对象
   */
  private async fetchFile(
    owner: string,
    repo: string,
    path: string,
    sha: string,
  ): Promise<{ path: string; type: 'file'; content: string }> {
    const endpoint = `/repos/${owner}/${repo}/git/blobs/${sha}`
    const response = await this.request<{
      sha: string
      size: number
      url: string
      content: string
      encoding: string
    }>(endpoint)

    if (!response.sha) {
      throw new Error('Failed to get file blob')
    }

    return {
      path: path,
      type: 'file',
      content: new TextDecoder().decode(
        Uint8Array.from(atob(response.content || ''), (c) => c.charCodeAt(0)),
      ),
    }
  }

  /**
   * 获取目录下的文件列表
   * @param owner - 作者
   * @param repo - 仓库名称
   * @param path - 路径
   * @param ref - 分支
   * @returns
   */
  private async fetchDirectory(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<Array<{ path: string; type: 'file' | 'directory'; content: string }>> {
    const treeEndpoint = `/repos/${owner}/${repo}/git/trees/${ref || 'master'}?recursive=1`
    const response = await this.request<{
      sha: string
      url: string
      tree: Array<{
        path: string
        mode: string
        type: 'tree' | 'blob'
        sha: string
        size: number
        url: string
      }>
      truncated: boolean
    }>(treeEndpoint)

    if (!response.tree) {
      throw new Error('Failed to get repository tree')
    }

    const results = await Promise.all(
      response.tree
        .filter((item) => !path || item.path.startsWith(path))
        .map(async (item) => {
          if (item.type === 'tree') {
            return [
              {
                path: item.path,
                type: 'directory' as const,
                content: '',
              },
            ]
          } else if (item.type === 'blob') {
            const file = await this.fetchFile(owner, repo, item.path, item.sha)
            return file
          }
          return []
        }),
    )
    return results.flat()
  }

  /**
   * 转换为WebContainer格式
   * @param files - 文件列表
   * @returns FileSystemTree格式的文件系统
   */
  private convertToWebContainerFormat(
    files: Array<{ path: string; type: 'file' | 'directory'; content: string }>,
  ) {
    const fileSystem: FileSystemTree = {}

    for (const file of files) {
      const pathParts = file.path.split('/')
      let current = fileSystem

      // 处理路径中的每一部分
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i]

        // 如果是最后一个部分
        if (i === pathParts.length - 1) {
          if (file.type === 'file') {
            current[part] = {
              file: {
                contents: file.content,
              },
            }
          } else if (file.type === 'directory') {
            current[part] = {
              directory: {},
            }
          }
        } else {
          // 如果不是最后一部分，创建中间目录
          if (!current[part]) {
            current[part] = {
              directory: {},
            }
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          current = current[part].directory
        }
      }
    }

    return fileSystem
  }

  async fetchRepository(owner: string, repo: string, branch?: string) {
    const files = await this.fetchDirectory(owner, repo, '', branch)
    const fileSystem = this.convertToWebContainerFormat(files)
    return { files, fileSystem }
  }

  /**
   * 获取仓库地址
   * @param owner 作者
   * @param repo 仓库名称
   * @returns
   */
  async getRepositoryUrl(owner: string, repo: string): Promise<string> {
    const endpoint = `/repos/${owner}/${repo}`
    const response = await this.request(endpoint)
    return response.html_url
  }

  /**
   * 获取作者信息
   * @param owner 作者
   * @returns
   */
  async getOwnerInfo(owner: string): Promise<{
    avatar: string
    htmlUrl: string
    name: string
    bio: string
    company?: string
    location?: string
    blog?: string
    followers: number
    following: number
  }> {
    const endpoint = `/users/${owner}`
    const response = await this.request(endpoint)

    return {
      avatar: response.avatar_url,
      htmlUrl: response.html_url,
      name: response.login,
      bio: response.bio || '',
      company: response.company ?? undefined,
      location: response.location ?? undefined,
      blog: response.blog ?? undefined,
      followers: response.followers,
      following: response.following,
    }
  }

  /**
   * 获取仓库信息
   * @param owner 作者
   * @param repo 仓库名称
   * @returns
   */
  async getRepositoryStats(
    owner: string,
    repo: string,
  ): Promise<{
    stars: number
    forks: number
    watchers: number
    description: string
    url: string
  }> {
    const endpoint = `/repos/${owner}/${repo}`
    const response = await this.request(endpoint)

    return {
      stars: response.stargazers_count,
      forks: response.forks_count,
      watchers: response.watchers_count,
      description: response.description || '',
      url: response.html_url,
    }
  }
}
