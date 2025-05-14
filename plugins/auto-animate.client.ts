// Auto-animate plugin for client-side animation only
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

export default defineNuxtPlugin((nuxtApp) => {
  // Only run on client side - this file is already .client.ts
  nuxtApp.vueApp.use(autoAnimatePlugin);
});
