import { RepositoryAdapter } from '@/adapters/RepositoryAdapter'
import { getSearchParams } from '@/lib/params'
import { atom } from 'jotai'
import { atomWithCache } from 'jotai-cache'
import { GitHubAdapter } from '@/adapters/GitHubAdapter.ts'

// owner
export const ownerAtom = atom(getSearchParams('owner'))

// repo
export const repoAtom = atom(getSearchParams('repo'))

// branch
export const branchAtom = atom(getSearchParams('branch'))

// repo token
export const tokenAtom = atom(getSearchParams('token'))

// 仓库适配器实例
export const repositoryAtom = atom<RepositoryAdapter | null>(
  new GitHubAdapter(getSearchParams('token')),
)

// baseInfo
export const baseInfoAtom = atom(
  (get) => {
    return {
      owner: get(ownerAtom),
      repo: get(repoAtom),
      branch: get(branchAtom),
      token: get(tokenAtom),
      repository: get(repositoryAtom),
    }
  },
  (_, set, value: { owner: string; repo: string; branch: string; token: string }) => {
    // TODO
    set(ownerAtom, value.owner)
    set(repoAtom, value.repo)
    set(branchAtom, value.branch)
    set(tokenAtom, value.token)
    set(repositoryAtom, new GitHubAdapter(value.token))
  },
)

// 仓库信息
export const repoInfoAtom = atomWithCache(async (get) => {
  const adaptor = get(repositoryAtom)
  const { owner, repo } = get(baseInfoAtom)

  if (!adaptor || !owner || !repo) return
  const ownerInfo = await adaptor.getOwnerInfo(owner)
  const repoInfo = await adaptor.getRepositoryStats(owner, repo)
  return { ownerInfo, repoUrl: repoInfo.url }
})
