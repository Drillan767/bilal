<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

interface Props {
    modelValue: any
    label: string
    placeholder?: string
    error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
    content: null,
    extensions: [
        StarterKit,
        Placeholder.configure({
            placeholder: props.placeholder ?? '',
        }),
    ],
    onUpdate: () => {
        emit('update:modelValue', editor.value?.getHTML() ?? '')
    },
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
                    :variant="editor.isActive('bold') ? 'tonal' : 'text'"
                    icon="mdi-format-bold"
                    class="mx-2"
                    @click="editor.chain().focus().toggleBold().run()"
                />
                <VBtn
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :variant="editor.isActive('italic') ? 'tonal' : 'text'"
                    icon="mdi-format-italic"
                    class="mr-2"
                    @click="editor.chain().focus().toggleItalic().run()"
                />
                <VBtn
                    :variant="editor.isActive('bulletList') ? 'tonal' : 'text'"
                    icon="mdi-format-list-bulleted"
                    class="mr-2"
                    @click="editor.chain().focus().toggleBulletList().run()"
                />
                <VBtn
                    :variant="editor.isActive('orderedList') ? 'tonal' : 'text'"
                    icon="mdi-format-list-numbered"
                    class="mr-2"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                />

                <VBtn
                    :variant="editor.isActive('code') ? 'tonal' : 'text'"
                    icon="mdi-code-tags"
                    class="mr-2"
                    @click="editor.chain().focus().toggleCode().run()"
                />

                <VBtn
                    :variant="editor.isActive('codeBlock') ? 'tonal' : 'text'"
                    icon="mdi-code-braces-box"
                    class="mr-2"
                    @click="editor.chain().focus().toggleCodeBlock().run()"
                />

                <VBtn
                    variant="text"
                    icon="mdi-undo"
                    class="mr-2"
                    @click="editor.chain().focus().undo().run()"
                />

                <VBtn
                    variant="text"
                    icon="mdi-redo"
                    @click="editor.chain().focus().redo().run()"
                />
            </template>
        </VToolbar>
        <VCardText>
            <EditorContent
                class="editor-content"
                :editor="editor"
            />
            <p v-show="error" class="text-red mt-4">
                {{ error }}
            </p>
        </VCardText>
    </VCard>
</template>

<style scoped lang="scss">
    :deep(.ProseMirror) {
        min-height: 100px;
        max-height: 100px;
        overflow-y: scroll;

        ul,
        ol {
            padding: 0 1rem;
        }

        code {
            background-color: rgba(#616161, 0.1);
            color: #616161;
        }

        pre {
            background: #0D0D0D;
            color: #FFF;
            font-family: 'JetBrainsMono', monospace;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;

            code {
            color: inherit;
            padding: 0;
            background: none;
            font-size: 0.8rem;
            }
        }

        &:focus {
            outline: none;
        }

    }
/*     :deep(.ProseMirror):focus {
        outline: none;
    }

    :deep(.ProseMirror) ul,
  ol {
    padding: 0 1rem;
  }

    :deep(.ProseMirror) {
        min-height: 100px;
        max-height: 100px;
        overflow-y: scroll;
    } */
</style>
