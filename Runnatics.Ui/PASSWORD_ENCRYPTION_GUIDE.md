# Password Encryption Implementation Guide

## 📋 Overview

This implementation adds password encryption for data in transit between the frontend and backend API. The password is encrypted on the frontend before sending and decrypted on the backend before BCrypt hashing.

## 🔐 Security Flow

### Login Flow:
```
Frontend                          Backend
--------                          -------
User enters password
    ↓
Encrypt with XOR + Base64
    ↓
Send to API              →        Receive encrypted password
                                      ↓
                                  Decrypt password
                                      ↓
                                  Verify with BCrypt
                                      ↓
                                  Return JWT token
```

### Register Flow:
```
Frontend                          Backend
--------                          -------
User enters password
    ↓
Encrypt with XOR + Base64
    ↓
Send to API              →        Receive encrypted password
                                      ↓
                                  Decrypt password
                                      ↓
                                  Hash with BCrypt
                                      ↓
                                  Save to database
                                      ↓
                                  Return JWT token
```

## ✅ What Was Implemented

### Frontend (React/TypeScript)

1. **Created encryption utility**: `/src/main/src/utility/encryption.ts`
   - `encryptPassword()` - Encrypts password using XOR cipher + Base64
   - `decryptPassword()` - Decrypts password (for testing)

2. **Updated AuthService**: `/src/main/src/services/AuthService.ts`
   - Login method now encrypts password before sending
   - Register method now encrypts password before sending

### Backend (C# .NET)

See `BACKEND_DECRYPTION_CODE.md` for complete C# implementation.

## 🔑 Secret Key Configuration

**CRITICAL**: The SECRET_KEY must be identical on both frontend and backend!

### Current Key
```
SECRET_KEY = "RunnaticsSecureKey2025"
```

### To Change the Key:

**Frontend** (`src/main/src/utility/encryption.ts`):
```typescript
const SECRET_KEY = 'YourNewSecretKey123';
```

**Backend** (C# PasswordDecryption class):
```csharp
private const string SECRET_KEY = "YourNewSecretKey123";
```

### Production Recommendation:
Store the key in environment variables:

**Frontend** (.env):
```
VITE_ENCRYPTION_KEY=YourProductionKey456
```

**Backend** (appsettings.json):
```json
{
  "Security": {
    "EncryptionKey": "YourProductionKey456"
  }
}
```

## 🧪 Testing

### Test in Browser Console:

```javascript
// Import the encryption utility
import { encryptPassword, decryptPassword } from './src/main/src/utility/encryption';

// Test encryption
const password = "MyPassword123!";
const encrypted = encryptPassword(password);
console.log("Encrypted:", encrypted);

// Test decryption
const decrypted = decryptPassword(encrypted);
console.log("Decrypted:", decrypted);
console.log("Match:", password === decrypted);
```

### What You'll See in Network Inspect:

**Before Implementation:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123!"  ← Visible plain text!
}
```

**After Implementation:**
```json
{
  "email": "user@example.com",
  "password": "Kj4xM2E5bW9yZQ=="  ← Encrypted/obfuscated!
}
```

## ⚠️ Important Security Notes

### 1. This is NOT True Encryption
- XOR cipher is **obfuscation**, not military-grade encryption
- It prevents casual inspection but is not cryptographically secure
- A determined attacker could reverse-engineer it

### 2. HTTPS is Essential
- **Always use HTTPS in production**
- HTTPS provides true encryption (SSL/TLS) for all data in transit
- This custom encryption is an **additional layer** only

### 3. Key Management
- Never commit secret keys to Git in production
- Use environment variables
- Rotate keys periodically
- Keep frontend and backend keys in sync

### 4. BCrypt Still Required
- This encryption is **only for transit**
- BCrypt is **still used** for database storage
- Never store plain text passwords in database

## 🚀 Production Deployment Checklist

- [ ] Change SECRET_KEY from default value
- [ ] Store SECRET_KEY in environment variables
- [ ] Ensure frontend and backend keys match
- [ ] Enable HTTPS on your server
- [ ] Test login/register with encrypted passwords
- [ ] Verify passwords are obfuscated in network inspector
- [ ] Confirm BCrypt verification works correctly
- [ ] Test password reset flow (if applicable)

## 🔄 Alternative: HTTPS Only (Recommended)

The **industry best practice** is to use HTTPS only without custom encryption:

### Pros of HTTPS-Only:
- ✅ Military-grade encryption (TLS 1.3)
- ✅ No custom code to maintain
- ✅ Industry standard
- ✅ Encrypts ALL data, not just passwords
- ✅ Protected against man-in-the-middle attacks

### Cons of Custom Encryption:
- ❌ Additional complexity
- ❌ Key synchronization required
- ❌ Not as secure as TLS
- ❌ Potential for implementation bugs

### When to Use Custom Encryption:
- Development environment without HTTPS
- Additional obfuscation for sensitive data
- Compliance requirements for extra security layers
- Defense-in-depth strategy

### When NOT to Use:
- If you have HTTPS (it's redundant)
- If you can't maintain key synchronization
- If it causes implementation problems

## 📞 Support

If you encounter issues:

1. **Keys don't match**: Verify SECRET_KEY is identical on both sides
2. **Decryption fails**: Check Base64 encoding/decoding
3. **Login fails**: Ensure decryption happens before BCrypt verification
4. **Register fails**: Ensure decryption happens before BCrypt hashing

## 📚 Additional Resources

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [BCrypt.Net Documentation](https://github.com/BcryptNet/bcrypt.net)
- [HTTPS Best Practices](https://https.cio.gov/)
