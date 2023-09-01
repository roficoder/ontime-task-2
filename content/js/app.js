var app = angular.module('myApp', []);

app.controller('DynamicFormController', function ($scope, $http) {
    $scope.formData = {};

    $scope.submitForm = function () {
        // Handle form submission here
        console.log($scope.formData);
    };

    // $http.get('./data.json')
    //     .then(function (response) {
    //         // $scope.data = response.data;
    //         console.log(response.data);
    //     })
    //     .catch(function (error) {
    //         console.error('Error fetching data:', error);
    //     });

    $scope.formDefinition = [
        {
            type: 'date',
            label: 'Visit Date',
            name: 'visit_date',
            required: true,
            errorMsg: 'Please select a specific date'
        },
        {
            type: 'select',
            label: 'Assesment Type',
            name: 'assesment_type',
            required: true,
            errorMsg: 'Please select one of the following assesesment type',

            options: [
                {
                    "title": "Initial Assessment",
                    "value": "initial_assessment"
                },
                {
                    "title": "Re-Assessment",
                    "value": "re_assessment"
                },
                {
                    "title": "PRN",
                    "value": "prn"
                }
            ]
        },
        {
            type: 'radio',
            label: 'Assessment Conducted',
            name: 'assessment_conducted',
            options: [
                { title: 'Field', value: 'field' },
                { title: 'Telephonic', value: 'telephonic' }
            ]
        },
        {
            type: 'checkbox',
            label: 'Covid Screening',
            name: 'covid_screening',
            dbType: 'array',
            required: true,
            errorMsg: 'Covid Screening is required',

            options: [
                { title: 'RN Self screened', value: 'rn_self_screened' },
                { title: 'Completed with Patient', value: 'completed_with_patient' },
                { title: 'Completed With Aide', value: 'completed_with_aide' },
                { title: 'N/A Telephonic', value: 'na_telephonic' },
            ]
        },
        {
            type: 'checkbox',
            label: 'Testing Obj',
            name: 'testing_obj',
            dbType: 'object',
            required: true,
            errorMsg: 'Testing Obj is required',
            options: [
                { title: 'One', key: 'One', value: 'one' },
                { title: 'Two', key: 'Second', value: 'two' },
            ]
        },
    ];

    $scope.formDefinition.forEach(item => {
        if (item.options && item.dbType == 'array')
            $scope.formData[item.name] = []
        else if (item.options && item.dbType == 'object')
            $scope.formData[item.name] = {}
        else if (item.type == 'text' || item.type == 'date' || item.type == 'select')
            $scope.formData[item.name] = ''
        else if (item.type == 'number')
            $scope.formData[item.name] = 0
    })

    $scope.handleCheckboxChange = function (value, type, field, option) {
        const arr = $scope.formData[field];
        console.log(value, field, option);
        if (type == 'array') {
            const index = arr.indexOf(option.value);
            if (index != -1) {
                arr.splice(index, 1);
            } else {
                arr.push(option.value);
            }
        }
        else if (type == 'object') {
            if (option.key in arr) {
                delete arr[option.key]
            } else {
                arr[option.key] = option.value
            }
        }

        console.log(arr);
    }
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
            console.log(scope.obj);
        },

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