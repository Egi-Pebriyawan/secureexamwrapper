import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GuideView from '@/views/GuideView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ExamCreateView from '@/views/ExamCreateView.vue'
import ExamDetailView from '@/views/ExamDetailView.vue'
import ExamReportView from '@/views/ExamReportView.vue'
import ParticipantJoinView from '@/views/ParticipantJoinView.vue'
import ExamRunView from '@/views/ExamRunView.vue'
import { useAuthStore } from '@/stores/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/guide',
      name: 'guide',
      component: GuideView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/exams/new',
      name: 'exam-create',
      component: ExamCreateView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/exams/:id',
      name: 'exam-detail',
      component: ExamDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/exams/:id/report',
      name: 'exam-report',
      component: ExamReportView,
      meta: { requiresAuth: true },
    },
    {
      path: '/exam/:code',
      name: 'participant-join',
      component: ParticipantJoinView,
    },
    {
      path: '/exam/:code/run',
      name: 'exam-run',
      component: ExamRunView,
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  if (authStore.loading) {
    await authStore.initAuth()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: 'login' })
  } else {
    next()
  }
})
