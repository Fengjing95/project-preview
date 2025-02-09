// 服务状态
export enum ServiceStatus {
  INIT,
  PULLING,
  CREATE_INSTANCE,
  MOUNT_FS,
  INSTALLED_DEPENDENCY,
  STARTING_SERVER,
  RUNNING,
}

// 状态的先后顺序
export const ServiceStatusMap = {
  [ServiceStatus.INIT]: 0,
  [ServiceStatus.PULLING]: 1,
  [ServiceStatus.CREATE_INSTANCE]: 2,
  [ServiceStatus.MOUNT_FS]: 3,
  [ServiceStatus.INSTALLED_DEPENDENCY]: 4,
  [ServiceStatus.STARTING_SERVER]: 5,
  [ServiceStatus.RUNNING]: 6,
}
