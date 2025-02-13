// 服务状态
export enum ServiceStatus {
  INIT, // 初始
  CREATE_INSTANCE, // 创建container实例
  PULLED, // 拉取文件
  MOUNT_FS, // 挂载文件
  INSTALLED_DEPENDENCY, // 安装依赖
  STARTING_SERVER, // 启动服务
  RUNNING, // 运行中
}

// 状态的先后顺序
export const ServiceStatusMap = {
  [ServiceStatus.INIT]: 0,
  [ServiceStatus.CREATE_INSTANCE]: 2,
  [ServiceStatus.PULLED]: 1,
  [ServiceStatus.MOUNT_FS]: 3,
  [ServiceStatus.INSTALLED_DEPENDENCY]: 4,
  [ServiceStatus.STARTING_SERVER]: 5,
  [ServiceStatus.RUNNING]: 6,
}
