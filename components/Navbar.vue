<script setup lang="ts">
const supabase = await useSupabaseClient()
const router = useRouter()

async function logout() {
    await supabase.auth.signOut()
    await router.push('/login')
}
</script>

<template>
    <VAppBar
        title="Bilal"
    >
        <template #append>
            <VMenu>
                <template #activator="{ props }">
                    <VBtn
                        v-bind="props"
                        icon="mdi-account"
                        color="primary"
                    />
                </template>

                <VList>
                    <VListItem
                        prepend-icon="mdi-cogs"
                        title="Settings"
                        to="/settings"
                    />
                    <VListItem
                        prepend-icon="mdi-logout"
                        title="Log out"
                        @click="logout"
                    />
                </VList>
            </VMenu>
        </template>
    </VAppBar>
</template>
