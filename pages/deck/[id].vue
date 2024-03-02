<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import type { Database } from '~/types/supabase'
import type { Deck } from '~/types/models'
import useNotification from '~/composables/notifications'
import CreateCardDialog from '~/components/cards/CreateCardDialog.vue'
import CardDetail from '~/components/decks/CardDetail.vue'

interface Card {
    id: number
    question_type: 'classic' | 'media'
    question: string | null
    media: string | null
    notes: string | null
    answer: string
    last_answered_at: string | null
    box: {
        name: string
    } | null
    cards_tags: {
        tags: {
            name: string
        } | null
    }[]
}

type DeckContent = Deck & {
    cards: Card[]
}

const router = useRouter()
const supabase = useSupabaseClient<Database>()
const { displayError, displaySuccess } = useNotification()

const deckId = useRouteParams('id', null, { transform: String })

const deck = ref<DeckContent>({} as DeckContent)
const loading = ref(false)
const showEditDeckDialog = ref(false)
const showDeleteDeckDialog = ref(false)
const showCreateCardDialog = ref(false)
const search = ref<string>()

const { defineField, handleSubmit, resetForm, setValues } = useForm<{ name: string }>({
    validationSchema: {
        name: 'required',
    },
})

const [name, nameProps] = defineField('name', vuetifyConfig)

useHead({
    title: () => deck.value.name,
})

const items = computed(() => ([
    {
        title: 'Home',
        to: '/',
    },
    {
        title: 'Decks',
        to: '/decks',
    },
    {
        title: deck.value.name,
        disabled: true,
    },
]))

async function fetchDeck() {
    loading.value = true

    const { data, error } = await supabase
        .from('decks')
        .select(`
            id,
            name,
            cards(
                id,
                question,
                question_type,
                media,
                notes,
                answer,
                last_answered_at,
                cards_tags(tags(name)),
                box:boxes(name)
            )
        `)
        .eq('id', deckId.value)
        .not('cards.box', 'is', 'NULL')
        .not('cards.cards_tags.tags', 'is', 'NULL')
        .single()

    if (data)
        deck.value = data

    if (error) {
        router.push('/decks')
            .then(() => displayError('Could not find the deck'))
    }

    loading.value = false
}

function editDeck() {
    setValues({
        name: deck.value.name,
    })

    showEditDeckDialog.value = true
}

const updateDeck = handleSubmit(async (form) => {
    if (!deckId.value)
        return

    loading.value = true

    await supabase
        .from('decks')
        .update({ name: form.name })
        .eq('id', deckId.value)

    displaySuccess('Deck updated successfully')

    showEditDeckDialog.value = false
    resetForm()
    loading.value = false

    await fetchDeck()
})

async function deleteDeck() {
    await supabase
        .from('decks')
        .delete()
        .eq('id', deckId.value)

    showDeleteDeckDialog.value = false
    router.push('/decks')
        .then(() => displaySuccess('Deck deleted successfully'))
}

function createCard() {
    showCreateCardDialog.value = true
}

onMounted(() => fetchDeck())

watch(showEditDeckDialog, (value) => {
    if (!value)
        resetForm()
})

provide('deckId', deckId.value)
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
                        {{ deck.name }}
                    </h1>
                </VCol>
                <VCol class="d-flex align-center justify-end">
                    <VBtnToggle
                        :divided="true"
                        density="compact"
                    >
                        <VBtn
                            prepend-icon="mdi-plus"
                            @click="createCard"
                        >
                            Add a card
                        </VBtn>
                        <VMenu
                            origin="top right"
                            location="bottom"
                            :offset="[0, -30]"
                        >
                            <template #activator="{ props: menu }">
                                <VBtn
                                    v-bind="menu"
                                    icon="mdi-chevron-down"
                                />
                            </template>
                            <VList>
                                <VListItem
                                    prepend-icon="mdi-square-edit-outline"
                                    title="Edit the deck"
                                    @click="editDeck"
                                />
                                <VDivider />
                                <VListItem
                                    prepend-icon="mdi-delete-outline"
                                    title="Delete deck"
                                    @click="showDeleteDeckDialog = true"
                                />
                            </VList>
                        </VMenu>
                    </VBtnToggle>
                </VCol>
            </VRow>
        </VCol>
    </VRow>
    <VRow>
        <VCol>
            <VCard
                :loading="loading"
                variant="tonal"
                title="Cards"
            >
                <template #text>
                    <VDataIterator
                        v-if="deck.cards?.length > 0"
                        :items="deck.cards"
                        :search="search"
                    >
                        <template #header>
                            <VToolbar class="px-2">
                                <VTextField
                                    v-model="search"
                                    clearable
                                    density="comfortable"
                                    hide-details
                                    placeholder="Search"
                                    prepend-inner-icon="mdi-magnify"
                                    style="max-width: 300px;"
                                    variant="solo"
                                />
                            </VToolbar>
                        </template>

                        <template #default="{ items: cardList }">
                            <VContainer :fluid="true">
                                <VRow :dense="true">
                                    <CardDetail
                                        v-for="(card, i) in cardList"
                                        :key="i"
                                        :card="card.raw"
                                        @fetch="fetchDeck"
                                    />
                                </VRow>
                            </VContainer>
                        </template>
                    </VDataIterator>
                    <template v-else>
                        <VCol class="text-center">
                            <VIcon
                                icon="mdi-information"
                                size="64px"
                            />
                            <p class="my-2">
                                Nothing to display, yet.
                            </p>
                            <VBtn
                                color="primary"
                                prepend-icon="mdi-plus"
                                @click="createCard"
                            >
                                Add a card
                            </VBtn>
                        </VCol>
                    </template>
                </template>
            </VCard>
        </VCol>
    </VRow>
    <VDialog
        v-model="showEditDeckDialog"
    >
        <VCard
            prepend-icon="mdi-cards"
            :title="`Edit ${deck.name}`"
        >
            <template #text>
                <VTextField
                    v-bind="nameProps"
                    v-model="name"
                    label="Name"
                    class="mt-4"
                />
            </template>
            <template #actions>
                <VSpacer />
                <VBtn
                    @click="showEditDeckDialog = false"
                >
                    Cancel
                </VBtn>
                <VBtn
                    color="primary"
                    prepend-icon="mdi-content-save"
                    @click="updateDeck"
                >
                    Save
                </VBtn>
            </template>
        </VCard>
    </VDialog>
    <VDialog
        v-model="showDeleteDeckDialog"
        :persistent="true"
    >
        <VCard
            prepend-icon="mdi-alert"
            title="Delete the deck?"
            text="Deleting the deck will also delete all related cards and tags. This action cannot be undone. Confirm?"
        >
            <template #actions>
                <VSpacer />
                <VBtn @click="showDeleteDeckDialog = false">
                    Cancel
                </VBtn>
                <VBtn
                    color="error"
                    @click="deleteDeck"
                >
                    Delete deck
                </VBtn>
            </template>
        </VCard>
    </VDialog>

    <CreateCardDialog
        v-model="showCreateCardDialog"
        :deck-id="deckId"
        @success="fetchDeck"
    />
</template>
