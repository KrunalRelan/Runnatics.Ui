/**
 * Client-side password encryption using AES-CBC (SubtleCrypto — no extra library needed).
 *
 * The same key and algorithm must be configured on the backend to decrypt the value.
 * Key is read from VITE_ENCRYPTION_KEY (a 32-byte base64-encoded secret, e.g.
 *   openssl rand -base64 32
 * Set the same value in the backend configuration.
 */

const KEY_B64 = ((import.meta as any).env?.VITE_ENCRYPTION_KEY as string | undefined)?.trim() || undefined;

async function importKey(keyB64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-CBC' }, false, ['encrypt']);
}

/**
 * Encrypts a plain-text password and returns a base64 string in the format:
 *   <base64-iv>:<base64-ciphertext>
 *
 * Returns the original password unchanged when VITE_ENCRYPTION_KEY is not set
 * (e.g. during local development without the env variable), so login still works.
 */
export async function encryptPassword(plaintext: string): Promise<string> {
  if (!KEY_B64) {
    console.warn('[encryption] VITE_ENCRYPTION_KEY is not set – sending password unencrypted.');
    return plaintext;
  }

  const key = await importKey(KEY_B64);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, encoded);

  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));

  return `${ivB64}:${cipherB64}`;
}
