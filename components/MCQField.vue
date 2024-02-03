<script setup lang="ts">
import { mergeProps } from 'vue'

const props = defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    (e: 'delete'): void
    (e: 'update:modelValue', value: string): void
}>()

const { defineField } = useForm<{ answer: string }>({
    validationSchema: {
        answer: 'required',
    },
    initialValues: {
        answer: props.modelValue,
    },
})

const [answer, answerProps] = defineField('answer', vuetifyConfig)

watch(answer, value => emit('update:modelValue', value))
</script>

<template>
    <VTextField
        v-bind="answerProps"
        v-model="answer"
        label="Answer"
        placeholder="Wrong answer"
    >
        <template #append-inner>
            <VBtn
                icon="mdi-delete"
                color="error"
                variant="text"
                @click="emit('delete')"
            />
        </template>
    </VTextField>
</template>
