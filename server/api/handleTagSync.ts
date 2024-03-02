import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

interface PivotData {
    tag_id: number
    card_id: number
}

/*
    1. Feth all tags for current card
    2. Check if formTag's content is contained by the fetched tags
    3. If not, create missing tag(s) and maybe add the tag to the list
    4. Delete everything related to card_id inside the pivot (cards_tags)
    5. Loop through all formTags, retrieve tag id from name and create an array of object with card_id
    6. Save the result
*/

export default async function syncTags(supabase: SupabaseClient<Database>, deckId: string, cardId: number, tags: string[]) {
    const pivotData: PivotData[] = []

    // Feth all tags for current card
    const { data: storedTags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tags)
        .eq('deck_id', deckId)

    if (!storedTags)
        return

    // Check if tags's content is contained by the fetched tags
    const newTags = tags.filter(t => !storedTags.find(st => st.name === t))

    // Create missing tag(s) and add the tag(s) to the list
    const { data: createdTags, error: tagError } = await supabase
        .from('tags')
        .insert(newTags.map(t => ({ name: t, deck_id: deckId })))
        .select('id, name')

    if (!createdTags)
        throw createError({ statusCode: 400, message: tagError.message })

    pivotData.push(...createdTags.map(ct => ({ tag_id: ct.id, card_id: cardId })))

    // Delete everything related to card_id inside the pivot (cards_tags)
    await supabase
        .from('cards_tags')
        .delete()
        .eq('card_id', cardId)

    // Loop through all tags, filter out recently created tags, and get a match from existing tags;
    // Extract tag id and create a pivot object from there.
    const existingTags = tags.reduce((acc, tag) => {
        const retrievedTag = storedTags.find(st => st.name === tag)
        if (retrievedTag)
            acc.push({ tag_id: retrievedTag.id, card_id: cardId })
        return acc
    }, [] as PivotData[])

    // Insert the result in the pivot table.
    await supabase
        .from('cards_tags')
        .insert(pivotData.concat(existingTags))
}
