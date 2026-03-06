import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://fyojnzueudygggrprkip.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5b2puenVldWR5Z2dncnBya2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzQ4MTcsImV4cCI6MjA4ODA1MDgxN30.ggbcERUJBiLyFPh-GGySyJsNXSkO-3_7r7eHykl9MeQ'

export const client = createClient(supabaseUrl, supabaseKey)

console.log("Teste de Conexão: Ok", client);


