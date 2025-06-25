import { supabase, AUDIO_BUCKET } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

export const initializeStorage = async () => {
  try {
    console.log('Initializing Supabase storage...');
    
    const { data: dbTest, error: dbError } = await supabase
      .from('recordings')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('Database connection failed:', dbError);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    const { data: files, error: bucketError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .list('', { limit: 1 });
    
    if (bucketError) {
      console.error('❌ Bucket access failed:', bucketError);
      console.error(`Make sure bucket '${AUDIO_BUCKET}' exists in Supabase`);
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

export const uploadAudioFile = async (localUri) => {
  try {
    const fileName = `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.m4a`;
    
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }
    
    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      type: 'audio/m4a',
      name: fileName,
    });
    
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

export const saveRecording = async (text, localAudioUri, isCustom = false, language = 'french', user = null, anonymousUser = null) => {
  try {
    const audioFilePath = await uploadAudioFile(localAudioUri);
    
    const { data, error } = await supabase
      .from('recordings')
      .insert([
        {
          french_text: text,
          audio_file_path: audioFilePath,
          is_custom: isCustom,
          user_language: 'ewe',
          content_language: language,
          user_id: user?.id,
          anonymous_user_id: anonymousUser?.id
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

export const getAllRecordings = async () => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select(`
        *,
        anonymous_users:username
      `)
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

export const deleteRecording = async (id, audioFilePath) => {
  try {
    if (audioFilePath) {
      const { error: storageError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .remove([audioFilePath]);
      
      if (storageError) {
        console.error('Error deleting audio file:', storageError);
      }
    }
    
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

export const getAudioPlaybackUrl = async (audioFilePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(audioFilePath, 3600);
    
    if (error) {
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting playback URL:', error);
    throw error;
  }
};

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