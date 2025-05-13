<script setup lang="ts">

defineProps({
  bg: {
    type: String,
    default: 'bg-brand',
  },
  color: {
    type: String,
    default: 'text-black',
  },
})

const emit = defineEmits(["click"])
</script>

<template>
  <button @click="emit(`click`)"
    :class="`px-6 py-3 rounded-3xl text-nowrap font-semibold hover:bg-opacity-70 hover:shadow-2xl transition duration-200 cursor-pointer ${bg} ${color}`">
    <div class="flex items-center gap-2 w-max mx-auto">
      <slot name="icon"></slot>
      <slot name="text"></slot>
    </div>
  </button>
</template>