// src/main/src/utils/encryption.ts

import CryptoJS from 'crypto-js';

/**
 * Encryption utility for sensitive data
 * Uses AES encryption with a secret key
 */

// IMPORTANT: This key should be stored in environment variables
// For production, use a more secure key management system
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-change-this-in-production';

/**
 * Encrypt a string using AES encryption
 * @param data - The string to encrypt
 * @returns Encrypted string in base64 format
 */
export const encryptData = (data: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt an AES encrypted string
 * @param encryptedData - The encrypted string in base64 format
 * @returns Decrypted string
 */
export const decryptData = (encryptedData: string): string => {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Hash a password using SHA256
 * Note: For production, the backend should handle password hashing with bcrypt/argon2
 * @param password - The password to hash
 * @returns Hashed password
 */
export const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString();
};

/**
 * Generate a random salt
 * @returns Random salt string
 */
export const generateSalt = (): string => {
    return CryptoJS.lib.WordArray.random(128/8).toString();
};
