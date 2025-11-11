import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

// 导出pinia实例，以便在其他地方使用
export { pinia }
