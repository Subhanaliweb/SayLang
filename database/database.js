import { supabase, AUDIO_BUCKET } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

// Initialize storage - just verify connection and bucket access
export const initializeStorage = async () => {
  try {
    console.log('Initializing Supabase storage...');
    
    // Test database connection
    const { data: dbTest, error: dbError } = await supabase
      .from('recordings')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('Database connection failed:', dbError);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test direct bucket access (bucket should already exist from dashboard)
    const { data: files, error: bucketError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .list('', { limit: 1 });
    
    if (bucketError) {
      console.error('❌ Bucket access failed:', bucketError);
      console.error(`Make sure bucket '${AUDIO_BUCKET}' exists in Supabase Dashboard`);
      return false;
    }
    
    console.log('✅ Storage bucket accessible');
    console.log('🎉 Supabase initialization complete!');
    return true;
    
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

// Upload audio file to Supabase Storage
export const uploadAudioFile = async (localUri) => {
  try {
    // Generate unique filename
    const fileName = `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.m4a`;
    
    // For React Native, we can upload the file directly using fetch
    // First, get file info to determine the file size
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }
    
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      type: 'audio/m4a',
      name: fileName,
    });
    
    // Get upload URL from Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(fileName, formData, {
        contentType: 'audio/m4a',
        upsert: false
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    return uploadData.path;
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw error;
  }
};

// Save recording to database with cloud storage
export const saveRecording = async (text, localAudioUri, isCustom = false, language = 'french') => {
  try {
    // First upload the audio file to cloud storage
    const audioFilePath = await uploadAudioFile(localAudioUri);
    
    // Then save the record to database
    const { data, error } = await supabase
      .from('recordings')
      .insert([
        {
          french_text: text, // Keep the column name for backward compatibility
          audio_file_path: audioFilePath,
          is_custom: isCustom,
          user_language: 'ewe', // User's native language (Ewe)
          content_language: language // Language of the content (french/ewe)
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('Recording saved successfully to cloud');
    return data;
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};

// Get all recordings from cloud database
export const getAllRecordings = async () => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching recordings:', error);
    throw error;
  }
};

// Delete recording from both database and storage
export const deleteRecording = async (id, audioFilePath) => {
  try {
    // Delete from storage first
    if (audioFilePath) {
      const { error: storageError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .remove([audioFilePath]);
      
      if (storageError) {
        console.error('Error deleting audio file:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id);
    
    if (dbError) {
      throw dbError;
    }
    
    console.log('Recording deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
};

// Get signed URL for audio playback
export const getAudioPlaybackUrl = async (audioFilePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(audioFilePath, 3600); // URL expires in 1 hour
    
    if (error) {
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting playback URL:', error);
    throw error;
  }
};

// Check connection to Supabase
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};