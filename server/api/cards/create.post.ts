export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event)

    if (!body)
        throw createError({ statusCode: 400 })

    const payload: Record<string, string> = {}

    for (const field of body) {
        const fieldName = field.name!.toString()

        if (fieldName !== 'media')
            payload[fieldName] = field.data.toString()
    }

    const mediaData = body.find(field => field.name === 'media')
})
