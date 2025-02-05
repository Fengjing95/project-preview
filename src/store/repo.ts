import { RepositoryAdapter } from "@/adapters/RepositoryAdapter";
import { getSearchParams } from "@/utils/params";
import { atom } from "jotai";
import { atomWithCache } from 'jotai-cache'

// 仓库适配器实例
export const repositoryAtom = atom<RepositoryAdapter | null>()

// owner
export const ownerAtom = atom(getSearchParams('owner'))

// repo
export const repoAtom = atom(getSearchParams('repo'))

// branch
export const branchAtom = atom(getSearchParams('branch'))

// baseInfo
export const baseInfoAtom = atom(get => {
  return {
    owner: get(ownerAtom),
    repo: get(repoAtom),
    branch: get(branchAtom)
  }
})

// 仓库信息
export const repoInfoAton = atomWithCache(async (get) => {
  const adaptor = get(repositoryAtom)
  const { owner, repo } = get(baseInfoAtom)

  if (!adaptor || !owner || !repo) return
  const ownerInfo = await adaptor.getOwnerInfo(owner)
  const repoUrl = await adaptor.getRepositoryUrl(owner, repo)
  return { ownerInfo, repoUrl }
})
