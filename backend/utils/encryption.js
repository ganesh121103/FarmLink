const crypto = require('crypto');

// Use a fallback key for development if no ENCRYPTION_KEY is provided in .env
// We hash the fallback string to ensure it is always 32 bytes (256 bits).
const SECRET = process.env.ENCRYPTION_KEY || 'farmlink_default_secret_key_12345';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(SECRET)).digest('base64').substr(0, 32); 

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypts a text string using AES-256-CBC.
 */
function encrypt(text) {
    if (!text) return text;
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted text joined by a colon
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a text string using AES-256-CBC.
 * Graciously returns the original text if it doesn't appear to be encrypted (backwards compatibility).
 */
function decrypt(text) {
    if (!text) return text;
    
    const textParts = text.split(':');
    
    // If it doesn't have the expected IV format (16 bytes = 32 hex chars), return original text
    if (textParts.length !== 2 || textParts[0].length !== 32) {
        return text;
    }
    
    try {
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption failed, falling back to raw text:', error.message);
        return text; // Fallback to raw text if decryption fails
    }
}

module.exports = {
    encrypt,
    decrypt
};
