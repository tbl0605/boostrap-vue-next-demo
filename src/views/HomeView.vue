<template>
  <Form class="needs-validation" novalidate @submit.stop.prevent="" v-slot="{ validate }">
    <ul>
      <li>writing "1" (without the quotes) in the input field will work as expected</li>
      <li>writing "a" (without the quotes) in the input field will make b-overlay crash</li>
    </ul>
    <div class="form-row align-items-start">
      <div class="form-group col-8">
        <AsyncVeeInput
          v-model.trim="chooseAlbumNumber"
          :rules="asyncRule"
          name="Album number"
          :async-rule-function="getAsyncData"
          v-model:is-async-rule-resolved="isChooseAlbumNumberAsyncRuleResolved"
          minlength="3"
          maxlength="3"
          required
          placeholder="Choose your album number between 1 and 100"
        />
      </div>
      <div class="form-group col">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!isChooseAlbumNumberAsyncRuleResolved"
          @click.prevent="handleSend(validate)"
        >
          Send
        </button>
      </div>
    </div>

    <div class="form-row">
      <div v-if="albumTitle" class="alert alert-success">Album title: {{ albumTitle }}</div>
    </div>
  </Form>
</template>

<script>
import { Form } from 'vee-validate'
import AsyncVeeInput from '../components/AsyncVeeInput.vue'

const createAsyncQueueData = (value, isValid = true, error = undefined) => ({
  value,
  isValid,
  invalidMessage: isValid ? undefined : error.response?.data || error.message || String(error)
})

const randomInt = (max) => Math.floor(Math.random() * max)
// Manually slow down a fetch request.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  data: () => ({
    // Component data:
    chooseAlbumNumber: '',
    albumTitle: '',
    isChooseAlbumNumberAsyncRuleResolved: true
  }),
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Form,
    AsyncVeeInput
  },
  computed: {
    asyncRule() {
      return {
        required: true
      }
    }
  },
  methods: {
    async getAsyncData(asyncRuleValue) {
      this.albumTitle = ''
      const v = isNaN(+asyncRuleValue) ? asyncRuleValue : +asyncRuleValue
      return delay(randomInt(1000))
        .then(() => fetch(`https://jsonplaceholder.typicode.com/albums/${v}`))
        .then((response) => (response.ok ? response.json() : Promise.reject('Invalid request')))
        .then((response) => {
          console.log('Successful fetch:', response)
          this.albumTitle = response.title
          return createAsyncQueueData(asyncRuleValue)
        })
        .catch(
          // NB: we don't really need to define an error function,
          // the asyncCall rule would handle rejected promises gracefully anyway.
          (error) => {
            console.log('Failed fetch!')
            // By storing the error associated with an album number here,
            // we show the user the same error until he enters another album number.
            return createAsyncQueueData(asyncRuleValue, false, error)
          }
        )
    },
    handleSend(validateFormAsyncFn) {
      if (!this.isChooseAlbumNumberAsyncRuleResolved) return
      validateFormAsyncFn().then(({ valid: isFormValid }) => {
        if (!isFormValid) return
        // Do here whatever you want to do after a successful validation...
        console.log('Successful validation:', this.albumTitle)
      })
    }
  }
}
</script>
