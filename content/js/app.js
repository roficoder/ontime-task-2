var app = angular.module('myApp', []);

app.controller('DynamicFormController', function ($scope, $http) {
    $scope.formData = {};
    $scope.formDefinition = []

    const url = 'db/data.json'
    $http.get(url)
        .then(function (response) {
            $scope.formDefinition = response.data
            $scope.makeArrData($scope.formDefinition)
        })
        .catch(function (error) {
            console.error('Error fetching JSON data:', error);
        });


    $scope.selectedRadios = {};
    $scope.subFields = {};
    $scope.checkBoxSubs = {};

    $scope.makeArrData = function (data) {

        data.forEach(item => {
            if (item.options && item.dbType == 'array')
                $scope.formData[item.name] = []
            else if (item.options && item.dbType == 'object')
                $scope.formData[item.name] = {}
            else if (item.type == 'text' || item.type == 'date' || item.type == 'select')
                $scope.formData[item.name] = ''
            else if (item.type == 'number')
                $scope.formData[item.name] = 0
        })
    }

    $scope.handleCheckboxChange = function (value, type, field, option) {
        const arr = $scope.formData[field];
        if (type == 'array') {
            const index = arr.indexOf(option.value);
            if (index != -1) {
                arr.splice(index, 1);
            } else {
                arr.push(option.value);
            }
        }
        else if (type == 'object') {
            if (option.value in arr) {
                delete arr[option.value]
            } else {
                arr[option.value] = option.value
            }
        }

        const checkBoxArr = $scope.checkBoxSubs;
        if (option.value in checkBoxArr)
            delete checkBoxArr[option.value];
        else
            $scope.checkBoxSubs[option.value] = value;

        console.log($scope.checkBoxSubs, option);
    }

    $scope.subFieldChanged = function (groupName, value) {
        $scope.subFields[groupName] = value;
        console.log($scope.subFields);
    }

    $scope.checkBoxSubChanged = function (groupName, value) {
        $scope.checkBoxSubs[groupName] = value;
        console.log($scope.checkBoxSubs);
    }


    $scope.radioChanged = function (groupName, value, test) {
        $scope.selectedRadios[groupName] = value;
        console.log($scope.selectedRadios);
    };

    // , type, field, option
    $scope.handleRadioChange = function (value) {
        console.log(value);
    }

    $scope.submitForm = function () {
        const obj = { ...$scope.formData, ...$scope.selectedRadios, ...$scope.subFields }
        console.log(obj);
    };
});


// app.directive('dynamicForm', function () {
//     return {
//         restrict: 'E',
//         templateUrl: 'content/html/form.html',
//         scope: {
//             formDefinition: '=',

//         },
//         link: function (scope) {
//             scope.formData = {};

//             console.log(scope.formDefinition);
//             scope.formDefinition.forEach(item => {
//                 if (item.options && item.dbType == 'array')
//                     scope.formData[item.name] = []
//                 else if (item.options && item.dbType == 'object')
//                     scope.formData[item.name] = {}
//                 else if (item.type == 'text' || item.type == 'date' || item.type == 'select')
//                     scope.formData[item.name] = ''
//                 else if (item.type == 'number')
//                     scope.formData[item.name] = 0
//             })

//             scope.submitForm = function () {
//                 // Handle form submission here
//                 console.log(scope.formData);
//             };
//         },


//     };
// });


app.directive('tick', function () {
    return {
        restrict: 'E',
        template: '<input type="checkbox" ng-model="model" id="{{inputId}}" ng-change="checkboxChanged()"/>',
        scope: {
            obj: '@',
            inputId: '@',
            onCheckboxChange: '&',
        },
        controller: function ($scope) {

            $scope.model;

            $scope.checkboxChanged = function () {
                $scope.onCheckboxChange({ value: $scope.obj });
            };
        },

        link: function (scope) {
            // console.log(scope.obj);
        },

    }

})

app.directive('radio', function () {
    return {
        restrict: 'E',
        template: '<input type="radio" ng-model="model" id="{{inputId}}" name={{name}} ng-change="radioChanged()"/>',
        scope: {
            obj: '@',
            inputId: '@',
            name: '@',
            onRadioChange: '&',
        },

        controller: function ($scope) {
            $scope.model;

            console.log($scope.obj);

            $scope.radioChanged = function () {
                $scope.onRadioChange({ value: $scope.obj });
                console.log("Some");
            };

        }
    }
})

app.filter('isEmpty', function () {
    return function (input) {
        if (angular.isArray(input) || angular.isObject(input)) {
            return Object.keys(input).length === 0;
        }
        return true; // If input is not an array or object, consider it empty
    };
});