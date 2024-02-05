import * as process from 'node:process'
import type { Database } from '~/types/supabase'
import type { CardForm } from '~/types/models'
import { serverSupabaseClient } from '#supabase/server'

<<<<<<< Updated upstream
type Form = Omit<CardForm, 'tags' | 'mcq_answers'> & {
    tags: string
    mcq_answers: string
=======
type Form = Omit<CardForm, 'tags'> & {
    tags: string
>>>>>>> Stashed changes
}

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event)

    if (!body)
        throw createError({ statusCode: 400 })

    const supabase = await serverSupabaseClient<Database>(event)

    const payload: Form = {} as Form

    for (const field of body) {
        const fieldName = field.name!.toString()

        if (fieldName !== 'media')
            payload[fieldName] = field.data.toString()
    }

    const mediaData = body.find(field => field.name === 'media')

    // Retrieve lowest interval box
    const { data: box } = await supabase
        .from('boxes')
        .select('id')
        .order('interval')
        .single()

    if (!box)
        throw createError({ statusCode: 400, message: 'A box is required to store cards.' })

<<<<<<< Updated upstream
    const { question, question_type, answer_type, answer, notes, mcq_answers, tags } = payload
=======
    const { question, question_type, answer, notes, tags } = payload
>>>>>>> Stashed changes

    const formTags: string[] = JSON.parse(tags)

    // Check which tags already exist
    const { data: storedTags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', JSON.parse(tags))

    // Store card.
    const { data: card } = await supabase
        .from('cards')
        .insert({
<<<<<<< Updated upstream
            box_id: box.id,
            question_type,
            answer_type,
=======
            deck_id: payload.deck_id,
            box_id: box.id,
            question_type,
>>>>>>> Stashed changes
            answer,
            question,
            notes,
            media: question_type === 'media' ? '' : null,
            last_answered_at: null,
        })
        .select('id')

    if (!card)
        throw createError({ statusCode: 400, message: 'Error while creating card' })

    // Handle media upload.
    if (mediaData && question_type === 'media') {
        await supabase
            .storage
            .from('media')
            .upload(`${card[0].id}-${mediaData.name}`, mediaData?.data, {
                cacheControl: '3600',
                contentType: `${mediaData.type};charset=UTF-8`,
            })

        await supabase
            .from('cards')
            .update({
                media: `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${card[0].id}-${mediaData.name}`,
            })
            .eq('id', box.id)
    }

    // Handle tags
    const newTags = formTags.filter((t) => {
        if (storedTags !== null)
            return !storedTags.some(storedTag => storedTag.name === t)

        return true
    })

<<<<<<< Updated upstream
    /* const newTags = formTags
        .filter(t => (storedTags || [])
        .map(t => t.name)
        .includes(t)) */

    console.log(newTags)

=======
>>>>>>> Stashed changes
    if (newTags.length) {
        const { data: tId } = await supabase
            .from('tags')
            .insert(newTags.map(t => ({ name: t })))
            .select('id')

        if (!tId)
            throw createError({ statusCode: 400, message: 'Error while creating tags' })

        await supabase
            .from('cards_tags')
            .insert(tId.map(t => ({ card_id: card[0].id, tag_id: t.id })))
    }

    return payload
})
