const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wjvrpbhuopxxbqxnhetq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdnJwYmh1b3B4eGJxeG5oZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDI3OTMsImV4cCI6MjA3MzQ3ODc5M30.aeDLetdhkiRKrl1n8rzfyUVA55iTx9XhpPWCE3JV_2Y"; // "anon public key"
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
