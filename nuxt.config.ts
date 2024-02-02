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
        },
    },
    vuetify: {
        vuetifyOptions: {
            theme: {
                defaultTheme: 'dark',
            },
            defaults: {
                VTextField: {
                    variant: 'outlined',
                    color: 'primary',
                },
                VTextarea: {
                    variant: 'outlined',
                    color: 'primary',
                },
                VSelect: {
                    variant: 'outlined',
                    color: 'primary',
                },
                VFileInput: {
                    variant: 'outlined',
                    color: 'primary',
                },
            },
        },
    },

    build: {
        transpile: ['vue3-toastify'],
    },
})
