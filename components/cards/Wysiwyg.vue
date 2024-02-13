<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

interface Props {
    modelValue: any
    label: string
    placeholder?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const value = toRef(props, 'modelValue')

const {
    errorMessage,
    handleBlur,
    handleChange,
    validate,
    meta,
} = useField(value, undefined, {
    initialValue: props.modelValue,
})

const editor = useEditor({
    content: '<p></p>',
    extensions: [
        StarterKit,
        Placeholder.configure({
            placeholder: props.label ?? '',
        }),
    ],
    onUpdate: (e) => {
        emit('update:modelValue', editor.value?.getHTML() ?? '')
        handleChange(e, true)
    },
    onBlur: () => handleBlur,

})

onMounted(() => editor.value?.commands.setContent(props.modelValue))
</script>

<template>
    <VCard
        v-if="editor"
        variant="tonal"
    >
        <VToolbar
            :extended="true"
            :title="props.label"
        >
            <template #extension>
                <VBtn
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    :variant="editor.isActive('bold') ? 'tonal' : 'outlined'"
                    icon="mdi-format-bold"
                    size="x-small"
                    class="mx-2"
                    @click="editor.chain().focus().toggleBold().run()"
                />
                <VBtn
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :variant="editor.isActive('italic') ? 'tonal' : 'outlined'"
                    icon="mdi-format-italic"
                    size="x-small"
                    class="mr-2"
                    @click="editor.chain().focus().toggleItalic().run()"
                />
                <VBtn
                    :variant="editor.isActive('bulletList') ? 'tonal' : 'outlined'"
                    icon="mdi-format-list-bulleted"
                    size="x-small"
                    class="mr-2"
                    @click="editor.chain().focus().toggleBulletList().run()"
                />
                <VBtn
                    :variant="editor.isActive('orderedList') ? 'tonal' : 'outlined'"
                    icon="mdi-format-list-numbered"
                    size="x-small"
                    class="mr-2"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                />

                <VBtn
                    :variant="editor.isActive('code') ? 'tonal' : 'outlined'"
                    icon="mdi-code-tags"
                    size="x-small"
                    class="mr-2"
                    @click="editor.chain().focus().toggleCode().run()"
                />

                <VBtn
                    :variant="editor.isActive('codeBlock') ? 'tonal' : 'outlined'"
                    icon="mdi-code-braces-box"
                    size="x-small"
                    class="mr-2"
                    @click="editor.chain().focus().toggleCodeBlock().run()"
                />

                <VBtn
                    variant="outlined"
                    icon="mdi-undo"
                    size="x-small"
                    class="mr-2"
                    @click="editor.chain().focus().undo().run()"
                />

                <VBtn
                    variant="outlined"
                    icon="mdi-redo"
                    size="x-small"
                    @click="editor.chain().focus().redo().run()"
                />
            </template>
        </VToolbar>
        <VCardText>
            <EditorContent
                :editor="editor"
            />
            <p v-show="errorMessage || meta.valid" class="help-message">
                {{ errorMessage }}
            </p>
        </VCardText>
    </VCard>
</template>
