angular.module('gaming.services', [])

    .factory('APIFactory', ['$http', '$httpParamSerializer', function ($http, $httpParamSerializer) {
        var api = {
            getHomeData: function (data) {
                return $http.get(domain + "home");
            },
            authUser: function (data) {
                var req = { method: 'POST', url: domain + 'login', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            registerUser: function (data) {
                var req = { method: 'POST', url: domain + 'registration', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            resetPwd: function (data) {
                var req = { method: 'POST', url: domain + 'forgot-password', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: $httpParamSerializer(data) };
                return $http(req);
            },
            getAllMatches: function (data) {
                var req = { method: 'POST', url: domain + 'listing-matches&userId=' + data.userId, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            getAllTournaments: function (data) {
                var req = { method: 'POST', url: domain + 'listing-tournaments&userId=' + data.userId, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            getTournamentDetail: function (data) {
                var req = { method: 'POST', url: domain + 'tournaments-detail&userId=' + data.userId, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            sendContactFrom: function (data, userId) {
                console.log(userId)
                var req = { method: 'POST', url: domain + 'contact-us&userId=' + userId, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: $httpParamSerializer({ 'data': data }) };
                return $http(req);
            },
            getUserAccount: function (data) {
                var req = { method: 'POST', url: domain + 'my-account&userId=' + data.userId, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            updateUser: function (data) {
                var req = { method: 'POST', url: domain + 'update-user-info&userId=' + data.userId, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: jQuery.param({ 'data': data }) };
                return $http(req);
            },
            getMenu: function (data) {
                return $http.get(domain + "header"); 
            }
        };
        return api;
    }])
    .factory('Loader', ['$ionicLoading', '$timeout', '$cordovaToast', function ($ionicLoading, $timeout, $cordovaToast) {
        var LOADERAPI = {
            show: function (text) {
                if (text) {
                    $ionicLoading.show({
                        template: text
                    });
                } else {
                    $ionicLoading.show();
                }
            },
            hide: function () {
                $ionicLoading.hide();
            },
            toggleLoadingWithMessage: function (text, timeout) {
                var self = this;
                self.show(text);
                $timeout(function () {
                    self.hide();
                }, timeout || 3000);
            },

            toast: function (msg) {
                var isAndroid = ionic.Platform.isAndroid();
                var isIOS = ionic.Platform.isIOS();
                if (isAndroid || isIOS) {
                    $cordovaToast.show(msg, 'short', 'center').then(function (success) { });
                }
                else {
                    console.info(msg);
                }
            }
        };
        return LOADERAPI;
    }])
    .factory('LSFactory', [function () {

        var LSAPI = {
            clear: function () {
                return localStorage.clear();
            },
            get: function (key) {
                return JSON.parse(localStorage.getItem(key));
            },
            set: function (key, data) {
                return localStorage.setItem(key, JSON.stringify(data));
            },
            setArray: function (key, data) {
                return localStorage.setItem(key, JSON.stringify([data]));
            },
            delete: function (key) {
                return localStorage.removeItem(key);
            },
            getAll: function () {
            }
        };
        return LSAPI;
    }])
    .factory('CommonFactory', ['$cordovaInAppBrowser', function ($cordovaInAppBrowser) {

        var commonFactory = {
            inAppLink: function (link) {
                var options = { location: 'yes', clearcache: 'yes', toolbar: 'no', closebuttoncaption: 'DONE?' };
                return $cordovaInAppBrowser.open(link, '_blank', options);
            }
        }
        return commonFactory;
    }])