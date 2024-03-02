import * as process from 'node:process'
import handleTagsSync from '../handleTagSync'
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { serverSupabaseClient } from '#supabase/server'

type Form = Omit<CardForm, 'tags'> & {
    tags: string
}

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event)

    if (!body)
        throw createError({ statusCode: 400 })

    const supabase = await serverSupabaseClient<Database>(event)

    const payload: Form = {} as Form
    let deckId = ''

    for (const field of body) {
        const fieldName = field.name!.toString()
        switch (fieldName) {
            case 'answer':
            case 'notes':
            case 'tags':
                payload[fieldName] = field.data.toString()
                break
            case 'question_type':
                payload.question_type = field.data.toString() as Form['question_type']
                break
            case 'question':
                payload.question = field.data?.toString() ?? null
                break
            case 'deck_id':
                deckId = field.data.toString()
                break
        }
    }

    if (deckId.length === 0)
        throw createError({ statusCode: 400, message: 'Deck Id could not be retrieved' })

    const mediaData = body.find(field => field.name === 'media')

    // Retrieve lowest interval box
    const { data: box } = await supabase
        .from('boxes')
        .select('id')
        .order('interval')
        .single()

    if (!box)
        throw createError({ statusCode: 400, message: 'A box is required to store cards.' })

    const { question, question_type, answer, notes, tags } = payload

    const formTags: string[] = JSON.parse(tags)

    // Store card.
    const { data: card, error } = await supabase
        .from('cards')
        .insert({
            deck_id: deckId,
            box_id: box.id,
            question_type,
            answer,
            question,
            notes,
            media: question_type === 'media' ? '' : null,
            last_answered_at: null,
        })
        .select('id')

    if (!card)
        throw createError({ statusCode: 400, message: error.message })

    // Handle media upload.
    if (mediaData && question_type === 'media') {
        await supabase
            .storage
            .from('media')
            .upload(`${card[0].id}-${mediaData.filename}`, mediaData.data, {
                cacheControl: '3600',
                contentType: `${mediaData.type};charset=UTF-8`,
            })

        await supabase
            .from('cards')
            .update({
                media: `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${card[0].id}-${mediaData.filename}`,
            })
            .eq('id', card[0].id)
    }

    await handleTagsSync(supabase, deckId, card[0].id, formTags)

    return payload
})
