var app = angular.module('myApp', []);



app.controller('DynamicFormController', function ($http) {
    'use strict';

    var ctrl = this;

    ctrl.formData = {};
    ctrl.formDefinition = []
    ctrl.selectedRadios = {};
    ctrl.subFields = {};
    ctrl.checkBoxSubs = {};
    ctrl.checkBoxes = {}
    ctrl.showSibs = {};
    ctrl.oneSelectors = {}
    ctrl.listChecks = {}
    ctrl.previousRadio = {}
    ctrl.previousChecks = {}

    const url = 'db/data.json'

    $http.get(url)
        .then(function (response) {
            ctrl.formDefinition = response.data
            ctrl.makeFormData(ctrl.formDefinition)
        })
        .catch(function (error) {
            console.error('Error fetching JSON data:', error);
        });


    ctrl.makeFormData = function (data) {
        data.forEach(item => {
            switch (item.dbType || item.type) {
                case 'array':
                    ctrl.formData[item.name] = [];
                    break;
                case 'object':
                    ctrl.formData[item.name] = {};
                    item.options.forEach(option => {
                        ctrl.formData[item.name][option.value] = false;
                    });
                    break;
                case 'text':
                case 'date':
                case 'select':
                case 'radio':
                    ctrl.formData[item.name] = '';
                    break;
                case 'number':
                    ctrl.formData[item.name] = 0;
                    break;
                default:
                    break;
            }
        });
    };

    ctrl.listCheckChanged = function (value, option, field) {
        const { listChecks } = ctrl;
        const formDataListChecks = ctrl.formData[field.name];

        if (option.value in listChecks) {
            delete listChecks[option.value];
            formDataListChecks[field.total] -= option.points;
        } else {
            listChecks[option.value] = value;
            formDataListChecks[field.total] = (formDataListChecks[field.total] || 0) + option.points;
        }

        formDataListChecks[option.value] = value;
    };


    ctrl.groupCaller = function (members, values) {
        console.log(members, values);
        const selectedRadios = ctrl.selectedRadios;
        members.forEach((member, index) => {
            selectedRadios[member] = values[index]
        })

        console.log(selectedRadios);

    }

    ctrl.handleCheckboxChange = function (value, type, field, option) {

        /*================   SETTING CHECKBOX ARRAY OR OBJECT IN FORMDATA   ===================*/
        const arr = ctrl.formData[field];
        if (type == 'array') {
            const index = arr.indexOf(option.value);
            if (index != -1) {
                arr.splice(index, 1);
            } else {
                arr.push(option.value);
            }
        }
        else if (type == 'object') {
            arr[option.value] = value
        }

        /*================   SHOWING SIBLINGS   ===================*/
        const showSibs = ctrl.showSibs;
        if (option.siblings) {
            const sibs = option.siblings.split(',');
            sibs.forEach(sib => {
                if (sib in showSibs)
                    delete showSibs[sib];
                else
                    ctrl.showSibs[sib] = sib;
            })
        }

        // console.log(ctrl.checkBoxSubs);
    }




    ctrl.oneSelectorChanged = function (id, value, field) {
        ctrl.oneSelectors[field.name] = true;
        let arr;
        if (value) {
            arr = {}
            arr[id] = true
            ctrl.formData[field.name] = arr
            field.options.forEach(option => {
                ctrl.checkBoxes[option.id] = false
                delete ctrl.checkBoxSubs[option.id]
                if (option.subfield?.name in ctrl.subFields)
                    ctrl.subFieldChanged(option.subfield?.name, '', true)
            })
        } else {
            // checkBox = {};
            ctrl.formData[field.name] = {}
            const optionsArr = ctrl.formData[field.name];
            field.options.forEach(option => {
                optionsArr[option.value] = false;
                if (option.subfield?.name in ctrl.subFields)
                    ctrl.subFieldChanged(option.subfield?.name, '', true)
            })
        }
    }

    /*================   SUB FIELDS CODE   ===================*/
    ctrl.showSubField = function (option) {
        const subFields = ctrl.subFields;
        const checkBoxSubsArr = ctrl.checkBoxSubs;
        if (option.id in checkBoxSubsArr) {
            delete checkBoxSubsArr[option.id];
            if (option.subfield?.name in subFields)
                ctrl.subFieldChanged(option.subfield?.name, '', true)
        }
        else {
            checkBoxSubsArr[option.id] = option.id;
            ctrl.subFieldChanged(option.subfield?.name)
        }
        console.log(ctrl.checkBoxSubsArr);

    }

    ctrl.subFieldChanged = function (groupName, value, check) {
        const subFields = ctrl.subFields;
        if (groupName in subFields && check)
            delete subFields[groupName]
        else
            subFields[groupName] = value ? value : '';

        // console.log(subFields);
    }

    ctrl.checkBoxSubChanged = function (groupName, value) {
        ctrl.checkBoxSubs[groupName] = value;
        // console.log(ctrl.checkBoxSubs);
    }

    ctrl.subFieldRemover = function (subfieldsArr) {
        // const index of 
    }

    ctrl.radioChanged = function (fieldName, option, value) {

        console.log(value);

        const previousRadio = ctrl.previousRadio;
        const radioFields = ctrl.selectedRadios;

        // if (fieldName in radioFields) {
        //     delete radioFields[fieldName];
        //     ctrl.subFieldChanged(previousRadio[fieldName], '', true)
        // } else {
        //     radioFields[fieldName] = value
        //     if (option.subfield) {
        //         ctrl.subFieldChanged(option.subfield.name)
        //         previousRadio[fieldName] = option.subfield.name
        //     }
        // }

        if (option.subfield) {
            ctrl.subFieldChanged(option.subfield?.name)
            previousRadio[fieldName] = option.subfield?.name
        } else {
            ctrl.subFieldChanged(previousRadio[fieldName], '', true)
        }

    };

    // , type, field, option
    ctrl.handleRadioChange = function (value) {
        console.log(value);
    }

    ctrl.submitForm = function () {
        const obj = { ...ctrl.formData, ...ctrl.selectedRadios, ...ctrl.subFields }
        console.log(obj);
    };

    document.body.addEventListener('click', () => {
        console.clear()
        ctrl.submitForm()
    })
});



app.directive('tick', function () {
    return {
        restrict: 'E',
        template: '<input type="checkbox" ng-model="model" ng-checked="checked" id="{{inputId}}" ng-disabled="disabled" ng-change="checkboxChanged()"/>',
        scope: {
            obj: '@',
            inputId: '@',
            doDisable: '@',
            checked: '@',
            onCheckboxChange: '&',
        },
        controller: function (ctrl) {
            ctrl.disabled = false;
            ctrl.model = false;

            ctrl.checkboxChanged = function (event) {
                console.log(ctrl.model);
                ctrl.onCheckboxChange({ value: ctrl.model });
                // console.log(ctrl.disabled);
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

        controller: function (ctrl) {
            ctrl.model;

            console.log(ctrl.obj);

            ctrl.radioChanged = function () {
                ctrl.onRadioChange({ value: ctrl.obj });
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