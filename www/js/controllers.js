angular.module('gaming.controllers', [])
    .controller('AppCtrl', ['$scope', '$q', '$rootScope', '$timeout', '$ionicModal', '$ionicPopup', '$ionicPopover', 'LSFactory', 'APIFactory', 'Loader', '$cordovaOauth', '$ionicActionSheet', 'CommonFactory', '$ionicHistory', '$state',
        function($scope, $q, $rootScope, $timeout, $ionicModal, $ionicPopup, $ionicPopover, LSFactory, APIFactory, Loader, $cordovaOauth, $ionicActionSheet, CommonFactory, $ionicHistory, $state) {
            $scope.updateUser = function() {
                if (LSFactory.get('gamingUser')) {
                    $rootScope.isLoggedIn = true;
                    $rootScope.user = LSFactory.get('gamingUser');
                    $scope.getUserDetail();
                    $timeout(function() {
                        $rootScope.isLoggedIn = true;
                    }, 200);
                } else {
                    $rootScope.isLoggedIn = false;
                    $rootScope.user = {};
                    $timeout(function() {
                        $rootScope.isLoggedIn = false;
                    }, 200);
                }
            };
            $scope.getUserDetail = function() {
                if ($rootScope.isLoggedIn) {
                    var data = {
                        userId: $rootScope.user.ID
                    };
                    APIFactory.getUserAccount(data).then(function(response) {
                        $scope.userDetail = response.data;
                    }, function(error) {

                    })

                }
            }
            $scope.updateUser();
            $rootScope.$on('showLoginModal', function($event, scope, cancelCallback, callback) {
                $scope.showLogin = true;
                $scope.registerToggle = function() {
                    $scope.showLogin = !$scope.showLogin;
                }
                $scope = scope || $scope;
                $scope.viewLogin = true;
                $ionicModal.fromTemplateUrl('templates/login.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.loginModal = modal;
                    $scope.loginModal.show();
                    $scope.hide = function() {
                        $scope.loginModal.hide();
                        if (typeof cancelCallback === 'function') {
                            cancelCallback();
                        }
                    }
                    $scope.authUser = function(data) {
                        console.log(data)
                        Loader.show('Authenticating')
                        APIFactory.authUser(data).then(function(response) {
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
                        }, function(error) {
                            console.error(error);
                            Loader.toggleLoadingWithMessage('Oops! something went wrong. Please try again', 2000);

                        })
                    }
                    $scope.registerUser = function(data) {
                        Loader.show('Registering')
                        APIFactory.registerUser(data).then(function(response) {
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
                        }, function(error) {
                            console.error(error)
                        })
                    }
                });
                $scope.facebookLogin = function() {
                        Loader.show();
                        $cordovaOauth.facebook("272604516407190", ["email", "public_profile"], {
                            redirect_uri: "http://localhost/callback"
                        }).then(function(result) {
                            $http.get("https://graph.facebook.com/v2.2/me", {
                                params: {
                                    access_token: result.access_token,
                                    fields: "name,first_name,last_name,location,picture,email",
                                    format: "json"
                                }
                            }).then(function(result) {
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
                            }, function(error) {
                                Loader.hide();
                            });
                        }, function(error) {
                            Loader.hide();
                            console.log(error);
                        });
                    } //end fb login

            });
            $scope.resetPwd = function() {
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
                        onTap: function(e) {
                            if (!$scope.data.user_login) {
                                e.preventDefault();
                            } else {
                                return $scope.data;
                            }
                        }
                    }, ]
                });
                myPopup.then(function(data) {
                    if (!data) {
                        return false;
                    }
                    Loader.show();
                    APIFactory.resetPwd(data).then(function(response) {
                        if (response.data == 'Yes') {
                            Loader.hide();
                            Loader.toast('Your password reset link has been sent to your email Id');
                        } else {
                            Loader.hide();
                            Loader.toast('This Email Id is not registered');
                        }
                    }, function(error) {
                        console.error(error);
                        Loader.toggleLoadingWithMessage('Something went wrong. Please try later');
                    })
                });
            };
            $scope.loginFromMenu = function() {
                $rootScope.$broadcast('showLoginModal', $scope, null, function() {});
            };
            $scope.logout = function() {
                var hideSheet = $ionicActionSheet.show({
                    destructiveText: 'Logout',
                    titleText: 'Are you sure you want to logout?',
                    cancelText: 'Cancel',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        return true;
                    },
                    destructiveButtonClicked: function() {
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
            $scope.toggleGroup = function(group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function(group) {
                return $scope.shownGroup === group;
            };
            $scope.getSegment = function(link) { //for setting href celeb listing from permlnk
                var segments = link.split('/');
                var action = segments[4];
                return '#/app/tournament-detail/' + action;
            };
            $scope.openLink = function(link, e) {
                e.preventDefault();
                CommonFactory.inAppLink(link).then(function(response) {}, function(error) {
                    console.log(error);
                })
            };
            APIFactory.getMenu().then(function(response) {
                $scope.menuItem = response.data.categories;
            }, function(error) {
                console.log('Unable to get menu item.');
            });

            $scope.items = [{
                title: '1',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }, {
                title: '2',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }, {
                title: '3',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }, {
                title: '4',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }, {
                title: '5',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit'
            }];

            /*
             * if given group is the selected group, deselect it
             * else, select the given group
             */
            $scope.toggleItem = function(item) {
                if ($scope.isItemShown(item)) {
                    $scope.shownItem = null;
                } else {
                    $scope.shownItem = item;
                }
            };
            $scope.isItemShown = function(item) {
                return $scope.shownItem === item;
            };
            $scope.addTrade = function(tid, teamId, pts, uid, slug, callback) {
                console.log(tid, teamId, pts, uid, slug)
                if (uid != null) {
                    var data = {
                        'tid': tid, // tournament id
                        'team_id': teamId, //team id 
                        'pts': pts, //traded points
                        'slug': slug,
                        'type': 'tournaments',
                        'userId': $rootScope.user.ID

                    };
                    APIFactory.addTrade(data).then(function(response) {
                        Loader.toast(response.data);
                        Loader.hide();
                        // if (typeof callback === 'function' && response.data.mytradedPoints) {
                        //     callback();
                        // }
                        $scope.$broadcast('refreshData');
                    }, function(error) {
                        Loader.hide();
                        Loader.toast('Oops! something went wrong. Please try later again');
                        $scope.$broadcast('refreshData');
                    })
                };
            }
            $scope.addMultipleTrade = function(link, tid, points, tie, uid, callback, type) {
                Loader.show();
                var deferred = $q.defer();
                var slug = link.split("/");
                slug = slug[slug.length - 2];
                var data = {
                    'mid': tid,
                    'pts': points,
                    'tie': tie,
                    'slug': slug,
                    'mainSlug': '',
                    'type': type || 'popularMatches',
                    'catType': '',
                    'userId': $rootScope.user.ID
                };
                APIFactory.multiTrade(data).then(function(response) {
                    Loader.hide();
                    Loader.toast(response.data.msg);
                    $scope.$broadcast('refreshData');
                    $scope.getUserDetail();
                    deferred.resolve(response.data);
                }, function(error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong. Please try later again');
                    $scope.$broadcast('refreshData');
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            $scope.toastMsg = function (msg) {
                Loader.toast(msg);
            }
            $scope.TradeToastInfo = function (points, team) {
                Loader.toast("You've traded "+ (points || 0) + " points on " + team);
            }
        }
    ])
    .controller('HomeCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$ionicScrollDelegate',
     function($scope, $rootScope, APIFactory, Loader, $ionicScrollDelegate) {
        $scope.activePanel = 'Matches';
        var fetchRecordCount = 1;
        $scope.canLoadMore = true;
        var data = {}
        $scope.$on('refreshData', function(e) { 
        });

        function getHomeData(category) {
            var data = {
                userId: $scope.user.ID
            };
            Loader.show();
            APIFactory.getHomeData(data).then(function(response) {
                $scope.featuredData = response.data;
                $scope.featuredDetail = response.data.upcomingMatches;
                $scope.featuredMathces = response.data.upcomingMatches.catPost;
                Loader.hide();
            }, function(error) {
                Loader.hide();
                console.error(error);
            });

        }
        getHomeData();
        $scope.loadMoreMatches = function() {
            fetchRecordCount = fetchRecordCount + 1;
            console.log(fetchRecordCount);
            var data = {
                'userId': $rootScope.user.ID,
                'getCount': fetchRecordCount
            };
            APIFactory.getHomeMatches(data).then(function(response) {
                if (!response.data.upcomingMatches.catPost.length) {
                    $scope.canLoadMore = false;
                } else {
                    response.data.upcomingMatches.catPost.forEach(function(element, index) {
                        $scope.featuredMathces.push(element);
                    });

                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function(error) {
                console.error(error);
            });
        }
        $scope.addHomeTred = function(link, tid, points, tie, uid, index) {
            $scope.addMultipleTrade(link, tid, points, tie, uid, null, 'popularMatches').then(function(response) {
                console.log(response.mytradedPoints)
                if (response.mytradedPoints != null) {
                    var tempArray = response.mytradedPoints;
                    for (var property in tempArray) {
                        if ($scope.featuredMathces[index].select_teams[0].team_name.ID == property) {
                            $scope.featuredMathces[index].mytradedTotal[$scope.featuredMathces[index].select_teams[0].team_name.ID] = response.mytradedPoints[property];
                            $scope.featuredMathces[index].mytradedTotal.tourTotal = Number($scope.featuredMathces[index].mytradedTotal.tourTotal) + Number(points[$scope.featuredMathces[index].select_teams[0].team_name.ID]);
                        }
                        if ($scope.featuredMathces[index].select_teams[1].team_name.ID == property) {
                            $scope.featuredMathces[index].mytradedTotal[$scope.featuredMathces[index].select_teams[1].team_name.ID] = response.mytradedPoints[property];
                            $scope.featuredMathces[index].mytradedTotal.tourTotal = Number($scope.featuredMathces[index].mytradedTotal.tourTotal) + Number(points[$scope.featuredMathces[index].select_teams[1].team_name.ID]);
                        }
                        if (property == 'tie') {
                            $scope.featuredMathces[index].mytradedTotal.mytradedTie = response.mytradedPoints['tie'];
                            $scope.featuredMathces[index].mytradedTotal.tourTotal = Number($scope.featuredMathces[index].mytradedTotal.tourTotal) + Number(tie);
                        }
                    }
                    $scope.featuredMathces[index].points = {};
                    $scope.featuredMathces[index].tie = '';
                    $scope.$digest;
                }
            });

        };
        
        $scope.toggleSection = function (tab) {
            $scope.activePanel =  tab;
            $ionicScrollDelegate.scrollTop([false]); 
        }
    }])
    .controller('MatchListingCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$ionicPopover', '$stateParams', '$ionicScrollDelegate',
        function($scope, $rootScope, APIFactory, Loader, $ionicPopover, $stateParams, $ionicScrollDelegate) {

            $scope.canLoadMore = true;
            var fetchRecordCount = 1;
            $scope.type = 'popularMatches';
            $scope.getMatches = function(cat, type) {
                $ionicScrollDelegate.scrollTop([true]);
                fetchRecordCount = 1;
                $scope.type = type || null;
                Loader.show();
                data = {
                    categoryName: cat,
                    userId: $scope.user.ID,
                    type: type || 'popular'
                };
                $scope.categoryLabel = data.categoryName;
                $scope.filterLabel = data.type;
                APIFactory.getAllMatches(data).then(function(response) {
                    $scope.matches = response.data.catPost;
                    $scope.featuredDetail = response.data;
                    Loader.hide();
                }, function(error) {
                    Loader.hide();
                    console.error(error);
                });
            }
            $scope.category = $stateParams.cat || 'Cricket';
            $scope.getMatches($scope.category);
            $scope.loadMoreMatchesListing = function() {
                fetchRecordCount = fetchRecordCount + 1;
                var data = {
                    'userId': $rootScope.user.ID,
                    'getCount': fetchRecordCount,
                    'type': $scope.type || 'popular'
                };
                APIFactory.getAllMatches(data).then(function(response) {
                    if (!response.data.catPost.length) {
                        $scope.canLoadMore = false;
                    } else {
                        response.data.catPost.forEach(function(element, index) {
                            $scope.matches.push(element);
                        });

                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function(error) {
                    console.error(error);
                });
            }
            $scope.addListingTred = function(link, tid, points, tie, uid, index) {
                $scope.addMultipleTrade(link, tid, points, tie, uid, null, $scope.type).then(function(response) {
                    console.log(response.mytradedPoints)
                    if (response.mytradedPoints != null) {
                        var tempArray = response.mytradedPoints;
                        for (var property in tempArray) {
                            if ($scope.matches[index].select_teams[0].team_name.ID == property) {
                                $scope.matches[index].mytradedTotal[$scope.matches[index].select_teams[0].team_name.ID] = response.mytradedPoints[property];
                                $scope.matches[index].mytradedTotal.tourTotal = Number($scope.matches[index].mytradedTotal.tourTotal) + Number(points[$scope.matches[index].select_teams[0].team_name.ID]);
                            }
                            if ($scope.matches[index].select_teams[1].team_name.ID == property) {
                                $scope.matches[index].mytradedTotal[$scope.matches[index].select_teams[1].team_name.ID] = response.mytradedPoints[property];
                                $scope.matches[index].mytradedTotal.tourTotal = Number($scope.matches[index].mytradedTotal.tourTotal) + Number(points[$scope.matches[index].select_teams[1].team_name.ID]);
                            }
                            if (property == 'tie') {
                                $scope.matches[index].mytradedTotal.mytradedTie = response.mytradedPoints['tie'];
                                $scope.matches[index].mytradedTotal.tourTotal = Number($scope.matches[index].mytradedTotal.tourTotal) + Number(tie);
                            }
                        }
                        $scope.matches[index].points = {};
                        $scope.matches[index].tie = '';
                        $scope.$digest;
                    }
                });
            }
        }
    ])
    .controller('TournamentListingCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$stateParams',
        function($scope, $rootScope, APIFactory, Loader, $stateParams) {
            var pagiTournament = 1;
            $scope.canLoadMore = true;

            function getTournaments(category) {
                var data = {
                    categoryName: $scope.category,
                    userId: $scope.user.ID
                };
                APIFactory.getAllTournaments(data).then(function(response) {
                    $scope.tournaments = response.data;
                    Loader.hide();
                }, function(error) {
                    Loader.hide();
                    console.error(error);
                });
            };
            $scope.loadMoreTournaments = function() {
                pagiTournament = pagiTournament + 1;
                var data = {
                    categoryName: $scope.category,
                    userId: $scope.user.ID,
                    getCount: pagiTournament
                };
                APIFactory.getAllTournaments(data).then(function(response) {
                    if (!response.data.catPost.length) {
                        $scope.canLoadMore = false;
                    } else {
                        response.data.catPost.forEach(function(element, index) {
                            $scope.tournaments.catPost.push(element);
                        });
                    }
                    Loader.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');

                }, function(error) {
                    Loader.hide();
                    console.error(error);
                });
            };
            $scope.category = $stateParams.cat || 'Cricket';
            getTournaments($scope.category);
        }
    ])
    .controller('TournamentDetailCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$stateParams',
        function($scope, $rootScope, APIFactory, Loader, $stateParams) {
            $scope.category = $stateParams.tournament;
            $scope.type = 'upcomming';
            $scope.$on('refreshData', function(e) {
                getTournaments($scope.category);
                getUpcomingMatch();
            });
            var pagiTournament = 1;
            $scope.canLoadMore = false;


            function getTournaments(category) {
                Loader.show();
                var data = {
                    postId: category,
                    userId: $scope.user.ID
                };
                APIFactory.getTournamentDetail(data).then(function(response) {
                    $scope.tournament = response.data;
                    Loader.hide();
                }, function(error) {
                    Loader.hide();
                    console.error(error);
                });
            }

            function getUpcomingMatch() {
                console.log('upmatch pull')
                Loader.show();
                var data = {
                    tourId: $scope.category,
                    type: 'upcomming',
                    userId: $rootScope.user.ID
                };
                APIFactory.getAllMatches(data).then(function(response) {
                    $scope.upcomingMatch = response.data;
                    Loader.hide();
                    $scope.$digest;
                }, function(error) {
                    console.error(error);
                    Loader.hide();
                })
            }
            // $scope.loadMoreMatchesListing = function() {
            //     fetchRecordCount = fetchRecordCount + 1;
            //     var data = {
            //         'userId': $rootScope.user.ID,
            //         'getCount': fetchRecordCount,
            //         'type': 'upcomming'
            //     };
            //     APIFactory.getAllMatches(data).then(function(response) {
            //         if (!response.data.catPost.length) {
            //             $scope.canLoadMore = false;
            //         } else {
            //             response.data.catPost.forEach(function(element, index) {
            //                 $scope.upcomingMatch.push(element);
            //             });

            //         }
            //         $scope.$broadcast('scroll.infiniteScrollComplete');
            //     }, function(error) {
            //         console.error(error);
            //     });
            // }

            getTournaments($scope.category);
            getUpcomingMatch();
            $scope.addTournamentDetailTred = function(link, tid, points, tie, uid, index) {
                $scope.addMultipleTrade(link, tid, points, tie, uid, null, $scope.type).then(function(response) {
                    console.log(response.mytradedPoints)
                    if (response.mytradedPoints != null) {
                        var tempArray = response.mytradedPoints;
                        for (var property in tempArray) {
                            if ($scope.upcomingMatch.catPost[index].select_teams[0].team_name.ID == property) {
                                $scope.upcomingMatch.catPost[index].mytradedTotal[$scope.upcomingMatch.catPost[index].select_teams[0].team_name.ID] = response.mytradedPoints[property];
                                $scope.upcomingMatch.catPost[index].mytradedTotal.tourTotal = Number($scope.upcomingMatch.catPost[index].mytradedTotal.tourTotal) + Number(points[$scope.upcomingMatch.catPost[index].select_teams[0].team_name.ID]);
                            }
                            if ($scope.upcomingMatch.catPost[index].select_teams[1].team_name.ID == property) {
                                $scope.upcomingMatch.catPost[index].mytradedTotal[$scope.upcomingMatch.catPost[index].select_teams[1].team_name.ID] = response.mytradedPoints[property];
                                $scope.upcomingMatch.catPost[index].mytradedTotal.tourTotal = Number($scope.upcomingMatch.catPost[index].mytradedTotal.tourTotal) + Number(points[$scope.upcomingMatch.catPost[index].select_teams[1].team_name.ID]);
                            }
                            if (property == 'tie') {
                                $scope.upcomingMatch.catPost[index].mytradedTotal.mytradedTie = response.mytradedPoints['tie'];
                                $scope.upcomingMatch.catPost[index].mytradedTotal.tourTotal = Number($scope.upcomingMatch.catPost[index].mytradedTotal.tourTotal) + Number(tie);
                            }
                        }
                        $scope.upcomingMatch.catPost[index].points = {};
                        $scope.upcomingMatch.catPost[index].tie = '';
                        $scope.$digest;
                    }
                });
            }
        }
    ])
    .controller('ContactCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function($scope, $rootScope, APIFactory, Loader) {
            var userId = $scope.user.ID;
            console.log(userId);
            $scope.sendMail = function(message) {
                var data = 'fname=' + message.fname + '&email=' + message.email + '&phone=' + message.phone + '&message=' + message.message;
                APIFactory.sendContactFrom(data, userId).then(function(response) {
                    Loader.hide();
                    Loader.toast(response.data.msg)
                }, function(error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong, Please try later again');
                });
            }
        }
    ])
    .controller('userProfileCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function($scope, $rootScope, APIFactory, Loader) {
            $scope.getUserAccount = function() {
                var data = {
                    type: 'myAccount',
                    userId: $scope.user.ID
                }
                APIFactory.getUserAccount(data).then(function(response) {
                    $scope.userInfo = response.data;
                    Loader.hide();
                    Loader.toast(response.data.msg)
                }, function(error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong, Please try later again');
                });
            };
            $scope.getUserAccount();
            $scope.updateUser = function(data) {
                Loader.show();
                var userInfo = {
                    pass: data.password,
                    fname: data.firstName[0],
                    lname: data.lastName[0],
                    email: data.userDetails.data.user_email,
                    phone: data.phone[0],
                    userId: $rootScope.user.ID
                };
                APIFactory.updateUser(userInfo).then(function(response) {
                    Loader.hide();
                }, function(error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong. Please try later again');
                });
            }
        }
    ])
    .controller('TradingHistoryCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$cordovaDatePicker',
        function($scope, $rootScope, APIFactory, Loader, $cordovaDatePicker) {
            $scope.pointsHidtory = function() {
                var data = {
                    type: 'myAccount',
                    userId: $scope.user.ID
                }
                APIFactory.getUserAccount(data).then(function(response) {
                    $scope.history = response.data;
                    Loader.hide();
                }, function(error) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong, Please try later again');
                });
            };
            $scope.pointsHidtory();
        }
    ])
    .controller('TrasactionCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader', '$cordovaDatePicker',
        function($scope, $rootScope, APIFactory, Loader, $cordovaDatePicker) {
            $scope.activeState = 'buy'
            $scope.switchTab = function (tab) {
                $scope.activeState = tab;
            }
        }
    ])
    .controller('MyTradesCtrl', ['$scope', '$rootScope', 'APIFactory', 'Loader',
        function($scope, $rootScope, APIFactory, Loader) {
            $scope.itemCount = 0;
            $scope.startDate = '';
            $scope.endDate = '';
            $scope.getTrade = function() {
                Loader.show();
                var data = {
                    type: 'myAccount',
                    userId: $scope.user.ID,
                    startDate: $scope.startDate,
                    endDate: $scope.endDate
                }
                APIFactory.getUserAccount(data).then(function(response) {
                    $scope.trades = response.data.userBets;
                    Loader.hide();
                    // Loader.toast(response.data.msg);
                }, function(error) {
                    Loader.hide();
                    // Loader.toast('Oops! something went wrong, Please try later again');
                });
            };
            $scope.getTrade();
            $scope.canLoadMore = true;
            $scope.loadMoreTrades = function() {
                console.log('load fired')
                $scope.itemCount = $scope.itemCount + 10;
                var data = {
                    type: 'myAccount',
                    userId: $scope.user.ID,
                    getCount: $scope.itemCount,
                    startDate: $scope.startDate,
                    endDate: $scope.endDate
                }
                APIFactory.getUserAccount(data).then(function(response) {
                    console.log(response)
                    var itemArray = response.data.userBets;
                    try {
                        if (!itemArray.length) {
                            $scope.canLoadMore = false;
                        }
                    } catch (e) {
                        $scope.canLoadMore = false;
                    }
                    itemArray.forEach(function(element, index) {
                        $scope.trades.push(element);
                    });
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    Loader.hide();
                    // Loader.toast(response.data.msg);
                }, function(error) {
                    Loader.hide();
                    // Loader.toast('Oops! something went wrong, Please try later again');
                });
            }
            var options = {
                date: new Date(),
                mode: 'date'
            };
            $scope.getstartDate = function() {
                $cordovaDatePicker.show(options).then(function(date) {
                    $scope.startDate = date;
                    console.log(date);
                }, function(error) {
                    console.log(error);
                });
            }
            $scope.getendDate = function() {
                $cordovaDatePicker.show(options).then(function(date) {
                    $scope.endDate = date;
                    console.log(date);
                }, function(error) {
                    console.log(error);
                });
            }
            $scope.getFilteredData = function() {
                $scope.getTrade();
            }
            $scope.clearFiltere = function() {
                $scope.startDate = '';
                $scope.endDate = '';
                $scope.getTrade();
            }
        }
    ])
