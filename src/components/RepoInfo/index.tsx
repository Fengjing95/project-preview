import { useAtomValue } from 'jotai'
import { baseInfoAtom, gitInfoAtom } from '@/store/repo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { VscGithubInverted, VscRepoForked, VscEye } from 'react-icons/vsc'
import { AiFillStar } from 'react-icons/ai'
import { useEffect, useState } from 'react'

interface RepoStats {
  stars: number
  forks: number
  watchers: number
  description: string
}

export function RepoInfo() {
  const gitInfo = useAtomValue(gitInfoAtom)
  const { owner, repo, repository } = useAtomValue(baseInfoAtom)
  const [stats, setStats] = useState<RepoStats | null>(null)

  useEffect(() => {
    if (repository && owner && repo) {
      repository.getRepositoryStats(owner, repo).then(setStats)
    }
  }, [repository, owner, repo])

  return (
    <div className="p-4">
      {/* 作者信息 */}
      <div className="flex items-center gap-2 mb-2">
        {gitInfo?.ownerInfo ? (
          <Avatar className="w-10 h-10">
            <AvatarImage src={gitInfo.ownerInfo.avatar} alt={gitInfo.ownerInfo.name} />
            <AvatarFallback>{gitInfo.ownerInfo.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        ) : (
          <Skeleton className="w-10 h-10 rounded-full" />
        )}
        <div className="flex-1">
          {gitInfo?.ownerInfo ? (
            <>
              <div
                className="text-sm font-semibold cursor-pointer"
                onClick={() => window.open(gitInfo.ownerInfo.htmlUrl)}
              >
                {gitInfo.ownerInfo.name}
              </div>
              <p className="text-sm text-muted-foreground">{gitInfo.ownerInfo.bio}</p>
              {gitInfo.ownerInfo.company && (
                <p className="text-sm text-muted-foreground">{gitInfo.ownerInfo.company}</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          )}
        </div>
      </div>

      {/* 仓库名称 */}
      <div className="mb-2">
        {gitInfo?.repoInfo.url ? (
          <div
            className="text-sm cursor-pointer"
            onClick={() => window.open(gitInfo?.repoInfo.url)}
          >
            {repo}
          </div>
        ) : (
          <Skeleton className="h-8 w-48" />
        )}
        {/* 仓库描述 */}
        {stats?.description && <p className="text-sm text-muted-foreground">{stats.description}</p>}
      </div>

      {/* 仓库统计 */}
      <div className="flex items-center gap-4">
        {stats ? (
          <>
            <div className="flex items-center gap-2">
              <AiFillStar className="text-xl" />
              <span>{stats.stars}</span>
            </div>
            <div className="flex items-center gap-2">
              <VscRepoForked className="text-xl" />
              <span>{stats.forks}</span>
            </div>
            <div className="flex items-center gap-2">
              <VscEye className="text-xl" />
              <span>{stats.watchers}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <VscGithubInverted className="text-xl" />
            <span>加载中...</span>
          </div>
        )}
      </div>
    </div>
  )
}
