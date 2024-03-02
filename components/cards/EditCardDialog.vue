<script setup lang="ts">
import CardForm from './CardForm.vue'
import type { CardForm as FormType } from '~/types/models'

interface Card {
    id: number
    question_type: 'classic' | 'media'
    question: string | null
    media: string | null
    notes: string | null
    last_answered_at: string | null
    answer: string
    box: {
        name: string
    } | null
    cards_tags: {
        tags: {
            name: string
        } | null
    }[] | null
}

interface Props {
    card: Card
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'success'): void
}>()

const valueData = defineModel<boolean>()

const deckId = inject<string>('deckId', '')

const formValid = ref(false)
const loading = ref(false)
const form = ref<FormType>({} as FormType)

// Handle preview from media link, check how to update it.

function intializeForm() {
    form.value = {
        question_type: props.card.question_type,
        question: props.card.question_type === 'classic' && props.card.question ? props.card.question : null,
        deck_id: deckId,
        notes: props.card.notes ?? null,
        answer: props.card.answer,
        tags: ['coucou', 'les', 'copains'],
        media: undefined,
    }
}

async function submit() {
    emit('success')
}

watch(valueData, (value) => {
    if (value)
        intializeForm()
}, { immediate: true })
</script>

<template>
    <VDialog
        v-model="valueData"
    >
        <VCard
            prepend-icon="mdi-cards"
            title="Edit card"
        >
            <template #text>
                <p>Deck id : {{ deckId }}</p>
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
                    Update
                </VBtn>
            </template>
        </VCard>
    </VDialog>
</template>
