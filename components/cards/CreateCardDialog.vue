<script setup lang="ts">
import CardForm from './CardForm.vue'
import type { CardForm as FormType } from '~/types/models'
import useNotifications from '~/composables/notifications'

interface Props {
    deckId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'success'): void
}>()

const initialValues: FormType = {
    deck_id: props.deckId,
    question_type: 'classic',
    question: '',
    answer: '',
    media: undefined,
    notes: '',
    tags: [],
}

const valueData = defineModel<boolean>()
const { displaySuccess } = useNotifications()

const loading = ref(false)
const form = ref<FormType>(initialValues)
const formValid = ref(false)

async function submit() {
    loading.value = true

    const formData = new FormData()
    formData.append('deck_id', props.deckId)
    formData.append('answer', form.value.answer)
    formData.append('notes', form.value.notes)
    formData.append('tags', JSON.stringify(form.value.tags))
    formData.append('question_type', form.value.question_type)

    if (form.value.question_type === 'classic')
        formData.append('question', form.value.question)

    if (form.value.question_type === 'media' && form.value.media)
        formData.append('media', form.value.media[0])

    await useFetch('/api/cards/create', {
        method: 'POST',
        body: formData,
    })

    loading.value = false
    emit('success')
    valueData.value = false
    displaySuccess('Card created successfully')
}

function resetForm() {
    form.value = Object.assign({}, initialValues)
}

watch(valueData, () => resetForm())
</script>

<template>
    <VDialog
        v-model="valueData"
    >
        <VCard
            prepend-icon="mdi-cards"
            title="Create a card"
        >
            <template #text>
                <CardForm
                    v-model:form="form"
                    v-model:formValid="formValid"
                    :loading="loading"
                />
            </template>
            <template #actions>
                <VSpacer />
                <VBtn
                    :disabled="loading"
                    @click="valueData = false"
                >
                    Cancel
                </VBtn>
                <VBtn
                    :disabled="!formValid || loading"
                    :loading="loading"
                    color="primary"
                    prepend-icon="mdi-content-save"
                    @click="submit"
                >
                    Save
                </VBtn>
                <VBtn
                    :disabled="!formValid || loading"
                    :loading="loading"
                    color="primary"
                    prepend-icon="mdi-content-save-plus"
                >
                    Save and add
                </VBtn>
            </template>
        </VCard>
    </VDialog>
</template>
