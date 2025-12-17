import { createRouter, createWebHistory } from 'vue-router'
import WorkFlowList from '../views/WorkFlowList.vue'
import EditWorkFlow from '../views/EditWorkFlow.vue'

const routes = [
  {
    path: '/',
    name: 'WorkFlowList',
    component: WorkFlowList
  },
  {
    path: '/workflow/create',
    name: 'EditWorkFlow',
    component: EditWorkFlow
  }
]

const router = createRouter({
  history: createWebHistory('/work_yr/'),
  routes
})

export default router
