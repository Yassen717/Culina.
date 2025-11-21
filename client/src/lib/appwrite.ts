import { Client, Account, Databases, Storage } from 'appwrite';

export const APPWRITE_CONFIG = {
  ENDPOINT: 'https://cloud.appwrite.io/v1',
  PROJECT_ID: 'YOUR_PROJECT_ID', // Replace with your Appwrite Project ID
  DATABASE_ID: 'culina_db',
  COLLECTION_ID_POSTS: 'posts',
  COLLECTION_ID_PROFILES: 'profiles',
  BUCKET_ID_IMAGES: 'images',
};

export const client = new Client();

client
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
