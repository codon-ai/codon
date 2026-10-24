({{ NB. FE|
'use strict'
((angular.module 'crossover').config routerConfig)
{{ NB. FD|routerConfig|$stateProvider,$urlRouterProvider
(($stateProvider.state 'home' O('url';'/';'templateUrl';'app/main/main.html';'controller';'MainController';'controllerAs';'main';'authenticate';true)).state 'login' O('url';'/login';'templateUrl';'app/login/login.html';'controller';'LoginController';'controllerAs';'vm'))
($urlRouterProvider.otherwise '/login')
}}
}})()