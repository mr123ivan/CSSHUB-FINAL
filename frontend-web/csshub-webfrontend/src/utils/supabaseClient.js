// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase configuration extracted from your application.yml
const supabaseUrl = 'https://vjcyyzpskoqhdkqklttm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY3l5enBza29xaGRrcWtsdHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2NTY5MzYsImV4cCI6MjAzMTIzMjkzNn0.5Vv7Oc5YQmXJQvYfLPCQUlQmtVYADrKH9Uy2lkHVXbA'; // This is a public anon key

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
