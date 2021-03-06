// Ionic gaming App
var domain = 'http://www.eventexchange.co.in/api/?action=';
var base_url = "http://www.eventexchange.co.in/"; 
angular.module('gaming', ['ionic', 'gaming.controllers', 'gaming.services', 'gaming.directives', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs) 
    setTimeout(function() {
      try { 
        navigator.splashscreen.hide();
      } catch(e) { 
        console.log('It will work on app only');
      }
    }, 300);
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true); }

    try {
    if (window.StatusBar) { 
      StatusBar.styleDefault();
    } 
      $cordovaStatusbar.styleHex('#b41a23');
  } catch(e) {
          console.log('styleDefault work on device only');
      }

  });
})
.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) { 
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('app.tournament-listing', {
    url: '/tournament-listing/:cat',
    views: {
      'menuContent': {
        templateUrl: 'templates/tournament-listing.html',
        controller: 'TournamentListingCtrl' 
      }
    }
  })
  .state('app.match-listing', {
    url: '/match-listing/:cat',
    views: {
      'menuContent': {
        templateUrl: 'templates/match-listing.html',
        controller: 'MatchListingCtrl' 
      }
    }
  })
  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html' 
      }
    }
  })
  .state('app.contact', {
    url: '/contact',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact.html',
        controller: 'ContactCtrl' 
      }
    }
  })
  .state('app.match-detail', {
    url: '/match-detail',
    views: {
      'menuContent': {
        templateUrl: 'templates/match-detail.html' 
      }
    }
  })
  .state('app.tournament-detail', {
    url: '/tournament-detail/:tournament',
    views: {
      'menuContent': {
        templateUrl: 'templates/tournament-detail.html',
        controller: 'TournamentDetailCtrl' 
      }
    }
  })
  .state('app.user-profile', {
    url: '/user-profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/user-profile.html',
        controller: 'userProfileCtrl' 
      }
    }
  })
  .state('app.my-trades', {
    url: '/my-trades',
    views: {
      'menuContent': {
        templateUrl: 'templates/my-trades.html',
        controller: 'MyTradesCtrl'
      }
    }
  })
  .state('app.buy-encash', {
    url: '/buy-encash',
    views: {
      'menuContent': {
        templateUrl: 'templates/buy-encash-points.html',
        controller: 'TrasactionCtrl' 
      }
    }
  })
  .state('app.trade-history', {
    url: '/trade-history',
    views: {
      'menuContent': {
        templateUrl: 'templates/trade-history.html',
        controller: 'TradingHistoryCtrl' 
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
}) 