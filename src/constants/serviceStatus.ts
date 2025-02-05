// 服务状态
export enum ServiceStatus {
  INIT,
  PULLING,
  CREATE_INSTANCE,
  MOUNT_FS,
  INSTALL_DEPENDENCY,
  STARTING_SERVER,
  RUNNING
}
