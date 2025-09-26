import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import { useAuthStore } from '../store/auth'
import Users from "../views/Users.vue"
import Message from "../views/Message.vue"

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true },
  },
  {path: "/users", name: "users", component: Users, meta:{requiresAuth: true}},
  {path: "/messages", name: "message", component: Message, meta:{requiresAuth: true}}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware d'auth
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router