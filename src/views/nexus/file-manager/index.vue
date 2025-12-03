<template>
  <!-- PDF Viewer - 使用 Teleport 挂载到 body -->
  <Teleport to="body">
    <div v-if="isPdfViewerOpen && selectedFileForDetail" class="pdf-viewer-overlay">
      <!-- Header Toolbar -->
      <div class="pdf-viewer-header">
        <div class="flex items-center gap-4">
          <AButton
            type="text"
            shape="circle"
            size="large"
            @click="isPdfViewerOpen = false"
            class="pdf-viewer-btn-back"
          >
            <template #icon>
              <ArrowLeftOutlined class="text-white text-lg" />
            </template>
          </AButton>
          <span class="text-white text-base font-medium truncate max-w-md">
            {{ selectedFileForDetail.name }}
          </span>
        </div>

        <ASpace :size="12">
          <AButton type="text" shape="circle" size="large" class="pdf-viewer-btn">
            <template #icon>
              <ZoomOutOutlined class="text-slate-300 text-lg" />
            </template>
          </AButton>
          <AButton type="text" shape="circle" size="large" class="pdf-viewer-btn">
            <template #icon>
              <ZoomInOutlined class="text-slate-300 text-lg" />
            </template>
          </AButton>
          <AButton type="text" shape="circle" size="large" class="pdf-viewer-btn">
            <template #icon>
              <FullscreenOutlined class="text-slate-300 text-lg" />
            </template>
          </AButton>
          <AButton type="text" shape="circle" size="large" class="pdf-viewer-btn">
            <template #icon>
              <DownloadOutlined class="text-slate-300 text-lg" />
            </template>
          </AButton>
        </ASpace>
      </div>

      <!-- PDF Content Area -->
      <div class="pdf-viewer-content">
        <div class="pdf-viewer-paper">
          <div class="space-y-6">
            <h1
              class="text-3xl font-bold text-slate-900 mb-8 pb-4 border-b-2 border-slate-200 text-center"
            >
              {{ selectedFileForDetail.name }}
            </h1>
            <div class="text-slate-700 leading-relaxed space-y-4">
              <p class="text-center text-slate-500 text-lg">文件预览区域</p>
              <div class="mt-8 space-y-3 text-sm text-slate-600">
                <p><strong>文件类型：</strong>{{ selectedFileForDetail.type }}</p>
                <p><strong>文件大小：</strong>{{ selectedFileForDetail.size }}</p>
                <p><strong>上传时间：</strong>{{ selectedFileForDetail.uploadDate }}</p>
                <p><strong>版本号：</strong>{{ selectedFileForDetail.version }}</p>
              </div>
              <div class="mt-12 p-8 bg-slate-50 rounded-lg">
                <p class="text-slate-500 text-center">
                  实际使用时，这里可以集成 PDF.js 或其他 PDF 预览库
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <div class="p-4 h-full flex flex-col space-y-4 relative">
    <!-- 列表视图 -->
    <template v-if="viewMode === 'LIST'">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">文件管理</h1>
          <p class="text-slate-500 text-sm">集中管理所有技术文档与资料</p>
        </div>
        <div class="flex gap-2">
          <a-button type="primary" size="large" @click="openUploadModal">
            <template #icon>
              <UploadOutlined />
            </template>
            上传文件
          </a-button>
        </div>
      </div>

      <!-- 高级查询 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div class="col-span-1 md:col-span-1 lg:col-span-2">
            <label class="block text-xs font-medium text-slate-500 mb-1">文件名称</label>
            <a-input
              v-model:value="searchTerm"
              placeholder="搜索文件名称..."
              size="default"
              allow-clear
            >
              <template #prefix>
                <SearchOutlined class="text-slate-400" />
              </template>
            </a-input>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">设备分类</label>
            <a-select
              v-model:value="filterCategory"
              placeholder="全部分类"
              size="default"
              allow-clear
              style="width: 100%"
              :options="[
                { value: '', label: '全部分类' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">文档语言</label>
            <a-select
              v-model:value="filterLanguage"
              placeholder="全部语言"
              size="default"
              allow-clear
              style="width: 100%"
              :options="[
                { value: '', label: '全部语言' },
                ...LANGUAGE_OPTIONS.map((l) => ({ value: l.code, label: l.label })),
              ]"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">是否关联</label>
            <a-select
              v-model:value="filterLinked"
              placeholder="全部"
              size="default"
              style="width: 100%"
              :options="[
                { value: 'all', label: '全部' },
                { value: 'yes', label: '是' },
                { value: 'no', label: '否' },
              ]"
            />
          </div>

          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
              <a-date-picker
                v-model:value="filterStartDate"
                style="width: 100%"
                size="default"
                placeholder="选择日期"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div
        class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <a-table
          :dataSource="filteredFiles"
          :columns="fileColumns"
          :pagination="{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <a-button type="link" @click="goToFileDetail(record)" class="p-0 h-auto">
                <FileTextOutlined class="mr-2" />
                {{ record.name }}
              </a-button>
            </template>
            <template v-else-if="column.key === 'language'">
              {{ getLanguageLabel(record.language) }}
            </template>
            <template v-else-if="column.key === 'langCode'">
              <span class="font-mono text-xs">{{ getShortLangCode(record.language || '') }}</span>
            </template>
            <template v-else-if="column.key === 'linked'">
              <a-tag v-if="isFileLinked(record.id)" color="success"> <LinkOutlined /> 是 </a-tag>
              <span v-else class="text-slate-400">否</span>
            </template>
            <template v-else-if="column.key === 'categories'">
              <span :title="getFileCatNames(record.id)">
                {{ getFileCatNames(record.id) || '-' }}
              </span>
            </template>
            <template v-else-if="column.key === 'models'">
              <span :title="getFileDevModels(record.id)">
                {{ getFileDevModels(record.id) || '-' }}
              </span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space :size="8">
                <a-button type="text" size="small" @click="handlePreview(record)" title="在线预览">
                  <template #icon>
                    <BookOutlined />
                  </template>
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="goToBindDevices(record)"
                  title="关联设备"
                >
                  <template #icon>
                    <LinkOutlined />
                  </template>
                </a-button>
                <a-popconfirm
                  title="确定删除该文件吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDelete(record.id)"
                >
                  <a-button type="text" danger size="small" title="删除">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="暂无数据" />
          </template>
        </a-table>
      </div>
    </template>

    <!-- 文件详情视图 -->
    <div
      v-else-if="viewMode === 'DETAIL' && selectedFileForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div class="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <a-button shape="circle" @click="backToList">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
        </a-button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {{ selectedFileForDetail.name }}
            <a-tag color="default">{{ selectedFileForDetail.version }}</a-tag>
          </h1>
          <p class="text-sm text-slate-500">文档详细信息与设备关联管理</p>
        </div>
      </div>

      <!-- 基本属性 -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h3
          class="font-bold text-slate-800 border-l-4 border-blue-500 pl-3 flex items-center gap-2"
        >
          基本属性
        </h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label class="text-xs text-slate-400 block mb-1">文件类型</label>
            <div class="text-sm text-slate-700 font-medium">
              {{ selectedFileForDetail.type }} ({{
                MANUAL_TYPE_MAP[selectedFileForDetail.manualType || ''] || '-'
              }})
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">语言</label>
            <div class="text-sm text-slate-700 font-medium">
              {{ getLanguageLabel(selectedFileForDetail.language) }} ({{
                getShortLangCode(selectedFileForDetail.language || '')
              }})
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">文件大小</label>
            <div class="text-sm text-slate-700 font-medium font-mono">
              {{ selectedFileForDetail.size }}
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">版本</label>
            <div class="text-sm text-slate-700 font-medium">{{
              selectedFileForDetail.version
            }}</div>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">上传人</label>
            <div class="text-sm text-slate-700 font-medium">{{
              selectedFileForDetail.creator
            }}</div>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">上传时间</label>
            <div class="text-sm text-slate-700 font-medium">
              {{ selectedFileForDetail.uploadDate }}
            </div>
          </div>
        </div>
      </div>

      <!-- 关联设备概览 -->
      <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3
            class="font-bold text-slate-800 border-l-4 border-emerald-500 pl-3 flex items-center gap-2"
          >
            关联设备概览 ({{ fileLinkedDevices.length }})
          </h3>
          <div class="flex gap-2">
            <a-button type="primary" @click="goToBindDevices(selectedFileForDetail)">
              <template #icon>
                <LinkOutlined />
              </template>
              关联更多设备
            </a-button>
          </div>
        </div>

        <div class="flex-1 overflow-x-auto">
          <a-table
            :dataSource="fileLinkedDevices"
            :columns="linkedDeviceColumns"
            :pagination="false"
            row-key="id"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'categoryId'">
                <a-tag color="default">{{ getCategoryDisplay(record.categoryId) }}</a-tag>
              </template>
            </template>
            <template #emptyText>
              <a-empty description="暂未关联任何设备" />
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 关联设备视图 -->
    <div
      v-else-if="viewMode === 'BIND_DEVICES' && selectedFileForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div class="flex items-center justify-between border-b border-slate-200 pb-4">
        <div class="flex items-center gap-4">
          <a-button shape="circle" @click="backToDetail">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
          </a-button>
          <div>
            <h1 class="text-xl font-bold text-slate-800">关联更多设备</h1>
            <p class="text-sm text-slate-500">
              当前文件:
              <span class="font-medium text-indigo-600">{{ selectedFileForDetail.name }}</span>
            </p>
          </div>
        </div>
        <a-space :size="12">
          <a-button @click="backToDetail">取消</a-button>
          <a-button type="primary" @click="saveDeviceBindings">
            <template #icon>
              <SaveOutlined />
            </template>
            保存关联 ({{ selectedDevicesForBind.size }})
          </a-button>
        </a-space>
      </div>

      <!-- Filter Bar -->
      <div
        class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end"
      >
        <div class="w-48">
          <label class="block text-xs font-medium text-slate-500 mb-1">设备名称</label>
          <a-input v-model:value="bindDevName" placeholder="搜索设备名..." allow-clear />
        </div>
        <div class="w-40">
          <label class="block text-xs font-medium text-slate-500 mb-1">设备分类</label>
          <a-select
            v-model:value="bindDevCategory"
            placeholder="全部"
            allow-clear
            style="width: 100%"
            :options="[
              { value: '', label: '全部' },
              ...categories.map((c) => ({ value: c.name, label: c.name })),
            ]"
          />
        </div>
        <div class="w-40">
          <label class="block text-xs font-medium text-slate-500 mb-1">设备型号</label>
          <a-input v-model:value="bindDevModel" placeholder="搜索型号..." allow-clear />
        </div>
      </div>

      <!-- Device Table -->
      <div
        class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <a-table
          :dataSource="filteredDevicesForBind"
          :columns="deviceColumns"
          :pagination="{ pageSize: 10 }"
          row-key="id"
          size="middle"
          :row-class-name="
            (record) => (selectedDevicesForBind.has(record.id) ? 'bg-indigo-50' : '')
          "
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'selected'">
              <a-checkbox
                :checked="selectedDevicesForBind.has(record.id)"
                @change="toggleDeviceSelection(record.id)"
              />
            </template>
            <template v-else-if="column.key === 'categoryId'">
              <a-tag color="default">{{ getCategoryDisplay(record.categoryId) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'sn'">
              <span class="font-mono text-xs">{{ record.sn }}</span>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="暂无匹配设备" />
          </template>
        </a-table>
      </div>
    </div>

    <!-- 上传模态框 -->
    <Modal
      v-model:visible="isEditModalOpen"
      title="上传文件"
      width="1000px"
      :footer="null"
      @cancel="isEditModalOpen = false"
    >
      <div class="flex flex-col gap-6 p-2">
        <a-alert message="文件命名规范" type="info" show-icon>
          <template #description>
            <p>
              格式:
              <span class="font-mono bg-blue-100 px-1 rounded">TD-RND-{Category}-{Seq}-{Lang}</span>
              (例如: TD-RND-CF-001-cn)
            </p>
            <p class="mt-1">系统将自动校验分类简码与语言后缀的一致性。</p>
          </template>
        </a-alert>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >文件名称 <span class="text-red-500">*</span></label
              >
              <a-input v-model:value="uploadForm.name" placeholder="输入文件名..." size="large" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">文件语言</label>
                <a-select
                  v-model:value="uploadForm.language"
                  @change="handleLanguageChange"
                  placeholder="-- 选择语言 --"
                  size="large"
                  style="width: 100%"
                  :options="[
                    { value: '', label: '-- 选择语言 --' },
                    ...LANGUAGE_OPTIONS.map((l) => ({ value: l.code, label: l.label })),
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">语言简码</label>
                <a-input
                  :value="uploadForm.langCode"
                  disabled
                  placeholder="自动生成"
                  size="large"
                  class="font-mono"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">文件类型</label>
                <a-select
                  v-model:value="uploadForm.manualType"
                  size="large"
                  style="width: 100%"
                  :options="
                    Object.entries(MANUAL_TYPE_MAP).map(([k, v]) => ({ value: k, label: v }))
                  "
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">版本号</label>
                <a-input v-model:value="uploadForm.version" size="large" />
              </div>
            </div>
          </div>

          <!-- Right Column: Binding Logic -->
          <div class="space-y-5">
            <!-- Step 1: Category -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">设备分类 (筛选)</label>
              <a-select
                v-model:value="uploadForm.categoryId"
                @change="handleCategoryChange"
                placeholder="-- 请先选择分类 --"
                size="large"
                style="width: 100%"
                :options="[
                  { value: '', label: '-- 请先选择分类 --' },
                  ...categories.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.description})`,
                  })),
                ]"
              />
            </div>

            <!-- Step 2: Model (Filtered by Category) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">设备型号 (筛选)</label>
              <a-select
                v-model:value="uploadForm.deviceModel"
                :disabled="!uploadForm.categoryId"
                placeholder="-- 请选择型号 --"
                size="large"
                style="width: 100%"
                :options="[
                  { value: '', label: '-- 请选择型号 --' },
                  ...availableModels.map((m) => ({ value: m, label: m })),
                ]"
              />
            </div>

            <!-- Step 3: Device (Filtered by Category & Model) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">关联设备名称</label>
              <a-select
                v-model:value="uploadForm.deviceId"
                :disabled="!uploadForm.deviceModel"
                placeholder="-- 选择具体设备 --"
                size="large"
                style="width: 100%"
                :options="[
                  { value: '', label: '-- 选择具体设备 --' },
                  ...availableDevices.map((d) => ({ value: d.id, label: `${d.name} (${d.sn})` })),
                ]"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">上传人</label>
                <a-input :value="uploadForm.uploader" disabled size="large" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">上传时间</label>
                <a-input :value="uploadForm.uploadTime" disabled size="large" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-slate-100">
          <div class="flex items-center gap-3">
            <input ref="fileInputRef" type="file" class="hidden" @change="handleFileSelect" />
            <a-button @click="$refs.fileInputRef?.click()">
              <template #icon>
                <FileOutlined />
              </template>
              {{ rawFile ? '更换文件' : '选择文件' }}
            </a-button>
            <span v-if="rawFile" class="text-sm text-slate-600"
              >{{ rawFile.name }} ({{ (rawFile.size / 1024).toFixed(1) }} KB)</span
            >
          </div>

          <a-space :size="12">
            <a-button @click="isEditModalOpen = false">取消</a-button>
            <a-button type="primary" @click="handleSaveUpload">
              <template #icon>
                <CloudUploadOutlined />
              </template>
              确认上传
            </a-button>
          </a-space>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue'
  import {
    Input as AInput,
    Select as ASelect,
    Button as AButton,
    Table as ATable,
    Modal,
    DatePicker as ADatePicker,
    Checkbox as ACheckbox,
    Tag as ATag,
    Empty as AEmpty,
    Popconfirm as APopconfirm,
    Space as ASpace,
    Alert as AAlert,
    message,
  } from 'ant-design-vue'
  import type { TableColumnsType } from 'ant-design-vue'
  import {
    UploadOutlined,
    SearchOutlined,
    LinkOutlined,
    DeleteOutlined,
    BookOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    FileTextOutlined,
    CloudUploadOutlined,
    FileOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined,
    DownloadOutlined,
  } from '@ant-design/icons-vue'
  import { MANUAL_TYPE_MAP, LANGUAGE_OPTIONS } from '../constants'
  import type { Device, DocFile, Category } from '../types'

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
      parameters: {},
      qrAddress: '',
      qrDesc: '',
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
      parameters: {},
      qrAddress: '',
      qrDesc: '',
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
      parameters: {},
      qrAddress: '',
      qrDesc: '',
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

  // 文件-设备关联关系
  const mockDeviceFileBindings = ref<Map<string, string[]>>(
    new Map([
      ['dev-1', ['file-1', 'file-2']],
      ['dev-2', ['file-3']],
      ['dev-3', ['file-4']],
    ]),
  )

  // 视图模式
  type ViewMode = 'LIST' | 'DETAIL' | 'BIND_DEVICES'
  const viewMode = ref<ViewMode>('LIST')

  // 数据状态
  const files = ref<DocFile[]>([...mockFiles])
  const devices = ref<Device[]>([...mockDevices])
  const categories = ref<Category[]>([...mockCategories])

  // 筛选状态
  const searchTerm = ref('')
  const filterStartDate = ref('')
  const filterEndDate = ref('')
  const filterCategory = ref('')
  const filterLanguage = ref('')
  const filterLinked = ref('all')

  // 绑定设备筛选状态
  const bindDevName = ref('')
  const bindDevCategory = ref('')
  const bindDevModel = ref('')

  // 选中状态
  const selectedDevicesForBind = ref<Set<string>>(new Set())

  // 模态框状态
  const isEditModalOpen = ref(false)
  const isPdfViewerOpen = ref(false)

  // 详情页状态
  const selectedFileForDetail = ref<DocFile | null>(null)

  // 上传表单状态
  interface UploadFormState {
    id: string
    name: string
    manualType: string
    language: string
    langCode: string
    deviceId: string
    deviceCategoryName: string
    deviceModel: string
    version: string
    uploader: string
    uploadTime: string
    fileType: string
    categoryId: string
  }

  const uploadForm = reactive<UploadFormState>({
    id: '',
    name: '',
    manualType: 'CZ',
    language: '',
    langCode: '',
    deviceId: '',
    deviceCategoryName: '',
    deviceModel: '',
    version: 'v1.0',
    uploader: '',
    uploadTime: '',
    fileType: 'PDF',
    categoryId: '',
  })

  const isNew = ref(false)
  const rawFile = ref<File | null>(null)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // Toast 消息提示
  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      message.success(msg)
    } else {
      message.error(msg)
    }
  }

  // 表格列配置
  const fileColumns: TableColumnsType = [
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 120,
    },
    {
      title: '简码',
      dataIndex: 'langCode',
      key: 'langCode',
      width: 80,
    },
    {
      title: '关联',
      dataIndex: 'linked',
      key: 'linked',
      width: 80,
    },
    {
      title: '绑定设备分类',
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
    },
    {
      title: '绑定设备型号',
      dataIndex: 'models',
      key: 'models',
      width: 150,
    },
    {
      title: '上传日期',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 120,
    },
    {
      title: '上传人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
    },
  ]

  // 设备绑定表格列配置
  const deviceColumns: TableColumnsType = [
    {
      title: '选择',
      dataIndex: 'selected',
      key: 'selected',
      width: 60,
      align: 'center',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '序列号',
      dataIndex: 'sn',
      key: 'sn',
      width: 180,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
  ]

  // 关联设备表格列配置
  const linkedDeviceColumns: TableColumnsType = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '设备分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 150,
    },
    {
      title: '设备型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
  ]

  // 辅助函数
  const getShortLangCode = (fullCode: string): string => {
    if (!fullCode) return ''
    if (fullCode === 'zh_cn') return 'cn'
    if (fullCode === 'zh_tw') return 'tw'
    return fullCode.split('_')[0]
  }

  const getCategoryDisplay = (catId: string) => {
    const cat = categories.value.find((c) => c.id === catId)
    return cat ? cat.name : '-'
  }

  const getLanguageLabel = (code: string) => {
    return LANGUAGE_OPTIONS.find((opt) => opt.code === code)?.label || '-'
  }

  const isFileLinked = (fileId: string) => {
    let linked = false
    mockDeviceFileBindings.value.forEach((fileIds) => {
      if (fileIds.includes(fileId)) linked = true
    })
    return linked
  }

  const getFileLinkedDevices = (fileId: string): Device[] => {
    const boundDeviceIds: string[] = []
    mockDeviceFileBindings.value.forEach((fileIds, deviceId) => {
      if (fileIds.includes(fileId)) {
        boundDeviceIds.push(deviceId)
      }
    })
    return devices.value.filter((d) => boundDeviceIds.includes(d.id))
  }

  const getFileCatNames = (fileId: string) => {
    const linkedDevices = getFileLinkedDevices(fileId)
    const catNames = Array.from(
      new Set(
        linkedDevices
          .map((d) => {
            const cat = categories.value.find((c) => c.id === d.categoryId)
            return cat ? cat.name : ''
          })
          .filter(Boolean),
      ),
    ).join(', ')
    return catNames
  }

  const getFileDevModels = (fileId: string) => {
    const linkedDevices = getFileLinkedDevices(fileId)
    return Array.from(new Set(linkedDevices.map((d) => d.model))).join(', ')
  }

  // 筛选逻辑
  const filteredFiles = computed(() => {
    return files.value.filter((f) => {
      const matchName = f.name.toLowerCase().includes(searchTerm.value.toLowerCase())

      let matchDate = true
      if (filterStartDate.value || filterEndDate.value) {
        const fileDate = new Date(f.uploadDate).getTime()
        if (filterStartDate.value) {
          matchDate = matchDate && fileDate >= new Date(filterStartDate.value).getTime()
        }
        if (filterEndDate.value) {
          matchDate = matchDate && fileDate <= new Date(filterEndDate.value).getTime()
        }
      }

      const matchCategory = !filterCategory.value || f.categoryId === filterCategory.value
      const matchLanguage = !filterLanguage.value || f.language === filterLanguage.value

      const isLinked = isFileLinked(f.id)
      const matchLinked =
        filterLinked.value === 'all' ? true : filterLinked.value === 'yes' ? isLinked : !isLinked

      return matchName && matchDate && matchCategory && matchLanguage && matchLinked
    })
  })

  const filteredDevicesForBind = computed(() => {
    return devices.value.filter((d) => {
      const matchName =
        !bindDevName.value || d.name.toLowerCase().includes(bindDevName.value.toLowerCase())
      const matchModel =
        !bindDevModel.value || d.model.toLowerCase().includes(bindDevModel.value.toLowerCase())

      let matchCategory = true
      if (bindDevCategory.value) {
        const cat = categories.value.find((c) => c.id === d.categoryId)
        if (!cat || !cat.name.includes(bindDevCategory.value)) matchCategory = false
      }

      return matchName && matchModel && matchCategory
    })
  })

  const fileLinkedDevices = computed(() => {
    if (!selectedFileForDetail.value) return []
    return getFileLinkedDevices(selectedFileForDetail.value.id)
  })

  const availableModels = computed(() => {
    if (!uploadForm.categoryId) return []
    const devicesInCat = devices.value.filter((d) => d.categoryId === uploadForm.categoryId)
    return Array.from(new Set(devicesInCat.map((d) => d.model)))
  })

  const availableDevices = computed(() => {
    if (!uploadForm.categoryId || !uploadForm.deviceModel) return []
    return devices.value.filter(
      (d) => d.categoryId === uploadForm.categoryId && d.model === uploadForm.deviceModel,
    )
  })

  // 导航操作
  const goToFileDetail = (file: DocFile) => {
    selectedFileForDetail.value = file
    viewMode.value = 'DETAIL'
  }

  const goToBindDevices = (file: DocFile) => {
    selectedFileForDetail.value = file
    const linkedDevs = getFileLinkedDevices(file.id)
    selectedDevicesForBind.value = new Set(linkedDevs.map((d) => d.id))

    bindDevName.value = ''
    bindDevCategory.value = ''
    bindDevModel.value = ''

    viewMode.value = 'BIND_DEVICES'
  }

  const backToList = () => {
    selectedFileForDetail.value = null
    viewMode.value = 'LIST'
  }

  const backToDetail = () => {
    viewMode.value = 'DETAIL'
  }

  const handlePreview = (file: DocFile) => {
    selectedFileForDetail.value = file
    isPdfViewerOpen.value = true
  }

  // 绑定逻辑
  const toggleDeviceSelection = (deviceId: string) => {
    const next = new Set(selectedDevicesForBind.value)
    if (next.has(deviceId)) next.delete(deviceId)
    else next.add(deviceId)
    selectedDevicesForBind.value = next
  }

  const saveDeviceBindings = () => {
    if (!selectedFileForDetail.value) return

    const fileId = selectedFileForDetail.value.id
    const newDeviceIds = Array.from(selectedDevicesForBind.value)

    // 更新绑定关系
    mockDeviceFileBindings.value.forEach((fileIds, deviceId) => {
      const index = fileIds.indexOf(fileId)
      const shouldInclude = newDeviceIds.includes(deviceId)

      if (shouldInclude && index === -1) {
        fileIds.push(fileId)
      } else if (!shouldInclude && index !== -1) {
        fileIds.splice(index, 1)
      }
    })

    showToast('设备关联已更新', 'success')
    viewMode.value = 'DETAIL'
  }

  // 上传逻辑
  const openUploadModal = () => {
    const today = new Date().toISOString().split('T')[0]

    Object.assign(uploadForm, {
      id: `file-${Date.now()}`,
      name: '',
      manualType: 'CZ',
      language: '',
      langCode: '',
      deviceId: '',
      deviceCategoryName: '',
      deviceModel: '',
      version: 'v1.0',
      uploader: 'Admin',
      uploadTime: today,
      fileType: 'PDF',
      categoryId: '',
    })

    rawFile.value = null
    isNew.value = true
    isEditModalOpen.value = true
  }

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      rawFile.value = file
      const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      uploadForm.fileType = ext
    }
  }

  const handleLanguageChange = () => {
    const shortCode = getShortLangCode(uploadForm.language)
    uploadForm.langCode = shortCode
  }

  const handleCategoryChange = () => {
    const cat = categories.value.find((c) => c.id === uploadForm.categoryId)
    uploadForm.deviceCategoryName = cat ? cat.name : ''
    uploadForm.deviceModel = ''
    uploadForm.deviceId = ''
  }

  const handleSaveUpload = () => {
    if (!uploadForm.name) {
      showToast('请输入文件名称', 'error')
      return
    }
    if (isNew.value && !rawFile.value) {
      showToast('请选择上传的文件', 'error')
      return
    }

    const newFile: DocFile = {
      id: isNew.value ? `file-${Date.now()}` : uploadForm.id,
      name: uploadForm.name,
      size: rawFile.value ? (rawFile.value.size / 1024).toFixed(1) + ' KB' : '0 KB',
      type: uploadForm.fileType,
      uploadDate: uploadForm.uploadTime,
      url: '#',
      creator: uploadForm.uploader,
      manualType: uploadForm.manualType,
      language: uploadForm.language,
      categoryId: uploadForm.categoryId,
      version: uploadForm.version,
    }

    if (isNew.value) {
      files.value.push(newFile)
    } else {
      const index = files.value.findIndex((f) => f.id === newFile.id)
      if (index !== -1) {
        files.value[index] = newFile
      }
    }

    if (uploadForm.deviceId) {
      const existing = mockDeviceFileBindings.value.get(uploadForm.deviceId) || []
      if (!existing.includes(newFile.id)) {
        existing.push(newFile.id)
        mockDeviceFileBindings.value.set(uploadForm.deviceId, existing)
      }
    }

    isEditModalOpen.value = false
    showToast('文件上传成功', 'success')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除该文件吗？')) {
      files.value = files.value.filter((f) => f.id !== id)
      mockDeviceFileBindings.value.forEach((fileIds) => {
        const index = fileIds.indexOf(id)
        if (index !== -1) {
          fileIds.splice(index, 1)
        }
      })
      showToast('文件已删除', 'success')
    }
  }
</script>

<style scoped>
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

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInFromTop {
    from {
      transform: translateX(-50%) translateY(-16px);
    }

    to {
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(16px);
    }

    to {
      transform: translateX(0);
    }
  } /* PDF 预览器 - 最高层级 */
  .pdf-viewer-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: #0f172a;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.2s ease-out;
  }

  .pdf-viewer-header {
    height: 64px;
    background-color: #1e293b;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
    backdrop-filter: blur(10px);
  }

  .pdf-viewer-btn,
  .pdf-viewer-btn-back {
    transition: all 0.2s ease;
  }

  .pdf-viewer-btn:hover,
  .pdf-viewer-btn-back:hover {
    background-color: rgba(71, 85, 105, 0.6) !important;
    transform: scale(1.08);
  }

  .pdf-viewer-btn:active,
  .pdf-viewer-btn-back:active {
    transform: scale(0.95);
  }

  .pdf-viewer-content {
    flex: 1;
    background-color: #64748b;
    overflow-y: auto;
    padding: 32px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .pdf-viewer-paper {
    background: white;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 56rem;
    min-height: 1200px;
    padding: 64px;
    border-radius: 2px;
    margin-bottom: 40px;
  }

  /* 通用动画 */
  .animate-in {
    animation: slideIn 0.3s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-in-from-top-4 {
    animation: slideInFromTop 0.3s ease-out;
  }

  .slide-in-from-right-4 {
    animation: slideInFromRight 0.3s ease-out;
  }

  /* 表格选中行样式 */
  :deep(.bg-indigo-50) {
    background-color: #eef2ff !important;
  }

  :deep(.bg-indigo-50:hover) {
    background-color: #e0e7ff !important;
  }
</style>
