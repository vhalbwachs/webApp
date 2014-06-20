"use strict";

angular.module('ratingGraphics', [])
  .factory('scoresGraph', ['$window', 'graphApiHelper', function($window, graphApiHelper){
    return {
      initialize: function(scope){
        var pageWidth = parseInt(d3.select(".board").style("width"));
        var pageHeight = $window.innerHeight;
        var dotSize = Math.sqrt(pageWidth*pageWidth + pageHeight*pageHeight)/100;

        var margin = {top: pageHeight/10, right: pageWidth/10, bottom: pageHeight/10, left: pageWidth/8},
            height = pageHeight - margin.top - margin.bottom - 150,
            width =   pageWidth - margin.left - margin.right - 50;

            // set the height and the width to be equal (to the smaller of the two)
        if(height > width) {
          height = width;
        } else {
          width = height;
        }

        /* 
         * value accessor - returns the value to encode for a given data object.
         * scale - maps value to a visual display encoding, such as a pixel position.
         * map function - maps from data value to display value
         * axis - sets up axis
         */ 

        // setup x 
        var xValue = function(d) { return d.x;}, // data -> value
            xScale = d3.scale.linear().range([0, width]), // value -> display
            xMap = function(d) { return xScale(xValue(d));}, // data -> display
            xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        // setup y
        var yValue = function(d) { return d.y;}, // data -> value
            yScale = d3.scale.linear().range([height, 0]), // value -> display
            yMap = function(d) { return yScale(yValue(d));}, // data -> display
            yAxis = d3.svg.axis().scale(yScale).orient("left");

        // add the graph canvas to the body of the webpage

        var svg = d3.select(".board").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .on("mousedown", function( ){
              if(scope.allowedToVote){
                var mousePos = d3.mouse(this);
                // if the page is wider, graph is wider 
                var yaxis = document.getElementsByClassName("y axis")[0].getBoundingClientRect();
                var yaxisPosition = yaxis.left + yaxis.width / 2;

                var xaxis = document.getElementsByClassName("x axis")[0].getBoundingClientRect();
                var xaxisPosition = xaxis.top + xaxis.height/2; //xaxis.bottom + xaxis.height / 2;
                var topBoard = document.getElementsByClassName("board")[0].getBoundingClientRect().top;

                var newX = ((mousePos[0] - yaxisPosition - 4)*100)/width;
                var newY = ((xaxisPosition - topBoard - mousePos[1])*100)/height;

                if(newX > -0.5 && newX < 100.5 && newY > -0.5 && newY < 100.5){
                  scope.userData =[{x: newX, y: newY}];
                  updateUserDots();
                }           
              }
            })
           .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        xScale.domain([0, 100]);
        yScale.domain([0, 100]);
        xAxis.ticks(Math.max(width/50, 2));
        yAxis.ticks(Math.max(height/50, 2));

        xAxis.tickSize(1,1);
        yAxis.tickSize(1,1);

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Company success");

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Personal success");

        var loadAllDots = function(data){
          // var radius = 4;
          var strokeWidth = 3;
          var delay = 50;
          var duration = 200;
          // draw dots
          svg.selectAll(".colleagueScores")
              .data(data)
            .enter().append("circle")
              .attr("class", "colleagueScores")
              .attr("r", 0)//dotSize)
              .attr("cx", xMap)
              .attr("cy", yMap)
              // .style("fill", "red")
              // .attr('opacity', 0)
            // .transition()
            .transition().delay(function(d, i) { return delay * i }).duration(duration)
              .attr('r', dotSize)
              .attr('stroke-width', strokeWidth)
              .each('end', function() {
                // have ripple around data point
                ripple([this.cx.animVal.value, this.cy.animVal.value]);
              })
              // .duration(1000)
              .attr('opacity', function(d) { 
                // this makes the dots / posts more transparent the older they are
                var date = d.date;  
                var postAgeDays = Math.floor((new Date() - new Date(date)) /  (86400 * 1000));
                return 1 / ( postAgeDays + 1);
              });  
        };

        var updateUserDots = function(data){
          var initR = 40;
          var finalR = 10;
          var thickness = 5;
          var userDots = svg.selectAll(".userScore")
              .data(scope.userData);
              // .data(data);
          // userDots.select('circle').remove();

          userDots
            .enter().append("circle")
              .attr("class", "userScore")
                .transition().duration(1000).ease('linear')
              .attr("r", dotSize*2)
              .attr("cx", xMap)
              .attr("cy", yMap)
              .attr({"stroke-width" : thickness});
              // .style("fill", "blue");

          userDots
              .attr("class", "userScore")
              .attr("r", dotSize*2)
              .attr("cx", xMap)
              .attr("cy", yMap);
              // .style("fill", "blue");
        };

        // if page hasn't initialized and the player has already scored today
        // retrieve the company scores immediately and display them
        if(scope.scored && !scope.initialized){
          graphApiHelper.getCompanyScores()
            .success(function(data){
              var scores = [];
              for(var i = 0; i < data.length; i++){
                if(data[i].score){
                  scores.push({x: data[i].score.x, y: data[i].score.y,  date: data[i].score.date});
                }
              }
              // store colleague scores on the scope, so they can be 
              // redrawn when the page is resized (instead of another GET)
              scope.colleagueScores = scores;
              loadAllDots(scores);
              //get user last score from scope.currentUser
              var userScore = scope.currentUser.scores[0];
              scope.userData = [{x: userScore.x, y: userScore.y}];
              updateUserDots();
            });
        } else if(scope.scored){
          // if page has loaded and user has posted a score load / render
          // both colleague and user scores
          updateUserDots();
          loadAllDots(scope.colleagueScores);
        } else {
          // if the page has loaded, but the user hasn't posted
          // update the user dot prior to submission 
          updateUserDots();
        }

        var ripple = function(position) {
          // constants for the ripple
          var initR = 10;
          var finalR = 40;
          var thickness = 3;
          var duration = 500;

          var circle = svg.append('circle')
            .attr({
              'cx': position[0],
              'cy': position[1],
              'r': (initR - (thickness / 2)),
              'class': 'colleague-ripples',
            })
            .style('stroke-width', thickness)
          .transition().duration(duration).ease('quad-in')
            .attr("r", finalR)
            .style("stroke-opacity", 0)
            .each('end', function () {
              d3.select(this).remove();
            });
        };  

        scope.submitScore = function(){
          // $http POST call
          var score = scope.userData;
          graphApiHelper.submitUserScore(score[0])
            .success(function(data){

              //load All Dots
              scope.allowedToVote = false;

              graphApiHelper.getCompanyScores()
                .success(function(data){
                  var scores = [];
                  for(var i = 0; i < data.length; i++){
                    if(data[i].score){
                      scores.push({x: data[i].score.x, y: data[i].score.y, date: data[i].score.date});
                    }
                  }
                  // after a successful POST mark set the scope scored property to true
                  scope.scored = true;

                  // store colleague scores on the scope, so they can be 
                  // redrawn when the page is resized (instead of another GET)
                  scope.colleagueScores = scores;

                  loadAllDots(scores);

                  scope.userData.push(scope.userData[0]);

                  updateUserDots();
                });
            });
        };

        scope.initialized = true;
      }
    }
  }])
  .factory('graphApiHelper', ['$rootScope', '$http', function($rootScope, $http){

    return {
      submitUserScore: function(score){
        return $http({
          method: 'POST',
          url: '/api/users/' + $rootScope.currentUser.id + '/scores',
          data: {
            x: score.x,
            y: score.y
          }
        });
      },
      getCompanyScores: function(){
        return $http({
          method: 'GET',
          url: 'api/companies/' + $rootScope.currentUser.company + '/scores/mostrecent'
        })
      }
    };
  }]);
