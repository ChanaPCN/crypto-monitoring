import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
    public: {
        Tables: {
            portfolio: {
                Row: {
                    id: string
                    user_id: string
                    coin_symbol: string
                    coin_name: string
                    amount: number
                    buy_price: number
                    buy_date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    coin_symbol: string
                    coin_name: string
                    amount: number
                    buy_price: number
                    buy_date: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    coin_symbol?: string
                    coin_name?: string
                    amount?: number
                    buy_price?: number
                    buy_date?: string
                    created_at?: string
                }
            }
            portfolio_history: {
                Row: {
                    id: string
                    user_id: string
                    total_value: number
                    timestamp: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    total_value: number
                    timestamp?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    total_value?: number
                    timestamp?: string
                }
            }
        }
    }
}
