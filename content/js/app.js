var app = angular.module('myApp', []);



app.controller('DynamicFormController', function ($http, $sce, $window, $timeout) {
    'use strict';

    var ctrl = this;

    ctrl.resetForm = function () {
        $rootScope.isFormDirty = false;
        ctrl.getFormDataCall()
    };

    ctrl.formData = {};
    ctrl.formDefinition = []
    ctrl.selectedRadios = {};
    ctrl.subFields = {}; // Responsible for sending data in FormData
    ctrl.checkBoxSubs = {}; // Keeps track of showing subfields
    ctrl.checkBoxes = {}
    ctrl.showSibs = {};
    ctrl.oneSelectors = {}
    ctrl.listChecks = {}
    ctrl.previousRadio = {}
    ctrl.previousChecks = {}
    ctrl.fieldDetailsObj = {}
    ctrl.errorFlag = false

    const url = 'db/data2.json'

    $http.get(url)
        .then(function (response) {
            ctrl.formDefinition = response.data
            makeFormData(ctrl.formDefinition)
        })
        .catch(function (error) {
            console.error('Error fetching JSON data:', error);
        });


    function makeFormData(data) {
        data.forEach(item => {
            switch (item.type) {
                case 'text':
                case 'date':
                case 'select':
                    ctrl.formData[item.name] = '';
                    break;
                case 'number':
                    ctrl.formData[item.name] = 0;
                    break;
                case 'radiocheck':
                    selectRadios(item)
                default:
                    // ctrl.formData[item.name] = '';
                    break;
            }
        });
    };

    function selectRadios(field) {
        if (field.subtype == 'radio') {
            ctrl.formData[field.name] = ''
            const selected = field.options.find(option => option.selected);
            if (selected)
                ctrl.selectedRadios[field.name] = selected.value
        }
        if (field.subtype == 'checkbox') {
            if (field.dbType === 'array') {
                ctrl.formData[field.name] = [];
                return
            }
            ctrl.formData[field.name] = {};
            field.options.forEach(option => {
                ctrl.formData[field.name][option.value] = false;
            });
        }
    }

    ctrl.sanitizeHtml = function (htmlContent) {
        return $sce.trustAsHtml(htmlContent);
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

    ctrl.handleCheckboxChange = function (value, type, fieldName, option) {

        /*================   SETTING CHECKBOX ARRAY OR OBJECT IN FORMDATA   ===================*/
        const arr = ctrl.formData[fieldName];
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
        if (value) {
            ctrl.formData[field.name] = { [id]: true }
            field.options.forEach(option => {
                ctrl.checkBoxes[option.id] = false
                if (option.id in ctrl.checkBoxSubs)
                    ctrl.showSubField(option)
                // delete ctrl.checkBoxSubs[option.id]
                // if (option.subfield?.name in ctrl.subFields)
                //     ctrl.subFieldChanged(option.subfield?.name, '', true)
            })
        } else {
            ctrl.formData[field.name] = {}
            const optionsArr = ctrl.formData[field.name];
            field.options.forEach(option => {
                optionsArr[option.value] = false;
                // if (option.subfield?.name in ctrl.subFields)
                //     ctrl.subFieldChanged(option.subfield?.name, '', true)
            })
        }
    }

    /*================   SUB FIELDS CODE   ===================*/
    ctrl.showSubField = function (option) {
        const subFields = ctrl.subFields;
        const checkBoxSubsArr = ctrl.checkBoxSubs;
        if (option.id in checkBoxSubsArr) {
            delete checkBoxSubsArr[option.id];
            // if (option.subfield?.name in subFields)
            ctrl.subFieldChanged(option.subfield?.name, '', true)
        }
        else {
            checkBoxSubsArr[option.id] = option.id;
            ctrl.subFieldChanged(option.subfield?.name)
        }
    }

    ctrl.subFieldChanged = function (subfieldName, value, check) {
        const subFields = ctrl.subFields;
        if (subfieldName in subFields && check)
            delete subFields[subfieldName]
        else
            subFields[subfieldName] = value ? value : '';
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
        console.log("Testing");
        ctrl.errorFlag = true;
        const errorDv = $window.document.querySelector('.error-div')
        if (errorDv) {
            $timeout(function () {
                $window.scrollTo(0, errorDv.offsetTop - 120);
            });
        }

        const obj = { ...ctrl.formData, ...ctrl.selectedRadios, ...ctrl.subFields }
        console.log({
            "formData": ctrl.formData,
            "selectedRadios": ctrl.selectedRadios,
            "subFields": ctrl.subFields
        });

        console.log(obj);
    };

    // document.body.addEventListener('click', () => {
    //     console.clear()
    //     ctrl.submitForm()
    // })
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


app.filter('isEmptyOrAllFalse', function () {
    return function (input) {
        if (angular.isArray(input)) {
            return input.length === 0;
        } else if (angular.isObject(input)) {
            return Object.values(input).every(function (value) {
                return value === false;
            });
        }
        return false;
    };
});


ctrl.listRadioChanged = function (field, option, selectOption) {
    const listField = ctrl.formData[field.name];
    listField[option.value] = selectOption.value
}