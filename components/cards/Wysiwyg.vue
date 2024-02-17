<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

interface Props {
    modelValue: any
    label: string
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
            emptyEditorClass: 'is-empty',
            placeholder: 'Type here...',
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
            :title="props.label"
        >
            <VBtnGroup
                :divided="true"
                density="compact"
                class="mr-2"
            >
                <VBtn
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    :variant="editor.isActive('bold') ? 'tonal' : 'outlined'"
                    icon="mdi-format-bold"
                    @click="editor.chain().focus().toggleBold().run()"
                />

                <VBtn
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :variant="editor.isActive('italic') ? 'tonal' : 'outlined'"
                    icon="mdi-format-italic"
                    @click="editor.chain().focus().toggleItalic().run()"
                />
            </VBtnGroup>
            <VBtnGroup
                :divided="true"
                density="compact"
                class="mr-2"
            >
                <VBtn
                    :variant="editor.isActive('bulletList') ? 'tonal' : 'outlined'"
                    icon="mdi-format-list-bulleted"
                    @click="editor.chain().focus().toggleBulletList().run()"
                />

                <VBtn
                    :variant="editor.isActive('orderedList') ? 'tonal' : 'outlined'"
                    icon="mdi-format-list-numbered"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                />
            </VBtnGroup>

            <VBtnGroup
                :divided="true"
                density="compact"
                class="mr-2"
            >
                <VBtn
                    :variant="editor.isActive('code') ? 'tonal' : 'outlined'"
                    icon="mdi-code-tags"
                    @click="editor.chain().focus().toggleCode().run()"
                />

                <VBtn
                    :variant="editor.isActive('codeBlock') ? 'tonal' : 'outlined'"
                    icon="mdi-code-braces-box"
                    @click="editor.chain().focus().toggleCodeBlock().run()"
                />
            </VBtnGroup>

            <VBtnGroup
                :divided="true"
                density="compact"
                class="mr-2"
            >
                <VBtn
                    variant="outlined"
                    icon="mdi-undo"

                    @click="editor.chain().focus().undo().run()"
                />

                <VBtn
                    variant="outlined"
                    icon="mdi-redo"
                    @click="editor.chain().focus().redo().run()"
                />
            </VBtnGroup>
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
        min-height: 50px;
        max-height: 50px;
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

        .is-empty::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            font-style: italic;
            float: left;
            height: 0;
            pointer-events: none;
        }
    }
</style>
