/**
 * Nexus DMS 数据存储
 * 使用 LocalStorage 进行持久化
 */

import type { AppData, Category, CategoryAttribute, Device, DocFile, User } from '../types'

const STORAGE_KEY = 'nexus_dms_db_v1'

// 初始化模拟数据
const generateMockCategories = (): Category[] => {
  const codes = ['CF', 'CH', 'IH', 'PE', 'SA', 'WM']
  const descriptions = [
    '离心机 (Centrifuge)',
    '底盘 (Chassis)',
    '感应加热 (Induction Heating)',
    '电力电子 (Power Electronics)',
    '频谱分析仪 (Spectrum Analyzer)',
    '清洗机 (Washing Machine)',
  ]
  return codes.map((code, index) => ({
    id: `cat-${code}`,
    name: code,
    description: descriptions[index] || '',
    creator: '系统管理员',
    createdAt: '2023-01-01',
    level: 1 as const,
    parentId: null,
  }))
}

const INITIAL_DATA: AppData = {
  users: [
    {
      id: 'u1',
      name: '系统管理员',
      role: '超级管理员',
      avatar: 'https://q1.qlogo.cn/g?b=qq&nk=190848757&s=640',
    },
  ],
  categories: generateMockCategories(),
  attributes: [
    { id: 'a1', categoryId: 'cat-CF', name: '转速', unit: 'rpm', visible: true },
    { id: 'a2', categoryId: 'cat-CH', name: '载重', unit: 'kg', visible: true },
  ],
  devices: [
    {
      id: 'd1',
      name: 'CF-200-1',
      model: 'CF-200',
      sn: 'SN2023001',
      version: 'v1.0',
      categoryId: 'cat-CF',
      status: 'maintenance',
      createdAt: '2023-10-15',
      creator: '张三',
      parameters: { 转速: '3000' },
      qrAddress: 'CF-200-1SN2023001',
      qrDesc: '主离心机',
    },
    {
      id: 'd2',
      name: 'CH-Alpha-1',
      model: 'CH-Alpha',
      sn: 'SN2023002',
      version: 'v2.1',
      categoryId: 'cat-CH',
      status: 'maintenance',
      createdAt: '2023-11-01',
      creator: '李四',
    },
  ],
  files: [
    {
      id: 'f1',
      name: 'TD-RND-CF-001-cn',
      size: '2.4 MB',
      type: 'PDF',
      uploadDate: '2023-10-15',
      url: '#',
      creator: '张三',
      manualType: 'CZ',
      language: 'zh_cn',
      categoryId: 'cat-CF',
      version: 'v1.0',
    },
  ],
  bindings: [{ deviceId: 'd1', fileId: 'f1' }],
  deviceModels: ['CF-200', 'CH-Alpha'],
}

class NexusStore {
  private data: AppData

  constructor() {
    this.loadData()
  }

  private loadData() {
    const saved = localStorage.getItem(STORAGE_KEY)
    this.data = saved ? JSON.parse(saved) : INITIAL_DATA
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
  }

  // ========== 用户相关 ==========
  getCurrentUser(): User {
    return this.data.users[0]
  }

  // ========== 分类相关 ==========
  getCategories(): Category[] {
    return this.data.categories
  }

  addCategory(category: Category) {
    this.data.categories.push(category)
    this.persist()
  }

  updateCategory(category: Category) {
    const idx = this.data.categories.findIndex((c) => c.id === category.id)
    if (idx > -1) {
      this.data.categories[idx] = category
      this.persist()
    }
  }

  deleteCategory(id: string) {
    this.data.categories = this.data.categories.filter((c) => c.id !== id)
    // 同时删除关联的属性
    this.data.attributes = this.data.attributes.filter((a) => a.categoryId !== id)
    this.persist()
  }

  // ========== 属性相关 ==========
  getAttributes(categoryId: string): CategoryAttribute[] {
    return this.data.attributes.filter((a) => a.categoryId === categoryId)
  }

  saveAttributes(categoryId: string, attributes: CategoryAttribute[]) {
    // 先删除该分类的所有属性
    this.data.attributes = this.data.attributes.filter((a) => a.categoryId !== categoryId)
    // 添加新的属性
    this.data.attributes.push(...attributes)
    this.persist()
  }

  getAllUniqueAttributeNames(): string[] {
    const names = new Set(this.data.attributes.map((a) => a.name))
    return Array.from(names)
  }

  // ========== 设备相关 ==========
  getDevices(): Device[] {
    return this.data.devices
  }

  addDevice(device: Device) {
    this.data.devices.push(device)
    // 更新型号字典
    if (device.model && !this.data.deviceModels.includes(device.model)) {
      this.data.deviceModels.push(device.model)
    }
    this.persist()
  }

  updateDevice(device: Device) {
    const idx = this.data.devices.findIndex((d) => d.id === device.id)
    if (idx > -1) {
      this.data.devices[idx] = device
      // 更新型号字典
      if (device.model && !this.data.deviceModels.includes(device.model)) {
        this.data.deviceModels.push(device.model)
      }
      this.persist()
    }
  }

  deleteDevice(id: string) {
    this.data.devices = this.data.devices.filter((d) => d.id !== id)
    // 删除关联的绑定
    this.data.bindings = this.data.bindings.filter((b) => b.deviceId !== id)
    this.persist()
  }

  getDeviceModels(): string[] {
    return this.data.deviceModels
  }

  // ========== 文件相关 ==========
  getFiles(): DocFile[] {
    return this.data.files
  }

  addFile(file: DocFile) {
    this.data.files.push(file)
    this.persist()
  }

  updateFile(file: DocFile) {
    const idx = this.data.files.findIndex((f) => f.id === file.id)
    if (idx > -1) {
      this.data.files[idx] = file
      this.persist()
    }
  }

  deleteFile(id: string) {
    this.data.files = this.data.files.filter((f) => f.id !== id)
    // 删除关联的绑定
    this.data.bindings = this.data.bindings.filter((b) => b.fileId !== id)
    this.persist()
  }

  // ========== 绑定关系相关 ==========
  getBindings() {
    return this.data.bindings
  }

  getFilesForDevice(deviceId: string): DocFile[] {
    const fileIds = this.data.bindings.filter((b) => b.deviceId === deviceId).map((b) => b.fileId)
    return this.data.files.filter((f) => fileIds.includes(f.id))
  }

  getDevicesForFile(fileId: string): Device[] {
    const deviceIds = this.data.bindings.filter((b) => b.fileId === fileId).map((b) => b.deviceId)
    return this.data.devices.filter((d) => deviceIds.includes(d.id))
  }

  bindFilesToDevice(deviceId: string, fileIds: string[]) {
    fileIds.forEach((fileId) => {
      if (!this.data.bindings.find((b) => b.deviceId === deviceId && b.fileId === fileId)) {
        this.data.bindings.push({ deviceId, fileId })
      }
    })
    this.persist()
  }

  bindDevicesToFile(fileId: string, deviceIds: string[]) {
    deviceIds.forEach((deviceId) => {
      if (!this.data.bindings.find((b) => b.deviceId === deviceId && b.fileId === fileId)) {
        this.data.bindings.push({ deviceId, fileId })
      }
    })
    this.persist()
  }

  unbindFileFromDevice(deviceId: string, fileId: string) {
    this.data.bindings = this.data.bindings.filter(
      (b) => !(b.deviceId === deviceId && b.fileId === fileId),
    )
    this.persist()
  }

  checkDeviceLinked(deviceId: string): boolean {
    return this.data.bindings.some((b) => b.deviceId === deviceId)
  }
}

// 导出单例
export const nexusStore = new NexusStore()
