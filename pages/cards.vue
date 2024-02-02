<script setup lang="ts">
useHead({
    title: 'Cards',
})

const edit = ref(false)
const drawer = ref(false)
const editDrawer = ref(false)

const items = [
    {
        title: 'Home',
        to: '/',
    },
    {
        title: 'Cards',
        disabled: true,
    },
]

function createCard() {
    edit.value = false
    drawer.value = true
}

function editCard() {
    edit.value = true
    drawer.value = true
}
</script>

<template>
    <VRow>
        <VBreadcrumbs :items="items">
            <template #divider>
                <VIcon icon="mdi-chevron-right" />
            </template>
        </VBreadcrumbs>
    </VRow>
    <VRow>
        <VCol>
            <VRow>
                <VCol>
                    <h1>
                        Cards
                    </h1>
                </VCol>
                <VCol class="d-flex align-center justify-end">
                    <VBtn
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="createCard"
                    >
                        Create a card
                    </VBtn>
                </VCol>
            </VRow>
        </VCol>
    </VRow>
    <VRow />
    <VDialog
        v-model="drawer"
        width="600"
    >
        <CardForm :edit="edit" />
    </VDialog>
</template>
