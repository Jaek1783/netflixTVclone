import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import Trending from '../views/Trending.vue'
import Movies from '../views/Movies.vue'
import Ticketing from '../views/Ticketing.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/search',
    name: 'search',
    component: Search
  },
  {
    path: '/trending',
    name: 'trending',
    component: Trending
  },
  {
    path: '/movies',
    name: 'movies',
    component: Movies
  },
  {
    path: '/ticketing',
    name: 'ticketing',
    component: Ticketing
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 