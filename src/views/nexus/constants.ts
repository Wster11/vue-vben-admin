/**
 * Nexus DMS 常量定义
 */

/** 手册类型映射 */
export const MANUAL_TYPE_MAP: Record<string, string> = {
  CZ: '操作手册',
  YW: '运维手册',
  AZ: '安装手册',
  SS: '实施手册',
}

/** 语言选项 */
export const LANGUAGE_OPTIONS = [
  { code: 'zh_cn', label: '中文 (简体)' },
  { code: 'zh_tw', label: '中文 (繁体)' },
  { code: 'en_us', label: '英语 (美国)' },
  { code: 'en_gb', label: '英语 (英国)' },
  { code: 'fr', label: '法语' },
  { code: 'de', label: '德语' },
  { code: 'ja', label: '日语' },
  { code: 'ko', label: '韩语' },
  { code: 'ru', label: '俄语' },
  { code: 'es', label: '西班牙语' },
  { code: 'pt', label: '葡萄牙语' },
  { code: 'it', label: '意大利语' },
  { code: 'ar', label: '阿拉伯语' },
]

/** 设备状态选项 */
export const DEVICE_STATUS_OPTIONS = [
  { value: 'active', label: '运行中', color: 'success' },
  { value: 'maintenance', label: '维护中', color: 'warning' },
  { value: 'retired', label: '已停用', color: 'error' },
]
