export function vuetifyConfig(state: any) {
    return {
        props: {
            'error-messages': state.errors,
        },
    }
}
