<template>
  <div class="p-4 h-full flex flex-col space-y-4 relative">
    <!-- 列表视图 -->
    <template v-if="viewMode === 'LIST'">
      <!-- 页面顶部 -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">设备管理</h1>
          <p class="text-slate-500 text-sm">监控设备状态并管理文档关联</p>
        </div>
        <div class="flex gap-2">
          <a-button type="primary" @click="openCreateModal" class="flex items-center gap-2">
            <template #icon>
              <Icon icon="ant-design:plus-outlined" />
            </template>
            新建设备
          </a-button>
        </div>
      </div>

      <!-- 高级查询区域 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-wrap items-center gap-4">
          <div class="w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">设备分类</label>
            <a-input v-model:value="filterCategory" placeholder="分类名称" allow-clear />
          </div>
          <div class="w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">设备名称</label>
            <a-input v-model:value="filterName" placeholder="设备名称" allow-clear />
          </div>
          <div class="w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">设备型号</label>
            <a-input v-model:value="filterModel" placeholder="型号" allow-clear />
          </div>
          <div class="w-32">
            <label class="block text-xs font-medium text-slate-500 mb-1">关联文档</label>
            <a-select v-model:value="filterLinked" class="w-full">
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="yes">是</a-select-option>
              <a-select-option value="no">否</a-select-option>
            </a-select>
          </div>
          <div class="w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
            <a-date-picker
              v-model:value="filterDateStart"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>
          <div class="w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">结束日期</label>
            <a-date-picker v-model:value="filterDateEnd" value-format="YYYY-MM-DD" class="w-full" />
          </div>

          <div class="flex gap-2 ml-auto mt-auto">
            <a-button @click="resetFilters">重置</a-button>
            <a-button type="primary" ghost @click="handleSearch">
              <template #icon>
                <Icon icon="ant-design:search-outlined" />
              </template>
              查询
            </a-button>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div
        class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <a-table
          :columns="columns"
          :data-source="filteredDevices"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          class="h-full"
          :scroll="{ y: 'calc(100vh - 380px)' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <a
                @click="goToDeviceDetail(record)"
                class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                {{ record.name }}
                <Icon
                  icon="ant-design:arrow-right-outlined"
                  class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </template>
            <template v-if="column.key === 'category'">
              <a-tag color="blue">{{ getCategoryDisplay(record.categoryId) }}</a-tag>
            </template>
            <template v-if="column.key === 'sn'">
              <span class="font-mono text-xs">{{ record.sn }}</span>
            </template>
            <template v-if="column.key === 'linked'">
              <a-tag :color="isDeviceLinked(record.id) ? 'success' : 'error'">
                {{ isDeviceLinked(record.id) ? '是' : '否' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space size="small">
                <a-tooltip title="下载二维码">
                  <a-button
                    type="text"
                    size="small"
                    class="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    @click="handleDownloadQr(record)"
                  >
                    <template #icon>
                      <Icon icon="ant-design:qrcode-outlined" />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="修改">
                  <a-button type="text" size="small" @click="openEditModal(record)">
                    <template #icon>
                      <Icon icon="ant-design:edit-outlined" />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="关联文档">
                  <a-button
                    type="text"
                    size="small"
                    class="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    @click="openBindModal(record)"
                  >
                    <template #icon>
                      <Icon icon="ant-design:link-outlined" />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm title="确定要删除该设备吗?" @confirm="handleDelete(record.id)">
                  <a-button type="text" danger size="small">
                    <template #icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </template>
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </template>

    <!-- 设备详情视图 -->
    <div
      v-else-if="viewMode === 'DEVICE_DETAIL' && selectedDeviceForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <!-- 头部 -->
      <div class="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <a-button shape="circle" @click="backToDeviceList">
          <template #icon>
            <Icon icon="ant-design:arrow-left-outlined" />
          </template>
        </a-button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {{ selectedDeviceForDetail.name }}
            <a-tag color="processing">{{ selectedDeviceForDetail.status }}</a-tag>
          </h1>
          <p class="text-slate-500 text-sm">设备详细信息与文档库</p>
        </div>
      </div>

      <!-- 基本信息 -->
      <a-card :bordered="false" class="shadow-sm rounded-xl">
        <template #title>
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
            <span>设备基本信息</span>
          </div>
        </template>
        <div class="flex flex-col lg:flex-row gap-8">
          <a-descriptions :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }" class="flex-1">
            <a-descriptions-item label="设备分类">
              {{ getCategoryDisplay(selectedDeviceForDetail.categoryId) }}
            </a-descriptions-item>
            <a-descriptions-item label="设备型号">
              {{ selectedDeviceForDetail.model }}
            </a-descriptions-item>
            <a-descriptions-item label="序列号">
              <span class="font-mono">{{ selectedDeviceForDetail.sn }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="版本号">
              {{ selectedDeviceForDetail.version || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建人">
              {{ selectedDeviceForDetail.creator }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ selectedDeviceForDetail.createdAt }}
            </a-descriptions-item>
            <a-descriptions-item label="二维码描述" :span="3">
              {{ selectedDeviceForDetail.qrDesc || '无描述' }}
            </a-descriptions-item>
          </a-descriptions>

          <!-- 右侧二维码卡片 -->
          <div
            class="w-full lg:w-64 flex-shrink-0 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl"
          >
            <div
              class="w-32 h-32 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-3"
            >
              <Icon
                v-if="!selectedDeviceForDetail.qrLogo"
                icon="ant-design:qrcode-outlined"
                class="w-12 h-12 text-slate-300"
              />
              <img
                v-else
                :src="selectedDeviceForDetail.qrLogo"
                alt="Logo"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </a-card>

      <!-- 关联文档列表 -->
      <a-card :bordered="false" class="shadow-sm rounded-xl flex-1 flex flex-col">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <span>关联文档列表 ({{ deviceLinkedFiles.length }})</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="ant-design:global-outlined" class="text-slate-400" />
              <a-select
                v-model:value="detailLanguageFilter"
                size="small"
                class="w-32"
                :options="[
                  { value: 'all', label: '所有语言' },
                  ...LANGUAGE_OPTIONS.map((l) => ({ value: l.code, label: l.label })),
                ]"
              />
            </div>
          </div>
        </template>
        <a-table
          :columns="linkedFileColumns"
          :data-source="filteredLinkedFiles"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="flex items-center gap-2">
                <Icon icon="ant-design:file-text-outlined" class="text-slate-400" />
                {{ record.name }}
              </div>
            </template>
            <template v-if="column.key === 'manualType'">
              <a-tag color="blue">{{ getManualTypeLabel(record.manualType || '') }}</a-tag>
            </template>
            <template v-if="column.key === 'language'">
              {{ getLanguageLabel(record.language || '') }}
            </template>
            <template v-if="column.key === 'size'">
              <span class="font-mono text-xs">{{ record.size }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="goToFileDetail(record)">
                  <template #icon>
                    <Icon icon="ant-design:export-outlined" />
                  </template>
                  详情
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 文件详情视图 -->
    <div
      v-else-if="viewMode === 'FILE_DETAIL' && selectedFileForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <!-- 头部 -->
      <div class="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <a-button shape="circle" @click="backToDeviceDetail">
          <template #icon>
            <Icon icon="ant-design:arrow-left-outlined" />
          </template>
        </a-button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {{ selectedFileForDetail.name }}
            <a-tag>{{ selectedFileForDetail.version || 'v1.0' }}</a-tag>
          </h1>
          <p class="text-slate-500 text-sm">文档详细信息与设备关联管理</p>
        </div>
      </div>

      <!-- 基本属性 -->
      <a-card :bordered="false" class="shadow-sm rounded-xl">
        <template #title>
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
            <span>基本属性</span>
          </div>
        </template>
        <a-descriptions :column="{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }">
          <a-descriptions-item label="文件类型">
            {{ selectedFileForDetail.type }} ({{
              MANUAL_TYPE_MAP[selectedFileForDetail.manualType || ''] || '-'
            }})
          </a-descriptions-item>
          <a-descriptions-item label="语言">
            {{ getLanguageLabel(selectedFileForDetail.language || '') }}
          </a-descriptions-item>
          <a-descriptions-item label="文件大小">
            <span class="font-mono">{{ selectedFileForDetail.size }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="版本">
            {{ selectedFileForDetail.version || 'v1.0' }}
          </a-descriptions-item>
          <a-descriptions-item label="上传人">
            {{ selectedFileForDetail.creator }}
          </a-descriptions-item>
          <a-descriptions-item label="上传时间">
            {{ selectedFileForDetail.uploadDate }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 关联设备概览 -->
      <a-card :bordered="false" class="shadow-sm rounded-xl flex-1 flex flex-col">
        <template #title>
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
            <span>关联设备概览 ({{ fileBoundDevices.length }})</span>
          </div>
        </template>
        <a-table
          :columns="boundDeviceColumns"
          :data-source="fileBoundDevices"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'sn'">
              <span class="font-mono text-xs">{{ record.sn }}</span>
            </template>
            <template v-if="column.key === 'category'">
              <a-tag>{{ getCategoryDisplay(record.categoryId) }}</a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 关联文档模态框 -->
    <a-modal
      v-model:visible="isBindModalOpen"
      title="关联技术文档"
      width="1000px"
      @ok="saveBindings"
      @cancel="isBindModalOpen = false"
    >
      <div class="flex flex-col h-[60vh]">
        <div class="mb-4 space-y-3">
          <div class="flex justify-between items-center">
            <p class="text-sm text-slate-500">
              正在为
              <span class="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{{
                selectedDeviceForBind?.name
              }}</span>
              管理关联文档。
            </p>
            <a-tag color="blue">已选: {{ selectedForBinding.size }} 个文件</a-tag>
          </div>

          <!-- 筛选区域 -->
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-3">
            <a-input
              v-model:value="bindSearchTerm"
              placeholder="搜索文件名称..."
              class="flex-1"
              allow-clear
            >
              <template #prefix>
                <Icon icon="ant-design:search-outlined" class="text-slate-400" />
              </template>
            </a-input>
            <a-select v-model:value="bindFilterCategory" class="w-40" placeholder="全部分类">
              <a-select-option value="">全部分类</a-select-option>
              <a-select-option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </a-select-option>
            </a-select>
            <a-select v-model:value="bindFilterLang" class="w-40" placeholder="全部语言">
              <a-select-option value="">全部语言</a-select-option>
              <a-select-option v-for="l in LANGUAGE_OPTIONS" :key="l.code" :value="l.code">
                {{ l.label }}
              </a-select-option>
            </a-select>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <div class="flex-1 overflow-hidden border border-slate-200 rounded-lg">
          <a-table
            :columns="bindFileColumns"
            :data-source="filteredBindFiles"
            :pagination="false"
            row-key="id"
            :scroll="{ y: 'calc(60vh - 120px)' }"
            :row-selection="{
              selectedRowKeys: Array.from(selectedForBinding),
              onSelect: handleBindSelect,
              onSelectAll: handleBindSelectAll,
            }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="flex items-center gap-2">
                  <Icon icon="ant-design:file-text-outlined" class="text-slate-400" />
                  {{ record.name }}
                </div>
              </template>
              <template v-if="column.key === 'language'">
                {{ getLanguageLabel(record.language || '') }}
              </template>
              <template v-if="column.key === 'manualType'">
                <a-tag>{{ getManualTypeLabel(record.manualType || '') }}</a-tag>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-modal>

    <!-- 新建/编辑设备模态框 -->
    <a-modal
      v-model:visible="isEditModalOpen"
      :title="isNew ? '新建设备' : '编辑设备'"
      width="1000px"
      @ok="saveDevice"
      @cancel="isEditModalOpen = false"
    >
      <a-form layout="vertical" class="max-h-[65vh] overflow-y-auto p-1">
        <!-- Group 1: 基础信息 -->
        <a-card title="基本信息" size="small" class="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a-form-item label="设备分类" required>
              <a-select
                v-model:value="editingDevice.categoryId"
                :disabled="!isNew"
                @change="handleCategoryChange"
                placeholder="请选择分类"
              >
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }} ({{ cat.description }})
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="设备型号" required>
              <a-auto-complete
                v-model:value="editingDevice.model"
                :disabled="!isNew"
                @change="handleModelChange"
                placeholder="请输入或选择型号"
              />
            </a-form-item>
            <a-form-item label="设备名称">
              <a-input v-model:value="editingDevice.name" readonly placeholder="自动生成" />
            </a-form-item>
            <a-form-item label="设备版本号">
              <a-input v-model:value="editingDevice.version" placeholder="如 v1.0" />
            </a-form-item>
            <a-form-item label="序列号" required>
              <a-input v-model:value="editingDevice.sn" placeholder="请输入设备序列号" />
            </a-form-item>
          </div>
        </a-card>

        <!-- Group 2: 设备参数设置 -->
        <a-card title="设备参数设置" size="small" class="mb-4">
          <div v-if="!editingDevice.categoryId" class="text-center py-4 text-slate-400">
            请先选择分类以加载参数
          </div>
          <div
            v-else-if="currentCategoryAttrs.length === 0"
            class="text-center py-4 text-slate-400"
          >
            该分类暂无参数定义
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="attr in currentCategoryAttrs"
              :key="attr.id"
              class="p-3 rounded-lg border border-slate-200"
              :class="{ 'bg-slate-50 opacity-75': !attr.visible }"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-semibold">{{ attr.name }}</span>
                <a-tag :color="attr.visible ? 'success' : 'default'" class="text-[10px] m-0">
                  {{ attr.visible ? 'Visible' : 'Hidden' }}
                </a-tag>
              </div>
              <a-input
                v-model:value="formParams[attr.name]"
                :disabled="!attr.visible"
                :placeholder="!attr.visible ? '无需填写' : '输入参数值'"
                size="small"
              >
                <template #suffix v-if="attr.unit">
                  <span class="text-xs text-slate-400">{{ attr.unit }}</span>
                </template>
              </a-input>
            </div>
          </div>
        </a-card>

        <!-- Group 4: 二维码配置 -->
        <a-card title="二维码配置" size="small">
          <div class="flex gap-6">
            <div class="flex flex-col items-center gap-2">
              <div
                class="w-24 h-24 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden"
              >
                <Icon
                  v-if="!editingDevice.qrLogo"
                  icon="ant-design:qrcode-outlined"
                  class="w-8 h-8 text-slate-300"
                />
                <img
                  v-else
                  :src="editingDevice.qrLogo"
                  alt="Logo"
                  class="w-full h-full object-contain"
                />
              </div>
              <a-button size="small" :disabled="!isNew">
                <template #icon>
                  <Icon icon="ant-design:upload-outlined" />
                </template>
                {{ editingDevice.qrLogo ? '更换Logo' : '上传Logo' }}
              </a-button>
            </div>
            <div class="flex-1 space-y-4">
              <a-form-item label="序列化地址 (自动生成)">
                <div
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono break-all"
                >
                  {{ qrSerializedAddress || '待输入设备名称和SN以生成...' }}
                </div>
              </a-form-item>
              <a-form-item label="二维码描述信息">
                <a-input
                  v-model:value="editingDevice.qrDesc"
                  :disabled="!isNew"
                  placeholder="请输入扫描二维码后显示的描述信息"
                />
              </a-form-item>
            </div>
          </div>
        </a-card>
      </a-form>
    </a-modal>

    <!-- 二维码预览模态框 -->
    <a-modal
      v-model:visible="isQrPreviewModalOpen"
      title="下载二维码"
      width="400px"
      @ok="handleQrDownload"
      @cancel="isQrPreviewModalOpen = false"
      ok-text="下载"
    >
      <div v-if="qrPreviewDevice" class="flex flex-col items-center py-4">
        <div class="bg-white p-4 border-2 border-slate-800 rounded-lg mb-4 relative shadow-lg">
          <!-- 模拟二维码视觉 -->
          <div
            class="w-48 h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden"
          >
            <div class="absolute top-2 left-2 w-8 h-8 border-4 border-black"></div>
            <div class="absolute top-2 right-2 w-8 h-8 border-4 border-black"></div>
            <div class="absolute bottom-2 left-2 w-8 h-8 border-4 border-black"></div>
            <div class="grid grid-cols-6 grid-rows-6 gap-1 w-32 h-32 opacity-80">
              <div
                v-for="i in 36"
                :key="i"
                :class="['bg-black', Math.random() > 0.5 ? 'opacity-100' : 'opacity-0']"
              ></div>
            </div>
            <div
              v-if="qrPreviewDevice.qrLogo"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="bg-white p-1 rounded">
                <img :src="qrPreviewDevice.qrLogo" alt="logo" class="w-10 h-10 object-contain" />
              </div>
            </div>
          </div>
          <p class="text-center text-xs font-mono mt-2 text-slate-600">
            {{ qrPreviewDevice.name }}
          </p>
          <p class="text-center text-xs text-slate-400">{{ qrPreviewDevice.sn }}</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch } from 'vue'
  import {
    Table,
    Button,
    Input,
    Select,
    DatePicker,
    Modal,
    Form,
    Card,
    Descriptions,
    Tag,
    Space,
    message,
    Tooltip,
    Popconfirm,
    AutoComplete,
  } from 'ant-design-vue'
  import { Icon } from '/@/components/Icon'
  import { MANUAL_TYPE_MAP, LANGUAGE_OPTIONS } from '../constants'
  import type { Device, DocFile, Category, CategoryAttribute } from '../types'

  // Component aliases for template usage
  const ATable = Table
  const AButton = Button
  const AInput = Input
  const ASelect = Select
  const ASelectOption = Select.Option
  const ADatePicker = DatePicker
  const AModal = Modal
  const AForm = Form
  const AFormItem = Form.Item
  const ACard = Card
  const ADescriptions = Descriptions
  const ADescriptionsItem = Descriptions.Item
  const ATag = Tag
  const ASpace = Space
  const ATooltip = Tooltip
  const APopconfirm = Popconfirm
  const AAutoComplete = AutoComplete

  // Mock 数据
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'CF',
      description: '离心机',
      creator: 'Admin',
      createdAt: '2024-01-15',
      level: 1,
      parentId: null,
    },
    {
      id: 'cat-2',
      name: 'PM',
      description: '泵类设备',
      creator: 'Admin',
      createdAt: '2024-01-16',
      level: 1,
      parentId: null,
    },
    {
      id: 'cat-3',
      name: 'MX',
      description: '混合器',
      creator: 'Admin',
      createdAt: '2024-01-17',
      level: 1,
      parentId: null,
    },
  ]

  const mockDevices: Device[] = [
    {
      id: 'dev-1',
      name: 'CF-001',
      model: 'CF-5000',
      sn: 'SN2024010001',
      version: 'v2.1',
      status: 'active',
      categoryId: 'cat-1',
      createdAt: '2024-01-20',
      creator: 'John Doe',
      parameters: { power: '5kW', speed: '3000rpm', capacity: '50L' },
      qrAddress: 'Q0YtMDAxI1NOMjAyNDAxMDAwMQ==',
      qrDesc: '离心机CF-001，用于样品分离',
      qrLogo: '',
      qrData: '',
    },
    {
      id: 'dev-2',
      name: 'PM-001',
      model: 'PM-3000',
      sn: 'SN2024010002',
      version: 'v1.5',
      status: 'active',
      categoryId: 'cat-2',
      createdAt: '2024-01-21',
      creator: 'Jane Smith',
      parameters: { flowRate: '100L/min', pressure: '10bar' },
      qrAddress: 'UE0tMDAxI1NOMjAyNDAxMDAwMg==',
      qrDesc: '泵类设备PM-001',
      qrLogo: '',
      qrData: '',
    },
    {
      id: 'dev-3',
      name: 'MX-001',
      model: 'MX-2000',
      sn: 'SN2024010003',
      version: 'v3.0',
      status: 'active',
      categoryId: 'cat-3',
      createdAt: '2024-01-22',
      creator: 'Bob Wilson',
      parameters: { volume: '200L', speed: '500rpm' },
      qrAddress: 'TVgtMDAxI1NOMjAyNDAxMDAwMw==',
      qrDesc: '混合器MX-001',
      qrLogo: '',
      qrData: '',
    },
    {
      id: 'dev-4',
      name: 'CF-002',
      model: 'CF-5000',
      sn: 'SN2024010004',
      version: 'v2.1',
      status: 'active',
      categoryId: 'cat-1',
      createdAt: '2024-01-23',
      creator: 'John Doe',
      parameters: { power: '5kW', speed: '3000rpm', capacity: '50L' },
      qrAddress: 'Q0YtMDAyI1NOMjAyNDAxMDAwNA==',
      qrDesc: '离心机CF-002',
      qrLogo: '',
      qrData: '',
    },
  ]

  const mockFiles: DocFile[] = [
    {
      id: 'file-1',
      name: 'TD-RND-CF-001-cn',
      size: '2.5 MB',
      type: 'PDF',
      uploadDate: '2024-01-20',
      url: '#',
      creator: 'Admin',
      manualType: 'CZ',
      language: 'zh_cn',
      categoryId: 'cat-1',
      version: 'v1.0',
    },
    {
      id: 'file-2',
      name: 'TD-RND-CF-001-en',
      size: '2.3 MB',
      type: 'PDF',
      uploadDate: '2024-01-20',
      url: '#',
      creator: 'Admin',
      manualType: 'CZ',
      language: 'en',
      categoryId: 'cat-1',
      version: 'v1.0',
    },
    {
      id: 'file-3',
      name: 'TD-RND-PM-001-cn',
      size: '1.8 MB',
      type: 'PDF',
      uploadDate: '2024-01-21',
      url: '#',
      creator: 'Admin',
      manualType: 'WH',
      language: 'zh_cn',
      categoryId: 'cat-2',
      version: 'v1.0',
    },
    {
      id: 'file-4',
      name: 'TD-RND-MX-001-cn',
      size: '3.1 MB',
      type: 'PDF',
      uploadDate: '2024-01-22',
      url: '#',
      creator: 'Admin',
      manualType: 'AZ',
      language: 'zh_cn',
      categoryId: 'cat-3',
      version: 'v1.0',
    },
  ]

  // 设备文件关联关系（mock）
  const mockDeviceFileBindings = ref<Map<string, string[]>>(
    new Map([
      ['dev-1', ['file-1', 'file-2']],
      ['dev-2', ['file-3']],
      ['dev-3', ['file-4']],
      ['dev-4', []],
    ]),
  )

  // 视图模式
  type ViewMode = 'LIST' | 'DEVICE_DETAIL' | 'FILE_DETAIL'
  const viewMode = ref<ViewMode>('LIST')

  // 数据状态
  const devices = ref<Device[]>([...mockDevices])
  const files = ref<DocFile[]>([...mockFiles])
  const categories = ref<Category[]>([...mockCategories])

  // 筛选条件
  const filterCategory = ref('')
  const filterName = ref('')
  const filterModel = ref('')
  const filterLinked = ref<string>('all')
  const filterDateStart = ref('')
  const filterDateEnd = ref('')

  // 绑定筛选
  const bindSearchTerm = ref('')
  const bindFilterCategory = ref('')
  const bindFilterLang = ref('')

  // 模态框状态
  const isBindModalOpen = ref(false)
  const isEditModalOpen = ref(false)
  const isNew = ref(false)
  const isQrPreviewModalOpen = ref(false)

  // 详情页状态
  const selectedDeviceForDetail = ref<Device | null>(null)
  const selectedFileForDetail = ref<DocFile | null>(null)
  const detailLanguageFilter = ref<string>('all')

  // 编辑状态
  const editingDevice = ref<Partial<Device>>({})
  const formParams = ref<Record<string, string>>({})
  const currentCategoryAttrs = ref<CategoryAttribute[]>([])

  // 绑定状态
  const selectedDeviceForBind = ref<Device | null>(null)
  const selectedForBinding = ref<Set<string>>(new Set())

  // 二维码预览
  const qrPreviewDevice = ref<Device | null>(null)

  // Pagination
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  })

  // Table Columns
  const columns = [
    { title: '设备名称', key: 'name', dataIndex: 'name' },
    { title: '设备分类', key: 'category', dataIndex: 'categoryId' },
    { title: '设备型号', key: 'model', dataIndex: 'model' },
    { title: '序列号', key: 'sn', dataIndex: 'sn' },
    { title: '关联文档', key: 'linked', dataIndex: 'id' },
    { title: '创建时间', key: 'createdAt', dataIndex: 'createdAt' },
    { title: '创建人', key: 'creator', dataIndex: 'creator' },
    { title: '操作', key: 'action', width: 200, align: 'right' },
  ]

  const linkedFileColumns = [
    { title: '文件名称', key: 'name', dataIndex: 'name' },
    { title: '文件类型', key: 'manualType', dataIndex: 'manualType' },
    { title: '语言', key: 'language', dataIndex: 'language' },
    { title: '大小', key: 'size', dataIndex: 'size' },
    { title: '操作', key: 'action', align: 'right' },
  ]

  const boundDeviceColumns = [
    { title: '设备名称', key: 'name', dataIndex: 'name' },
    { title: '型号', key: 'model', dataIndex: 'model' },
    { title: '序列号', key: 'sn', dataIndex: 'sn' },
    { title: '分类', key: 'category', dataIndex: 'categoryId' },
    { title: '创建时间', key: 'createdAt', dataIndex: 'createdAt' },
    { title: '创建人', key: 'creator', dataIndex: 'creator' },
  ]

  const bindFileColumns = [
    { title: '文件名称', key: 'name', dataIndex: 'name' },
    { title: '语言', key: 'language', dataIndex: 'language' },
    { title: '类型', key: 'manualType', dataIndex: 'manualType' },
    { title: '上传时间', key: 'uploadDate', dataIndex: 'uploadDate' },
  ]

  // 筛选逻辑
  const filteredDevices = computed(() => {
    const result = devices.value.filter((d) => {
      const catName = categories.value.find((c) => c.id === d.categoryId)?.name || ''
      const matchCatName =
        !filterCategory.value || catName.toLowerCase().includes(filterCategory.value.toLowerCase())

      const matchName =
        !filterName.value || d.name.toLowerCase().includes(filterName.value.toLowerCase())
      const matchModel =
        !filterModel.value || d.model.toLowerCase().includes(filterModel.value.toLowerCase())

      const isLinked = isDeviceLinked(d.id)
      const matchLinked =
        filterLinked.value === 'all' ? true : filterLinked.value === 'yes' ? isLinked : !isLinked

      let matchDate = true
      if (filterDateStart.value || filterDateEnd.value) {
        const devDate = new Date(d.createdAt).getTime()
        if (filterDateStart.value) {
          matchDate = matchDate && devDate >= new Date(filterDateStart.value).getTime()
        }
        if (filterDateEnd.value) {
          matchDate = matchDate && devDate <= new Date(filterDateEnd.value).getTime()
        }
      }

      return matchCatName && matchName && matchModel && matchLinked && matchDate
    })
    return result
  })

  watch(
    filteredDevices,
    (val) => {
      pagination.total = val.length
    },
    { immediate: true },
  )

  const deviceLinkedFiles = computed(() => {
    if (!selectedDeviceForDetail.value) return []
    const fileIds = mockDeviceFileBindings.value.get(selectedDeviceForDetail.value.id) || []
    return files.value.filter((f) => fileIds.includes(f.id))
  })

  const filteredLinkedFiles = computed(() => {
    return deviceLinkedFiles.value.filter(
      (f) => detailLanguageFilter.value === 'all' || f.language === detailLanguageFilter.value,
    )
  })

  const fileBoundDevices = computed(() => {
    if (!selectedFileForDetail.value) return []
    const boundDeviceIds: string[] = []
    mockDeviceFileBindings.value.forEach((fileIds, deviceId) => {
      if (fileIds.includes(selectedFileForDetail.value!.id)) {
        boundDeviceIds.push(deviceId)
      }
    })
    return devices.value.filter((d) => boundDeviceIds.includes(d.id))
  })

  const filteredBindFiles = computed(() => {
    return files.value.filter((f) => {
      const matchSearch =
        !bindSearchTerm.value || f.name.toLowerCase().includes(bindSearchTerm.value.toLowerCase())
      const matchCategory = !bindFilterCategory.value || f.categoryId === bindFilterCategory.value
      const matchLang = !bindFilterLang.value || f.language === bindFilterLang.value
      return matchSearch && matchCategory && matchLang
    })
  })

  const qrSerializedAddress = computed(() => {
    const name = editingDevice.value.name || ''
    const sn = editingDevice.value.sn || ''
    if (!name || !sn) return ''
    try {
      return btoa(`${name}#${sn}`)
    } catch (e) {
      return ''
    }
  })

  const resetFilters = () => {
    filterCategory.value = ''
    filterName.value = ''
    filterModel.value = ''
    filterLinked.value = 'all'
    filterDateStart.value = ''
    filterDateEnd.value = ''
  }

  const handleSearch = () => {
    // In a real app, this might trigger an API call
    pagination.current = 1
  }

  const handleTableChange = (pag: any) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
  }

  const isDeviceLinked = (deviceId: string) => {
    const fileIds = mockDeviceFileBindings.value.get(deviceId) || []
    return fileIds.length > 0
  }

  const getCategoryDisplay = (catId: string) => {
    const cat = categories.value.find((c) => c.id === catId)
    return cat ? cat.name : '-'
  }

  const getLanguageLabel = (code: string) => {
    return LANGUAGE_OPTIONS.find((opt) => opt.code === code)?.label || code || '-'
  }

  const getManualTypeLabel = (code: string) => {
    return MANUAL_TYPE_MAP[code] || code || '其他文档'
  }

  // 视图切换
  const goToDeviceDetail = (device: Device) => {
    selectedDeviceForDetail.value = device
    detailLanguageFilter.value = 'all'
    viewMode.value = 'DEVICE_DETAIL'
  }

  const backToDeviceList = () => {
    selectedDeviceForDetail.value = null
    viewMode.value = 'LIST'
  }

  const goToFileDetail = (file: DocFile) => {
    selectedFileForDetail.value = file
    viewMode.value = 'FILE_DETAIL'
  }

  const backToDeviceDetail = () => {
    selectedFileForDetail.value = null
    viewMode.value = 'DEVICE_DETAIL'
  }

  // 设备操作
  const handleDelete = (id: string) => {
    devices.value = devices.value.filter((d) => d.id !== id)
    mockDeviceFileBindings.value.delete(id)
    message.success('删除成功')
  }

  const openEditModal = (device?: Device) => {
    if (device) {
      editingDevice.value = { ...device }
      formParams.value = device.parameters || {}
      currentCategoryAttrs.value = [
        { id: 'attr-1', categoryId: device.categoryId, name: 'power', unit: 'kW', visible: true },
        { id: 'attr-2', categoryId: device.categoryId, name: 'speed', unit: 'rpm', visible: true },
        {
          id: 'attr-3',
          categoryId: device.categoryId,
          name: 'capacity',
          unit: 'L',
          visible: true,
        },
      ]
      isNew.value = false
    } else {
      editingDevice.value = {
        id: `dev-${Date.now()}`,
        name: '',
        model: '',
        sn: '',
        version: '',
        status: 'active',
        categoryId: undefined,
        createdAt: new Date().toISOString().split('T')[0],
        creator: 'Admin',
        parameters: {},
        qrAddress: '',
        qrDesc: '',
        qrLogo: '',
      }
      formParams.value = {}
      currentCategoryAttrs.value = []
      isNew.value = true
    }
    isEditModalOpen.value = true
  }

  const openCreateModal = () => openEditModal()

  const handleCategoryChange = (categoryId: string) => {
    editingDevice.value = { ...editingDevice.value, categoryId }
    currentCategoryAttrs.value = [
      { id: 'attr-1', categoryId, name: 'power', unit: 'kW', visible: true },
      { id: 'attr-2', categoryId, name: 'speed', unit: 'rpm', visible: true },
      { id: 'attr-3', categoryId, name: 'capacity', unit: 'L', visible: true },
    ]
    formParams.value = {}
  }

  const handleModelChange = (val: string) => {
    editingDevice.value = { ...editingDevice.value, model: val }
    if (isNew.value && val) {
      const catPrefix = categories.value.find((c) => c.id === editingDevice.value.categoryId)?.name
      if (catPrefix) {
        const existingDevices = devices.value.filter(
          (d) => d.categoryId === editingDevice.value.categoryId,
        )
        const nextNum = existingDevices.length + 1
        editingDevice.value.name = `${catPrefix}-${String(nextNum).padStart(3, '0')}`
      }
    }
  }

  const saveDevice = () => {
    if (!editingDevice.value.categoryId) {
      message.error('请选择设备分类')
      return
    }
    if (!editingDevice.value.model) {
      message.error('请填写设备型号')
      return
    }
    if (!editingDevice.value.sn) {
      message.error('请填写序列号')
      return
    }

    const name = editingDevice.value.name || ''
    const sn = editingDevice.value.sn || ''
    const qrSerializedAddr = name && sn ? btoa(`${name}#${sn}`) : ''

    const finalDevice: Device = {
      ...(editingDevice.value as Device),
      parameters: formParams.value,
      qrAddress: qrSerializedAddr,
      qrData: JSON.stringify({
        address: qrSerializedAddr,
        logo: editingDevice.value.qrLogo,
        desc: editingDevice.value.qrDesc,
      }),
      version: editingDevice.value.version || '',
    }

    if (isNew.value) {
      devices.value.push(finalDevice)
      mockDeviceFileBindings.value.set(finalDevice.id, [])
    } else {
      const index = devices.value.findIndex((d) => d.id === finalDevice.id)
      if (index !== -1) {
        devices.value[index] = finalDevice
      }
    }

    isEditModalOpen.value = false
    message.success('保存成功')
  }

  // 关联操作
  const openBindModal = (device: Device) => {
    selectedDeviceForBind.value = device
    const existing = mockDeviceFileBindings.value.get(device.id) || []
    selectedForBinding.value = new Set(existing)
    bindSearchTerm.value = ''
    bindFilterCategory.value = ''
    bindFilterLang.value = ''
    isBindModalOpen.value = true
  }

  const handleBindSelect = (record: DocFile, selected: boolean) => {
    if (selected) {
      selectedForBinding.value.add(record.id)
    } else {
      selectedForBinding.value.delete(record.id)
    }
  }

  const handleBindSelectAll = (
    selected: boolean,
    selectedRows: DocFile[],
    changeRows: DocFile[],
  ) => {
    if (selected) {
      changeRows.forEach((row) => selectedForBinding.value.add(row.id))
    } else {
      changeRows.forEach((row) => selectedForBinding.value.delete(row.id))
    }
  }

  const saveBindings = () => {
    if (!selectedDeviceForBind.value) return
    mockDeviceFileBindings.value.set(
      selectedDeviceForBind.value.id,
      Array.from(selectedForBinding.value),
    )
    isBindModalOpen.value = false
    message.success('关联成功')
    selectedDeviceForBind.value = null
  }

  // 二维码操作
  const handleDownloadQr = (device: Device) => {
    qrPreviewDevice.value = device
    isQrPreviewModalOpen.value = true
  }

  const handleQrDownload = () => {
    message.success('二维码已下载 (模拟)')
    isQrPreviewModalOpen.value = false
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }

  .animate-in {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .slide-in-from-right-4 {
    animation: slideInFromRight 0.3s ease-out;
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(16px);
    }

    to {
      transform: translateX(0);
    }
  }
</style>
