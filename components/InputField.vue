<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useField } from 'vee-validate';
import { watch } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  rules: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// Connect to vee-validate
const {
  value,
  errorMessage,
  handleBlur,
  handleChange,
  meta
} = useField(() => props.name, props.rules, {
  validateOnValueUpdate: false,
  initialValue: props.modelValue,
});

// Sync with external model value
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== null && newValue !== value.value) {
    value.value = newValue;
  }
}, { immediate: true });

// Sync internal value changes with v-model
watch(value, (newValue) => {
  emit('update:modelValue', newValue);
});

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const inputValue = target.value;
  handleChange(inputValue);
};

const onBlur = () => {
  handleBlur();
};
</script>

<template>
  <div class="mb-4">
    <label :for="name" class="block text-sm font-medium text-gray-300 mb-1">{{ label }}</label>
    <div class="relative">
      <span v-if="icon" class="absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon :icon="icon" class="text-gray-400" width="20" height="20" />
      </span>
      <input :id="name" :name="name" :type="type" :placeholder="placeholder" :required="required"
        :autocomplete="autocomplete" v-model="value" @blur="onBlur"
        class="bg-dark-3 border border-dark text-white w-full rounded-3xl focus:border-brand focus:bg-dark-3 transition-colors font-normal h-12"
        :class="[
          icon ? 'pl-12 pr-6' : 'px-6',
          'py-3',
          errorMessage ? 'border-red-500' : 'border-dark',
        ]" />
    </div>
    <p v-if="errorMessage" class="mt-1 text-sm text-red-400">{{ errorMessage }}</p>
  </div>
</template>