// src/main/src/utility/encryption.ts

/**
 * Simple encryption utility using Base64 encoding with a secret key
 * Note: For production, use HTTPS instead. This is for additional obfuscation.
 * 
 * IMPORTANT: This is NOT true encryption, just obfuscation. 
 * Always use HTTPS in production for real security.
 */

const SECRET_KEY = 'RunnaticsSecureKey2025'; // Change this to match your backend

/**
 * Encrypt password using XOR cipher with Base64 encoding
 * @param password - Plain text password
 * @returns Encrypted password string
 */
export const encryptPassword = (password: string): string => {
    try {
        // XOR encryption with secret key
        let encrypted = '';
        for (let i = 0; i < password.length; i++) {
            const passwordChar = password.charCodeAt(i);
            const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            encrypted += String.fromCharCode(passwordChar ^ keyChar);
        }
        
        // Encode to Base64 to make it URL-safe
        return btoa(encrypted);
    } catch (error) {
        console.error('Encryption error:', error);
        return password; // Fallback to plain password if encryption fails
    }
};

/**
 * Decrypt password (for testing purposes)
 * @param encryptedPassword - Encrypted password string
 * @returns Decrypted password
 */
export const decryptPassword = (encryptedPassword: string): string => {
    try {
        // Decode from Base64
        const encrypted = atob(encryptedPassword);
        
        // XOR decryption with secret key
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            const encryptedChar = encrypted.charCodeAt(i);
            const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            decrypted += String.fromCharCode(encryptedChar ^ keyChar);
        }
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedPassword; // Fallback to return as-is if decryption fails
    }
};
