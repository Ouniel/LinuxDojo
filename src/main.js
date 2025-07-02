import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

import App from './App.vue'
import HomePage from './views/HomePage.vue'

// 路由配置
const routes = [
    { path: '/', name: 'Home', component: HomePage },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 创建Pinia状态管理
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
