import { useAtom, useSetAtom } from 'jotai'
import { gitInfoAtom } from '@/store/repo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { VscRepoForked, VscEye } from 'react-icons/vsc'
import { AiFillStar } from 'react-icons/ai'
import { errorAtom } from '@/store/global'

const LoadingInfo = () => (
  <div className="p-4">
    <div className="flex items-center gap-2 mb-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>

    <div className="mb-2">
      <Skeleton className="h-6 w-88" />
    </div>

    <Skeleton className="h-6 w-88" />
  </div>
)

export function RepoInfo() {
  const [gitInfoAsync] = useAtom(gitInfoAtom)
  const setGlobalError = useSetAtom(errorAtom)

  if (gitInfoAsync.state === 'loading') {
    return <LoadingInfo />
  }

  if (gitInfoAsync.state === 'hasError') {
    setGlobalError(gitInfoAsync.error as Error)
    return <LoadingInfo />
  }

  const gitInfo = gitInfoAsync.data

  return (
    <div className="p-4">
      {/* 作者信息 */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src={gitInfo?.ownerInfo.avatar} alt={gitInfo?.ownerInfo.name} />
          <AvatarFallback>{gitInfo?.ownerInfo.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <>
            <div
              className="text-sm font-semibold cursor-pointer"
              onClick={() => window.open(gitInfo?.ownerInfo.htmlUrl)}
            >
              {gitInfo?.ownerInfo.name}
            </div>
            <p className="text-sm text-muted-foreground">{gitInfo?.ownerInfo.bio}</p>
            {gitInfo?.ownerInfo.company && (
              <p className="text-sm text-muted-foreground">{gitInfo?.ownerInfo.company}</p>
            )}
          </>
        </div>
      </div>

      {/* 仓库名称 */}
      <div className="mb-2">
        <div className="text-sm cursor-pointer" onClick={() => window.open(gitInfo?.repoInfo.url)}>
          {gitInfo?.repoInfo.name}
        </div>

        {/* 仓库描述 */}
        {gitInfo?.stats.description && (
          <p className="text-sm text-muted-foreground">{gitInfo.stats.description}</p>
        )}
      </div>

      {/* 仓库统计 */}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AiFillStar className="text-xl" />
          <span>{gitInfo?.stats.stars}</span>
        </div>
        <div className="flex items-center gap-2">
          <VscRepoForked className="text-xl" />
          <span>{gitInfo?.stats.forks}</span>
        </div>
        <div className="flex items-center gap-2">
          <VscEye className="text-xl" />
          <span>{gitInfo?.stats.watchers}</span>
        </div>
      </div>
    </div>
  )
}
