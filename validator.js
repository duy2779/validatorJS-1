function Validator(options) {

    const selectorRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    function validate(inputElement, rule) {
        const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        let errorMessage;

        const rules = selectorRules[rule.selector];

        for (let i in rules) {

            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }

            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            removeErrorMessage(inputElement)
        }

        return !errorMessage
    }

    function removeErrorMessage(inputElement) {
        const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        errorElement.innerText = ''
        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
    }
    // get form that need to validate
    const formElement = document.querySelector(options.form)
    if (formElement) {
        // Handle form submit
        formElement.onsubmit = (e) => {
            e.preventDefault()

            let isFormValid = true;

            // Validate all rules
            options.rules.forEach(rule => {
                const inputElement = formElement.querySelector(rule.selector)

                const isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            })
            // get values
            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {

                    let enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    const formValues = Array.from(enableInputs).reduce((values, input) => {

                        switch (input.type) {
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'radio':
                                values[input.name] = formElement.querySelector(`input[name="${input.name}"]:checked`)?.value || ''
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }

                        return values
                    }, {})

                    options.onSubmit(formValues)
                }
            }
        }

        options.rules.forEach(rule => {
            // save rules for each input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            const inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(inputElement => {
                if (inputElement) {
                    // Handle When onblur input 
                    inputElement.onblur = () => {
                        validate(inputElement, rule);
                    }

                    // Handle when oninput input
                    inputElement.oninput = () => {
                        removeErrorMessage(inputElement)
                    }
                }
            })

        });
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector,
        test(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector,
        test(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là Email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : message || 'Vui lòng nhập tối thiểu ' + min + ' kí tự'
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector,
        test(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}