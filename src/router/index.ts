import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import StyleguideView from '@/views/StyleguideView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/styleguide',
      name: 'styleguide',
      component: StyleguideView,
    },
  ],
})
