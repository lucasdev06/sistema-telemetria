import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.com/dashboard/project/fyojnzueudygggrprkip/settings/jwt'
const supabaseKey = 'sb_publishable_BxhHLxXyofqWDMhrwKbSZg_A82p8yFa'

const supabase = createClient(supabaseUrl, supabaseKey)