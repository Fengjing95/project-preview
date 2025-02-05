/**
 * 从search中获取参数
 * @param args 参数列表
 * @returns 
 */
export function getSearchParams(key: string): string | undefined;
export function getSearchParams(...args: string[]): Array<string | undefined>;
export function getSearchParams(...args: string[]) {
  const searchParams = new URLSearchParams(window.location.search);
  if (args.length === 1) {
    return searchParams.get(args[0]) ?? undefined;
  }
  return args.map((arg) => searchParams.get(arg) ?? undefined);
}
