'use strict';

angular.module('happyMeterApp')
  .controller('SideboxCtrl', ['$rootScope', '$scope', '$location', 'Auth',
   function ($rootScope, $scope, $location, Auth) {

    var role = $scope.currentUser ? $scope.currentUser.role : undefined;

    // ensure the sideBox is hidden when the route is changed
    $scope.showSidebox = false;
    $rootScope.showSidebox = false;

    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'Dashboard',
      'link': '/dashboard',
      'hide': (role === 'employee')
    }, {
      'title': 'Rating',
      'link': '/rating',
      'hide': (role === 'executive')
    }, {
      'title': 'Rating History',
      'link' : '/ratinghistory',
      'hide': (role === 'executive')
    }, {
      'title': 'Rewards',
      'link' : '/rewards',
      'hide': (role === 'executive')
    }, {
      'title': 'Settings',
      'link': '/settings'
    }, {
      'title': 'Invite Colleagues',
      'link': '/invite'
    }];

    
    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        $location.path('/');
      });
    };
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.toggleSidebox = function(){
      $scope.showSidebox = !$scope.showSidebox;
      $rootScope.showSidebox = $scope.showSidebox;
    };

  }]);
