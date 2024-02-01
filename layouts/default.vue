<script setup lang="ts">
import Navbar from '../composables/components/Navbar.vue'
</script>

<template>
    <VApp>
        <VLayout>
            <Navbar />
            <VMain>
                <VContainer>
                    <slot />
                </VContainer>
            </VMain>
        </VLayout>
    </VApp>
</template>
