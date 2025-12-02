<template>
  <div class="p-4 h-full flex flex-col space-y-4 relative">
    <!-- Toast 提示 -->
    <Transition name="fade">
      <div v-if="toast.show" :class="toastClass">
        <Icon :icon="toastIconName" class="w-5 h-5" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- 列表视图 -->
    <template v-if="viewMode === 'LIST'">
      <!-- 页面顶部 -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">设备管理</h1>
          <p class="text-slate-500 text-sm">监控设备状态并管理文档关联</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="openCreateModal"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Icon icon="ant-design:plus-outlined" class="w-4 h-4" />
            新建设备
          </button>
        </div>
      </div>

      <!-- 高级查询区域 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <div class="w-32 xl:w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">设备分类</label>
            <input
              v-model="filterCategory"
              type="text"
              placeholder="分类名称"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="w-32 xl:w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">设备名称</label>
            <input
              v-model="filterName"
              type="text"
              placeholder="设备名称"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="w-32 xl:w-40">
            <label class="block text-xs font-medium text-slate-500 mb-1">设备型号</label>
            <input
              v-model="filterModel"
              type="text"
              placeholder="型号"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="w-24">
            <label class="block text-xs font-medium text-slate-500 mb-1">关联文档</label>
            <select
              v-model="filterLinked"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
          <div class="w-36">
            <label class="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
            <div class="relative">
              <input
                v-model="filterDateStart"
                type="date"
                class="w-full pl-2 pr-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div class="w-36">
            <label class="block text-xs font-medium text-slate-500 mb-1">结束日期</label>
            <div class="relative">
              <input
                v-model="filterDateEnd"
                type="date"
                class="w-full pl-2 pr-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div class="flex gap-2 ml-auto lg:ml-0">
            <button
              @click="resetFilters"
              class="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors h-[38px]"
            >
              重置
            </button>
            <button
              class="px-4 py-2 text-sm bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 h-[38px]"
            >
              <Icon icon="ant-design:search-outlined" class="w-4 h-4" />
              查询
            </button>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div
        class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 font-semibold text-slate-700">设备名称</th>
                <th class="px-6 py-4 font-semibold text-slate-700">设备分类</th>
                <th class="px-6 py-4 font-semibold text-slate-700">设备型号</th>
                <th class="px-6 py-4 font-semibold text-slate-700">序列号</th>
                <th class="px-6 py-4 font-semibold text-slate-700">关联文档</th>
                <th class="px-6 py-4 font-semibold text-slate-700">创建时间</th>
                <th class="px-6 py-4 font-semibold text-slate-700">创建人</th>
                <th class="px-6 py-4 font-semibold text-slate-700 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="device in filteredDevices"
                :key="device.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium">
                  <button
                    @click="goToDeviceDetail(device)"
                    class="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 group"
                    title="查看详情"
                  >
                    {{ device.name }}
                    <Icon
                      icon="ant-design:arrow-left-outlined"
                      class="w-3 h-3 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                </td>
                <td class="px-6 py-4 text-slate-500">
                  <span class="bg-slate-100 px-2 py-1 rounded text-xs">{{
                    getCategoryDisplay(device.categoryId)
                  }}</span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ device.model }}</td>
                <td class="px-6 py-4 text-slate-500 font-mono text-xs">{{ device.sn }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      isDeviceLinked(device.id)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700',
                    ]"
                  >
                    <div
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        isDeviceLinked(device.id) ? 'bg-emerald-500' : 'bg-red-500',
                      ]"
                    ></div>
                    {{ isDeviceLinked(device.id) ? '是' : '否' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ device.createdAt }}</td>
                <td class="px-6 py-4 text-slate-500">{{ device.creator }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleDownloadQr(device)"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md hover:bg-emerald-100 transition-colors"
                      title="下载二维码"
                    >
                      <Icon icon="ant-design:qrcode-outlined" class="w-3.5 h-3.5" />
                      二维码
                    </button>
                    <button
                      @click="openEditModal(device)"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Icon icon="ant-design:edit-outlined" class="w-3.5 h-3.5" />
                      修改
                    </button>
                    <button
                      @click="openBindModal(device)"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      <Icon icon="ant-design:link-outlined" class="w-3.5 h-3.5" />
                      关联
                    </button>
                    <button
                      @click="handleDelete(device.id)"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Icon icon="ant-design:delete-outlined" class="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredDevices.length === 0">
                <td colspan="8" class="text-center py-12 text-slate-400">未找到相关设备</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 设备详情视图 -->
    <div
      v-else-if="viewMode === 'DEVICE_DETAIL' && selectedDeviceForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <!-- 头部 -->
      <div class="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <button
          @click="backToDeviceList"
          class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Icon icon="ant-design:arrow-left-outlined" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {{ selectedDeviceForDetail.name }}
            <span
              class="px-2 py-0.5 rounded text-xs font-normal bg-indigo-50 text-indigo-600 border border-indigo-100"
            >
              {{ selectedDeviceForDetail.status }}
            </span>
          </h1>
          <p class="text-slate-500 text-sm">设备详细信息与文档库</p>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
          设备基本信息
        </h3>
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- 左侧信息 -->
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
            <div>
              <label class="text-xs font-medium text-slate-400 block mb-1">设备分类</label>
              <div class="text-sm font-medium text-slate-700">
                {{ getCategoryDisplay(selectedDeviceForDetail.categoryId) }}
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-400 block mb-1">设备型号</label>
              <div class="text-sm font-medium text-slate-700">{{
                selectedDeviceForDetail.model
              }}</div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-400 block mb-1">序列号 (SN)</label>
              <div class="text-sm font-medium text-slate-700 font-mono">
                {{ selectedDeviceForDetail.sn }}
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-400 block mb-1">版本号</label>
              <div class="text-sm font-medium text-slate-700">
                {{ selectedDeviceForDetail.version || '-' }}
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-400 block mb-1">创建人</label>
              <div class="text-sm font-medium text-slate-700">
                {{ selectedDeviceForDetail.creator }}
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-400 block mb-1">创建时间</label>
              <div class="text-sm font-medium text-slate-700">
                {{ selectedDeviceForDetail.createdAt }}
              </div>
            </div>
            <div class="md:col-span-2 lg:col-span-3">
              <label class="text-xs font-medium text-slate-400 block mb-1">二维码描述</label>
              <div class="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                {{ selectedDeviceForDetail.qrDesc || '无描述' }}
              </div>
            </div>
          </div>

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
      </div>

      <!-- 关联文档列表 -->
      <div
        class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]"
      >
        <div
          class="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
            关联文档列表 ({{ deviceLinkedFiles.length }})
          </h3>

          <!-- 语言筛选 -->
          <div class="flex items-center gap-2">
            <Icon icon="ant-design:global-outlined" class="w-4 h-4 text-slate-400" />
            <select
              v-model="detailLanguageFilter"
              class="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">所有语言</option>
              <option v-for="opt in LANGUAGE_OPTIONS" :key="opt.code" :value="opt.code">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex-1 overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-6 py-3 font-semibold">文件名称</th>
                <th class="px-6 py-3 font-semibold">文件类型</th>
                <th class="px-6 py-3 font-semibold">语言</th>
                <th class="px-6 py-3 font-semibold">大小</th>
                <th class="px-6 py-3 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="file in filteredLinkedFiles"
                :key="file.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                  <Icon icon="ant-design:file-text-outlined" class="w-4 h-4 text-slate-400" />
                  {{ file.name }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                  >
                    {{ getManualTypeLabel(file.manualType || '') }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600">{{
                  getLanguageLabel(file.language || '')
                }}</td>
                <td class="px-6 py-4 text-slate-500 font-mono text-xs">{{ file.size }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-white border border-slate-200 rounded-md hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                    >
                      <Icon icon="ant-design:book-outlined" class="w-3.5 h-3.5" />
                      阅读
                    </button>
                    <button
                      @click="goToFileDetail(file)"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-slate-200 rounded-md hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      <Icon icon="ant-design:export-outlined" class="w-3.5 h-3.5" />
                      详情
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredLinkedFiles.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400">暂无相关文档</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 文件详情视图 -->
    <div
      v-else-if="viewMode === 'FILE_DETAIL' && selectedFileForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <!-- 头部 -->
      <div class="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <button
          @click="backToDeviceDetail"
          class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Icon icon="ant-design:arrow-left-outlined" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {{ selectedFileForDetail.name }}
            <span class="text-sm font-normal px-2 py-0.5 bg-slate-100 rounded text-slate-500">{{
              selectedFileForDetail.version || 'v1.0'
            }}</span>
          </h1>
          <p class="text-slate-500 text-sm">文档详细信息与设备关联管理</p>
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
              {{ getLanguageLabel(selectedFileForDetail.language || '') }}
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
            <div class="text-sm text-slate-700 font-medium">
              {{ selectedFileForDetail.version || 'v1.0' }}
            </div>
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
            关联设备概览 ({{ fileBoundDevices.length }})
          </h3>
        </div>

        <div class="flex-1 overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-6 py-3 font-semibold">设备名称</th>
                <th class="px-6 py-3 font-semibold">型号</th>
                <th class="px-6 py-3 font-semibold">序列号</th>
                <th class="px-6 py-3 font-semibold">分类</th>
                <th class="px-6 py-3 font-semibold">创建时间</th>
                <th class="px-6 py-3 font-semibold">创建人</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="dev in fileBoundDevices"
                :key="dev.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-slate-800">{{ dev.name }}</td>
                <td class="px-6 py-4 text-slate-600">{{ dev.model }}</td>
                <td class="px-6 py-4 text-slate-500 font-mono text-xs">{{ dev.sn }}</td>
                <td class="px-6 py-4 text-slate-500 text-xs">
                  <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{{
                    getCategoryDisplay(dev.categoryId)
                  }}</span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ dev.createdAt }}</td>
                <td class="px-6 py-4 text-slate-500">{{ dev.creator }}</td>
              </tr>
              <tr v-if="fileBoundDevices.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400">暂未关联任何设备</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 关联文档模态框 -->
    <NexusModal v-model:visible="isBindModalOpen" title="关联技术文档" width="1200px">
      <div class="flex flex-col h-[70vh]">
        <div class="mb-4 space-y-3">
          <div class="flex justify-between items-center">
            <p class="text-sm text-slate-500">
              正在为
              <span class="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{{
                selectedDeviceForBind?.name
              }}</span>
              管理关联文档。
            </p>
            <div class="flex items-center gap-3">
              <span class="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                已选: {{ selectedForBinding.size }} 个文件
              </span>
            </div>
          </div>

          <!-- 筛选区域 -->
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-12 gap-3">
            <div class="col-span-4 relative">
              <Icon
                icon="ant-design:search-outlined"
                class="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
              />
              <input
                v-model="bindSearchTerm"
                type="text"
                placeholder="搜索文件名称..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-3">
              <select
                v-model="bindFilterCategory"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">全部分类</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="col-span-3">
              <select
                v-model="bindFilterLang"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">全部语言</option>
                <option v-for="l in LANGUAGE_OPTIONS" :key="l.code" :value="l.code">
                  {{ l.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <div class="flex-1 overflow-hidden border border-slate-200 rounded-lg flex flex-col">
          <div class="overflow-y-auto custom-scrollbar flex-1 bg-white">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th class="px-4 py-3 font-semibold text-slate-700 w-16 text-center">选择</th>
                  <th class="px-4 py-3 font-semibold text-slate-700">文件名称</th>
                  <th class="px-4 py-3 font-semibold text-slate-700">语言</th>
                  <th class="px-4 py-3 font-semibold text-slate-700">类型</th>
                  <th class="px-4 py-3 font-semibold text-slate-700">上传时间</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="filteredBindFiles.length === 0">
                  <td colspan="5" class="py-12 text-center text-slate-400">暂无匹配文件</td>
                </tr>
                <tr
                  v-for="file in filteredBindFiles"
                  v-else
                  :key="file.id"
                  :class="[
                    'hover:bg-indigo-50/50 transition-colors cursor-pointer',
                    selectedForBinding.has(file.id) ? 'bg-indigo-50/30' : '',
                  ]"
                  @click="handleToggleFile(file.id)"
                >
                  <td class="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      :checked="selectedForBinding.has(file.id)"
                      @change="handleToggleFile(file.id)"
                      class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td class="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                    <Icon
                      icon="ant-design:file-text-outlined"
                      :class="[
                        'w-4 h-4',
                        selectedForBinding.has(file.id) ? 'text-indigo-500' : 'text-slate-400',
                      ]"
                    />
                    {{ file.name }}
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{
                    getLanguageLabel(file.language || '')
                  }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] border border-slate-200 uppercase font-medium"
                    >
                      {{ getManualTypeLabel(file.manualType || '') }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ file.uploadDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-auto">
          <button
            @click="isBindModalOpen = false"
            class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
          >
            取消
          </button>
          <button
            @click="saveBindings"
            class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
          >
            确认关联 ({{ selectedForBinding.size }})
          </button>
        </div>
      </div>
    </NexusModal>

    <!-- 新建/编辑设备模态框 -->
    <NexusModal
      v-model:visible="isEditModalOpen"
      :title="isNew ? '新建设备' : '编辑设备'"
      width="1200px"
    >
      <div
        class="flex flex-col space-y-6 bg-slate-50/50 -m-6 p-8"
        style="max-height: 65vh; overflow-y: auto"
      >
        <!-- Group 1: 基础信息 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3
            class="text-sm font-bold text-slate-800 border-l-4 border-indigo-600 pl-3 mb-5 flex items-center gap-2"
          >
            基本信息
            <span class="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full"
              >Group 1</span
            >
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 设备分类 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >设备分类 <span class="text-red-500">*</span></label
              >
              <select
                v-model="editingDevice.categoryId"
                :disabled="!isNew"
                @change="handleCategoryChange(editingDevice.categoryId || '')"
                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all hover:border-indigo-200"
              >
                <option value="">-- 请选择分类 --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }} ({{ cat.description }})
                </option>
              </select>
            </div>

            <!-- 设备型号 -->
            <div class="relative">
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >设备型号 <span class="text-red-500">*</span></label
              >
              <div class="relative">
                <input
                  v-model="editingDevice.model"
                  :disabled="!isNew"
                  @input="handleModelChange(editingDevice.model || '')"
                  placeholder="请输入或选择型号"
                  autocomplete="off"
                  class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-indigo-200"
                />
                <Icon
                  icon="ant-design:down-outlined"
                  class="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <!-- 设备名称 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >设备名称 <span class="text-xs text-slate-400 font-normal">(自动)</span></label
              >
              <input
                v-model="editingDevice.name"
                readonly
                placeholder="自动生成"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <!-- 版本号 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">设备版本号</label>
              <input
                v-model="editingDevice.version"
                placeholder="如 v1.0"
                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-200"
              />
            </div>

            <!-- 序列号 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >序列号 <span class="text-red-500">*</span></label
              >
              <input
                v-model="editingDevice.sn"
                placeholder="请输入设备序列号"
                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-indigo-200"
              />
            </div>
          </div>
        </div>

        <!-- Group 2: 设备参数设置 -->
        <div
          class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0"
        >
          <div class="flex items-center justify-between mb-4">
            <h3
              class="text-sm font-bold text-slate-800 border-l-4 border-emerald-500 pl-3 flex items-center gap-2"
            >
              设备参数设置
              <span class="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full"
                >Group 2</span
              >
            </h3>
            <span
              v-if="!editingDevice.categoryId"
              class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1"
            >
              <Icon icon="ant-design:info-circle-outlined" class="w-3 h-3" />
              请先选择分类以加载参数
            </span>
          </div>

          <div class="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
            <div
              v-if="currentCategoryAttrs.length === 0"
              class="flex flex-col items-center justify-center text-slate-400 py-6"
            >
              <div
                class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2"
              >
                <Icon icon="ant-design:info-circle-outlined" class="w-5 h-5 text-slate-300" />
              </div>
              <p class="text-sm">该分类暂无参数定义</p>
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="attr in currentCategoryAttrs"
                :key="attr.id"
                :class="[
                  'p-3 rounded-lg border shadow-sm flex flex-col gap-2 transition-shadow',
                  !attr.visible
                    ? 'bg-slate-100 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 hover:shadow-md',
                ]"
              >
                <div class="flex justify-between items-start">
                  <label
                    :class="[
                      'text-xs font-semibold truncate',
                      !attr.visible ? 'text-slate-400' : 'text-slate-700',
                    ]"
                    :title="attr.name"
                  >
                    {{ attr.name }}
                  </label>
                  <div
                    :class="[
                      'px-1.5 py-0.5 rounded text-[9px] font-medium border flex items-center gap-0.5 shrink-0',
                      attr.visible
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-200 text-slate-500 border-slate-300',
                    ]"
                  >
                    <Icon
                      :icon="
                        attr.visible
                          ? 'ant-design:eye-outlined'
                          : 'ant-design:eye-invisible-outlined'
                      "
                      class="w-2.5 h-2.5"
                    />
                    {{ attr.visible ? 'Visible' : 'Hidden' }}
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <input
                    v-model="formParams[attr.name]"
                    type="text"
                    :disabled="!attr.visible"
                    :placeholder="!attr.visible ? '无需填写' : '输入参数值'"
                    :title="!attr.visible ? '该参数已被定义为隐藏，无需填写' : ''"
                    :class="[
                      'flex-1 px-2 py-1.5 text-sm border rounded outline-none transition-colors',
                      !attr.visible
                        ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed select-none'
                        : 'focus:ring-1 focus:ring-emerald-500 bg-white border-slate-200',
                    ]"
                  />
                  <span
                    v-if="attr.unit"
                    class="text-xs text-slate-400 shrink-0 bg-slate-100 px-1.5 py-1 rounded"
                    >{{ attr.unit }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group 4: 二维码配置 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3
            class="text-sm font-bold text-slate-800 border-l-4 border-purple-500 pl-3 mb-5 flex items-center gap-2"
          >
            二维码配置
            <span class="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full"
              >Group 4</span
            >
            <span class="text-xs font-normal text-purple-400 italic ml-auto">生成后不可变</span>
          </h3>
          <div class="flex flex-col md:flex-row gap-8 items-start">
            <!-- Left: Logo Area -->
            <div class="flex-shrink-0 flex flex-col items-center gap-3">
              <div
                class="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner group relative"
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
                  class="w-full h-full object-contain p-2"
                />
              </div>
              <button
                :disabled="!isNew"
                class="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 text-slate-600 shadow-sm transition-all"
              >
                <Icon icon="ant-design:upload-outlined" class="w-3 h-3" />
                {{ editingDevice.qrLogo ? '更换Logo' : '上传Logo' }}
              </button>
            </div>

            <!-- Right: Info Inputs -->
            <div class="flex-1 space-y-5 w-full">
              <div>
                <label
                  class="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide"
                  >序列化地址 (自动生成)</label
                >
                <div
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono break-all flex items-center min-h-[46px]"
                >
                  <span v-if="qrSerializedAddress">{{ qrSerializedAddress }}</span>
                  <span v-else class="text-slate-400 italic">待输入设备名称和SN以生成...</span>
                </div>
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide"
                  >二维码描述信息</label
                >
                <input
                  v-model="editingDevice.qrDesc"
                  :disabled="!isNew"
                  placeholder="请输入扫描二维码后显示的描述信息"
                  class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all hover:border-purple-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            @click="isEditModalOpen = false"
            class="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="saveDevice"
            class="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            提交保存
          </button>
        </div>
      </template>
    </NexusModal>

    <!-- 二维码预览模态框 -->
    <NexusModal v-model:visible="isQrPreviewModalOpen" title="下载二维码" width="400px">
      <div v-if="qrPreviewDevice" class="flex flex-col items-center py-4">
        <div class="bg-white p-4 border-2 border-slate-800 rounded-lg mb-4 relative shadow-lg">
          <!-- 模拟二维码视觉 -->
          <div
            class="w-48 h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden"
          >
            <!-- Corner markers -->
            <div class="absolute top-2 left-2 w-8 h-8 border-4 border-black"></div>
            <div class="absolute top-2 right-2 w-8 h-8 border-4 border-black"></div>
            <div class="absolute bottom-2 left-2 w-8 h-8 border-4 border-black"></div>
            <!-- Content -->
            <div class="grid grid-cols-6 grid-rows-6 gap-1 w-32 h-32 opacity-80">
              <div
                v-for="i in 36"
                :key="i"
                :class="['bg-black', Math.random() > 0.5 ? 'opacity-100' : 'opacity-0']"
              ></div>
            </div>
            <!-- Logo overlay if exists -->
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

        <div class="flex gap-3 w-full">
          <button
            @click="isQrPreviewModalOpen = false"
            class="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleQrDownload"
            class="flex-1 py-2.5 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Icon icon="ant-design:download-outlined" class="w-4 h-4" />
            下载
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
  import { MANUAL_TYPE_MAP, LANGUAGE_OPTIONS } from '../constants'
  import type { Device, DocFile, Category, CategoryAttribute } from '../types'

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

  // Toast 状态
  const toast = reactive({
    show: false,
    msg: '',
    type: 'success' as 'success' | 'error' | 'warning',
  })

  // Toast 样式
  const toastClass = computed(() => {
    const baseClass =
      'fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-xl font-medium animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2 text-white'
    const typeClass =
      toast.type === 'success'
        ? 'bg-emerald-600'
        : toast.type === 'error'
        ? 'bg-red-600'
        : 'bg-amber-500'
    return `${baseClass} ${typeClass}`
  })

  // Toast 图标名称
  const toastIconName = computed(() => {
    if (toast.type === 'success') return 'ant-design:check-circle-filled'
    if (toast.type === 'error') return 'ant-design:close-circle-filled'
    return 'ant-design:info-circle-filled'
  })

  // Toast 提示
  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    toast.show = true
    toast.msg = msg
    toast.type = type
    setTimeout(() => {
      toast.show = false
    }, 3000)
  }

  // 筛选逻辑
  const filteredDevices = computed(() => {
    return devices.value.filter((d) => {
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
  })

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
    if (confirm('确定要删除该设备吗?')) {
      devices.value = devices.value.filter((d) => d.id !== id)
      mockDeviceFileBindings.value.delete(id)
      showToast('删除成功', 'success')
    }
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
        categoryId: '',
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
      showToast('请选择设备分类', 'error')
      return
    }
    if (!editingDevice.value.model) {
      showToast('请填写设备型号', 'error')
      return
    }
    if (!editingDevice.value.sn) {
      showToast('请填写序列号', 'error')
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
    showToast('保存成功', 'success')
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

  const handleToggleFile = (fileId: string) => {
    const next = new Set(selectedForBinding.value)
    if (next.has(fileId)) next.delete(fileId)
    else next.add(fileId)
    selectedForBinding.value = next
  }

  const saveBindings = () => {
    if (!selectedDeviceForBind.value) return
    mockDeviceFileBindings.value.set(
      selectedDeviceForBind.value.id,
      Array.from(selectedForBinding.value),
    )
    isBindModalOpen.value = false
    showToast('关联成功', 'success')
    selectedDeviceForBind.value = null
  }

  // 二维码操作
  const handleDownloadQr = (device: Device) => {
    qrPreviewDevice.value = device
    isQrPreviewModalOpen.value = true
  }

  const handleQrDownload = () => {
    showToast('二维码已下载 (模拟)', 'success')
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
