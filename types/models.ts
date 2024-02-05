export enum QuestionType {
    Classic = 'classic',
    Media = 'media',
}

export enum AnswerType {
    MCQ = 'mcq',
    Guess = 'guess',
    Exact = 'exact',
}

export interface BaseCard {
    last_answered_at: string | null
    tags: string
    notes: string
    answer: string
}

interface QuestionTypeBase {
    question_type: QuestionType
}

interface AnswerTypeBase {
    answer_type: AnswerType
}

export type ClassicCard = BaseCard & QuestionTypeBase & {
    question_type: QuestionType.Classic
}

export type MediaCard = BaseCard & QuestionTypeBase & {
    question_type: QuestionType.Media
    media: string
}

export type MCQCard = BaseCard & AnswerTypeBase & {
    answer_type: AnswerType.MCQ
    mcq_answers: string
}

export type DefaultAnswerCard = BaseCard & AnswerTypeBase & {
    answer_type: AnswerType.Guess | AnswerType.Exact
}

export interface CardForm {
    deck_id: string
    question_type: 'classic' | 'media'
    question: string
    answer: string
    tags: string[]
    notes: string
    media: File[] | undefined
}
