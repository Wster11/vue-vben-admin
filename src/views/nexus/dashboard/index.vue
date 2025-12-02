<template>
  <div class="nexus-dashboard p-4">
    <!-- KPI 统计卡片 -->
    <div class="stat-cards">
      <StatCard icon="HardDrive" label="设备总量" :value="deviceCount" unit="台" color="slate" />
      <StatCard icon="FileText" label="文档总量" :value="fileCount" unit="份" color="blue" />
      <StatCard
        icon="Link2"
        label="关联覆盖率"
        :value="bindingRate"
        unit="%"
        color="indigo"
        subText="已关联文档设备"
      />
      <StatCard
        icon="QrCode"
        label="今日扫码"
        :value="128"
        unit="次"
        color="emerald"
        subText="现场查阅热度"
      />
    </div>

    <!-- 快捷操作区域 -->
    <div class="quick-actions-section">
      <h3 class="section-title">快捷操作</h3>
      <div class="quick-actions">
        <button class="action-card action-card-primary" @click="goToDeviceCreate">
          <div class="action-icon">
            <Icon icon="ant-design:plus-circle-outlined" :size="24" />
          </div>
          <div class="action-content">
            <h4 class="action-title">注册新设备</h4>
            <p class="action-desc">录入新的硬件资产并生成唯一标识</p>
          </div>
          <Icon icon="ant-design:arrow-right-outlined" :size="20" class="action-arrow" />
        </button>

        <button class="action-card action-card-blue" @click="goToFileUpload">
          <div class="action-icon action-icon-blue">
            <Icon icon="ant-design:cloud-upload-outlined" :size="24" />
          </div>
          <div class="action-content">
            <h4 class="action-title">上传文档</h4>
            <p class="action-desc">添加技术手册、图纸或维护指南</p>
          </div>
          <Icon icon="ant-design:arrow-right-outlined" :size="20" class="action-arrow" />
        </button>
      </div>
    </div>

    <!-- 最新设备 (Top 5) -->
    <div class="data-section">
      <SectionHeader
        title="最新设备 (Top 5)"
        :count="sortedDevices.length"
        color="indigo"
        @click-more="goToDeviceManager"
      />
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>设备名称</th>
              <th>设备分类</th>
              <th>设备型号</th>
              <th>文档关联</th>
              <th>创建时间</th>
              <th>创建人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in displayDevices" :key="device.id" class="table-row">
              <td class="font-medium">{{ device.name }}</td>
              <td>
                <span class="badge">{{ getCategoryName(device.categoryId) }}</span>
              </td>
              <td>{{ device.model }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    checkDeviceLinked(device.id) ? 'status-linked' : 'status-unlinked',
                  ]"
                >
                  <span class="status-dot"></span>
                  {{ checkDeviceLinked(device.id) ? '是' : '否' }}
                </span>
              </td>
              <td>{{ device.createdAt }}</td>
              <td>{{ device.creator || '-' }}</td>
            </tr>
            <tr v-if="displayDevices.length === 0">
              <td colspan="6" class="empty-cell">暂无设备数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 最新文件 (Top 5) -->
    <div class="data-section">
      <SectionHeader
        title="最新文件 (Top 5)"
        :count="sortedFiles.length"
        color="blue"
        @click-more="goToFileManager"
      />
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>文件名称</th>
              <th>关联设备分类</th>
              <th>设备名称</th>
              <th>是否关联</th>
              <th>创建时间</th>
              <th>创建人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in displayFiles" :key="file.id" class="table-row">
              <td class="font-medium file-cell">
                <Icon icon="ant-design:file-text-outlined" :size="16" class="file-icon" />
                {{ file.name }}
              </td>
              <td>
                <span v-if="getFileInfo(file.id).categoryName !== '-'" class="badge">
                  {{ getFileInfo(file.id).categoryName }}
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ getFileInfo(file.id).deviceName }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    getFileInfo(file.id).isLinked ? 'status-linked' : 'status-unlinked',
                  ]"
                >
                  <span class="status-dot"></span>
                  {{ getFileInfo(file.id).isLinked ? '是' : '否' }}
                </span>
              </td>
              <td>{{ file.uploadDate }}</td>
              <td>{{ file.creator || '-' }}</td>
            </tr>
            <tr v-if="displayFiles.length === 0">
              <td colspan="6" class="empty-cell">暂无文件数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Icon } from '/@/components/Icon'
  import { nexusStore } from '../store'
  import StatCard from './components/StatCard.vue'
  import SectionHeader from './components/SectionHeader.vue'

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

<style scoped>
  .nexus-dashboard {
    min-height: 100%;
  }

  /* 统计卡片 */
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  /* 快捷操作 */
  .quick-actions-section {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
  }

  .action-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .action-card-primary {
    border-color: #e0e7ff;
    background: linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%);
  }

  .action-card-primary:hover {
    border-color: #c7d2fe;
    background: linear-gradient(135deg, #faf5ff 0%, #f0f4ff 100%);
  }

  .action-card-blue {
    border-color: #dbeafe;
    background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  }

  .action-card-blue:hover {
    border-color: #bfdbfe;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #6366f1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s;
  }

  .action-icon-blue {
    background: #3b82f6;
  }

  .action-card:hover .action-icon {
    transform: scale(1.1);
  }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
  }

  .action-desc {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .action-arrow {
    color: #9ca3af;
    transition: all 0.3s;
    flex-shrink: 0;
  }

  .action-card:hover .action-arrow {
    color: #6366f1;
    transform: translateX(4px);
  }

  /* 数据区域 */
  .data-section {
    margin-bottom: 32px;
  }

  .data-table-wrapper {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .data-table thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .data-table th {
    padding: 12px 24px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
  }

  .data-table tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s;
  }

  .data-table tbody tr:last-child {
    border-bottom: none;
  }

  .data-table tbody tr:hover {
    background-color: #f9fafb;
  }

  .data-table td {
    padding: 16px 24px;
    color: #6b7280;
  }

  .font-medium {
    font-weight: 500;
    color: #111827;
  }

  .file-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .file-icon {
    color: #9ca3af;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 12px;
    color: #374151;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-linked {
    background: #d1fae5;
    color: #065f46;
  }

  .status-unlinked {
    background: #fee2e2;
    color: #991b1b;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .empty-cell {
    text-align: center;
    padding: 48px 24px !important;
    color: #9ca3af;
  }
</style>
