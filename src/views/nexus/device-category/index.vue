<template>
  <div class="p-4 h-full flex flex-col relative space-y-4">
    <!-- Top Bar -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">设备分类管理</h1>
        <p class="text-slate-500 text-sm">定义设备类型及关联属性规范</p>
      </div>
      <div class="flex gap-2">
        <a-button type="primary" @click="openCreateModal" class="flex items-center gap-2">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新建分类
        </a-button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
      <div class="relative flex-1 max-w-md">
        <a-input
          v-model:value="searchTerm"
          placeholder="搜索分类名称..."
          class="w-full"
          allow-clear
        >
          <template #prefix>
            <Icon icon="ant-design:search-outlined" class="text-slate-400" />
          </template>
        </a-input>
      </div>
      <a-button @click="refreshData" class="flex items-center gap-2">
        <template #icon>
          <Icon icon="ant-design:search-outlined" />
        </template>
        查询
      </a-button>
      <a-button @click="searchTerm = ''"> 重置 </a-button>
    </div>

    <!-- Table -->
    <div
      class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col"
    >
      <a-table
        :columns="columns"
        :data-source="filteredCategories"
        :loading="loading"
        :pagination="false"
        row-key="id"
        class="category-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="font-medium text-slate-900">{{ record.name }}</span>
          </template>
          <template v-if="column.key === 'description'">
            <span :title="record.description" class="text-slate-500">
              {{ record.description || '-' }}
            </span>
          </template>
          <template v-if="column.key === 'createdAt'">
            <span class="text-slate-500 font-mono text-xs">{{ record.createdAt }}</span>
          </template>
          <template v-if="column.key === 'creator'">
            <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
              {{ record.creator }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-button size="small" @click="openEditModal(record)">
                <template #icon>
                  <Icon icon="ant-design:edit-outlined" />
                </template>
                修改
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
    <!-- Modal (Create/Edit) -->
    <Modal
      v-model:visible="isModalOpen"
      :title="isNew ? '新建设备分类' : '编辑设备分类'"
      width="1000px"
      :footer="null"
      wrapClassName="device-category-modal"
      @cancel="handleDirectClose"
    >
      <div class="flex flex-col h-[80vh] divide-y divide-slate-200">
        <!-- Section 1: Basic Info -->
        <div class="py-6 px-2 flex-shrink-0">
          <h3 class="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <span class="w-1 h-5 rounded-full bg-indigo-600"></span>
            基本信息
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div class="md:col-span-5 space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2"
                  >分类名称 <span class="text-red-500">*</span></label
                >
                <a-input
                  v-model:value="formCategory.name"
                  placeholder="请输入分类名称"
                  class="w-full"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-500 mb-2">创建人</label>
                  <a-input
                    :value="formCategory.creator || ''"
                    disabled
                    class="w-full bg-slate-100 text-slate-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-500 mb-2">创建时间</label>
                  <a-input
                    :value="formCategory.createdAt || ''"
                    disabled
                    class="w-full bg-slate-100 text-slate-500"
                  />
                </div>
              </div>
            </div>
            <div class="md:col-span-7 h-full flex flex-col">
              <label class="block text-sm font-medium text-slate-700 mb-2">分类描述</label>
              <a-textarea
                v-model:value="formCategory.description"
                class="flex-1 w-full"
                placeholder="请输入该分类的详细描述..."
                :rows="4"
                style="resize: none; min-height: 120px"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: Attributes -->
        <div class="flex-1 flex flex-col py-6 px-2 min-h-0">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <span class="w-1 h-5 rounded-full bg-emerald-500"></span>
              参数定义
            </h3>
            <a-button
              type="primary"
              @click="addAttributeRow"
              class="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
            >
              <template #icon>
                <Icon icon="ant-design:plus-circle-outlined" />
              </template>
              新增
            </a-button>
          </div>

          <div
            class="flex-1 overflow-hidden bg-slate-50 border border-slate-200 rounded-xl flex flex-col"
          >
            <div
              class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase"
            >
              <div class="col-span-1 text-center">序号</div>
              <div class="col-span-5">参数名称</div>
              <div class="col-span-3">单位</div>
              <div class="col-span-2">是否显示</div>
              <div class="col-span-1 text-center">操作</div>
            </div>

            <div class="overflow-y-auto custom-scrollbar p-4 space-y-2 flex-1 relative">
              <div
                v-if="formAttributes.length === 0"
                class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60"
              >
                <div class="p-4 bg-slate-100 rounded-full mb-3">
                  <Icon icon="ant-design:setting-outlined" class="w-8 h-8" />
                </div>
                <p class="text-sm">暂无自定义参数</p>
              </div>
              <div
                v-for="(attr, idx) in formAttributes"
                v-else
                :key="idx"
                class="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
              >
                <div class="col-span-1 flex justify-center">
                  <span
                    class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center"
                    >{{ idx + 1 }}</span
                  >
                </div>
                <div class="col-span-5 relative">
                  <a-auto-complete
                    :value="attr.name"
                    :options="getParamOptions(attr.name || '')"
                    @update:value="(val) => updateAttribute(idx, 'name', val)"
                    placeholder="输入参数名称"
                    class="w-full"
                  />
                </div>
                <div class="col-span-3">
                  <a-input
                    :value="attr.unit || ''"
                    @change="(e) => updateAttribute(idx, 'unit', e.target.value)"
                    placeholder="单位"
                    class="w-full"
                  />
                </div>
                <div class="col-span-2">
                  <label class="inline-flex items-center cursor-pointer gap-2">
                    <a-switch
                      :checked="attr.visible"
                      @change="(checked) => updateAttribute(idx, 'visible', checked)"
                      size="small"
                    />
                    <span class="text-xs font-medium text-slate-600 select-none">{{
                      attr.visible ? '显示' : '隐藏'
                    }}</span>
                  </label>
                </div>
                <div class="col-span-1 flex justify-center">
                  <a-button type="text" danger size="small" @click="removeAttribute(idx)">
                    <template #icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </template>
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-4 pt-6 mt-auto border-t border-slate-100 flex-shrink-0">
          <a-button size="large" @click="handleCancelClick">
            <template #icon>
              <Icon icon="ant-design:close-outlined" />
            </template>
            取消
          </a-button>
          <a-button type="primary" size="large" @click="handleSaveCheck">
            <template #icon>
              <Icon icon="ant-design:save-outlined" />
            </template>
            提交保存
          </a-button>
        </div>
      </div>
    </Modal>

    <!-- Confirm Close Modal -->
    <Modal
      v-model:visible="isConfirmCloseOpen"
      title="确认取消"
      width="400px"
      :footer="null"
      @cancel="isConfirmCloseOpen = false"
    >
      <div class="flex flex-col items-center text-center pt-2 pb-2">
        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Icon icon="ant-design:exclamation-circle-outlined" class="w-6 h-6 text-amber-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">确定取消吗？</h3>
        <p class="text-sm text-slate-500 mb-6">当前编辑的内容将不会被保存。</p>
        <div class="flex gap-3 w-full">
          <a-button @click="isConfirmCloseOpen = false" class="flex-1" size="large">
            暂不取消
          </a-button>
          <a-button type="primary" @click="executeCancel" class="flex-1" size="large">
            确定取消
          </a-button>
        </div>
      </div>
    </Modal>

    <!-- Confirm Save Modal -->
    <Modal
      v-model:visible="isConfirmSaveOpen"
      title="确认提交"
      width="400px"
      :footer="null"
      @cancel="isConfirmSaveOpen = false"
    >
      <div class="flex flex-col items-center text-center pt-2 pb-2">
        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Icon icon="ant-design:check-circle-outlined" class="w-6 h-6 text-indigo-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">确认提交保存？</h3>
        <div class="flex gap-3 w-full mt-6">
          <a-button @click="isConfirmSaveOpen = false" class="flex-1" size="large">
            再检查下
          </a-button>
          <a-button type="primary" @click="executeSave" class="flex-1" size="large">
            确定提交
          </a-button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import {
    Table as ATable,
    Button as AButton,
    Space as ASpace,
    Input as AInput,
    Textarea as ATextarea,
    Switch as ASwitch,
    AutoComplete as AAutoComplete,
    Modal,
    message,
  } from 'ant-design-vue'
  import { Icon } from '/@/components/Icon'
  import type { Category, CategoryAttribute } from '../types'

  // Mock 数据
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'CF',
      description: '离心机 - 用于分离物质的设备',
      creator: 'Admin',
      createdAt: '2024-01-15',
      level: 1,
      parentId: null,
    },
    {
      id: 'cat-2',
      name: 'PM',
      description: '泵类设备 - 用于流体输送的设备',
      creator: 'Admin',
      createdAt: '2024-01-16',
      level: 1,
      parentId: null,
    },
    {
      id: 'cat-3',
      name: 'MX',
      description: '混合器 - 用于物料混合的设备',
      creator: 'Admin',
      createdAt: '2024-01-17',
      level: 1,
      parentId: null,
    },
  ]

  const mockCategoryAttributes = new Map<string, CategoryAttribute[]>([
    [
      'cat-1',
      [
        { id: 'attr-1-1', categoryId: 'cat-1', name: 'power', unit: 'kW', visible: true },
        { id: 'attr-1-2', categoryId: 'cat-1', name: 'speed', unit: 'rpm', visible: true },
        { id: 'attr-1-3', categoryId: 'cat-1', name: 'capacity', unit: 'L', visible: true },
      ],
    ],
    [
      'cat-2',
      [
        { id: 'attr-2-1', categoryId: 'cat-2', name: 'flowRate', unit: 'L/min', visible: true },
        { id: 'attr-2-2', categoryId: 'cat-2', name: 'pressure', unit: 'bar', visible: true },
      ],
    ],
    [
      'cat-3',
      [
        { id: 'attr-3-1', categoryId: 'cat-3', name: 'volume', unit: 'L', visible: true },
        { id: 'attr-3-2', categoryId: 'cat-3', name: 'speed', unit: 'rpm', visible: true },
      ],
    ],
  ])

  const mockHistoryParamNames = [
    'power',
    'speed',
    'capacity',
    'flowRate',
    'pressure',
    'volume',
    'temperature',
    'weight',
    'length',
    'width',
    'height',
  ]

  // 数据状态
  const categories = ref<Category[]>([...mockCategories])
  const searchTerm = ref('')
  const loading = ref(false)

  // 模态框与表单状态
  const isModalOpen = ref(false)
  const isConfirmCloseOpen = ref(false)
  const isConfirmSaveOpen = ref(false)

  const isNew = ref(false)
  const formCategory = ref<Partial<Category>>({})
  const formAttributes = ref<CategoryAttribute[]>([])

  // 自动补全状态
  const historyParamNames = ref<string[]>([...mockHistoryParamNames])

  // Table columns
  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: '分类描述',
      dataIndex: 'description',
      key: 'description',
      width: '33%',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'right' as const,
    },
  ]

  // 筛选逻辑
  const filteredCategories = computed(() =>
    categories.value.filter((c) => c.name.toLowerCase().includes(searchTerm.value.toLowerCase())),
  )

  const getParamOptions = (input: string) => {
    return historyParamNames.value
      .filter((n) => n.toLowerCase().includes((input || '').toLowerCase()))
      .map((n) => ({ value: n }))
  }

  const refreshData = () => {
    // Mock refresh - 实际项目中会从API重新加载数据
    message.info('数据已刷新')
  }
  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0]

    isNew.value = true
    formCategory.value = {
      name: '',
      description: '',
      creator: 'Admin',
      createdAt: today,
      level: 1,
      parentId: null,
    }
    formAttributes.value = []
    isModalOpen.value = true
  }

  const openEditModal = (cat: Category) => {
    isNew.value = false
    formCategory.value = { ...cat }
    const attrs = mockCategoryAttributes.get(cat.id) || []
    formAttributes.value = JSON.parse(JSON.stringify(attrs))
    isModalOpen.value = true
  }

  const handleDirectClose = () => {
    isModalOpen.value = false
  }

  const handleCancelClick = () => {
    isConfirmCloseOpen.value = true
  }

  const executeCancel = () => {
    isConfirmCloseOpen.value = false
    isModalOpen.value = false
    message.info('取消成功')
  }

  // 属性设计逻辑
  const addAttributeRow = () => {
    const newAttr: CategoryAttribute = {
      id: `attr-${Date.now()}`,
      categoryId: formCategory.value.id || '',
      name: '',
      unit: '',
      visible: true,
    }
    formAttributes.value.push(newAttr)
  }

  const updateAttribute = (index: number, field: keyof CategoryAttribute, value: any) => {
    const updated = [...formAttributes.value]
    updated[index] = { ...updated[index], [field]: value }
    formAttributes.value = updated
  }

  const removeAttribute = (index: number) => {
    const updated = [...formAttributes.value]
    updated.splice(index, 1)
    formAttributes.value = updated
  }

  // 保存逻辑
  const handleSaveCheck = () => {
    if (!formCategory.value.name || formCategory.value.name.trim() === '') {
      message.error('请填写分类名称 (必填)')
      return
    }
    const names = formAttributes.value.map((a) => a.name.trim()).filter((n) => n !== '')
    const uniqueNames = new Set(names)
    if (names.length !== uniqueNames.size) {
      message.error('参数名称不能重复，请检查')
      return
    }
    isConfirmSaveOpen.value = true
  }

  const executeSave = () => {
    let savedCategory: Category

    if (isNew.value) {
      // 新建
      savedCategory = {
        ...(formCategory.value as Category),
        id: `cat-${Date.now()}`,
      }
      categories.value.push(savedCategory)
    } else {
      // 编辑
      savedCategory = formCategory.value as Category
      const index = categories.value.findIndex((c) => c.id === savedCategory.id)
      if (index !== -1) {
        categories.value[index] = savedCategory
      }
    }

    // 保存属性
    const attributesWithCatId = formAttributes.value.map((a) => ({
      ...a,
      categoryId: savedCategory.id,
    }))
    mockCategoryAttributes.set(savedCategory.id, attributesWithCatId)

    // 更新历史参数名称
    const newNames = attributesWithCatId.map((a) => a.name).filter((n) => n.trim() !== '')
    newNames.forEach((name) => {
      if (!historyParamNames.value.includes(name)) {
        historyParamNames.value.push(name)
      }
    })

    isConfirmSaveOpen.value = false
    isModalOpen.value = false
    message.success('保存成功')
  }
</script>

<style lang="less">
  .device-category-modal {
    .ant-modal-body {
      padding: 30px !important;
    }
  }
</style>

<style scoped>


  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }

    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes slideInFromTop {
    from {
      transform: translateX(-50%) translateY(-16px);
    }

    to {
      transform: translateX(-50%) translateY(0);
    }
  }  /* Category Table Styles */
  .category-table :deep(.ant-table) {
    font-size: 14px;
  }

  .category-table :deep(.ant-table-thead > tr > th) {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #334155;
    padding: 16px 24px;
  }

  .category-table :deep(.ant-table-tbody > tr > td) {
    padding: 16px 24px;
    border-bottom: 1px solid #f1f5f9;
  }

  .category-table :deep(.ant-table-tbody > tr:hover > td) {
    background: #f8fafc;
  }

  .category-table :deep(.ant-empty) {
    padding: 48px 0;
  }

  /* Toast Animations */
  .animate-in {
    animation: slideIn 0.3s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-in-from-top-4 {
    animation: slideInFromTop 0.3s ease-out;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>
