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
  private async request(endpoint: string) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
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
   * @returns 包含文件信息的对象
   */
  private async fetchFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<{ path: string; type: 'file'; content: string }> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`
    const response = await this.request(endpoint)

    if (Array.isArray(response)) {
      throw new Error('Expected a file but received a directory')
    }

    return {
      path: path,
      type: 'file',
      content: atob(response.content || ''),
    }
  }

  /**
   * 获取目录中的所有文件和子目录
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   * @param path - 目录路径
   * @returns 包含文件和目录信息的数组
   */
  private async fetchDirectory(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<Array<{ path: string; type: 'file' | 'directory'; content: string }>> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`
    const response = await this.request(endpoint)

    if (!Array.isArray(response)) {
      throw new Error('Expected a directory but received a file')
    }

    const results = await Promise.all(
      response.map(async (item) => {
        if (item.type === 'dir') {
          const subFiles = await this.fetchDirectory(owner, repo, item.path, ref)
          return [
            {
              path: item.path,
              type: 'directory' as const,
              content: '',
            },
            ...subFiles,
          ]
        } else {
          const file = await this.fetchFile(owner, repo, item.path, ref)
          return [file]
        }
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
