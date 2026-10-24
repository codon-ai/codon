(function() {
    "use strict";
    angular.module("crossover").config(routerConfig);
    function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider.state("home", {
  url: "/",
  templateUrl: "app/main/main.html",
  controller: "MainController",
  controllerAs: "main",
  authenticate: true
}).state("login", {
  url: "/login",
  templateUrl: "app/login/login.html",
  controller: "LoginController",
  controllerAs: "vm"
});
    $urlRouterProvider.otherwise("/login");
}
})();