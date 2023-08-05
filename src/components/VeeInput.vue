<template>
  <div>
    <Field
      v-slot="{ componentField, errors }"
      :rules="rules"
      :name="name"
      :label="label"
      :keep-value="true"
      v-model="localMutableValue"
    >
      <b-form-input
        v-bind="mergeProps(componentField, inputAttrsDynamic)"
        ref="input"
        :class="inputClass"
        :style="inputStyle"
        type="text"
        :name="inputName"
      />
      <div v-if="errors.length > 0" :class="errorClass" :style="errorStyle">
        {{ errors[0] }}
      </div>
    </Field>
  </div>
</template>

<script>
import { mergeProps } from 'vue'
import { Field } from 'vee-validate'

export default {
  name: 'VeeInput',
  components: {
    Field
  },
  inheritAttrs: false,
  props: {
    rules: {
      type: [String, Object, Function],
      default: undefined
    },
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: undefined
    },
    inputName: {
      type: String,
      default: undefined
    },
    inputClass: {
      type: String,
      default: undefined
    },
    inputStyle: {
      type: String,
      default: undefined
    },
    modelValue: {
      type: [String, Number, Boolean, Array],
      default: undefined
    },
    errorClass: {
      type: String,
      default: undefined
    },
    errorStyle: {
      type: String,
      default: undefined
    }
  },
  computed: {
    localMutableValue: {
      get() {
        return this.modelValue
      },
      set(newValue) {
        this.$emit('update:modelValue', this.formatValue(newValue))
      }
    },
    inputAttrsDynamic: function () {
      // eslint-disable-next-line no-unused-vars
      const newAttrs = (({
        // eslint-disable-next-line no-unused-vars
        'onUpdate:modelValue': _x,
        // eslint-disable-next-line no-unused-vars
        modelValue,
        // eslint-disable-next-line no-unused-vars
        value,
        // eslint-disable-next-line no-unused-vars
        class: _y,
        // eslint-disable-next-line no-unused-vars
        style,
        // eslint-disable-next-line no-unused-vars
        onInput,
        // eslint-disable-next-line no-unused-vars
        onChange,
        // eslint-disable-next-line no-unused-vars
        onFocus,
        // eslint-disable-next-line no-unused-vars
        onBlur,
        ...o
      }) => o)(this.$attrs)
      if ('onChange' in this.$attrs) {
        newAttrs.onChange = () => {
          this.$nextTick(() => {
            this.$emit('change', this.modelValue)
          })
        }
      }
      newAttrs.onFocus = (event) => this.$emit('focus', event)
      newAttrs.onBlur = (event) => this.$emit('blur', event)

      return newAttrs
    }
  },
  methods: {
    mergeProps,
    formatValue(val) {
      return val.toUpperCase()
    }
  }
}
</script>
