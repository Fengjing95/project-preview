import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAtom } from 'jotai'
import { gitTypeAtom, ownerAtom, repoAtom, tokenAtom } from '@/store/repo'
import { RepositoryAdapterEnum } from '@/adapters'
import { Slash } from 'lucide-react'
import { useState } from 'react'

interface RepoFormProps {
  onSubmit: () => void
  open: boolean
}

const RepoTypeOptions = [
  {
    icon: import.meta.env.BASE_URL + '/images/github-gary.svg',
    selectIcon: import.meta.env.BASE_URL + '/images/github.svg',
    value: RepositoryAdapterEnum.GITHUB,
  },
  {
    icon: import.meta.env.BASE_URL + '/images/gitlab-gary.svg',
    selectIcon: import.meta.env.BASE_URL + '/images/gitlab.svg',
    value: RepositoryAdapterEnum.GITLAB,
  },
  {
    icon: import.meta.env.BASE_URL + '/images/gitee-gary.svg',
    selectIcon: import.meta.env.BASE_URL + '/images/gitee.svg',
    value: RepositoryAdapterEnum.GITEE,
  },
]

export function RepoForm({ onSubmit, open }: RepoFormProps) {
  const [gitType, setGitType] = useAtom(gitTypeAtom)
  const [owner, setOwner] = useAtom(ownerAtom)
  const [repo, setRepo] = useAtom(repoAtom)
  const [token, setToken] = useAtom(tokenAtom)

  const [gitTypeInput, setGitTypeInput] = useState(gitType)
  const [ownerInput, setOwnerInput] = useState(owner)
  const [repoInput, setRepoInput] = useState(repo)
  const [tokenInput, setTokenInput] = useState(token)

  function handleSubmit() {
    // TODO 校验是否有效
    setGitType(gitTypeInput)
    setOwner(ownerInput)
    setRepo(repoInput)
    setToken(tokenInput)

    // 更新URL参数
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('owner', ownerInput as string)
    searchParams.set('repo', repoInput as string)
    searchParams.set('source', gitTypeInput)
    searchParams.set('token', tokenInput as string)
    window.history.replaceState(null, '', `?${searchParams.toString()}`)

    onSubmit?.()
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>填写仓库信息</DialogTitle>
          <DialogDescription>请填写需要预览的代码仓库信息</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">仓库类型</Label>
            <div className="flex gap-2">
              {RepoTypeOptions.map((repo) => (
                <div
                  key={repo.value}
                  className={`w-12 h-12 flex items-center justify-center rounded-md border cursor-pointer hover:bg-accent ${gitTypeInput === repo.value ? 'bg-accent border-primary' : ''}`}
                  onClick={() => setGitTypeInput(repo.value)}
                >
                  <img
                    src={gitTypeInput === repo.value ? repo.selectIcon : repo.icon}
                    alt="github"
                    className="h-5 w-5"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="owner">仓库信息</Label>
            <div className="flex items-center gap-1">
              <Input
                id="owner"
                value={ownerInput}
                onChange={(e) => setOwnerInput(e.target.value)}
                placeholder="请输入仓库所有者（GitLab为userId）"
              />
              <Slash className="w-9 h-9 text-muted-foreground" />
              <Input
                id="repo"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="请输入仓库名称（GitLab为projectId）"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="token">访问令牌</Label>
            <Input
              id="token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="无token有请求限制，建议使用自己的只读token进行预览"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
