NB. i|D:Vue:vue|D:Router:vue-router|D:Login:./components/Login.vue|D:Home:./components/Home.vue|D:Welcome:./components/Welcome.vue|D:Users:./components/user/Users.vue

(Vue.use Router)

router =: (new Router O('routes';(O('path';'/';'redirect';'/login');O('path';'/login';'component';Login);O('path';'/home';'component';Home;'redirect';'/welcome';'children';(O('path';'/Welcome';'component';Welcome);O('path';'/users';'component';Users))))))