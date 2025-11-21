import { Client, Account, Databases, Storage } from 'appwrite';

// Read settings from Vite env variables
// Configure these in a .env file with VITE_* prefix so they are exposed to the client.
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID ?? 'culina_db';
const COLLECTION_ID_POSTS = import.meta.env.VITE_APPWRITE_COLLECTION_ID_POSTS ?? 'posts';
const COLLECTION_ID_PROFILES = import.meta.env.VITE_APPWRITE_COLLECTION_ID_PROFILES ?? 'profiles';
const BUCKET_ID_IMAGES = import.meta.env.VITE_APPWRITE_BUCKET_ID_IMAGES ?? 'images';

if (!PROJECT_ID) {
  // Fail fast with a clear message to help developers configure env vars correctly.
  throw new Error(
    'Missing VITE_APPWRITE_PROJECT_ID. Please set it in your .env file (see .env.example).'
  );
}

export const APPWRITE_CONFIG = {
  ENDPOINT,
  PROJECT_ID,
  DATABASE_ID,
  COLLECTION_ID_POSTS,
  COLLECTION_ID_PROFILES,
  BUCKET_ID_IMAGES,
} as const;

export const client = new Client();

client.setEndpoint(APPWRITE_CONFIG.ENDPOINT).setProject(APPWRITE_CONFIG.PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
