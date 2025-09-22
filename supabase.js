const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "";
const supabaseKey = ""
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

