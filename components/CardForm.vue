<script setup lang="ts">
import { useDropZone, useFileDialog } from '@vueuse/core'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import MCQField from './MCQField.vue'
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { vuetifyConfig } from '~/composables/vuetifyConfig'

interface Props {
    edit: boolean
}

defineProps<Props>()

const supabase = useSupabaseClient<Database>()

const qType = ref<'classic' | 'media'>('classic')
const aType = ref<'exact' | 'guess' | 'mcq'>('exact')

const { defineField, setValues, handleSubmit, resetForm } = useForm<CardForm>({
    validationSchema: computed(() => toTypedSchema(
        yup.object({
            question: qType.value === 'classic' ? yup.string().required() : yup.string().notRequired(),
            tags: yup.array().of(
                yup.object().shape({
                    name: yup.string(),
                }),
            )
                .min(1)
                .required(),
            answer: yup.string().required(),
            note: yup.string().nullable(),
            mcqAnswers: yup.array().of(
                yup.object().shape({
                    answer: yup.string(),
                }),
            )
                .min(aType.value === 'mcq' ? 1 : 0)
                .required(),
        }),
    )),
    initialValues: {
        tags: [],
        mcq_answers: [],
    },
})

const dropzone = ref<HTMLDivElement>()
const tagsList = ref<{ id: number, name: string }[]>([])
const loading = ref(false)

const [question, questionProps] = defineField('question', vuetifyConfig)
const [answer, answerProps] = defineField('answer', vuetifyConfig)
const [tags, tagsProps] = defineField('tags', vuetifyConfig)
const [media] = defineField('media', vuetifyConfig)
const [mcqAnswers] = defineField('mcq_answers', vuetifyConfig)
const [note, noteProps] = defineField('notes', vuetifyConfig)

const { files, open, onChange } = useFileDialog({
    accept: 'audio/*, image/*',
    multiple: false,
})

useDropZone(dropzone, { onDrop: onFileDrop })

onChange(files => console.log(files))

const formValid = useIsFormValid()

function addMcqAnswer() {
    if (mcqAnswers.value.length < 3)
        mcqAnswers.value.push('')
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

function onFileDrop(files: File[] | null) {
    console.log(files)
}

onMounted(() => fetchTags())
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
                            <VCol>
                                <div
                                    ref="dropzone"
                                    class="cursor-pointer"
                                    @click="() => open()"
                                >
                                    <VIcon
                                        icon="mdi-cloud-upload-outline"
                                    />
                                    <p>
                                        Click to upload, or drop a file
                                    </p>
                                </div>
                            </VCol>
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
                            <VCol>
                                <MCQField
                                    v-for="(_, i) in mcqAnswers"
                                    :key="i"
                                    v-model="mcqAnswers[i]"
                                    @delete="removeMcqAnswer(i)"
                                />
                                <div class="text-right mt-2">
                                    <VBtn
                                        color="secondary"
                                        variant="outlined"
                                        @click="addMcqAnswer"
                                    >
                                        Add an answer
                                    </VBtn>
                                </div>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol>
                                <VTextField
                                    v-bind="answerProps"
                                    v-model="answer"
                                    label="Correct answer"
                                />
                            </VCol>
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
                :disabled="!formValid"
            >
                Save
            </VBtn>
        </template>
    </VCard>
</template>
