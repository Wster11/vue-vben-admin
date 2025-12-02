<template>
  <div class="p-4 h-full flex flex-col space-y-4 relative">
    <!-- Toast -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-xl font-medium animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2',
        toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white',
      ]"
    >
      <Icon
        :icon="
          toast.type === 'success'
            ? 'ant-design:check-circle-filled'
            : 'ant-design:close-circle-filled'
        "
        class="w-5 h-5"
      />
      {{ toast.msg }}
    </div>

    <!-- PDF Viewer -->
    <div
      v-if="isPdfViewerOpen && selectedFileForDetail"
      class="fixed inset-0 z-[110] bg-slate-900 flex flex-col animate-in fade-in duration-200"
    >
      <div
        class="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0"
      >
        <div class="flex items-center gap-4 text-slate-200">
          <button
            @click="isPdfViewerOpen = false"
            class="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <Icon icon="ant-design:arrow-left-outlined" class="w-5 h-5" />
          </button>
          <span class="font-medium truncate max-w-md">{{ selectedFileForDetail.name }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Icon icon="ant-design:zoom-out-outlined" class="w-5 h-5" />
          </button>
          <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Icon icon="ant-design:zoom-in-outlined" class="w-5 h-5" />
          </button>
          <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Icon icon="ant-design:fullscreen-outlined" class="w-5 h-5" />
          </button>
          <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Icon icon="ant-design:download-outlined" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div class="flex-1 bg-slate-500 overflow-y-auto p-8 flex justify-center">
        <div
          class="bg-white shadow-2xl w-full max-w-4xl min-h-[1000px] p-12 flex flex-col items-center"
        >
          <h1 class="text-3xl font-bold text-slate-900 mb-8 border-b pb-4 w-full text-center">
            {{ selectedFileForDetail.name }}
          </h1>
          <p class="text-slate-600">这里是文件预览区域 (模拟 PDF 内容)</p>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <template v-if="viewMode === 'LIST'">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">文件管理</h1>
          <p class="text-slate-500 text-sm">集中管理所有技术文档与资料</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="openUploadModal"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Icon icon="ant-design:upload-outlined" class="w-4 h-4" />
            上传文件
          </button>
        </div>
      </div>

      <!-- 高级查询 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div class="col-span-1 md:col-span-1 lg:col-span-2">
            <label class="block text-xs font-medium text-slate-500 mb-1">文件名称</label>
            <div class="relative">
              <Icon
                icon="ant-design:search-outlined"
                class="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
              />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="搜索文件名称..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">设备分类</label>
            <select
              v-model="filterCategory"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部分类</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">文档语言</label>
            <select
              v-model="filterLanguage"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部语言</option>
              <option v-for="l in LANGUAGE_OPTIONS" :key="l.code" :value="l.code">
                {{ l.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">是否关联</label>
            <select
              v-model="filterLinked"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>

          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
              <input
                v-model="filterStartDate"
                type="date"
                class="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div
        class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 font-semibold text-slate-700">文件名称</th>
                <th class="px-4 py-4 font-semibold text-slate-700">语言</th>
                <th class="px-4 py-4 font-semibold text-slate-700">简码</th>
                <th class="px-4 py-4 font-semibold text-slate-700">关联</th>
                <th class="px-6 py-4 font-semibold text-slate-700">绑定设备分类</th>
                <th class="px-6 py-4 font-semibold text-slate-700">绑定设备型号</th>
                <th class="px-6 py-4 font-semibold text-slate-700">上传日期</th>
                <th class="px-4 py-4 font-semibold text-slate-700">上传人</th>
                <th class="px-6 py-4 font-semibold text-slate-700 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="file in filteredFiles"
                :key="file.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium">
                  <button
                    @click="goToFileDetail(file)"
                    class="text-blue-600 hover:underline flex items-center gap-2 group"
                  >
                    <Icon
                      icon="ant-design:file-text-outlined"
                      class="w-4 h-4 text-slate-400 group-hover:text-blue-500"
                    />
                    {{ file.name }}
                  </button>
                </td>
                <td class="px-4 py-4 text-slate-600">{{ getLanguageLabel(file.language) }}</td>
                <td class="px-4 py-4 text-slate-500 font-mono text-xs">
                  {{ getShortLangCode(file.language || '') }}
                </td>
                <td class="px-4 py-4">
                  <span
                    v-if="isFileLinked(file.id)"
                    class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"
                  >
                    <Icon icon="ant-design:link-outlined" class="w-3 h-3" /> 是
                  </span>
                  <span v-else class="text-xs text-slate-400">否</span>
                </td>
                <td class="px-6 py-4 text-slate-500 text-xs" :title="getFileCatNames(file.id)">
                  {{ getFileCatNames(file.id) || '-' }}
                </td>
                <td class="px-6 py-4 text-slate-500 text-xs" :title="getFileDevModels(file.id)">
                  {{ getFileDevModels(file.id) || '-' }}
                </td>
                <td class="px-6 py-4 text-slate-500">{{ file.uploadDate }}</td>
                <td class="px-4 py-4 text-slate-500">{{ file.creator }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      @click="handlePreview(file)"
                      class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="在线预览"
                    >
                      <Icon icon="ant-design:book-outlined" class="w-4 h-4" />
                    </button>
                    <button
                      @click="goToBindDevices(file)"
                      class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="关联设备"
                    >
                      <Icon icon="ant-design:link-outlined" class="w-4 h-4" />
                    </button>
                    <button
                      @click="handleDelete(file.id)"
                      class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Icon icon="ant-design:delete-outlined" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredFiles.length === 0">
                <td colspan="9" class="text-center py-12 text-slate-400">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 文件详情视图 -->
    <div
      v-else-if="viewMode === 'DETAIL' && selectedFileForDetail"
      class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div class="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <button
          @click="backToList"
          class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Icon icon="ant-design:arrow-left-outlined" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {{ selectedFileForDetail.name }}
            <span class="text-sm font-normal px-2 py-0.5 bg-slate-100 rounded text-slate-500">{{
              selectedFileForDetail.version
            }}</span>
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
            <button
              @click="goToBindDevices(selectedFileForDetail)"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
            >
              <Icon icon="ant-design:link-outlined" class="w-4 h-4" />
              关联更多设备
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-3 font-semibold text-slate-700">设备名称</th>
                <th class="px-6 py-3 font-semibold text-slate-700">设备分类</th>
                <th class="px-6 py-3 font-semibold text-slate-700">设备型号</th>
                <th class="px-6 py-3 font-semibold text-slate-700">创建时间</th>
                <th class="px-6 py-3 font-semibold text-slate-700">创建人</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="device in fileLinkedDevices"
                :key="device.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-slate-800">{{ device.name }}</td>
                <td class="px-6 py-4 text-slate-500">
                  <span class="bg-slate-100 px-2 py-0.5 rounded text-xs">{{
                    getCategoryDisplay(device.categoryId)
                  }}</span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ device.model }}</td>
                <td class="px-6 py-4 text-slate-500">{{ device.createdAt }}</td>
                <td class="px-6 py-4 text-slate-500">{{ device.creator }}</td>
              </tr>
              <tr v-if="fileLinkedDevices.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400">暂未关联任何设备</td>
              </tr>
            </tbody>
          </table>
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
          <button
            @click="backToDetail"
            class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Icon icon="ant-design:arrow-left-outlined" class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-xl font-bold text-slate-800">关联更多设备</h1>
            <p class="text-sm text-slate-500">
              当前文件:
              <span class="font-medium text-indigo-600">{{ selectedFileForDetail.name }}</span>
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="backToDetail"
            class="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
          >
            取消
          </button>
          <button
            @click="saveDeviceBindings"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium flex items-center gap-2"
          >
            <Icon icon="ant-design:save-outlined" class="w-4 h-4" /> 保存关联 ({{
              selectedDevicesForBind.size
            }})
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div
        class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end"
      >
        <div class="w-48">
          <label class="block text-xs font-medium text-slate-500 mb-1">设备名称</label>
          <input
            v-model="bindDevName"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="搜索设备名..."
          />
        </div>
        <div class="w-40">
          <label class="block text-xs font-medium text-slate-500 mb-1">设备分类</label>
          <select
            v-model="bindDevCategory"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">全部</option>
            <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>
        <div class="w-40">
          <label class="block text-xs font-medium text-slate-500 mb-1">设备型号</label>
          <input
            v-model="bindDevModel"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="搜索型号..."
          />
        </div>
      </div>

      <!-- Device Table -->
      <div
        class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 font-semibold text-slate-700 w-16 text-center">选择</th>
                <th class="px-6 py-4 font-semibold text-slate-700">设备名称</th>
                <th class="px-6 py-4 font-semibold text-slate-700">分类</th>
                <th class="px-6 py-4 font-semibold text-slate-700">型号</th>
                <th class="px-6 py-4 font-semibold text-slate-700">序列号</th>
                <th class="px-6 py-4 font-semibold text-slate-700">创建时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="device in filteredDevicesForBind"
                :key="device.id"
                :class="[
                  'hover:bg-slate-50 transition-colors cursor-pointer',
                  selectedDevicesForBind.has(device.id) ? 'bg-indigo-50/30' : '',
                ]"
                @click="toggleDeviceSelection(device.id)"
              >
                <td class="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    :checked="selectedDevicesForBind.has(device.id)"
                    @change="toggleDeviceSelection(device.id)"
                    class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </td>
                <td class="px-6 py-4 font-medium text-slate-900">{{ device.name }}</td>
                <td class="px-6 py-4 text-slate-500">
                  <span class="bg-slate-100 px-2 py-0.5 rounded text-xs">{{
                    getCategoryDisplay(device.categoryId)
                  }}</span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ device.model }}</td>
                <td class="px-6 py-4 text-slate-500 font-mono text-xs">{{ device.sn }}</td>
                <td class="px-6 py-4 text-slate-500">{{ device.createdAt }}</td>
              </tr>
              <tr v-if="filteredDevicesForBind.length === 0">
                <td colspan="6" class="text-center py-12 text-slate-400">暂无匹配设备</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 上传模态框 -->
    <NexusModal
      v-model:visible="isEditModalOpen"
      title="上传文件"
      width="1000px"
      @close="isEditModalOpen = false"
    >
      <div class="flex flex-col gap-6 p-2">
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <div class="p-2 bg-blue-100 rounded-full text-blue-600">
            <Icon icon="ant-design:file-text-outlined" class="w-5 h-5" />
          </div>
          <div class="text-sm text-blue-800">
            <p class="font-bold mb-1">文件命名规范</p>
            <p>
              格式:
              <span class="font-mono bg-blue-100 px-1 rounded">TD-RND-{Category}-{Seq}-{Lang}</span>
              (例如: TD-RND-CF-001-cn)
            </p>
            <p class="mt-1 opacity-80">系统将自动校验分类简码与语言后缀的一致性。</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >文件名称 <span class="text-red-500">*</span></label
              >
              <input
                v-model="uploadForm.name"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="输入文件名..."
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">文件语言</label>
                <select
                  v-model="uploadForm.language"
                  @change="handleLanguageChange"
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- 选择语言 --</option>
                  <option v-for="l in LANGUAGE_OPTIONS" :key="l.code" :value="l.code">
                    {{ l.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">语言简码</label>
                <input
                  :value="uploadForm.langCode"
                  disabled
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono"
                  placeholder="自动生成"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">文件类型</label>
                <select
                  v-model="uploadForm.manualType"
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option v-for="(v, k) in MANUAL_TYPE_MAP" :key="k" :value="k">{{ v }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">版本号</label>
                <input
                  v-model="uploadForm.version"
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Binding Logic -->
          <div class="space-y-5">
            <!-- Step 1: Category -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">设备分类 (筛选)</label>
              <select
                v-model="uploadForm.categoryId"
                @change="handleCategoryChange"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- 请先选择分类 --</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">
                  {{ c.name }} ({{ c.description }})
                </option>
              </select>
            </div>

            <!-- Step 2: Model (Filtered by Category) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">设备型号 (筛选)</label>
              <select
                v-model="uploadForm.deviceModel"
                :disabled="!uploadForm.categoryId"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">-- 请选择型号 --</option>
                <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <!-- Step 3: Device (Filtered by Category & Model) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">关联设备名称</label>
              <select
                v-model="uploadForm.deviceId"
                :disabled="!uploadForm.deviceModel"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">-- 选择具体设备 --</option>
                <option v-for="d in availableDevices" :key="d.id" :value="d.id">
                  {{ d.name }} ({{ d.sn }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">上传人</label>
                <input
                  :value="uploadForm.uploader"
                  disabled
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">上传时间</label>
                <input
                  :value="uploadForm.uploadTime"
                  disabled
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-slate-100">
          <div class="flex items-center gap-3">
            <input ref="fileInputRef" type="file" class="hidden" @change="handleFileSelect" />
            <button
              @click="$refs.fileInputRef?.click()"
              class="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2"
            >
              <Icon icon="ant-design:file-outlined" class="w-4 h-4" />
              {{ rawFile ? '更换文件' : '选择文件' }}
            </button>
            <span v-if="rawFile" class="text-sm text-slate-600"
              >{{ rawFile.name }} ({{ (rawFile.size / 1024).toFixed(1) }} KB)</span
            >
          </div>

          <div class="flex gap-3">
            <button
              @click="isEditModalOpen = false"
              class="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSaveUpload"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-all flex items-center gap-2"
            >
              <Icon icon="ant-design:cloud-upload-outlined" class="w-4 h-4" />
              确认上传
            </button>
          </div>
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

  // Toast 状态
  const toast = reactive({
    show: false,
    msg: '',
    type: 'success' as 'success' | 'error',
  })

  const showToast = (msg: string, type: 'success' | 'error') => {
    toast.show = true
    toast.msg = msg
    toast.type = type
    setTimeout(() => {
      toast.show = false
    }, 3000)
  }

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
