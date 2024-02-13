<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import type { Database } from '~/types/supabase'
import type { Deck } from '~/types/models'
import useNotification from '~/composables/notifications'
import CardForm from '~/components/cards/CardForm.vue'

const router = useRouter()
const supabase = useSupabaseClient<Database>()
const { displayError, displaySuccess } = useNotification()

const deckId = useRouteParams('id', null, { transform: String })

const deck = ref<Deck>({} as Deck)
const loading = ref(false)
const showEditDeckDialog = ref(false)
const showDeleteDeckDialog = ref(false)
const showCreateCardDialog = ref(false)

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
            name
        `)
        .eq('id', deckId.value)
        .single()

    if (data)
        deck.value = data

    if (error) {
        router.push('/decks')
            .then(() => displayError('Could not find the deck'))
    }
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
    fetchDeck()

    loading.value = false
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
    <VDialog
        v-model="showEditDeckDialog"
        width="600"
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
        width="600"
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

    <CardForm
        v-model="showCreateCardDialog"
        :edit="false"
    />
</template>
