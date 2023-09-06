const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Validator(options) {
  const selectorRules = {};

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  // Validate all form
  function validate(inputElement, rule) {
    let errorMessage;
    const errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);

    var rules = selectorRules[rule.selector];

    // Check if user violate the rules
    for (var i = 0; i < rules.length; ++i) {
      switch (formElement.querySelector(rule.selector).type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errorMessage;
  }

  // Get form element
  const formElement = $(options.form);

  // Handle all form rules
  if (formElement) {
    // Check when form is submitted
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      options.rules.forEach(function (rule) {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);

        if (!isValid) isFormValid = false;
      });

      if (isFormValid) {
        const enableInputs = formElement.querySelectorAll(
          "[name]:not([disable])"
        );

        const formValues = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "checkbox":
              if (Array.isArray(values[input.name])) {
                if (input.matches(":checked"))
                  values[input.name].push(input.value);
              } else {
                if (input.matches(":checked"))
                  values[input.name] = [input.value];
              }
              break;
            case "radio":
              if (input.matches(":checked")) values[input.name] = input.value;
              break;
            case "file":
              values[input.name] = input.files;
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        },
        {});

        if (typeof options.onSubmit === "function") {
          options.onSubmit(formValues);
        }
      }
    };

    options.rules.forEach(function (rule) {
      // Add rules to array if form has more than 1 rule
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElements = formElement.querySelectorAll(rule.selector);

      // Handle all form events (Blur, input,..)
      Array.from(inputElements).forEach(function (inputElement) {
        // Handle form blur event
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // Handle form input event
        inputElement.oninput = function () {
          const errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      });
    });
  }
}

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      const regrex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
      return regrex.test(value)
        ? undefined
        : message || "Vui lòng nhập gmail hợp lệ";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length > min
        ? undefined
        : message || `Mật khẩu tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isSimilar = function (selector, confirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === confirmValue()
        ? undefined
        : message || "Mật khẩu không trùng khớp";
    },
  };
};

Validator.onSubmit = function () {};

Validator({
  form: "#form-1",
  errorSelector: ".form-message",
  formGroupSelector: ".form-group",
  rules: [
    Validator.isRequired("#fullname"),
    Validator.isRequired("#email"),
    Validator.isEmail("#email"),
    Validator.minLength("#password", 6),
    Validator.isRequired("#password_confirmation"),
    Validator.isRequired("input[name='gender']"),
    Validator.isSimilar(
      "#password_confirmation",
      function () {
        return $("#form-1 #password").value;
      },
      "Vui lòng nhập lại"
    ),
  ],
  onSubmit: function (data) {
    console.log(data);
  },
});
