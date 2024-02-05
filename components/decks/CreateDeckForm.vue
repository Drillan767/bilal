<script setup lang="ts">
import { toast } from 'vue3-toastify'
import type { Database } from '~/types/supabase'

const emit = defineEmits<{
    (e: 'success'): void
}>()

const valueData = defineModel<boolean>()

const supabase = useSupabaseClient<Database>()

const { defineField, handleSubmit, resetForm } = useForm<{ name: string }>({
    validationSchema: {
        name: 'required',
    },
})

const loading = ref(false)
const [name, nameProps] = defineField('name', vuetifyConfig)

const submit = handleSubmit(async (value) => {
    loading.value = true

    await supabase
        .from('decks')
        .insert({ name: value.name })

    toast.success('Deck successfully created')
    emit('success')
    resetForm()
    valueData.value = false
})
</script>

<template>
    <VDialog
        v-model="valueData"
        width="600"
        persitent
    >
        <VCard
            title="New deck"
            prepend-icon="mdi-cards"
        >
            <template #text>
                <VTextField
                    v-bind="nameProps"
                    v-model="name"
                    class="mt-4"
                    label="Deck name"
                />
            </template>
            <template #actions>
                <VSpacer />
                <VBtn
                    @click="valueData = false"
                >
                    Cancel
                </VBtn>
                <VBtn
                    color="primary"
                    prepend-icon="mdi-content-save"
                    @click="submit"
                >
                    Save
                </VBtn>
            </template>
        </VCard>
    </VDialog>
</template>
