'use strict';

angular.module('happyMeterApp')
  .controller('NavbarCtrl', ['$scope', '$location', 'Auth','storedUserData', function ($scope, $location, Auth, storedUserData) {

    var role = $scope.currentUser ? $scope.currentUser.role : undefined;

    $scope.menu = [{
      'title': 'Dashboard',
      'link': '/dashboard',
      'hide': (role === 'employee')
    }, {
      'title': 'Rating',
      'link': '/rating',
      'hide': (role === 'executive')
    }, {
      'title': 'Settings',
      'link': '/settings'
    }, {
      'title': 'Invite',
      'link': '/invite'
    }];
    
    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        storedUserData.setScored(false);
        $location.path('/');
      });
    };
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  }]);
