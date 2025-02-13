import { ServiceStatus, ServiceStatusMap } from "@/constants/serviceStatus";

/**
 * 判断当前状态是否位于目标状态之前
 * @param target 目标状态
 * @param current 当前状态
 * @returns boolean
 */
export function isBeforeStatus(target: ServiceStatus, current: ServiceStatus) {
  return ServiceStatusMap[target] > ServiceStatusMap[current]
}

/**
 * 判断当前状态是否处于目标状态
 * @param target 目标状态
 * @param current 当前状态
 * @returns boolean
 */
export function isEqualStatus(target: ServiceStatus, current: ServiceStatus) {
  return ServiceStatusMap[target] === ServiceStatusMap[current]
}

/**
 * 判断当前状态是否位于目标状态之后
 * @param target 目标状态
 * @param current 当前状态
 * @returns boolean
 */
export function isAfterStatus(target: ServiceStatus, current: ServiceStatus) {
  return ServiceStatusMap[target] < ServiceStatusMap[current]
}
