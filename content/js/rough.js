/*================   CODE FOR MAKING FORM   ===================*/

ctrl.makeFormData = function (data) {
    data.forEach(item => {
        if (item.options && item.dbType == 'array')
            ctrl.formData[item.name] = []
        else if (item.options && item.dbType == 'object') {
            ctrl.formData[item.name] = {}
            const optionsArr = ctrl.formData[item.name];
            item.options.forEach(option => {
                optionsArr[option.value] = false;
            })
        }
        else if (item.type == 'text' || item.type == 'date' || item.type == 'select' || item.type == 'radio')
            ctrl.formData[item.name] = ''
        else if (item.type == 'number')
            ctrl.formData[item.name] = 0
    })
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
            console.log(ctrl.checkBoxes);
            delete ctrl.checkBoxSubs[option.id]
            if (option.subfield?.name in ctrl.subFields)
                ctrl.subFieldChanged(option.subfield?.name, '', true)
        })
    } else {
        ctrl.formData[field.name] = {}
        const optionsArr = ctrl.formData[field.name];
        field.options.forEach(option => {
            optionsArr[option.value] = false;
            if (option.subfield?.name in ctrl.subFields)
                ctrl.subFieldChanged(option.subfield?.name, '', true)
        })
    }
}


ctrl.listCheckChanged = function (value, option, field) {
    const { listChecks, scores } = ctrl;
    const formDataListChecks = ctrl.formData[field.name]

    if (option.value in listChecks) {
        delete listChecks[option.value];
        scores[field.name] -= option.points
    }
    else {
        listChecks[option.value] = value;
        if (field.name in scores) {
            scores[field.name] = scores[field.name] + option.points
        } else {
            scores[field.name] = option.points;
        }
        formDataListChecks[option.value] = value
        formDataListChecks[field.total] = scores[field.name]
    }
}