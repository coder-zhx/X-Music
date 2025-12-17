import { createWebHistory, createRouter } from 'vue-router'

import Main from '@renderer/page/main/index.vue'

const routes = [
  {
    path: '/',
    component: Main,
    children: [
      {
        path: '/',
        redirect: '/home',
      },
      {
        path: '/home',
        name: 'home',
        component: () => import('@renderer/page/main/home/index.vue'),
      },
      {
        path: '/playlist',
        name: 'playlist',
        component: () => import('@renderer/page/main/playlist/index.vue'),
      },
      {
        path: '/playlist/:id',
        name: '/playlist-detail',
        component: () => import('@renderer/page/main/playlist-detail/index.vue'),
      },
      {
        path: '/my-love',
        name: 'my-love',
        component: () => import('@renderer/page/main/my-love/index.vue'),
      },
      {
        path: '/setting',
        name: 'setting',
        component: () => import('@renderer/page/main/setting/index.vue'),
      },
      {
        path: '/custom-playlist/:id',
        name: 'custom-playlist-detail',
        component: () => import('@renderer/page/main/custom-playlist-detail/index.vue'),
      },
      {
        path: '/singer-list',
        name: 'singer-list',
        component: () => import('@renderer/page/main/singer-list/index.vue'),
      },
      {
        path: '/singer/:id',
        name: '/singer-detail',
        component: () => import('@renderer/page/main/singer-detail/index.vue'),
      },
      {
        path: '/toplist',
        name: 'toplist',
        component: () => import('@renderer/page/main/toplist/index.vue'),
      },
      {
        path: '/search',
        name: 'search',
        component: () => import('@renderer/page/main/search/index.vue'),
      },
      {
        path: '/mv/:id',
        name: 'mv-detail',
        component: () => import('@renderer/page/main/mv-detail/index.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
