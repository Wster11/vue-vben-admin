import { MockMethod } from 'vite-plugin-mock'
import { resultError, resultSuccess, resultPageSuccess, requestParams } from '../_util'
import type { MockMethod } from 'vite-plugin-mock'
import { resultError, resultSuccess, resultPageSuccess, requestParams } from '../_util'

// 模拟数据
const mockCategories = [
  {
    id: 1,
    categoryName: '服务器',
    categoryDes: '服务器设备',
    realValue: '服务器类型描述',
    delFlag: '0',
    createBy: 'admin',
    createTime: '2025-01-01 12:00:00',
    updateBy: 'admin',
    updateTime: '2025-01-01 12:00:00',
    remark: '服务器类型',
    attributes: [
      {
        id: 1,
        categoryAttributeName: 'CPU型号',
        categoryAttributeEnglishName: 'cpu_model',
        categoryAttributeType: '字符串',
        visibility: 0,
        unit: '',
        createBy: 'admin',
        createTime: '2025-01-01 12:00:00',
        updateBy: 'admin',
        updateTime: '2025-01-01 12:00:00',
        remark: 'CPU型号属性',
      },
      {
        id: 2,
        categoryAttributeName: '内存容量',
        categoryAttributeEnglishName: 'memory_capacity',
        categoryAttributeType: '字符串',
        visibility: 0,
        unit: 'GB',
        createBy: 'admin',
        createTime: '2025-01-01 12:00:00',
        updateBy: 'admin',
        updateTime: '2025-01-01 12:00:00',
        remark: '内存容量属性',
      },
    ],
  },
  {
    id: 2,
    categoryName: '交换机',
    categoryDes: '网络交换机',
    realValue: '交换机类型描述',
    delFlag: '0',
    createBy: 'admin',
    createTime: '2025-01-02 12:00:00',
    updateBy: 'admin',
    updateTime: '2025-01-02 12:00:00',
    remark: '交换机类型',
    attributes: [
      {
        id: 3,
        categoryAttributeName: '端口数量',
        categoryAttributeEnglishName: 'port_count',
        categoryAttributeType: '数字',
        visibility: 0,
        unit: '个',
        createBy: 'admin',
        createTime: '2025-01-02 12:00:00',
        updateBy: 'admin',
        updateTime: '2025-01-02 12:00:00',
        remark: '端口数量属性',
      },
    ],
  },
]

const mockDevices = [
  {
    id: 1,
    deviceName: '服务器001',
    categoryId: 1,
    categoryName: '服务器',
    attributes: {
      cpu_model: 'Intel Xeon E5-2670',
      memory_capacity: '32',
    },
    createBy: 'admin',
    createTime: '2025-01-03 12:00:00',
    updateBy: 'admin',
    updateTime: '2025-01-03 12:00:00',
    remark: '测试服务器',
  },
]

const mockFiles = [
  {
    id: 1,
    fileName: '服务器使用手册.pdf',
    fileType: 'pdf',
    filePath: '/upload/files/server_manual.pdf',
    fileSize: '1024',
    uploadBy: 'admin',
    uploadTime: '2025-01-04 12:00:00',
    remark: '服务器使用手册',
  },
]

const mockLanguages = [
  {
    id: 1,
    languageName: '中文',
    languageCode: 'zh-CN',
    createBy: 'admin',
    createTime: '2025-01-05 12:00:00',
    updateBy: 'admin',
    updateTime: '2025-01-05 12:00:00',
    remark: '中文语言',
  },
  {
    id: 2,
    languageName: '英文',
    languageCode: 'en-US',
    createBy: 'admin',
    createTime: '2025-01-05 12:00:00',
    updateBy: 'admin',
    updateTime: '2025-01-05 12:00:00',
    remark: '英文语言',
  },
]

const mockHomeCount = {
  deviceCount: 100,
  fileCount: 500,
  categoryCount: 20,
  languageCount: 5,
}

export default [
  // 获取验证码
  {
    url: '/basic-api/captchaImage',
    method: 'get',
    response: () => {
      return resultSuccess({
        uuid: '123456',
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      })
    },
  },

  // 登录
  {
    url: '/basic-api/login1',
    method: 'post',
    response: ({ body }: requestParams) => {
      const { username, password } = body
      if (username === 'admin' && password === 'admin123') {
        return resultSuccess({
          token: 'fakeToken',
          userInfo: {
            userId: '1',
            username: 'admin',
            realName: '管理员',
            avatar: '',
            roles: ['admin'],
          },
        })
      }
      return resultError('用户名或密码错误')
    },
  },

  // 分类列表
  {
    url: '/basic-api/v1/category/list',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { page, pageSize } = query
      return resultPageSuccess(page || 1, pageSize || 10, mockCategories, { message: '查询成功' })
    },
  },

  // 获取所有分类
  {
    url: '/basic-api/v1/category/listAll',
    method: 'get',
    response: () => {
      return resultSuccess(mockCategories, { message: '查询成功' })
    },
  },

  // 获取分类详情
  {
    url: '/basic-api/v1/category/{id}',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { id } = query
      const category = mockCategories.find((item) => item.id === Number(id))
      if (category) {
        return resultSuccess(category, { message: '查询成功' })
      }
      return resultError('分类不存在')
    },
  },

  // 添加分类
  {
    url: '/basic-api/v1/category/add',
    method: 'post',
    response: ({ body }: requestParams) => {
      const newCategory = {
        ...body,
        id: mockCategories.length + 1,
        createBy: 'admin',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateBy: 'admin',
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        attributes: [],
      }
      mockCategories.push(newCategory)
      return resultSuccess(null, { message: '操作成功' })
    },
  },

  // 编辑分类
  {
    url: '/basic-api/v1/category/edit',
    method: 'put',
    response: ({ body }: requestParams) => {
      const { id } = body
      const index = mockCategories.findIndex((item) => item.id === Number(id))
      if (index !== -1) {
        mockCategories[index] = {
          ...mockCategories[index],
          ...body,
          updateBy: 'admin',
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
        return resultSuccess(null, { message: '操作成功' })
      }
      return resultError('分类不存在')
    },
  },

  // 获取分类代码列表
  {
    url: '/basic-api/v1/category/getCodeList',
    method: 'get',
    response: () => {
      return resultSuccess([], { message: '查询成功' })
    },
  },

  // 获取分类模型列表
  {
    url: '/basic-api/v1/category/getModelList',
    method: 'get',
    response: () => {
      return resultSuccess([], { message: '查询成功' })
    },
  },

  // 设备列表
  {
    url: '/basic-api/v1/device/list',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { page, pageSize } = query
      return resultPageSuccess(page || 1, pageSize || 10, mockDevices, { message: '查询成功' })
    },
  },

  // 获取设备详情
  {
    url: '/basic-api/v1/device/{id}',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { id } = query
      const device = mockDevices.find((item) => item.id === Number(id))
      if (device) {
        return resultSuccess(device, { message: '查询成功' })
      }
      return resultError('设备不存在')
    },
  },

  // 添加设备
  {
    url: '/basic-api/v1/device/add',
    method: 'post',
    response: ({ body }: requestParams) => {
      const newDevice = {
        ...body,
        id: mockDevices.length + 1,
        createBy: 'admin',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateBy: 'admin',
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockDevices.push(newDevice)
      return resultSuccess(null, { message: '操作成功' })
    },
  },

  // 编辑设备
  {
    url: '/basic-api/v1/device/edit',
    method: 'put',
    response: ({ body }: requestParams) => {
      const { id } = body
      const index = mockDevices.findIndex((item) => item.id === Number(id))
      if (index !== -1) {
        mockDevices[index] = {
          ...mockDevices[index],
          ...body,
          updateBy: 'admin',
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
        return resultSuccess(null, { message: '操作成功' })
      }
      return resultError('设备不存在')
    },
  },

  // 绑定设备文件
  {
    url: '/basic-api/v1/device/bindFile',
    method: 'post',
    response: () => {
      return resultSuccess(null, { message: '操作成功' })
    },
  },

  // 文件列表
  {
    url: '/basic-api/v1/fileManager/list',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { page, pageSize } = query
      return resultPageSuccess(page || 1, pageSize || 10, mockFiles, { message: '查询成功' })
    },
  },

  // 添加文件
  {
    url: '/basic-api/v1/fileManager/add',
    method: 'post',
    response: ({ body }: requestParams) => {
      const newFile = {
        ...body,
        id: mockFiles.length + 1,
        uploadBy: 'admin',
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockFiles.push(newFile)
      return resultSuccess(null, { message: '操作成功' })
    },
  },

  // 编辑文件
  {
    url: '/basic-api/v1/fileManager/edit',
    method: 'put',
    response: ({ body }: requestParams) => {
      const { id } = body
      const index = mockFiles.findIndex((item) => item.id === Number(id))
      if (index !== -1) {
        mockFiles[index] = {
          ...mockFiles[index],
          ...body,
          updateBy: 'admin',
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
        return resultSuccess(null, { message: '操作成功' })
      }
      return resultError('文件不存在')
    },
  },

  // 删除文件
  {
    url: '/basic-api/v1/fileManager/nullifyById/{id}',
    method: 'delete',
    response: ({ query }: requestParams) => {
      const { id } = query
      const index = mockFiles.findIndex((item) => item.id === Number(id))
      if (index !== -1) {
        mockFiles.splice(index, 1)
        return resultSuccess(null, { message: '操作成功' })
      }
      return resultError('文件不存在')
    },
  },

  // 首页统计信息
  {
    url: '/basic-api/v1/home/getCountInfo',
    method: 'get',
    response: () => {
      return resultSuccess(mockHomeCount, { message: '查询成功' })
    },
  },

  // 语言字典列表
  {
    url: '/basic-api/v1/languagesDic/list',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { page, pageSize } = query
      return resultPageSuccess(page || 1, pageSize || 10, mockLanguages, { message: '查询成功' })
    },
  },

  // 获取语言字典详情
  {
    url: '/basic-api/v1/languagesDic/{id}',
    method: 'get',
    response: ({ query }: requestParams) => {
      const { id } = query
      const language = mockLanguages.find((item) => item.id === Number(id))
      if (language) {
        return resultSuccess(language, { message: '查询成功' })
      }
      return resultError('语言字典不存在')
    },
  },

  // 添加语言字典
  {
    url: '/basic-api/v1/languagesDic/add',
    method: 'post',
    response: ({ body }: requestParams) => {
      const newLanguage = {
        ...body,
        id: mockLanguages.length + 1,
        createBy: 'admin',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateBy: 'admin',
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockLanguages.push(newLanguage)
      return resultSuccess(null, { message: '操作成功' })
    },
  },

  // 编辑语言字典
  {
    url: '/basic-api/v1/languagesDic/edit',
    method: 'put',
    response: ({ body }: requestParams) => {
      const { id } = body
      const index = mockLanguages.findIndex((item) => item.id === Number(id))
      if (index !== -1) {
        mockLanguages[index] = {
          ...mockLanguages[index],
          ...body,
          updateBy: 'admin',
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
        return resultSuccess(null, { message: '操作成功' })
      }
      return resultError('语言字典不存在')
    },
  },

  // 获取文档类型列表
  {
    url: '/basic-api/v1/sysDict/getDocumentTypeList',
    method: 'get',
    response: () => {
      return resultSuccess(
        [
          { value: 'pdf', label: 'PDF文档' },
          { value: 'doc', label: 'Word文档' },
          { value: 'xls', label: 'Excel文档' },
          { value: 'ppt', label: 'PPT文档' },
          { value: 'txt', label: '文本文件' },
        ],
        { message: '查询成功' },
      )
    },
  },

  // 获取语言列表
  {
    url: '/basic-api/v1/sysDict/getLanguageList',
    method: 'get',
    response: () => {
      return resultSuccess(
        [
          { value: 'zh-CN', label: '中文' },
          { value: 'en-US', label: '英文' },
          { value: 'ja-JP', label: '日文' },
          { value: 'ko-KR', label: '韩文' },
        ],
        { message: '查询成功' },
      )
    },
  },
] as MockMethod[]
