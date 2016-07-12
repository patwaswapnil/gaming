angular.module('gaming.directives', [])
.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
})
.directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = viewValue != scope.changePwdForm.password.$viewValue
                console.log(noMatch);
                ctrl.$setValidity('noMatch', !noMatch)
            })
        }
    }
})
