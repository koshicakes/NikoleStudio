// supabase.js — shared Supabase client for all Nikole Studio pages
// ⚠️ Replace these with your actual Supabase project URL and anon key

const NIKOLE_SUPABASE_URL = 'https://iouecgwquqengycxzzbt.supabase.co';
const NIKOLE_SUPABASE_ANON_KEY = 'sb_publishable_jjvZjkPhZ8MSLrG7dbx-JA_pBrq6mHD';

// Initialize client (window.supabase is loaded via CDN in each page)
const nikoleDB = window.supabase.createClient(NIKOLE_SUPABASE_URL, NIKOLE_SUPABASE_ANON_KEY);
<<<<<<< HEAD
window.nikoleDB = nikoleDB;
=======
>>>>>>> 60ff1a6f774ded85328b7b27217c31b9e07732ae
