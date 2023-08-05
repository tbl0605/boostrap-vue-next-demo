<template>
  <div>
    <b-overlay :show="!!showOverlay" opacity="0.6" :no-fade="true">
      <component
        v-bind="$attrs"
        ref="input"
        :is="inputTag"
        :rules="currentRules"
        :disabled="!!$attrs['disabled'] || !!showOverlay"
        ><template v-for="(_, name) in $slots" v-slot:[name]="slotData"
          ><slot :name="name" v-bind="slotData" /></template
      ></component>
    </b-overlay>
  </div>
</template>

<script>
import PQueue from 'p-queue'
import isString from 'lodash/isString'
import { normalizeRules } from 'vee-validate'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import VeeInput from './VeeInput.vue'
import { markRaw } from 'vue'

const initialStateFn = () => ({
  showOverlay: false,
  asyncQueue: {
    $lastResponse: markRaw({
      value: undefined,
      isValid: false,
      invalidMessage: undefined
    }),
    $queue: markRaw(new PQueue({ concurrency: 1 }))
  }
})

function isTrueObject(valeur) {
  return isPlainObject(valeur) && !isArray(valeur)
}

export default {
  name: 'AsyncVeeInput',
  inheritAttrs: false,
  props: {
    inputTag: {
      type: String,
      default: 'VeeInput'
    },
    rules: {
      type: [String, Object],
      default: undefined
    },
    asyncRuleFunction: {
      type: Function,
      required: true
    },
    isAsyncRuleResolved: {
      type: Boolean,
      default: undefined
    }
  },
  data: initialStateFn,
  components: {
    VeeInput
  },
  computed: {
    normalizedRules() {
      return isString(this.rules) ? normalizeRules(this.rules) : this.rules || {}
    },
    currentRules() {
      return {
        ...this.normalizedRules,
        asyncCall: [this.wrapperAsyncRuleFunction, this.asyncQueue]
      }
    }
  },
  methods: {
    wrapperAsyncRuleFunction(value) {
      this.showOverlay = true
      this.$emit('update:is-async-rule-resolved', false)
      return new Promise((resolve) => {
        resolve(this.asyncRuleFunction(value))
      })
        .then((response) => {
          if (
            !isTrueObject(response) ||
            !('value' in response) ||
            !('isValid' in response) ||
            !('invalidMessage' in response)
          ) {
            throw new Error(
              'AsyncVeeInput::asyncRuleFunction() : the response is invalid (the value, isValid and/or invalidMessage properties are missing)!'
            )
          }
          return response
        })
        .then(
          (response) => {
            this.showOverlay = false
            this.$emit('update:is-async-rule-resolved', true)
            return response
          },
          (error) => {
            this.showOverlay = false
            this.$emit('update:is-async-rule-resolved', true)
            return Promise.reject(error)
          }
        )
    }
  }
}
</script>
