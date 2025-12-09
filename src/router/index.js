import { createRouter, createWebHistory } from 'vue-router'
import WorkFlowList from '../views/WorkFlowList.vue'

const routes = [
  {
    path: '/',
    name: 'WorkFlowList',
    component: WorkFlowList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
