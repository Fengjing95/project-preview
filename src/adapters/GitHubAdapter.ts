import { Octokit } from '@octokit/rest'
import { RepositoryAdapter } from './RepositoryAdapter'
import { FileSystemTree } from '@webcontainer/api'

/**
 * GitHub仓库适配器，用于获取GitHub仓库中的文件内容
 * 实现了RepositoryAdapter接口，提供统一的仓库访问方法
 */
export class GitHubAdapter implements RepositoryAdapter {
  private octokit: Octokit

  /**
   * 创建GitHub适配器实例
   * @param token - GitHub访问令牌，可选参数。如果提供，将用于认证访问
   */
  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    })
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
    branch?: string,
  ): Promise<{ path: string; type: 'file'; content: string }> {
    const response = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })

    if (Array.isArray(response.data) || response.data.type !== 'file') {
      throw new Error('Expected a file but received a directory')
    }

    return {
      path: path,
      type: 'file',
      content: new TextDecoder().decode(
        Uint8Array.from(atob(response.data.content || ''), (c) => c.charCodeAt(0)),
      ),
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
    branch?: string,
  ): Promise<Array<{ path: string; type: 'file' | 'directory'; content: string }>> {
    const response = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })

    if (!Array.isArray(response.data)) {
      throw new Error('Expected a directory but received a file')
    }

    const results = await Promise.all(
      response.data.map(async (item) => {
        if (item.type === 'dir') {
          const subFiles = await this.fetchDirectory(owner, repo, item.path)
          return [
            {
              path: item.path,
              type: 'directory' as const,
              content: '',
            },
            ...subFiles,
          ]
        } else {
          const file = await this.fetchFile(owner, repo, item.path)
          return [file]
        }
      }),
    )
    return results.flat()
  }

  /**
   * 获取GitHub仓库中的文件内容
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   * @param path - 可选的文件路径，默认获取根目录
   * @returns 包含所有文件信息的对象
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
    const response = await this.octokit.users.getByUsername({
      username: owner,
    })

    return {
      avatar: response.data.avatar_url,
      htmlUrl: response.data.html_url,
      name: response.data.login,
      bio: response.data.bio || '',
      company: response.data.company ?? undefined,
      location: response.data.location ?? undefined,
      blog: response.data.blog ?? undefined,
      followers: response.data.followers,
      following: response.data.following,
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
    const response = await this.octokit.repos.get({
      owner,
      repo,
    })

    return {
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      watchers: response.data.watchers_count,
      description: response.data.description || '',
      url: response.data.html_url,
    }
  }
}
