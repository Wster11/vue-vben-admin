/**
 * Nexus DMS 类型定义
 */

/** 应用导航视图 */
export type ViewState =
  | 'DASHBOARD'
  | 'DEVICE_CATEGORY'
  | 'DEVICE_MGR'
  | 'FILE_MGR'
  | 'DICT_MGR'
  | 'USER_MGR'
  | 'ROLE_MGR'
  | 'PERM_MGR'

/** 用户信息 */
export interface User {
  id: string
  name: string
  avatar: string
  role: string
}

/** 设备分类 */
export interface Category {
  id: string
  name: string
  description: string
  creator: string
  createdAt: string
  level: 1 | 2 | 3
  parentId: string | null
}

/** 分类动态属性（参数定义） */
export interface CategoryAttribute {
  id: string
  categoryId: string
  name: string
  unit: string
  visible: boolean
}

/** 硬件设备实体 */
export interface Device {
  id: string
  name: string
  model: string
  sn: string // 序列号
  version?: string
  categoryId: string
  status: 'active' | 'maintenance' | 'retired'
  createdAt: string
  creator: string
  /** 基于分类定义的动态参数 */
  parameters?: Record<string, string>

  // 二维码相关字段
  qrAddress?: string
  qrLogo?: string
  qrDesc?: string
  qrData?: string
}

/** 文档文件实体 */
export interface DocFile {
  id: string
  name: string
  size: string
  type: string
  uploadDate: string
  url: string
  creator: string
  version?: string

  // 手册类型和语言
  manualType?: 'CZ' | 'YW' | 'AZ' | 'SS' | string
  language?: string

  categoryId?: string
}

/** 设备-文件多对多关系 */
export interface DeviceFileBinding {
  deviceId: string
  fileId: string
}

/** 全局数据存储接口 */
export interface AppData {
  users: User[]
  categories: Category[]
  attributes: CategoryAttribute[]
  devices: Device[]
  files: DocFile[]
  bindings: DeviceFileBinding[]
  deviceModels: string[]
}
