

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://cspzgbjyvktjfbaiienz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcHpnYmp5dmt0amZiYWlpZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MTkzMDgsImV4cCI6MjA0OTM5NTMwOH0.6s9g2TLUr2o5o3N0_qvP2QvycklCmYteRvxHYuxYk44"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



