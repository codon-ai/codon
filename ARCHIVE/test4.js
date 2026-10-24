import Vue from 'vue';

import Router from 'vue-router';

import Login from './components/Login.vue';

import Home from './components/Home.vue';

import Welcome from './components/Welcome.vue';

import Users from './components/user/Users.vue';

Vue.use(Router);

const router = new Router({
  routes: [
  {
  path: "/",
  redirect: "/login"
},
  {
  path: "/login",
  component: Login
},
  {
  path: "/home",
  component: Home,
  redirect: "/welcome",
  children: [
  {
  path: "/Welcome",
  component: Welcome
},
  {
  path: "/users",
  component: Users
}
]
}
]
});