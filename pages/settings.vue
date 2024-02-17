<script setup lang="ts">
import { toast } from 'vue3-toastify'
import type { Database } from '~/types/supabase'
import { vuetifyConfig } from '~/composables/vuetifyConfig'

useHead({
    title: 'Settings',
})

interface Box {
    id: number
    name: string
    interval: number
}

const supabase = useSupabaseClient<Database>()
const { defineField, resetForm, handleSubmit, setValues } = useForm<Box>({
    validationSchema: {
        name: 'required',
        interval: 'min:1|required',
    },
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [interval, intervalProps] = defineField('interval', vuetifyConfig)
const formValid = useIsFormValid()
const boxes = ref<Box[]>([])
const selectedBox = ref<Box>({} as Box)
const loading = ref(false)
const createBoxModal = ref(false)
const editBoxModal = ref(false)
const deleteBoxModal = ref(false)
const orphanCardsModal = ref(false)

fetchBoxes()

const items = [
    {
        title: 'Home',
        to: '/',
    },
    {
        title: 'Settings',
        disabled: true,
    },
]

async function fetchBoxes() {
    loading.value = true
    const { data } = await supabase
        .from('boxes')
        .select('id, name, interval')
        .order('interval')

    if (data)
        boxes.value = data

    loading.value = false
}

function addBox() {
    createBoxModal.value = true
}

function editBox(box: Box) {
    selectedBox.value = box
    editBoxModal.value = true

    setValues({
        name: box.name,
        interval: box.interval,
    })
}

function closeCreate() {
    resetForm()
    createBoxModal.value = false
}

const saveBox = handleSubmit(async (value) => {
    loading.value = true

    await supabase
        .from('boxes')
        .insert(value)

    await fetchBoxes()
    loading.value = false
    resetForm()
    createBoxModal.value = false
    toast.success('Box created successfully!')
})

const updateBox = handleSubmit(async (value) => {
    loading.value = true

    await supabase
        .from('boxes')
        .update(value)
        .eq('id', selectedBox.value.id)

    editBoxModal.value = false
    resetForm()
    await fetchBoxes()
    loading.value = false
    toast.success('Box updated successfully!')
})

function handleDeleteBox(box: Box) {
    selectedBox.value = box
    deleteBoxModal.value = true
}

async function deleteBox(box: Box) {
    // Checking if cards in the current box.
    loading.value = true
    const { count: nbCards } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('box_id', box.id)

    if (nbCards && nbCards > 0) {
        // ...
    }

    await supabase
        .from('boxes')
        .delete()
        .eq('id', box.id)

    deleteBoxModal.value = false
    loading.value = false
    toast.success('Box deleted successfully')
    await fetchBoxes()
}
</script>

<template>
    <VRow>
        <VBreadcrumbs
            :items="items"
        >
            <template #divider>
                <VIcon icon="mdi-chevron-right" />
            </template>
        </VBreadcrumbs>
    </VRow>
    <VRow>
        <VCol>
            <h1>
                Settings
            </h1>
        </VCol>
    </VRow>
    <VRow>
        <VCol>
            <VCard
                title="Boxes"
                prepend-icon="mdi-cube"
                :loading="loading"
            >
                <template #text>
                    <template v-if="boxes.length > 0">
                        <VRow>
                            <VCol
                                v-for="(box, i) in boxes"
                                :key="i"
                                cols="12"
                                md="2"
                            >
                                <VCard
                                    :title="box.name"
                                    prepend-icon="mdi-cube-outline"
                                    elevation="5"
                                >
                                    <template #text>
                                        <p>Interval: {{ box.interval }} day(s)</p>
                                    </template>
                                    <template #actions>
                                        <VSpacer />
                                        <VBtn
                                            color="warning"
                                            icon="mdi-cog"
                                            @click="editBox(box)"
                                        />

                                        <VBtn
                                            color="error"
                                            icon="mdi-delete"
                                            @click="handleDeleteBox(box)"
                                        />
                                    </template>
                                </VCard>
                            </VCol>
                        </VRow>
                    </template>
                    <template v-else>
                        <div class="d-flex flex-column justify-center align-center">
                            <p class="mb-4">
                                No box yet
                            </p>
                            <div>
                                <VBtn
                                    color="primary"
                                    @click="addBox"
                                >
                                    Add a box
                                </VBtn>
                            </div>
                        </div>
                    </template>
                </template>
                <template #actions>
                    <VSpacer />
                    <VBtn
                        prepend-icon="mdi-plus"
                        color="success"
                        @click="addBox"
                    >
                        Add box
                    </VBtn>
                </template>
            </VCard>
        </VCol>
        <VDialog
            v-model="createBoxModal"
            :persistent="true"
        >
            <VCard
                prepend-icon="mdi-cube-outline"
                title="New box"
            >
                <template #text>
                    <VTextField
                        v-bind="nameProps"
                        v-model="name"
                        class="mb-4"
                        label="Name"
                    />
                    <VTextField
                        v-bind="intervalProps"
                        v-model="interval"
                        type="number"
                        prefix="Every"
                        suffix="day(s)"
                        label="Interval"
                    />
                </template>
                <template #actions>
                    <VSpacer />
                    <VBtn
                        :disabled="loading"
                        @click="closeCreate"
                    >
                        Cancel
                    </VBtn>
                    <VBtn
                        color="primary"
                        prepend-icon="mdi-content-save"
                        :loading="loading"
                        :disabled="!formValid || loading"
                        @click="saveBox"
                    >
                        Save
                    </VBtn>
                </template>
            </VCard>
        </VDialog>
        <VDialog
            v-model="editBoxModal"
        >
            <VCard
                prepend-icon="mdi-cube-scan"
                :title="`Editing ${selectedBox.name}`"
                :loading="loading"
            >
                <template #text>
                    <VTextField
                        v-bind="nameProps"
                        v-model="name"
                        class="mb-4"
                        label="Name"
                    />
                    <VTextField
                        v-bind="intervalProps"
                        v-model="interval"
                        type="number"
                        prefix="Every"
                        suffix="day(s)"
                        label="Interval"
                    />
                </template>
                <template #actions>
                    <VSpacer />
                    <VBtn
                        @click="editBoxModal = false"
                    >
                        Cancel
                    </VBtn>
                    <VBtn
                        prepend-icon="mdi-content-save"
                        color="primary"
                        @click="updateBox"
                    >
                        Save
                    </VBtn>
                </template>
            </VCard>
        </VDialog>
        <VDialog
            v-model="deleteBoxModal"
        >
            <VCard
                prepend-icon="mdi-alert"
                :title="`Delete ${selectedBox.name}?`"
                :loading="loading"
                text="The box will be deleted and all its related card will be assigned to the box with the nearest (lower or higher) interval. Confirm?"
            >
                <template #actions>
                    <VSpacer />
                    <VBtn
                        @click="deleteBoxModal = false"
                    >
                        Cancel
                    </VBtn>
                    <VBtn
                        prepend-icon="mdi-delete"
                        color="error"
                        :disabled="loading"
                        @click="deleteBox(selectedBox)"
                    >
                        Delete
                    </VBtn>
                </template>
            </VCard>
        </VDialog>
        <VDialog
            v-model="orphanCardsModal"
        >
            <VCard
                prepend-icon="mdi-cancel"
                title="Unable to delete this box"
                text="Cards must have a box, and you are trying to delete the last one of them, you monster."
            >
                <template #actions>
                    <VSpacer />
                    <VBtn @click="orphanCardsModal = false">
                        My bad.
                    </VBtn>
                </template>
            </VCard>
        </VDialog>
    </VRow>
</template>
