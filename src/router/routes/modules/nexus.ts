import type { AppRouteModule } from '/@/router/types'

import { LAYOUT } from '/@/router/constant'

const nexus: AppRouteModule = {
  path: '/nexus',
  name: 'Nexus',
  component: LAYOUT,
  redirect: '/nexus/dashboard',
  meta: {
    orderNo: 5,
    icon: 'ion:cube-outline',
    title: 'Nexus DMS',
  },
  children: [
    {
      path: 'dashboard',
      name: 'NexusDashboard',
      component: () => import('/@/views/nexus/dashboard/index.vue'),
      meta: {
        title: '首页',
        icon: 'ion:home-outline',
      },
    },
    {
      path: 'device-category',
      name: 'DeviceCategory',
      component: () => import('/@/views/nexus/device-category/index.vue'),
      meta: {
        title: '设备分类管理',
        icon: 'ion:layers-outline',
      },
    },
    {
      path: 'device-manager',
      name: 'DeviceManager',
      component: () => import('/@/views/nexus/device-manager/index.vue'),
      meta: {
        title: '设备管理',
        icon: 'ion:hardware-chip-outline',
      },
    },
    {
      path: 'file-manager',
      name: 'FileManager',
      component: () => import('/@/views/nexus/file-manager/index.vue'),
      meta: {
        title: '文件管理',
        icon: 'ion:document-text-outline',
      },
    },
    {
      path: 'dictionary',
      name: 'Dictionary',
      component: () => import('/@/views/nexus/dictionary/index.vue'),
      meta: {
        title: '字典管理',
        icon: 'ion:book-outline',
      },
    },
    {
      path: 'user-manager',
      name: 'UserManager',
      component: () => import('/@/views/nexus/user-manager/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'ion:people-outline',
      },
    },
    {
      path: 'role-manager',
      name: 'RoleManager',
      component: () => import('/@/views/nexus/role-manager/index.vue'),
      meta: {
        title: '角色管理',
        icon: 'ion:shield-checkmark-outline',
      },
    },
    {
      path: 'permission-manager',
      name: 'PermissionManager',
      component: () => import('/@/views/nexus/permission-manager/index.vue'),
      meta: {
        title: '权限管理',
        icon: 'ion:key-outline',
      },
    },
  ],
}

export default nexus
