// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@vueuse/nuxt',
    'vuetify-nuxt-module',
    'nuxt-tiptap-editor',
    '@nuxtjs/supabase',
    'dayjs-nuxt',
    '@vee-validate/nuxt',
  ],
  
  app: {
    head: {
        htmlAttrs: {
            lang: 'en',
        },
        titleTemplate: '%s | Bilal',
    }
  }
})
