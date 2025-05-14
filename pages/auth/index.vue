<script setup lang="ts">
// Redirect to login page
definePageMeta({
  middleware: (to) => {
    return navigateTo('/auth/login')
  }
})
</script>

<template>
  <div>Redirecting...</div>
</template>