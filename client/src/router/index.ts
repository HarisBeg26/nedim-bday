import { createRouter, createWebHistory } from 'vue-router'
import Level2Adventure from '@/components/Level2Adventure.vue'

const Congrats = () => import('@/pages/Congrats.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'adventure',
      component: Level2Adventure,
    },
    {
      path: '/congrats',
      name: 'congrats',
      component: Congrats,
    }
  ],
})

export default router
