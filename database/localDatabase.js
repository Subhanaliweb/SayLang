import * as SQLite from 'expo-sqlite';

let databaseInstance = null;

const getDatabase = async () => {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync('gbe-gne.db');
  }
  return databaseInstance;
};

const checkColumnExists = async (db, tableName, columnName) => {
  try {
    const result = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
    return result.some(column => column.name === columnName);
  } catch (error) {
    console.error('Error checking column existence:', error);
    return false;
  }
};

export const initLocalDatabase = async () => {
  try {
    const db = await getDatabase();
    
    // Create table with basic structure first
    await db.runAsync(
      'CREATE TABLE IF NOT EXISTS completed_texts (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'text_id INTEGER NOT NULL,' +
      'language TEXT NOT NULL,' +
      'completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
      ');'
    );
    
    // Check and add missing columns
    const hasUserId = await checkColumnExists(db, 'completed_texts', 'user_id');
    const hasAnonymousUserId = await checkColumnExists(db, 'completed_texts', 'anonymous_user_id');
    
    if (!hasUserId) {
      console.log('Adding user_id column...');
      await db.runAsync('ALTER TABLE completed_texts ADD COLUMN user_id TEXT;');
    }
    
    if (!hasAnonymousUserId) {
      console.log('Adding anonymous_user_id column...');
      await db.runAsync('ALTER TABLE completed_texts ADD COLUMN anonymous_user_id TEXT;');
    }
    
    console.log('Local database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing local database:', error);
    throw error;
  }
};

export const markTextAsCompleted = async (textId, language, userId = null, anonymousUserId = null) => {
  try {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      'INSERT INTO completed_texts (text_id, language, user_id, anonymous_user_id) VALUES (?, ?, ?, ?);',
      [textId, language, userId, anonymousUserId]
    );
    
    console.log('Text marked as completed successfully');
    return result;
  } catch (error) {
    console.error('Error marking text as completed:', error);
    throw error;
  }
};

export const getCompletedTexts = async (language, userId = null, anonymousUserId = null) => {
  try {
    const db = await getDatabase();
    
    let query = 'SELECT text_id FROM completed_texts WHERE language = ?';
    const params = [language];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    } else if (anonymousUserId) {
      query += ' AND anonymous_user_id = ?';
      params.push(anonymousUserId);
    } else {
      // If no user or anonymous user, return empty to show all texts
      return [];
    }
    
    const result = await db.getAllAsync(query, params);
    return result.map(row => row.text_id);
  } catch (error) {
    console.error('Error getting completed texts:', error);
    throw error;
  }
};