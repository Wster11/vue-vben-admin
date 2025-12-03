import type { AppRouteModule } from '/@/router/types'

import { LAYOUT } from '/@/router/constant'

const nexus: AppRouteModule[] = [
  {
    path: '/nexus/dashboard',
    name: 'NexusDashboardRoute',
    component: LAYOUT,
    redirect: '/nexus/dashboard/index',
    meta: {
      orderNo: 5,
      icon: 'ion:home-outline',
      title: '首页',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'NexusDashboard',
        component: () => import('/@/views/nexus/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'ion:home-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/device-category',
    name: 'DeviceCategoryRoute',
    component: LAYOUT,
    redirect: '/nexus/device-category/index',
    meta: {
      orderNo: 5,
      title: '设备分类管理',
      icon: 'ion:layers-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'DeviceCategory',
        component: () => import('/@/views/nexus/device-category/index.vue'),
        meta: {
          title: '设备分类管理',
          icon: 'ion:layers-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/device-manager',
    name: 'DeviceManagerRoute',
    component: LAYOUT,
    redirect: '/nexus/device-manager/index',
    meta: {
      orderNo: 5,
      title: '设备管理',
      icon: 'ion:hardware-chip-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'DeviceManager',
        component: () => import('/@/views/nexus/device-manager/index.vue'),
        meta: {
          title: '设备管理',
          icon: 'ion:hardware-chip-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/file-manager',
    name: 'FileManagerRoute',
    component: LAYOUT,
    redirect: '/nexus/file-manager/index',
    meta: {
      orderNo: 5,
      title: '文件管理',
      icon: 'ion:document-text-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'FileManager',
        component: () => import('/@/views/nexus/file-manager/index.vue'),
        meta: {
          title: '文件管理',
          icon: 'ion:document-text-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/dictionary',
    name: 'DictionaryRoute',
    component: LAYOUT,
    redirect: '/nexus/dictionary/index',
    meta: {
      orderNo: 5,
      title: '字典管理',
      icon: 'ion:book-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'Dictionary',
        component: () => import('/@/views/nexus/dictionary/index.vue'),
        meta: {
          title: '字典管理',
          icon: 'ion:book-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/user-manager',
    name: 'UserManagerRoute',
    component: LAYOUT,
    redirect: '/nexus/user-manager/index',
    meta: {
      orderNo: 5,
      title: '用户管理',
      icon: 'ion:people-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'UserManager',
        component: () => import('/@/views/nexus/user-manager/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'ion:people-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/role-manager',
    name: 'RoleManagerRoute',
    component: LAYOUT,
    redirect: '/nexus/role-manager/index',
    meta: {
      orderNo: 5,
      title: '角色管理',
      icon: 'ion:shield-checkmark-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'RoleManager',
        component: () => import('/@/views/nexus/role-manager/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'ion:shield-checkmark-outline',
          hideMenu: true,
        },
      },
    ],
  },
  {
    path: '/nexus/permission-manager',
    name: 'PermissionManagerRoute',
    component: LAYOUT,
    redirect: '/nexus/permission-manager/index',
    meta: {
      orderNo: 5,
      title: '权限管理',
      icon: 'ion:key-outline',
      hideChildrenInMenu: true,
    },
    children: [
      {
        path: 'index',
        name: 'PermissionManager',
        component: () => import('/@/views/nexus/permission-manager/index.vue'),
        meta: {
          title: '权限管理',
          icon: 'ion:key-outline',
          hideMenu: true,
        },
      },
    ],
  },
]

export default nexus
