import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/pages/index/index.vue') },
  { path: '/login', component: () => import('@/pages/login/index.vue') },
  { path: '/entity/:id', component: () => import('@/pages/entity/index.vue') },
  { path: '/inspection', component: () => import('@/pages/inspection/index.vue') },
  { path: '/inspection/:id', component: () => import('@/pages/inspection/execute.vue') },
  { path: '/screening', component: () => import('@/pages/screening/index.vue') },
  { path: '/screening/execute', name: 'ScreeningExecute', component: () => import('@/pages/screening/execute.vue') },
  { path: '/screening/:id', name: 'ScreeningDetail', component: () => import('@/pages/screening/detail.vue') },
  { path: '/complaint/submit', component: () => import('@/pages/complaint/submit.vue') },
  { path: '/complaint', component: () => import('@/pages/complaint/index.vue') },
  { path: '/self-inspection', component: () => import('@/pages/self-inspection/index.vue') },
  { path: '/self-inspection/:id', component: () => import('@/pages/self-inspection/execute.vue') },
  { path: '/activity', component: () => import('@/pages/activity/index.vue') },
  { path: '/activity/:id', component: () => import('@/pages/activity/detail.vue') },
  { path: '/activity/participations', name: 'ActivityParticipations', component: () => import('@/pages/activity/participations.vue') },
  { path: '/notification', component: () => import('@/pages/notification/index.vue') },
  { path: '/profile', component: () => import('@/pages/profile/index.vue') },
  { path: '/info-correction', component: () => import('@/pages/info-correction/index.vue') },
  { path: '/info-correction/submit', name: 'InfoCorrectionSubmit', component: () => import('@/pages/info-correction/submit.vue') },
  { path: '/info-correction/:id', name: 'InfoCorrectionDetail', component: () => import('@/pages/info-correction/detail.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
