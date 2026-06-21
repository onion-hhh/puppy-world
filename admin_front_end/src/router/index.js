import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'apply-list',
        name: 'ApplyList',
        component: () => import('../views/ApplyList.vue'),
        meta: { title: '申请审核', icon: 'DocumentChecked' }
      },
      {
        path: 'place-list',
        name: 'PlaceList',
        component: () => import('../views/PlaceList.vue'),
        meta: { title: '地点管理', icon: 'Location' }
      },
      {
        path: 'user-list',
        name: 'UserList',
        component: () => import('../views/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'comment-list',
        name: 'CommentList',
        component: () => import('../views/CommentList.vue'),
        meta: { title: '评论管理', icon: 'ChatDotRound' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 汪汪世界管理后台` : '汪汪世界管理后台'
  
  const token = localStorage.getItem('adminToken')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export { router }
