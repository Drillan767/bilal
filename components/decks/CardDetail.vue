<script setup lang="ts">
import type { Database } from '~/types/supabase'
import EditCardDialog from '~/components/cards/EditCardDialog.vue'

interface Props {
    card: {
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
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'fetch'): void
}>()

const supabase = useSupabaseClient<Database>()

const tags = computed(() => {
    if (!props.card.cards_tags)
        return []

    return props.card.cards_tags.reduce((acc, ct) => {
        if (ct.tags)
            acc.push(ct.tags.name)

        return acc
    }, [] as string[])
})

const loading = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedCard = ref<Props['card']>()

async function deleteCard() {
    loading.value = true

    await supabase
        .from('cards')
        .delete()
        .eq('id', props.card.id)

    loading.value = false
    showDeleteModal.value = false
    emit('fetch')
}

function handleEditCard(card: Props['card']) {
    showEditModal.value = true
    selectedCard.value = card
}
</script>

<template>
    <VCol
        cols="12"
        md="3"
    >
        <VCard>
            <VExpansionPanels variant="accordion">
                <VExpansionPanel title="Question">
                    <VExpansionPanelText>
                        <template v-if="card.question_type === 'media'">
                            Contient un média
                        </template>
                        <template
                            v-else
                        >
                            <div v-html="card.question" />
                        </template>
                    </VExpansionPanelText>
                </VExpansionPanel>
                <VExpansionPanel title="Notes">
                    <VExpansionPanelText>
                        <div v-html="card.notes ?? ''" />
                    </VExpansionPanelText>
                </VExpansionPanel>
                <VExpansionPanel title="Answer">
                    <VExpansionPanelText>
                        <div v-html="card.answer" />
                    </VExpansionPanelText>
                </VExpansionPanel>
                <VExpansionPanel
                    title="Statistics"
                    text="Bjr je suis un panel"
                />
            </VExpansionPanels>
            <VCardActions>
                <div>
                    <VChip
                        v-for="(tag, i) in tags"
                        :key="i"
                        :text="tag"
                    />
                </div>
                <VSpacer />
                <VMenu :offset="[0, 64]">
                    <template #activator="{ props: menu }">
                        <VBtn
                            v-bind="menu"
                            text="actions"
                            append-icon="mdi-menu-down"
                        />
                    </template>
                    <VList>
                        <VListItem
                            title="Edit card"
                            prepend-icon="mdi-pencil"
                            @click="handleEditCard(card)"
                        />
                        <VListItem
                            title="Delete card"
                            prepend-icon="mdi-delete-outline"
                            @click="showDeleteModal = true"
                        />
                    </VList>
                </VMenu>
            </VCardActions>
        </VCard>
        <EditCardDialog
            v-if="selectedCard"
            v-model="showEditModal"
            :card="selectedCard"
        />

        <VDialog
            v-model="showDeleteModal"
            :persistent="true"
        >
            <VCard
                :loading="loading"
                prepend-icon="mdi-alert"
                title="Delete this card?"
                text="This action cannot be undone, and all related content (statistics, media...) will also be deleted. Confirm?"
            >
                <template #actions>
                    <VSpacer />
                    <VBtn
                        :disabled="loading"
                        @click="showDeleteModal = false"
                    >
                        Cancel
                    </VBtn>
                    <VBtn
                        :disabled="loading"
                        :loading="loading"
                        color="error"
                        @click="deleteCard"
                    >
                        Delete
                    </VBtn>
                </template>
            </VCard>
        </VDialog>
    </VCol>
</template>
