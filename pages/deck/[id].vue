<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import { toast } from 'vue3-toastify'
import type { Database } from '~/types/supabase'
import type { ClassicCard, Deck } from '~/types/models'

const router = useRouter()
const supabase = useSupabaseClient<Database>()

const deckId = useRouteParams('id', null, { transform: String })

const deck = ref<Deck>({} as Deck)
const loading = ref(false)
const showEditDeckDialog = ref(false)
const showDeleteDeckDialog = ref(false)

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
            cards(id, media, question, answer)    
        `)
        .eq('id', deckId.value)
        .single()

    if (error) {
        toast.error('Deck not found')
        router.push('/decks')
    }

    if (data)
        deck.value = data
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

    toast.success('Deck updated successfully')
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
</template>
