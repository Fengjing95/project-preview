import { getAdapter } from '@/adapters'
import { RepositoryAdapter } from '@/adapters/RepositoryAdapter'
import { getSearchParams } from '@/lib/params'
import { atom } from 'jotai'
import { atomWithCache } from 'jotai-cache'

// owner
export const ownerAtom = atom(getSearchParams('owner'))

// repo
export const repoAtom = atom(getSearchParams('repo'))

// branch
export const branchAtom = atom(getSearchParams('branch'))

// repo token
export const tokenAtom = atom(getSearchParams('token'))

// git 类型
export const gitTypeAtom = atom(getSearchParams('source') as string)

// 仓库适配器实例
export const repositoryAtom = atom<RepositoryAdapter | null>((get) => {
  const Constructor = getAdapter(get(gitTypeAtom))
  return new Constructor(get(tokenAtom) as string)
})

// baseInfo
export const baseInfoAtom = atom((get) => {
  return {
    owner: get(ownerAtom),
    repo: get(repoAtom),
    branch: get(branchAtom),
    token: get(tokenAtom),
    repository: get(repositoryAtom),
  }
})

// 仓库信息
export const gitInfoAtom = atomWithCache(async (get) => {
  const adaptor = get(repositoryAtom)
  const { owner, repo } = get(baseInfoAtom)

  if (!adaptor || !owner || !repo) return
  const ownerInfo = await adaptor.getOwnerInfo(owner)
  const repoInfo = await adaptor.getRepositoryStats(owner, repo)
  return { ownerInfo, repoInfo }
})
