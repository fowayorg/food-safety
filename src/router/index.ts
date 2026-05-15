import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'entities', name: 'Entities', component: () => import('../views/Entities.vue') },
      { path: 'inspections', name: 'Inspections', component: () => import('../views/Inspections.vue') },
      { path: 'inspection-plans', name: 'InspectionPlans', component: () => import('../views/InspectionPlans.vue') },
      { path: 'inspection-templates', name: 'InspectionTemplates', component: () => import('../views/InspectionTemplates.vue') },
      { path: 'screenings', name: 'Screenings', component: () => import('../views/Screenings.vue') },
      { path: 'complaints', name: 'Complaints', component: () => import('../views/Complaints.vue') },
      { path: 'rectifications', name: 'Rectifications', component: () => import('../views/Rectifications.vue') },
      { path: 'activities', name: 'Activities', component: () => import('../views/Activities.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('../views/Notifications.vue') },
      { path: 'self-inspections', name: 'SelfInspections', component: () => import('../views/SelfInspections.vue') },
      { path: 'info-corrections', name: 'InfoCorrections', component: () => import('../views/InfoCorrections.vue') },
      { path: 'feedback', name: 'Feedback', component: () => import('../views/Feedback.vue') },
      { path: 'reports', name: 'Reports', component: () => import('../views/Reports.vue') },
      { path: 'users', name: 'Users', component: () => import('../views/Users.vue') },
      { path: 'streets', name: 'Streets', component: () => import('../views/Streets.vue') },
      { path: 'qrcodes', name: 'QRCodes', component: () => import('../views/QRCodes.vue') },
      { path: 'qr-scans', name: 'QrScans', component: () => import('../views/QrScans.vue') },
      { path: 'audit-logs', name: 'AuditLogs', component: () => import('../views/AuditLogs.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/Settings.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router