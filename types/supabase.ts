export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            boxes: {
                Row: {
                    created_at: string
                    id: number
                    interval: number
                    name: string
                }
                Insert: {
                    created_at?: string
                    id?: number
                    interval: number
                    name: string
                }
                Update: {
                    created_at?: string
                    id?: number
                    interval?: number
                    name?: string
                }
                Relationships: []
            }
            cards: {
                Row: {
                    answer: string
                    box_id: number
                    created_at: string
                    deck_id: string
                    id: number
                    last_answered_at: string | null
                    media: string | null
                    notes: string | null
                    question: string | null
                    question_type: Database['public']['Enums']['question_types']
                }
                Insert: {
                    answer: string
                    box_id: number
                    created_at?: string
                    deck_id: string
                    id?: number
                    last_answered_at?: string | null
                    media?: string | null
                    notes?: string | null
                    question?: string | null
                    question_type?: Database['public']['Enums']['question_types']
                }
                Update: {
                    answer?: string
                    box_id?: number
                    created_at?: string
                    deck_id?: string
                    id?: number
                    last_answered_at?: string | null
                    media?: string | null
                    notes?: string | null
                    question?: string | null
                    question_type?: Database['public']['Enums']['question_types']
                }
                Relationships: [
                    {
                        foreignKeyName: 'cards_box_id_fkey'
                        columns: ['box_id']
                        isOneToOne: false
                        referencedRelation: 'boxes'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'cards_deck_id_fkey'
                        columns: ['deck_id']
                        isOneToOne: false
                        referencedRelation: 'decks'
                        referencedColumns: ['id']
                    },
                ]
            }
            cards_tags: {
                Row: {
                    card_id: number
                    created_at: string
                    id: number
                    tag_id: number
                }
                Insert: {
                    card_id: number
                    created_at?: string
                    id?: number
                    tag_id: number
                }
                Update: {
                    card_id?: number
                    created_at?: string
                    id?: number
                    tag_id?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'cards_tags_card_id_fkey'
                        columns: ['card_id']
                        isOneToOne: false
                        referencedRelation: 'cards'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'cards_tags_tag_id_fkey'
                        columns: ['tag_id']
                        isOneToOne: false
                        referencedRelation: 'tags'
                        referencedColumns: ['id']
                    },
                ]
            }
            decks: {
                Row: {
                    created_at: string
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            statistics: {
                Row: {
                    box_id: number
                    card_id: number
                    created_at: string
                    difficulty: string
                    id: number
                }
                Insert: {
                    box_id: number
                    card_id: number
                    created_at?: string
                    difficulty: string
                    id?: number
                }
                Update: {
                    box_id?: number
                    card_id?: number
                    created_at?: string
                    difficulty?: string
                    id?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'statistics_box_id_fkey'
                        columns: ['box_id']
                        isOneToOne: false
                        referencedRelation: 'boxes'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'statistics_card_id_fkey'
                        columns: ['card_id']
                        isOneToOne: false
                        referencedRelation: 'cards'
                        referencedColumns: ['id']
                    },
                ]
            }
            tags: {
                Row: {
                    created_at: string
                    deck_id: string
                    id: number
                    name: string
                }
                Insert: {
                    created_at?: string
                    deck_id: string
                    id?: number
                    name: string
                }
                Update: {
                    created_at?: string
                    deck_id?: string
                    id?: number
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'tags_deck_id_fkey'
                        columns: ['deck_id']
                        isOneToOne: false
                        referencedRelation: 'decks'
                        referencedColumns: ['id']
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            question_types: 'classic' | 'media'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database['public']['Tables'] & Database['public']['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
      ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])
      : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
            Row: infer R
        }
            ? R
            : never
    : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
    Database['public']['Views'])
        ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
                Row: infer R
            }
                ? R
                : never
        : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
      ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
      : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
        Insert: infer I
    }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof Database['public']['Tables']
        ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
            Insert: infer I
        }
            ? I
            : never
        : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
      ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
      : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
        Update: infer U
    }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof Database['public']['Tables']
        ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
            Update: infer U
        }
            ? U
            : never
        : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database['public']['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
      ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
      : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
        ? Database['public']['Enums'][PublicEnumNameOrOptions]
        : never
