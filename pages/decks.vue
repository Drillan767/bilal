<script setup lang="ts">
import CreateDeckForm from '~/components/decks/CreateDeckForm.vue'
import type { Database } from '~/types/supabase'
import type { Deck } from '~/types/models'

type DeckType = Deck & {
    cards: {
        id: number
    }[]
}

useHead({
    title: 'Decks',
})

const supabase = useSupabaseClient<Database>()

const items = [
    {
        title: 'Home',
        to: '/',
    },
    {
        title: 'Decks',
        disabled: true,
    },
]

const loading = ref(false)
const showCreateDeckDialog = ref(false)
const decks = ref<DeckType[]>([])

function createDeck() {
    showCreateDeckDialog.value = true
}

async function fetchDecks() {
    loading.value = true

    const { data } = await supabase
        .from('decks')
        .select('id, name, cards(id)')

    if (data)
        decks.value = data

    loading.value = false
}

onMounted(() => fetchDecks())
</script>

<template>
    <VRow>
        <VBreadcrumbs :items="items">
            <template #divider>
                <VIcon icon="mdi-chevron-right" />
            </template>
        </VBreadcrumbs>
    </VRow>
    <VRow>
        <VCol>
            <VRow>
                <VCol>
                    <h1>
                        Decks
                    </h1>
                </VCol>
                <VCol class="d-flex align-center justify-end">
                    <VBtn
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="createDeck"
                    >
                        New deck
                    </VBtn>
                </VCol>
            </VRow>
            <VRow>
                <VCol>
                    <VCard
                        :loading="loading"
                        variant="tonal"
                    >
                        <template #text>
                            <VContainer>
                                <VRow>
                                    <VCol
                                        v-for="(deck, i) in decks"
                                        :key="i"
                                        cols="2"
                                    >
                                        <VCard
                                            :title="deck.name"
                                            :to="`/deck/${deck.id}`"
                                            prepend-icon="mdi-cards"
                                            elevation="4"
                                        >
                                            <template #text>
                                                Number of cards: {{ deck.cards.length }}
                                            </template>
                                        </VCard>
                                    </VCol>
                                </VRow>
                            </VContainer>
                        </template>
                    </VCard>
                </VCol>
            </VRow>
        </VCol>
    </VRow>
    <CreateDeckForm
        v-model="showCreateDeckDialog"
        @success="fetchDecks()"
    />
</template>
