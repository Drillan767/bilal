// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        '@vueuse/nuxt',
        'vuetify-nuxt-module',
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
                VCombobox: {
                    variant: 'outlined',
                    color: 'primary',
                },
                VFileInput: {
                    variant: 'outlined',
                    color: 'primary',
                },
                VDialog: {
                    width: 600,
                },
            },
        },
    },

    build: {
        transpile: ['vue3-toastify'],
    },
})
