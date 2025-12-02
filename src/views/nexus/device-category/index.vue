<template>
  <div class="p-4 h-full flex flex-col relative space-y-4">
    <!-- Toast -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-lg shadow-xl font-medium animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2',
        toast.type === 'success'
          ? 'bg-emerald-600 text-white'
          : toast.type === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-slate-800 text-white',
      ]"
    >
      <div
        v-if="toast.type === 'success'"
        class="w-2 h-2 rounded-full bg-white animate-pulse"
      ></div>
      {{ toast.msg }}
    </div>

    <!-- Top Bar -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">设备分类管理</h1>
        <p class="text-slate-500 text-sm">定义设备类型及关联属性规范</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Icon icon="ant-design:plus-outlined" class="w-4 h-4" />
          新建分类
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div class="relative flex-1 max-w-md">
        <Icon
          icon="ant-design:search-outlined"
          class="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
        />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="搜索分类名称..."
          class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>
      <button
        @click="refreshData"
        class="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <Icon icon="ant-design:search-outlined" class="w-4 h-4" />
        查询
      </button>
      <button
        @click="searchTerm = ''"
        class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
      >
        重置
      </button>
    </div>

    <!-- Table -->
    <div
      class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-700 w-1/4">分类名称</th>
              <th class="px-6 py-4 font-semibold text-slate-700 w-1/3">分类描述</th>
              <th class="px-6 py-4 font-semibold text-slate-700">创建时间</th>
              <th class="px-6 py-4 font-semibold text-slate-700">创建人</th>
              <th class="px-6 py-4 font-semibold text-slate-700 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="5" class="text-center py-12 text-slate-400">加载中...</td>
            </tr>
            <tr v-else-if="filteredCategories.length === 0">
              <td colspan="5" class="text-center py-12 text-slate-400">暂无数据</td>
            </tr>
            <tr
              v-for="cat in filteredCategories"
              v-else
              :key="cat.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-slate-900">{{ cat.name }}</td>
              <td
                class="px-6 py-4 text-slate-500 overflow-hidden text-ellipsis max-w-xs"
                :title="cat.description"
              >
                {{ cat.description || '-' }}
              </td>
              <td class="px-6 py-4 text-slate-500 font-mono text-xs">{{ cat.createdAt }}</td>
              <td class="px-6 py-4 text-slate-500">
                <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{{
                  cat.creator
                }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(cat)"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Icon icon="ant-design:edit-outlined" class="w-3.5 h-3.5" />
                    修改
                  </button>
                  <button
                    @click="openEditModal(cat)"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    <Icon icon="ant-design:setting-outlined" class="w-3.5 h-3.5" />
                    参数定义
                  </button>
                  <button
                    @click="requestDelete(cat.id, cat.name)"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <Icon icon="ant-design:delete-outlined" class="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal (Create/Edit) -->
    <NexusModal
      v-model:visible="isModalOpen"
      :title="isNew ? '新建设备分类' : '编辑设备分类'"
      width="1200px"
      @close="handleDirectClose"
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
                <input
                  v-model="formCategory.name"
                  type="text"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="请输入分类名称"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-500 mb-2">创建人</label>
                  <input
                    :value="formCategory.creator || ''"
                    disabled
                    class="w-full px-4 py-2.5 bg-slate-100 border rounded-lg text-slate-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-500 mb-2">创建时间</label>
                  <input
                    :value="formCategory.createdAt || ''"
                    disabled
                    class="w-full px-4 py-2.5 bg-slate-100 border rounded-lg text-slate-500"
                  />
                </div>
              </div>
            </div>
            <div class="md:col-span-7 h-full flex flex-col">
              <label class="block text-sm font-medium text-slate-700 mb-2">分类描述</label>
              <textarea
                v-model="formCategory.description"
                class="flex-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[120px]"
                placeholder="请输入该分类的详细描述..."
              ></textarea>
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
            <button
              @click="addAttributeRow"
              class="flex items-center gap-1.5 text-sm font-medium text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm"
            >
              <Icon icon="ant-design:plus-circle-outlined" class="w-4 h-4" />
              新增
            </button>
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
                  <input
                    :value="attr.name"
                    @input="updateAttribute(idx, 'name', ($event.target as HTMLInputElement).value)"
                    @focus="activeParamDropdownIndex = idx"
                    @blur="() => setTimeout(() => (activeParamDropdownIndex = null), 200)"
                    placeholder="输入参数名称"
                    class="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <ul
                    v-if="activeParamDropdownIndex === idx"
                    class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
                  >
                    <li
                      v-for="(s, sIdx) in filteredParamNames(attr.name || '')"
                      :key="sIdx"
                      @click="updateAttribute(idx, 'name', s)"
                      class="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer"
                    >
                      {{ s }}
                    </li>
                  </ul>
                </div>
                <div class="col-span-3">
                  <input
                    :value="attr.unit || ''"
                    @input="updateAttribute(idx, 'unit', ($event.target as HTMLInputElement).value)"
                    placeholder="单位"
                    class="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div class="col-span-2">
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="attr.visible"
                      @change="
                        updateAttribute(idx, 'visible', ($event.target as HTMLInputElement).checked)
                      "
                      class="sr-only peer"
                    />
                    <div
                      class="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"
                    ></div>
                    <span class="ms-2 text-xs font-medium text-slate-600 select-none">{{
                      attr.visible ? '显示' : '隐藏'
                    }}</span>
                  </label>
                </div>
                <div class="col-span-1 flex justify-center">
                  <button
                    @click="removeAttribute(idx)"
                    class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Icon icon="ant-design:delete-outlined" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-4 pt-6 mt-auto border-t border-slate-100 flex-shrink-0">
          <button
            @click="handleCancelClick"
            class="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <Icon icon="ant-design:close-outlined" class="w-4 h-4" /> 取消
          </button>
          <button
            @click="handleSaveCheck"
            class="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md"
          >
            <Icon icon="ant-design:save-outlined" class="w-4 h-4" /> 提交保存
          </button>
        </div>
      </div>
    </NexusModal>

    <!-- Confirm Close Modal -->
    <NexusModal
      v-model:visible="isConfirmCloseOpen"
      title="确认取消"
      width="400px"
      @close="isConfirmCloseOpen = false"
    >
      <div class="flex flex-col items-center text-center pt-2 pb-2">
        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Icon icon="ant-design:exclamation-circle-outlined" class="w-6 h-6 text-amber-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">确定取消吗？</h3>
        <p class="text-sm text-slate-500 mb-6">当前编辑的内容将不会被保存。</p>
        <div class="flex gap-3 w-full">
          <button
            @click="isConfirmCloseOpen = false"
            class="flex-1 py-2.5 border rounded-lg hover:bg-slate-50"
          >
            暂不取消
          </button>
          <button
            @click="executeCancel"
            class="flex-1 py-2.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700"
          >
            确定取消
          </button>
        </div>
      </div>
    </NexusModal>

    <!-- Confirm Save Modal -->
    <NexusModal
      v-model:visible="isConfirmSaveOpen"
      title="确认提交"
      width="400px"
      @close="isConfirmSaveOpen = false"
    >
      <div class="flex flex-col items-center text-center pt-2 pb-2">
        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Icon icon="ant-design:check-circle-outlined" class="w-6 h-6 text-indigo-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">确认提交保存？</h3>
        <div class="flex gap-3 w-full mt-6">
          <button
            @click="isConfirmSaveOpen = false"
            class="flex-1 py-2.5 border rounded-lg hover:bg-slate-50"
          >
            再检查下
          </button>
          <button
            @click="executeSave"
            class="flex-1 py-2.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700"
          >
            确定提交
          </button>
        </div>
      </div>
    </NexusModal>

    <!-- Confirm Delete Modal -->
    <NexusModal
      v-model:visible="isConfirmDeleteOpen"
      title="确认删除"
      width="400px"
      @close="isConfirmDeleteOpen = false"
    >
      <div class="flex flex-col items-center text-center pt-2 pb-2">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Icon icon="ant-design:warning-outlined" class="w-6 h-6 text-red-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">确定删除分类?</h3>
        <p class="text-sm text-slate-500 mb-6">
          您正在删除 <strong>{{ deleteTarget?.name }}</strong
          >，该操作无法撤销。
        </p>
        <div class="flex gap-3 w-full">
          <button
            @click="isConfirmDeleteOpen = false"
            class="flex-1 py-2.5 border rounded-lg hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="executeDelete"
            class="flex-1 py-2.5 bg-red-600 rounded-lg text-white hover:bg-red-700"
          >
            确定删除
          </button>
        </div>
      </div>
    </NexusModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue'
  import { Icon } from '/@/components/Icon'
  import NexusModal from '../components/NexusModal.vue'
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
  const isConfirmDeleteOpen = ref(false)
  const deleteTarget = ref<{ id: string; name: string } | null>(null)

  const isNew = ref(false)
  const formCategory = ref<Partial<Category>>({})
  const formAttributes = ref<CategoryAttribute[]>([])

  // 自动补全状态
  const historyParamNames = ref<string[]>([...mockHistoryParamNames])
  const activeParamDropdownIndex = ref<number | null>(null)

  // 提示框状态
  const toast = reactive({
    show: false,
    msg: '',
    type: 'info' as 'success' | 'error' | 'info',
  })

  // 筛选逻辑
  const filteredCategories = computed(() =>
    categories.value.filter((c) => c.name.toLowerCase().includes(searchTerm.value.toLowerCase())),
  )

  const filteredParamNames = (input: string) => {
    return historyParamNames.value.filter((n) =>
      n.toLowerCase().includes((input || '').toLowerCase()),
    )
  }

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.show = true
    toast.msg = msg
    toast.type = type
    setTimeout(() => {
      toast.show = false
    }, 3000)
  }

  const refreshData = () => {
    // Mock refresh - 实际项目中会从API重新加载数据
    showToast('数据已刷新', 'info')
  }

  // 事件处理函数
  const requestDelete = (id: string, name: string) => {
    deleteTarget.value = { id, name }
    isConfirmDeleteOpen.value = true
  }

  const executeDelete = () => {
    if (deleteTarget.value) {
      categories.value = categories.value.filter((c) => c.id !== deleteTarget.value!.id)
      mockCategoryAttributes.delete(deleteTarget.value.id)
      deleteTarget.value = null
      isConfirmDeleteOpen.value = false
      showToast('删除成功', 'success')
    }
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
    showToast('取消成功', 'info')
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
      showToast('请填写分类名称 (必填)', 'error')
      return
    }
    const names = formAttributes.value.map((a) => a.name.trim()).filter((n) => n !== '')
    const uniqueNames = new Set(names)
    if (names.length !== uniqueNames.size) {
      showToast('参数名称不能重复，请检查', 'error')
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
    showToast('保存成功', 'success')
  }
</script>

<style scoped>
  .animate-in {
    animation: slideIn 0.3s ease-out;
  }

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

  .slide-in-from-top-4 {
    animation: slideInFromTop 0.3s ease-out;
  }

  @keyframes slideInFromTop {
    from {
      transform: translateX(-50%) translateY(-16px);
    }

    to {
      transform: translateX(-50%) translateY(0);
    }
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
