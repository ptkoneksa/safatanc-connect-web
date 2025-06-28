// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css", "~/assets/css/animations.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },

  modules: [
    "@nuxt/image",
    "@nuxt/icon",
    "@pinia/nuxt",
    "@formkit/auto-animate/nuxt",
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: "https://connect-core.safatanc.com",
      gsaltApiBaseUrl: "http://localhost:8080",
    },
  },

  nitro: {
    preset: "bun",
  },
});
