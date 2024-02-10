<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { vuetifyConfig } from '~/composables/vuetifyConfig'

interface Props {
    edit: boolean
}

defineProps<Props>()

const context = new window.AudioContext()

const supabase = useSupabaseClient<Database>()

const qType = ref<'classic' | 'media'>('classic')
const aType = ref<'exact' | 'guess' | 'mcq'>('exact')

const { defineField, handleSubmit, resetForm } = useForm<CardForm>({
    validationSchema: computed(() => toTypedSchema(
        yup.object({
            question: qType.value === 'classic' ? yup.string().required() : yup.string().notRequired(),
            tags: yup.array().of(
                yup.string().required(),
            )
                .min(1)
                .required(),
            answer: yup.string().required(),
            note: yup.string().nullable(),
            media: qType.value === 'media'
                ? yup
                    .mixed()
                    .required()
                    .test('respects-size', 'File too heavy', (value: File[]) => {
                        return value && value[0] && value[0].size <= 102400
                    })
                    .test('respects-mime', 'Only audio and images are accepted', (value: File[]) => {
                        return value && value[0] && (value[0].type.includes('audio') || value[0].type.includes('image'))
                    })
                : yup.string().nullable(),
            mcq_answers: yup.array().of(
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
    },
})

const tagsList = ref<{ id: number, name: string }[]>([])
const loading = ref(false)
const showPreview = ref(false)
const imgPreview = ref('')
const mediaType = ref<'audio' | 'image'>()
const soundPreview = ref<AudioBufferSourceNode>(context.createBufferSource())

const [question, questionProps] = defineField('question', vuetifyConfig)
const [answer, answerProps] = defineField('answer', vuetifyConfig)
const [tags, tagsProps] = defineField('tags', vuetifyConfig)
const [media, mediaProps] = defineField('media', vuetifyConfig)
const [note, noteProps] = defineField('notes', vuetifyConfig)

const formValid = useIsFormValid()

async function fetchTags() {
    loading.value = true

    const { data } = await supabase
        .from('tags')
        .select('id, name')

    if (data)
        tagsList.value = data
}

function playSound() {
    if (media.value && media.value[0] && mediaType.value === 'audio') {
        const reader = new FileReader()
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer
            context.decodeAudioData(arrayBuffer, (buffer) => {
                const source = context.createBufferSource()
                source.buffer = buffer
                source.connect(context.destination)
                source.start(0)
            })
        }

        reader.readAsArrayBuffer(media.value[0])
    }
    // soundPreview.value.start(0)
    soundPreview.value.playbackRate.value = 1
}

const submit = handleSubmit(async (form) => {
    loading.value = true

    const formData = new FormData()
    formData.append('answer', form.answer)
    formData.append('notes', form.notes)
    formData.append('tags', JSON.stringify(form.tags))

    if (qType.value === 'classic')
        formData.append('question', form.question)

    if (qType.value === 'media' && form.media)
        formData.append('media', form.media[0])

    await $fetch('/api/cards/create', {
        method: 'POST',
        body: formData,
    })

    loading.value = false
    resetForm()
})

watch(media, (value) => {
    if (value && value[0]) {
        const uploadedFile = value[0]

        if (uploadedFile.type.includes('audio'))
            mediaType.value = 'audio'

        if (uploadedFile.type.includes('image')) {
            mediaType.value = 'image'
            imgPreview.value = URL.createObjectURL(uploadedFile)
        }
    }
})

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
                                <VFileInput
                                    v-bind="mediaProps"
                                    v-model="media"
                                    label="Media (image or audio)"
                                >
                                    <template
                                        v-if="media"
                                        #append
                                    >
                                        <VBtn
                                            v-if="mediaType === 'audio'"
                                            variant="text"
                                            icon="mdi-volume-high"
                                            @click="playSound"
                                        />
                                        <VBtn
                                            v-if="mediaType === 'image'"
                                            :icon="true"
                                            @click="showPreview = true"
                                        >
                                            <VAvatar :image="imgPreview" />
                                        </VBtn>
                                    </template>
                                </VFileInput>
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
            <VDialog
                v-model="showPreview"
            >
                <VImg :image="imgPreview" />
            </VDialog>
        </template>
        <template #actions>
            <VSpacer />
            <VBtn>
                Cancel
            </VBtn>
            <VBtn
                color="primary"
                :disabled="!formValid"
                @click="submit"
            >
                Save
            </VBtn>
        </template>
    </VCard>
</template>

<style scoped>
.dropzone {
    border: solid 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    flex-direction: column;
    padding: 10px 0;
    text-align: center;
    cursor: pointer;
}
</style>
