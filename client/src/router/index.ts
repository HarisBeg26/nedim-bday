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

router.beforeEach((to, from, next) => {
  console.log('[diag][router] navigating', { from: from.fullPath, to: to.fullPath, name: to.name });
  next();
});

router.afterEach((to, from) => {
  console.log('[diag][router] navigated', { from: from.fullPath, to: to.fullPath, name: to.name });
});

export default router
