import {createRouter,createWebHashHistory} from 'vue-router'
import HomePage from './pages/HomePage.vue'
import SignIn from './components/auth/SignIn.vue'
import SignUp from './components/auth/SignUp.vue'
const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        path: '/sign-in',
        component: SignIn
    },
    {
        path: '/sign-up',
        component: SignUp
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router