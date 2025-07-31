import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import Trending from '../views/Trending.vue'
import Movies from '../views/Movies.vue'
import Ticketing from '../views/Ticketing.vue'
import Payment from '../views/Payment.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminPayments from '../views/AdminPayments.vue'
import AdminMovies from '../views/AdminMovies.vue'
import AdminTickets from '../views/AdminTickets.vue'

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
    path: '/payment',
    name: 'payment',
    component: Payment
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsers
  },
  {
    path: '/admin/payments',
    name: 'admin-payments',
    component: AdminPayments
  },
  {
    path: '/admin/movies',
    name: 'admin-movies',
    component: AdminMovies
  },
  {
    path: '/admin/tickets',
    name: 'admin-tickets',
    component: AdminTickets
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 