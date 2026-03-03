import { Client, Account } from 'appwrite';
// @ts-ignore - SvelteKit env variables
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';

const endpoint = PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = PUBLIC_APPWRITE_PROJECT_ID || '';

const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export { client };
