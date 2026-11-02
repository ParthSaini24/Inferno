import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload receipt image to Supabase Storage bucket 'receipts'
 * or fallback to Local Data URL when demo mode is active.
 */
export async function uploadReceiptFile(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.warn('Supabase receipt upload failed, falling back to local preview:', uploadError.message);
    } else {
      const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
      return data.publicUrl;
    }
  }

  // Fallback: Read as Data URL so user can preview and attach immediately in local/demo mode
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
