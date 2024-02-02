<script setup lang="ts">
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { vuetifyConfig } from '~/composables/vuetifyConfig'

interface Props {
    edit: boolean
}

defineProps<Props>()

const supabase = useSupabaseClient<Database>()

const { defineField, setValues, handleSubmit, resetForm } = useForm<CardForm>({
    validationSchema: {
        question_type: 'required|oneOf:classic,media',
        answer_type: 'required|oneOf:exact,guess,mcq',
        answer: 'required',
    },
    initialValues: {
        question_type: 'classic',
        answer_type: 'exact',
    },
})

const mcqAnswers = ref<string[]>([])
const tagsList = ref<{ id: number, name: string }[]>([])
const loading = ref(false)

const [qType, qTypeProps] = defineField('question_type', vuetifyConfig)
const [aType, aTypeProps] = defineField('answer_type', vuetifyConfig)
const [question, questionProps] = defineField('question', vuetifyConfig)
const [answer, answerProps] = defineField('answer', vuetifyConfig)
const [tags, tagsProps] = defineField('tags', vuetifyConfig)
const [media, mediaProps] = defineField('media', vuetifyConfig)
const [note, noteProps] = defineField('notes', vuetifyConfig)

const formValid = useIsFormValid()

function addMcqAnswer() {
    if (mcqAnswers.value.length < 3)
        mcqAnswers.value.push()
}

function removeMcqAnswer(i: number) {
    mcqAnswers.value.slice(i, 1)
}

async function fetchTags() {
    loading.value = true

    const { data } = await supabase
        .from('tags')
        .select('id, name')

    if (data)
        tagsList.value = data
}
</script>

<template>
    <VCard
        prepend-icon="mdi-cards"
    >
        <template #title>
            <h3>{{ edit ? 'Edit' : 'Create' }} a card</h3>
        </template>
        <template #text>
            <VContainer>
                <VRow>
                    <VCol>
                        <VItemGroup
                            v-bind="qTypeProps"
                            v-model="qType"
                            :mandatory="true"
                        >
                            <VRow>
                                <VCol>
                                    <VItem
                                        v-slot="{ toggle }"
                                        value="classic"
                                    >
                                        <VCard
                                            :variant="qType === 'classic' ? 'tonal' : 'outlined'"
                                            prepend-icon="mdi-text-box"
                                            title="Classic"
                                            @click="toggle"
                                        />
                                    </VItem>
                                </VCol>
                                <VCol>
                                    <VItem
                                        v-slot="{ toggle }"
                                        value="media"
                                    >
                                        <VCard
                                            :variant="qType === 'media' ? 'tonal' : 'outlined'"
                                            prepend-icon="mdi-music-box-outline"
                                            title="Media"
                                            @click="toggle"
                                        />
                                    </VItem>
                                </VCol>
                            </VRow>
                        </VItemGroup>
                        <VRow v-if="qType === 'classic'">
                            <VCol>
                                <VTextField
                                    v-bind="questionProps"
                                    v-model="question"
                                    label="Question"
                                />
                            </VCol>
                        </VRow>
                        <VRow v-if="qType === 'media'">
                            <VCol>Media lo</VCol>
                        </VRow>
                        <VRow>
                            <VCol>
                                <VTextarea
                                    v-bind="noteProps"
                                    v-model="note"
                                    label="Additional notes"
                                />
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol cols="12">
                                <h4>Answer type</h4>
                            </VCol>
                            <VCol cols="12">
                                <VItemGroup
                                    v-bind="aTypeProps"
                                    v-model="aType"
                                    :mandatory="true"
                                >
                                    <VRow>
                                        <VCol>
                                            <VItem
                                                v-slot="{ toggle }"
                                                value="exact"
                                            >
                                                <VCard
                                                    :variant="aType === 'exact' ? 'tonal' : 'outlined'"
                                                    prepend-icon="mdi-target"
                                                    title="Exact"
                                                    @click="toggle"
                                                />
                                            </VItem>
                                        </VCol>
                                        <VCol>
                                            <VItem
                                                v-slot="{ toggle }"
                                                value="guess"
                                            >
                                                <VCard
                                                    :variant="aType === 'guess' ? 'tonal' : 'outlined'"
                                                    prepend-icon="mdi-head-question-outline"
                                                    title="Guess"
                                                    @click="toggle"
                                                />
                                            </VItem>
                                        </VCol>
                                        <VCol>
                                            <VItem
                                                v-slot="{ toggle }"
                                                value="mcq"
                                            >
                                                <VCard
                                                    :variant="aType === 'mcq' ? 'tonal' : 'outlined'"
                                                    prepend-icon="mdi-list-status"
                                                    title="MCQ"
                                                    @click="toggle"
                                                />
                                            </VItem>
                                        </VCol>
                                    </VRow>
                                </VItemGroup>
                            </VCol>
                        </VRow>
                        <VRow v-if="aType === 'mcq'">
                            <VTextField
                                v-for="(a, i) in mcqAnswers"
                                :key="i"
                                v-model="mcqAnswers[i]"
                                label="Answer"
                            />
                            <VBtn @click="addMcqAnswer" />
                        </VRow>
                        <VRow>
                            <VCol>
                                <VCombobox
                                    v-bind="tagsProps"
                                    v-model="tags"
                                    :chips="true"
                                    item-value=""
                                    :return-object="false"
                                    :multiple="true"
                                    :closable-chips="true"
                                    :items="tagsList"
                                    label="Tags"
                                    hint="You can add non existing tags and press enter"
                                />
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>
            </VContainer>
        </template>
        <template #actions>
            <VSpacer />
            <VBtn>
                Cancel
            </VBtn>
            <VBtn
                color="primary"
            >
                Save
            </VBtn>
        </template>
    </VCard>
</template>
