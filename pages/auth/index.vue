<script setup lang="ts">
// Redirect to login page with redirect_uri
definePageMeta({
  middleware: (to) => {
    if (to.query.redirect_uri) {
      return navigateTo("/auth/login?redirect_uri=" + to.query.redirect_uri)
    }
    if (to.query.close_on_success) {
      return navigateTo("/auth/login?close_on_success=true")
    }
    return navigateTo("/auth/login")
  }
})
</script>

<template>
  <div>Redirecting...</div>
</template>