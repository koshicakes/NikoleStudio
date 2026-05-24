const NIKOLE_SUPABASE_URL   = 'https://iouecgwquqengycxzzbt.supabase.co';
const NIKOLE_SUPABASE_ANON_KEY = 'sb_publishable_iD0UpMqBkrmL6HpTDCy1bA_1MdJQc4D';
const NIKOLE_EMAIL_FUNCTION = 'send-booking-email';

window.nikoleDB = window.supabase.createClient(NIKOLE_SUPABASE_URL, NIKOLE_SUPABASE_ANON_KEY);