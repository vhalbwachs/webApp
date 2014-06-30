'use strict';

angular.module('app.dashboard', ['dashboardGraphics', 'formatUsers'])
  .controller('DashboardCtrl', ['$scope', '$http', '$location', '$window', 'formatUsers', function ($scope, $http, $location, $window, formatUsers) {

    //container for sizing parameters
    $scope.sizing = {};
    $scope.resize = function(){
      $scope.sizing.margin = {top: 30, right: 40, bottom: 30, left: 30};
      $scope.sizing.width = $('.board-wrapper').width() - $scope.sizing.margin.left - $scope.sizing.margin.right;
      $scope.sizing.height = ($window.innerHeight - 160) - $scope.sizing.margin.top - $scope.sizing.margin.bottom;
    };
    $scope.renderChart = function(){
      $scope.resize();
      $scope.$broadcast('render');      
    };
    //listener for window scope resize
    $window.addEventListener('resize', $scope.renderChart);
    $scope.$on('$destroy', function(event){
      $window.removeEventListener('resize');
    });

    //display options
    $scope.options = {
      displayMode: 'fisheye',
      showFisheye: true,
      showSidebox: true,
      dateRange: 31,
      snapshotDate: undefined,
      mousePos: [0, 0],
    };

    $scope.setDisplayMode = function(mode){
      $scope.options.displayMode = mode;
      $scope.renderChart();
    };

    $scope.setDateRange = function(range){
      //$scope.users[2] is array of average scores
      $scope.options.dateRange = range || $scope.users[2].length;
      $scope.renderChart();
    };

    $scope.toggleSidebox = function(){
      $scope.options.showSidebox = !$scope.options.showSidebox;
      d3.select('.board-wrapper')
        .attr('class', function(){
          return $scope.options.showSidebox ? 
            'board-wrapper col-sm-9' :
            'board-wrapper col-sm-11 col-md-offset-1';
        });
      $scope.renderChart();
    };

    //toggle dropdown menu for small devices
    $scope.showDropdown = false;
    $scope.toggleDropdown = function(){
      console.log('toggle');
      $scope.showDropdown = !$scope.showDropdown;
    };

    //fetch scores from server
    $http({
      method: 'GET',
      url: '/api/companies/' + $scope.currentUser.company + '/scores'
    })
    .success(function(data){
      $scope.users = formatUsers(data);
      // set default date range to one month
      $scope.options.dateRange = 31;
      $scope.renderChart();
    })
    .error(function(err){
      console.error(err);
    });

  }]);
