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
    $scope.checkBoxes = {}
    $scope.showSibs = {};
    $scope.oneSelectors = {}
    $scope.listChecks = {}
    $scope.scores = {}
    $scope.previousRadio = {}


    /*================   MAKE FORMDATA   ===================*/
    $scope.makeArrData = function (data) {
        data.forEach(item => {
            if (item.options && item.dbType == 'array')
                $scope.formData[item.name] = []
            else if (item.options && item.dbType == 'object') {
                $scope.formData[item.name] = {}
                const optionsArr = $scope.formData[item.name];
                item.options.forEach(option => {
                    optionsArr[option.value] = false;
                })
            }
            else if (item.type == 'text' || item.type == 'date' || item.type == 'select' || item.type == 'radio')
                $scope.formData[item.name] = ''
            else if (item.type == 'number')
                $scope.formData[item.name] = 0
        })
    }

    $scope.listCheckChanged = function (check, points, id, field) {
        const listChecks = $scope.listChecks;
        const scores = $scope.scores;


        if (id in listChecks) {
            delete listChecks[id];
            scores[field] = scores[field] - points
        }
        else {
            listChecks[id] = check;
            if (field in scores) {
                scores[field] = scores[field] + points
            } else {
                scores[field] = points;
            }
        }
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
            // if (option.value in arr) {
            //     delete arr[option.value]
            // } else {
            arr[option.value] = value
            // }
        }


        const checkBoxArr = $scope.checkBoxes;
        if (option.id in checkBoxArr)
            delete checkBoxArr[option.id];
        else
            checkBoxArr[option.id] = option.id;

        const checkBoxSubsArr = $scope.checkBoxSubs;
        if (option.id in checkBoxSubsArr)
            delete checkBoxSubsArr[option.id];
        else
            checkBoxSubsArr[option.id] = option.id;

        const showSibs = $scope.showSibs;
        if (option.siblings) {
            const sibs = option.siblings.split(',');
            sibs.forEach(sib => {
                if (sib in showSibs)
                    delete showSibs[sib];
                else
                    $scope.showSibs[sib] = sib;
            })

        }
    }


    $scope.oneSelectorChanged = function (groupName, value, options) {
        $scope.oneSelectors[groupName] = value;
        // console.log(options, $scope.oneSelectors);
        // if ($scope.oneSelectors[groupName]) {

        //     options.forEach((option => {
        //         option['disabled'] = true
        //     }))
        // } else {
        //     options.forEach((option => {
        //         option['disabled'] = false
        //     }))
        // }
    }

    $scope.subFieldChanged = function (groupName, value) {
        const subFields = $scope.subFields;
        if (groupName in subFields)
            delete subFields[groupName]
        else
            subFields[groupName] = value ? value : '';

        // if (groupName in showSibs)
        //     delete showSibs[groupName];
        // else
        //     showSibs[groupName] = value ? value : '';

        // console.log(showSibs);
    }

    $scope.checkBoxSubChanged = function (groupName, value) {
        $scope.checkBoxSubs[groupName] = value;
        // console.log($scope.checkBoxSubs);
    }

    $scope.subFieldRemover = function (subfieldsArr) {
        // const index of 
    }

    $scope.radioChanged = function (fieldName, option) {
        const previousRadio = $scope.previousRadio;
        if (option.subfield) {
            $scope.subFieldChanged(option.subfield.name)
            previousRadio[fieldName] = option.subfield.name
        } else
            $scope.subFieldChanged(previousRadio[fieldName])
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



app.directive('tick', function () {
    return {
        restrict: 'E',
        template: '<input type="checkbox" ng-model="model" id="{{inputId}}" ng-disabled="disabled" ng-change="checkboxChanged()"/>',
        scope: {
            obj: '@',
            inputId: '@',
            doDisable: '@',
            onCheckboxChange: '&',
        },
        controller: function ($scope) {
            $scope.disabled = false;
            $scope.model = false;

            $scope.checkboxChanged = function (event) {
                console.log($scope.model);
                $scope.onCheckboxChange({ value: $scope.model });
                // console.log($scope.disabled);
            };
        },

        link: function (scope) {
            scope.$watch('doDisable', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    scope.disabled = scope.$eval(newVal);
                }
            });
        }

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