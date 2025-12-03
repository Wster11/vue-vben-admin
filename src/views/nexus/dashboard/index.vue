<template>
  <PageWrapper contentFullHeight>
    <div class="p-4">
      <!-- KPI 统计卡片 -->
      <div class="mb-5">
        <a-row :gutter="[16, 16]">
          <a-col :span="24" :md="12" :lg="6">
            <a-card hoverable :bordered="false">
              <a-statistic title="设备总量" :value="deviceCount" suffix="台">
                <template #prefix>
                  <Icon icon="ant-design:hdd-outlined" size="24" color="#64748b" />
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="24" :md="12" :lg="6">
            <a-card hoverable :bordered="false">
              <a-statistic title="文档总量" :value="fileCount" suffix="份">
                <template #prefix>
                  <Icon icon="ant-design:file-text-outlined" size="24" color="#3b82f6" />
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="24" :md="12" :lg="6">
            <a-card hoverable :bordered="false" class="relative">
              <div
                class="absolute top-6 right-6 text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded"
                >已关联文档设备</div
              >
              <a-statistic title="关联覆盖率" :value="bindingRate" suffix="%">
                <template #prefix>
                  <Icon icon="ant-design:link-outlined" size="24" color="#6366f1" />
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="24" :md="12" :lg="6">
            <a-card hoverable :bordered="false">
              <div
                class="absolute top-6 right-6 text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded"
                >现场查阅热度</div
              >
              <a-statistic title="今日扫码" :value="128" suffix="次">
                <template #prefix>
                  <Icon icon="ant-design:qrcode-outlined" size="24" color="#10b981" />
                </template>
              </a-statistic>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 快捷操作区域 -->
      <div class="mb-5">
        <a-card title="快捷操作" :bordered="false">
          <a-row :gutter="[16, 16]">
            <a-col :span="24" :md="12">
              <a-card
                hoverable
                class="cursor-pointer !bg-indigo-50 !border-indigo-100"
                @click="goToDeviceCreate"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="p-3 rounded-lg bg-indigo-500 text-white flex items-center justify-center"
                  >
                    <Icon icon="ant-design:plus-circle-outlined" size="24" />
                  </div>
                  <div class="flex-1">
                    <div class="text-lg font-bold text-gray-800">注册新设备</div>
                    <div class="text-gray-500">录入新的硬件资产并生成唯一标识</div>
                  </div>
                  <Icon icon="ant-design:arrow-right-outlined" size="20" class="text-indigo-400" />
                </div>
              </a-card>
            </a-col>
            <a-col :span="24" :md="12">
              <a-card
                hoverable
                class="cursor-pointer !bg-blue-50 !border-blue-100"
                @click="goToFileUpload"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="p-3 rounded-lg bg-blue-500 text-white flex items-center justify-center"
                  >
                    <Icon icon="ant-design:cloud-upload-outlined" size="24" />
                  </div>
                  <div class="flex-1">
                    <div class="text-lg font-bold text-gray-800">上传文档</div>
                    <div class="text-gray-500">添加技术手册、图纸或维护指南</div>
                  </div>
                  <Icon icon="ant-design:arrow-right-outlined" size="20" class="text-blue-400" />
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </div>

      <!-- 最新设备 (Top 5) -->
      <div class="mb-5">
        <a-card :bordered="false">
          <template #title>
            <div class="flex items-center justify-between">
              <span
                >最新设备 (Top 5) <a-tag color="indigo">{{ sortedDevices.length }}</a-tag></span
              >
            </div>
          </template>
          <template #extra>
            <a-button type="link" @click="goToDeviceManager"
              >查看全部 <Icon icon="ant-design:arrow-right-outlined"
            /></a-button>
          </template>

          <a-table
            :columns="deviceColumns"
            :dataSource="displayDevices"
            :pagination="false"
            rowKey="id"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'category'">
                <a-tag>{{ getCategoryName(record.categoryId) }}</a-tag>
              </template>
              <template v-if="column.key === 'linked'">
                <a-badge
                  :status="checkDeviceLinked(record.id) ? 'success' : 'error'"
                  :text="checkDeviceLinked(record.id) ? '是' : '否'"
                />
              </template>
              <template v-if="column.key === 'creator'">
                {{ record.creator || '-' }}
              </template>
            </template>
          </a-table>
        </a-card>
      </div>

      <!-- 最新文件 (Top 5) -->
      <div class="mb-5">
        <a-card :bordered="false">
          <template #title>
            <div class="flex items-center justify-between">
              <span
                >最新文件 (Top 5) <a-tag color="blue">{{ sortedFiles.length }}</a-tag></span
              >
            </div>
          </template>
          <template #extra>
            <a-button type="link" @click="goToFileManager"
              >查看全部 <Icon icon="ant-design:arrow-right-outlined"
            /></a-button>
          </template>

          <a-table
            :columns="fileColumns"
            :dataSource="displayFiles"
            :pagination="false"
            rowKey="id"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="flex items-center gap-2">
                  <Icon icon="ant-design:file-text-outlined" class="text-gray-400" />
                  <span>{{ record.name }}</span>
                </div>
              </template>
              <template v-if="column.key === 'category'">
                <a-tag v-if="getFileInfo(record.id).categoryName !== '-'">{{
                  getFileInfo(record.id).categoryName
                }}</a-tag>
                <span v-else>-</span>
              </template>
              <template v-if="column.key === 'deviceName'">
                {{ getFileInfo(record.id).deviceName }}
              </template>
              <template v-if="column.key === 'linked'">
                <a-badge
                  :status="getFileInfo(record.id).isLinked ? 'success' : 'error'"
                  :text="getFileInfo(record.id).isLinked ? '是' : '否'"
                />
              </template>
              <template v-if="column.key === 'creator'">
                {{ record.creator || '-' }}
              </template>
            </template>
          </a-table>
        </a-card>
      </div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Icon } from '/@/components/Icon'
  import { PageWrapper } from '/@/components/Page'
  import { nexusStore } from '../store'
  import {
    Card as ACard,
    Row as ARow,
    Col as ACol,
    Statistic as AStatistic,
    Table as ATable,
    Tag as ATag,
    Badge as ABadge,
    Button as AButton,
  } from 'ant-design-vue'

  const router = useRouter()

  // 获取数据
  const allDevices = computed(() => nexusStore.getDevices())
  const allFiles = computed(() => nexusStore.getFiles())
  const allBindings = computed(() => nexusStore.getBindings())
  const allCategories = computed(() => nexusStore.getCategories())

  // KPI 计算
  const deviceCount = computed(() => allDevices.value.length)
  const fileCount = computed(() => allFiles.value.length)
  const devicesWithFiles = computed(() => {
    const uniqueDevices = new Set(allBindings.value.map((b) => b.deviceId))
    return uniqueDevices.size
  })
  const bindingRate = computed(() => {
    if (deviceCount.value === 0) return '0'
    return ((devicesWithFiles.value / deviceCount.value) * 100).toFixed(1)
  })

  // 排序数据
  const sortedDevices = computed(() => {
    return [...allDevices.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  })

  const sortedFiles = computed(() => {
    return [...allFiles.value].sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
    )
  })

  // Top 5
  const displayDevices = computed(() => sortedDevices.value.slice(0, 5))
  const displayFiles = computed(() => sortedFiles.value.slice(0, 5))

  // 辅助函数
  const getCategoryName = (id: string) => {
    return allCategories.value.find((c) => c.id === id)?.name || '-'
  }

  const checkDeviceLinked = (deviceId: string) => {
    return nexusStore.checkDeviceLinked(deviceId)
  }

  const getFileInfo = (fileId: string) => {
    const linkedDevices = nexusStore.getDevicesForFile(fileId)
    const isLinked = linkedDevices.length > 0

    let categoryName = '-'
    let deviceName = '-'

    if (isLinked) {
      const firstDev = linkedDevices[0]
      categoryName = getCategoryName(firstDev.categoryId)
      deviceName = firstDev.name + (linkedDevices.length > 1 ? ` 等${linkedDevices.length}台` : '')
    }

    return { isLinked, categoryName, deviceName }
  }

  // Table Columns
  const deviceColumns = [
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: '设备分类', key: 'category' },
    { title: '设备型号', dataIndex: 'model', key: 'model' },
    { title: '文档关联', key: 'linked' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '创建人', key: 'creator' },
  ]

  const fileColumns = [
    { title: '文件名称', dataIndex: 'name', key: 'name' },
    { title: '关联设备分类', key: 'category' },
    { title: '设备名称', key: 'deviceName' },
    { title: '是否关联', key: 'linked' },
    { title: '创建时间', dataIndex: 'uploadDate', key: 'uploadDate' },
    { title: '创建人', key: 'creator' },
  ]

  // 导航
  const goToDeviceCreate = () => {
    router.push('/nexus/device-manager')
  }

  const goToFileUpload = () => {
    router.push('/nexus/file-manager')
  }

  const goToDeviceManager = () => {
    router.push('/nexus/device-manager')
  }

  const goToFileManager = () => {
    router.push('/nexus/file-manager')
  }
</script>

<style lang="less" scoped></style>
