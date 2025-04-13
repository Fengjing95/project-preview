import { Gitlab } from '@gitbeaker/rest'
import { RepositoryAdapter } from './RepositoryAdapter'
import { FileSystemTree } from '@webcontainer/api'

export class GitLabAdapter implements RepositoryAdapter {
  private gitlab: InstanceType<typeof Gitlab>

  /**
   * 创建GitLab适配器实例
   * @param token - GitLab访问令牌，可选参数。如果提供，将用于认证访问
   */
  constructor(token: string) {
    this.gitlab = new Gitlab({
      token,
    })
  }

  /**
   * 获取单个文件的内容
   * @param repo - 仓库名称
   * @param path - 文件路径
   * @param branch - 分支名称
   * @returns 包含文件信息的对象
   */
  private async fetchFile(
    repo: string,
    path: string,
    branch: string,
  ): Promise<{ path: string; type: 'file'; content: string }> {
    const response = await this.gitlab.RepositoryFiles.show(repo, path, branch)

    return {
      path,
      type: 'file',
      content: new TextDecoder().decode(
        Uint8Array.from(atob(response.content || ''), (c) => c.charCodeAt(0)),
      ),
    }
  }

  /**
   * 获取目录中的所有文件和子目录
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   * @param path - 目录路径
   * @param branch - 分支名称
   * @returns 包含文件和目录信息的数组
   */
  private async fetchDirectory(
    repo: string,
    path: string,
    branch: string,
  ): Promise<Array<{ path: string; type: 'file' | 'directory'; content: string }>> {
    const response = await this.gitlab.Repositories.allRepositoryTrees(`${repo}`, {
      path: path || '',
      ref: branch || 'main',
      recursive: true,
    })

    const results = await Promise.all(
      response.map(async (item) => {
        if (item.type === 'tree') {
          return [
            {
              path: item.path,
              type: 'directory' as const,
              content: '',
            },
          ]
        } else if (item.type === 'blob') {
          const file = await this.fetchFile(repo, item.path, branch)
          return [file]
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

  async fetchRepository(_: string, repo: string, branch = 'main') {
    const files = await this.fetchDirectory(repo, '', branch)
    const fileSystem = this.convertToWebContainerFormat(files)
    return { files, fileSystem }
  }

  /**
   * 获取作者信息
   * @param owner 作者
   * @returns
   */
  async getOwnerInfo(owner: string | number): Promise<{
    avatar: string
    htmlUrl: string
    name: string
    bio: string
    company?: string
    location?: string
  }> {
    const response = await this.gitlab.Users.show(owner as number)

    return {
      avatar: response.avatar_url as string,
      htmlUrl: response.web_url as string,
      name: response.username,
      bio: response.bio || '',
      company: response.organization ?? undefined,
      location: response.location ?? undefined,
    }
  }

  /**
   * 获取仓库信息
   * @param owner 作者
   * @param repo 仓库ID
   * @returns
   */
  async getRepositoryStats(
    _: string,
    repo: string,
  ): Promise<{
    stars: number
    forks: number
    watchers: number
    description: string
    url: string
    name: string
  }> {
    const response = await this.gitlab.Projects.show(repo)

    return {
      stars: response.star_count as number,
      forks: response.forks_count as number,
      watchers: 0, // GitLab API doesn't provide watchers count
      description: response.description || '',
      url: response.web_url as string,
      name: response.name as string,
    }
  }
}
