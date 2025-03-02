import { RepositoryAdapter } from '@/adapters/RepositoryAdapter'
import { getSearchParams } from '@/lib/params'
import { atom, getDefaultStore } from 'jotai'
import { atomWithCache } from 'jotai-cache'
import { errorAtom } from './global'
import { loadable } from 'jotai/utils'

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
export const repositoryAtom = atom<RepositoryAdapter | null>(null)

// baseInfo
export const baseInfoAtom = atom((get) => {
  return {
    owner: get(ownerAtom),
    repo: get(repoAtom),
    branch: get(branchAtom),
    token: get(tokenAtom),
    gitType: get(gitTypeAtom),
  }
})

// 仓库信息
const gitInfoAtomBase = atomWithCache(async (get) => {
  const adaptor = get(repositoryAtom)
  const { owner, repo } = get(baseInfoAtom)

  if (!adaptor || !owner || !repo) return
  try {
    const ownerInfo = await adaptor.getOwnerInfo(owner)
    const repoInfo = await adaptor.getRepositoryStats(owner, repo)
    const stats = await adaptor.getRepositoryStats(owner, repo)
    return { ownerInfo, repoInfo, stats }
  } catch (error) {
    const store = getDefaultStore()
    store.set(errorAtom, error as Error)
  }
})

export const gitInfoAtom = loadable(gitInfoAtomBase)
