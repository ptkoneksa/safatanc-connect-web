<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <main class="min-h-screen">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-16 border-t border-dark">
      <div class="container mx-auto px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Company Info -->
          <div>
            <NuxtImg src="/images/stech_logo_gradient.png" alt="Safatanc"
              class="h-12 w-auto aspect-video object-cover mb-4" />
            <p class="text-gray-400 text-sm mt-4">The central platform for Safatanc Group's users to manage their
              accounts and access all services.</p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="mb-4 font-semibold">Quick Links</h4>
            <ul class="space-y-2 text-gray-400">
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">My Account</NuxtLink>
              </li>
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">GSalt Management</NuxtLink>
              </li>
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">Safatanc Services</NuxtLink>
              </li>
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">Help Center</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="mb-4 font-semibold">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">Privacy Policy</NuxtLink>
              </li>
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">Terms of Use</NuxtLink>
              </li>
              <li>
                <NuxtLink to="#" class="hover:text-brand transition-colors duration-200">Security Information</NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-dark mt-8 pt-8 text-center text-sm text-gray-400">
          <NuxtLink to="https://www.safatanc.com" target="_blank"
            class="hover:text-brand transition-colors duration-200">
            © PT SAFATANC TECHNOLOGY DIGITAL {{ currentYear }}
          </NuxtLink>
          <p class="mt-2">All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>