import { createApp, markRaw } from 'vue'
import App from './App.vue'
import { configure, defineRule } from 'vee-validate'
import * as AllRules from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import en from '@vee-validate/i18n/dist/locale/en.json'
import { createBootstrap } from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import router from './router'

localize({ en })

configure({
  generateMessage: localize('en'),
  validateOnBlur: true, // controls if `blur` events should trigger validation with `handleChange` handler
  validateOnChange: true, // controls if `change` events should trigger validation with `handleChange` handler
  validateOnInput: false, // controls if `input` events should trigger validation with `handleChange` handler
  validateOnModelUpdate: true // controls if `update:modelValue` events should trigger validation with `handleChange` handler
})

// import all known VeeValidate rules
Object.keys(AllRules).forEach((rule) => {
  defineRule(rule, AllRules[rule])
})

defineRule('asyncCall', async (value, [asyncFn, asyncQueue, defaultMessage]) => {
  if (!asyncFn) {
    return true
  }
  if (value == null) {
    if (defaultMessage) {
      return String(defaultMessage)
    }
    return false
  }
  var response = asyncQueue?.$lastResponse
  if (value !== response?.value) {
    const wrapperFn = () =>
      asyncQueue?.$queue
        ? asyncQueue.$queue.add(() => {
            if (value === asyncQueue.$lastResponse?.value) {
              return asyncQueue.$lastResponse
            }
            return asyncFn(value).then(
              (_response) => (asyncQueue.$lastResponse = markRaw({ ..._response })),
              (error) =>
                (asyncQueue.$lastResponse = markRaw({
                  value: undefined,
                  isValid: false,
                  invalidMessage: error.response?.data || error.message || String(error)
                }))
            )
          })
        : asyncFn(value).catch((error) => ({
            value: undefined,
            isValid: false,
            invalidMessage: error.response?.data || error.message || String(error)
          }))
    response = await wrapperFn()
  }
  const { isValid, invalidMessage: customMessage } = response
  if (isValid) {
    return true
  }
  if (customMessage) {
    return String(customMessage)
  }
  if (defaultMessage) {
    return String(defaultMessage)
  }
  return false
})

const app = createApp(App)

app.use(createBootstrap({ components: true, directives: true }))
app.use(router)

app.mount('#app')
