<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import Wysiwyg from './Wysiwyg.vue'
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { vuetifyConfig } from '~/composables/vuetifyConfig'

interface Props {
    form: CardForm
    formValid: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:form', value: CardForm): void
    (e: 'update:formValid', value: boolean): void
}>()

const supabase = useSupabaseClient<Database>()

const qType = ref<'classic' | 'media'>('classic')

const formProxy = computed({
    get: () => props.form,
    set: value => emit('update:form', value),
})

const { defineField, controlledValues, errors } = useForm<CardForm>({
    validationSchema: computed(() => toTypedSchema(
        yup.object({
            question_type: yup.string().required(),
            question: qType.value === 'classic'
                ? yup.mixed()
                    .required()
                    .test('not-empty', 'The field is required', (value) => {
                        return value && value !== '<p></p>'
                    })
                : yup.string().notRequired(),
            tags: yup.array().of(
                yup.string().required(),
            )
                .nullable(),
            answer: yup
                .mixed()
                .required()
                .test('not-empty', 'The field is required', (value) => {
                    return value && value !== '<p></p>'
                }),
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
    initialValues: formProxy.value,
})

const tagsList = ref<{ id: number, name: string }[]>([])
const loading = ref(false)
const showPreview = ref(false)
const imgPreview = ref('')
const mediaType = ref<'audio' | 'image'>()

const [question] = defineField('question')
const [answer] = defineField('answer')
const [tags, tagsProps] = defineField('tags', vuetifyConfig)
const [media, mediaProps] = defineField('media', vuetifyConfig)
const [note] = defineField('notes')
defineField('question_type')

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

watch(formValid, value => emit('update:formValid', value))

watch([controlledValues, qType], ([values, type]) => emit('update:form', {
    ...values,
    question_type: type,
}))

onMounted(() => fetchTags())
</script>

<template>
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
                        <Wysiwyg
                            v-model="question"
                            label="Question"
                            placeholder="Test bjr"
                            :error="errors.question"
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
                        <Wysiwyg
                            v-model="note"
                            label="Notes"
                            :error="errors.notes"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol>
                        <Wysiwyg
                            v-model="answer"
                            label="Answer"
                            :error="errors.answer"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol>
                        <VCombobox
                            v-bind="tagsProps"
                            v-model="tags"
                            :chips="true"
                            item-title="name"
                            item-value="name"
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
        <VDialog v-model="showPreview">
            <VImg :src="imgPreview" />
        </VDialog>
    </VContainer>
</template>
