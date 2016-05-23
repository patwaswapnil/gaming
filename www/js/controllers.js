angular.module('gaming.controllers', [])
    .controller('AppCtrl', ['$scope', '$rootScope', '$timeout', '$ionicModal', '$ionicPopup', '$ionicPopover', 'LSFactory', 'APIFactory', 'Loader', '$cordovaOauth', '$ionicActionSheet', 'CommonFactory',
        function ($scope, $rootScope, $timeout, $ionicModal, $ionicPopup, $ionicPopover, LSFactory, APIFactory, Loader, $cordovaOauth, $ionicActionSheet, CommonFactory) {
            $scope.updateUser = function () {
                if (LSFactory.get('gamingUser')) {
                    $rootScope.isLoggedIn = true;
                    $rootScope.user = LSFactory.get('gamingUser');
                    $timeout(function () {
                        $rootScope.isLoggedIn = true;
                    }, 200);
                } else {
                    $rootScope.isLoggedIn = false;
                    $rootScope.user = {};
                    $timeout(function () {
                        $rootScope.isLoggedIn = false;
                    }, 200);
                }
            };
            $scope.updateUser();
            $rootScope.$on('showLoginModal', function ($event, scope, cancelCallback, callback) {
                $scope.showLogin = true;
                $scope.registerToggle = function () {
                    $scope.showLogin = !$scope.showLogin;
                }
                $scope = scope || $scope;
                $scope.viewLogin = true;
                $ionicModal.fromTemplateUrl('templates/login.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.loginModal = modal;
                    $scope.loginModal.show();
                    $scope.hide = function () {
                        $scope.loginModal.hide();
                        if (typeof cancelCallback === 'function') {
                            cancelCallback();
                        }
                    }
                    $scope.authUser = function (data) {
                        console.log(data)
                        Loader.show('Authenticating')
                        APIFactory.authUser(data).then(function (response) {
                            Loader.toggleLoadingWithMessage(response.data.msg);
                            if (response.data.msg == 'Not a valid username or password') {
                                Loader.toggleLoadingWithMessage('Invalid Username or Password', 2000);
                            } else if (response.data.msg == 'success_login') {
                                Loader.toggleLoadingWithMessage('Authentication Successful', 2000);
                                $scope.loginModal.hide();
                                LSFactory.set('gamingUser', response.data.userData)
                                $scope.updateUser();
                                if (typeof callback === 'function') {
                                    callback();
                                }
                            } else {
                                Loader.toggleLoadingWithMessage('Oops! something went wrong. Please try again', 2000);
                            }
                        }, function (error) {
                            console.error(error);
                            Loader.toggleLoadingWithMessage('Oops! something went wrong. Please try again', 2000);

                        })
                    }
                    $scope.registerUser = function (data) {
                        Loader.show('Registering')
                        APIFactory.registerUser(data).then(function (response) {
                            console.log(response);
                            if (response.data.msg != 'success_login') {
                                Loader.toggleLoadingWithMessage(response.data.msg, 2000);
                            } else {
                                Loader.toggleLoadingWithMessage('Registration Successful', 2000);
                                var cred = {
                                    userName: data.user_login,
                                    password: data.user_pass
                                };
                                $scope.authUser(cred);
                            }
                        }, function (error) {
                            console.error(error)
                        })
                    }
                });
                $scope.facebookLogin = function () {
                    Loader.show();
                    $cordovaOauth.facebook("272604516407190", ["email", "public_profile"], {
                        redirect_uri: "http://localhost/callback"
                    }).then(function (result) {
                        $http.get("https://graph.facebook.com/v2.2/me", {
                            params: {
                                access_token: result.access_token,
                                fields: "name,first_name,last_name,location,picture,email",
                                format: "json"
                            }
                        }).then(function (result) {
                            console.log(result);
                            $scope.params = {
                                first_name: result.data.first_name,
                                last_name: result.data.last_name,
                                user_email: result.data.email,
                                user_login: result.data.email
                            };
                            // APIFactory.socialRegister($scope.params).then(function(response) {
                            //     $scope.loginModal.hide();
                            //     Loader.hide();
                            //     Loader.toast('Logged in successfuly');
                            //     LSFactory.set('radiusUser', response.data.data)
                            //     $scope.updateUser();
                            //     if (typeof callback === 'function') {
                            //         callback();
                            //     }
                            // }, function(error) {
                            //     Loader.hide();
                            // })
                        }, function (error) {
                            Loader.hide();
                        });
                    }, function (error) {
                        Loader.hide();
                        console.log(error);
                    });
                } //end fb login

            });
            $scope.resetPwd = function () {
                $scope.data = {}
                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: '<input type="email" ng-model="data.user_login" placeholder="Enter you email" class="padding">',
                    title: 'Enter your email address',
                    subTitle: 'You will get a link to reset password',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel',
                        type: 'fs12 reset-btn'
                    }, {
                        text: 'Submit',
                        type: 'button-balanced fs12 reset-btn',
                        onTap: function (e) {
                            if (!$scope.data.user_login) {
                                e.preventDefault();
                            } else {
                                return $scope.data;
                            }
                        }
                    }, ]
                });
                myPopup.then(function (data) {
                    if (!data) {
                        return false;
                    }
                    Loader.show();
                    APIFactory.resetPwd(data).then(function (response) {
                        if (response.data == 'Yes') {
                            Loader.hide();
                            Loader.toast('Your password reset link has been sent to your email Id');
                        } else {
                            Loader.hide();
                            Loader.toast('This Email Id is not registered');
                        }
                    }, function (error) {
                        console.error(error);
                        Loader.toggleLoadingWithMessage('Something went wrong. Please try later');
                    })
                });
            };
            $scope.loginFromMenu = function () {
                $rootScope.$broadcast('showLoginModal', $scope, null, function () {
                });
            };
            $scope.logout = function () {
                var hideSheet = $ionicActionSheet.show({
                    destructiveText: 'Logout',
                    titleText: 'Are you sure you want to logout?',
                    cancelText: 'Cancel',
                    cancel: function () { },
                    buttonClicked: function (index) {
                        return true;
                    },
                    destructiveButtonClicked: function () {
                        Loader.show();
                        LSFactory.delete('gamingUser');
                        hideSheet();
                        $scope.updateUser();
                        $ionicHistory.nextViewOptions({
                            disableBack: true,
                            historyRoot: true
                        });
                        $state.go('app.home');
                        Loader.toast('Logged out successfuly')
                        Loader.hide();
                    }
                });
            };
            $scope.trade = function () {
                $scope.data = {}
                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: '<div>India: <input type="text" ng-model="data.trade" placeholder="Enter trade for India" class="padding"> </div><div>Australia <input type="text" ng-model="data.trade" placeholder="Enter  trade for Australia" class="padding"></div>',
                    title: 'Enter your trade',
                    subTitle: 'My Points: 50',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel',
                        type: 'fz12 reset-btn'
                    }, {
                        text: 'Submit',
                        type: 'button-balanced fz12 reset-btn',
                        onTap: function (e) {
                            if (!$scope.data.trade) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                return $scope.data;
                            }
                        }
                    }, ]
                });
                myPopup.then(function (data) {
                    if (!data) {
                        return false;
                    }

                });
            };
            $scope.getSegment = function (link) { //for setting href celeb listing from permlnk
                var segments = link.split('/');
                var action = segments[4];
                return '#/app/tournament-detail/' + action;
            };
            $scope.openLink = function (link, e) {
                e.preventDefault();
                CommonFactory.inAppLink(link).then(function (response) { }, function (error) {
                    console.log(error);
                })
            };
        }
    ])
    .controller('HomeCtrl', ['$scope', 'APIFactory', 'Loader', function ($scope, APIFactory, Loader) {
        $scope.activePanel = 'Tournaments';

        function getHomeData(category) {
            Loader.show();
            APIFactory.getHomeData().then(function (response) {
                $scope.featuredData = response.data;
                Loader.hide();
            }, function (error) {
                Loader.hide();
                console.error(error);
            });
        }
        getHomeData();

    }])
    .controller('MatchListingCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function ($scope, $rootScope, APIFactory, Loader) {
            function getMatches() {
                var data = { categoryName: 'Cricket', userId: $scope.user.ID };
                APIFactory.getAllMatches(data).then(function (response) {
                    $scope.matches = response.data;
                    Loader.hide();
                }, function (error) {
                    Loader.hide();
                    console.error(error);
                });
            }
            getMatches();

        }])
    .controller('TournamentListingCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function ($scope, $rootScope, APIFactory, Loader) {
            function getTournaments(category) {
                var data = { categoryName: 'Cricket', userId: $scope.user.ID };
                APIFactory.getAllTournaments(data).then(function (response) {
                    $scope.tournaments = response.data;
                    Loader.hide();
                }, function (error) {
                    Loader.hide();
                    console.error(error);
                });
            }
            getTournaments();
        }])
    .controller('TournamentDetailCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$stateParams',
        function ($scope, $rootScope, APIFactory, Loader, $stateParams) {
            $scope.category = $stateParams.tournament;
            function getTournaments(category) {
                var data = { postId: category, userId: $scope.user.ID };
                APIFactory.getTournamentDetail(data).then(function (response) {
                    $scope.tournament = response.data;
                    console.log($scope.tournament)
                    Loader.hide();
                }, function (error) {
                    Loader.hide();
                    console.error(error);
                });
            }
            getTournaments($scope.category);
        }])
    .controller('ContactCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function ($scope, $rootScope, APIFactory, Loader) {
            var userId = $scope.user.ID;
            console.log(userId);
            $scope.sendMail = function (message) {
                var data = 'fname=' + message.fname + '&email=' + message.email + '&phone=' + message.phone + '&message=' + message.message;
                APIFactory.sendContactFrom(data, userId).then(function (response) {
                    Loader.hide();
                    Loader.toast(response.data.msg)
                }, function (error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong, Please try later again');
                });
            }
        }])
    .controller('userProfileCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function ($scope, $rootScope, APIFactory, Loader) {
            $scope.getUserAccount = function () {
                var data = { type: 'myAccount', userId: $scope.user.ID }
                APIFactory.getUserAccount(data).then(function (response) {
                    $scope.userInfo = response.data;
                    console.log($scope.userInfo)
                    Loader.hide();
                    Loader.toggleLoadingWithMessage('asdf');
                    Loader.toast(response.data.msg)
                }, function (error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong, Please try later again');
                });
            };
            $scope.getUserAccount();
        }])
