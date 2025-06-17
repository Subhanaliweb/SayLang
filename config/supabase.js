import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://xxiwidlijvdhqaxgmlzx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aXdpZGxpanZkaHFheGdtbHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTI0MDQsImV4cCI6MjA2NDg4ODQwNH0.c7pcLOSUcu1UUuH1UDRsyekAf180sj550QMJ96AX_TM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name for audio files
export const AUDIO_BUCKET = 'audio-recordings';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  FRENCH: 'french',
  EWE: 'ewe'
};

// Language display names
export const LANGUAGE_NAMES = {
  french: 'Français',
  ewe: 'Eʋegbe'
};