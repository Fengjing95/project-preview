// 服务状态
export enum ServiceStatus {
  NULL, // 空状态
  INIT, // 初始化
  CREATE_INSTANCE, // 创建container实例
  PULLED, // 拉取文件
  MOUNT_FS, // 挂载文件
  INSTALLED_DEPENDENCY, // 安装依赖
  STARTING_SERVER, // 启动服务
  RUNNING, // 运行中
}

// 状态的先后顺序
export const ServiceStatusMap = {
  [ServiceStatus.NULL]: 0,
  [ServiceStatus.INIT]: 1,
  [ServiceStatus.CREATE_INSTANCE]: 2,
  [ServiceStatus.PULLED]: 3,
  [ServiceStatus.MOUNT_FS]: 4,
  [ServiceStatus.INSTALLED_DEPENDENCY]: 5,
  [ServiceStatus.STARTING_SERVER]: 6,
  [ServiceStatus.RUNNING]: 7,
}
