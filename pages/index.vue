<script setup lang="ts">
useHead({
    title: 'Home',
})
</script>

<template>
    <VRow>
        <VCol>
            <VCard
                variant="outlined"
                to="/cards"
            >
                <template #text>
                    Cards
                </template>
            </VCard>
        </VCol>
    </VRow>
    <VRow>
        <VCol>
            <VCard
                to="/decks"
                title="Decks"
                variant="outlined"
            />
        </VCol>
    </VRow>
    <VRow>
        <VCol>
            <VCard
                variant="outlined"
                to="/cards"
                title="Cards"
            />
        </VCol>
    </VRow>
</template>
