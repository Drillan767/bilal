<script setup lang="ts">
import { useForm, useIsFormValid } from 'vee-validate'
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient<Database>()

interface LoginForm {
    email: string
    password: string
}

useHead({
    title: 'Login',
})

definePageMeta({
    layout: false,
})

const { defineField, handleSubmit } = useForm<LoginForm>({
    validationSchema: {
        email: 'email|required',
        password: 'required',
    },
})

const router = useRouter()
const formValid = useIsFormValid()

const loading = ref(false)

const [email, emailProps] = defineField('email', vuetifyConfig)
const [password, passwordProps] = defineField('password', vuetifyConfig)

const submit = handleSubmit(async (form) => {
    loading.value = true

    const { email, password } = form

    await supabase.auth.signInWithPassword({ email, password })

    loading.value = false

    router.push('/')
})
</script>

<template>
    <VRow justify="center" align="center" class="h-screen">
        <VCol
            cols="12"
            md="4"
        >
            <VCard>
                <VCardTitle class="text-center">
                    LOGIN
                </VCardTitle>
                <VCardText>
                    <VTextField
                        v-bind="emailProps"
                        v-model="email"
                        class="mt-4"
                        label="Email"
                    />

                    <VTextField
                        v-bind="passwordProps"
                        v-model="password"
                        class="mt-4"
                        type="password"
                        label="Password"
                    />
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn
                        :disabled="!formValid"
                        @click="submit"
                    >
                        Login
                    </VBtn>
                </VCardActions>
            </VCard>
        </VCol>
    </VRow>
</template>
