<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import Wysiwyg from './Wysiwyg.vue'
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { vuetifyConfig } from '~/composables/vuetifyConfig'

interface Props {
    edit: boolean
}

defineProps<Props>()

const valueData = defineModel<boolean>()

const supabase = useSupabaseClient<Database>()

const qType = ref<'classic' | 'media'>('classic')

const { defineField, handleSubmit, resetForm } = useForm<CardForm>({
    validationSchema: computed(() => toTypedSchema(
        yup.object({
            question: qType.value === 'classic' ? yup.string().required() : yup.string().notRequired(),
            tags: yup.array().of(
                yup.string().required(),
            )
                .nullable(),
            answer: yup.string().required(),
            note: yup.string().nullable(),
            media: qType.value === 'media'
                ? yup
                    .mixed()
                    .required()
                    .test('respects-size', 'File too heavy', (value) => {
                        const file = value as File[]
                        return file && file[0] && file[0].size <= 102400
                    })
                    .test('respects-mime', 'Only audio and images are accepted', (value) => {
                        const file = value as File[]
                        return file && file[0] && (file[0].type.includes('audio') || file[0].type.includes('image'))
                    })
                : yup.string().nullable(),
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

const [question, questionProps] = defineField('question')
const [answer, answerProps] = defineField('answer')
const [tags, tagsProps] = defineField('tags', vuetifyConfig)
const [media, mediaProps] = defineField('media', vuetifyConfig)
const [note, noteProps] = defineField('notes')

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
    if (!media.value || !media.value[0] || mediaType.value !== 'audio')
        return

    const reader = new FileReader()
    reader.onload = (e) => {
        const context = new window.AudioContext()
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
    <VDialog
        v-model="valueData"
        :persistent="true"
        width="600"
    >
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
                                    <!-- <VTextField
                                        v-bind="questionProps"
                                        v-model="question"
                                        label="Question"
                                    /> -->
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
                                    <Wysiwyg
                                        v-bind="questionProps"
                                        v-model="question"
                                        label="Notes"
                                        placeholder="Test bjr"
                                    />
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
                <VBtn
                    @click="valueData = false"
                >
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
    </VDialog>
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
