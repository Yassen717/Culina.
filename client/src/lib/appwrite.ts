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
  // Warn instead of throwing so the app can render and show the auth screen.
  // Auth actions will fail until VITE_APPWRITE_PROJECT_ID is provided.
  // eslint-disable-next-line no-console
  console.warn(
    'FeastFlow: VITE_APPWRITE_PROJECT_ID is not set. Auth will be disabled until you set it in your .env. See .env.example.'
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

client.setEndpoint(APPWRITE_CONFIG.ENDPOINT);
if (PROJECT_ID) {
  client.setProject(PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
