import { defineRule, configure } from "vee-validate";
import { required, email, min, confirmed } from "@vee-validate/rules";
import { localize, setLocale } from "@vee-validate/i18n";
import en from "@vee-validate/i18n/dist/locale/en.json";

export default defineNuxtPlugin(() => {
  // Define rules
  defineRule("required", required);
  defineRule("email", email);
  defineRule("min", min);
  defineRule("confirmed", confirmed);

  // Configure
  configure({
    validateOnInput: true,
    validateOnChange: true,
    validateOnBlur: true,
    generateMessage: localize({
      en: {
        ...en,
        messages: {
          ...en.messages,
          required: "This field is required",
          email: "Please enter a valid email address",
          min: "This field must be at least {length} characters",
          confirmed: "The passwords do not match",
        },
      },
    }),
  });

  setLocale("en");
});
