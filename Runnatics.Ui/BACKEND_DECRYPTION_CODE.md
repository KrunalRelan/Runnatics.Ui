# Backend Password Decryption Code

## C# Implementation for .NET API

Add this class to your backend API project to decrypt passwords sent from the frontend:

```csharp
using System;
using System.Text;

namespace YourNamespace.Utilities
{
    /// <summary>
    /// Password decryption utility to decrypt passwords sent from frontend
    /// Must match the encryption key used on the frontend
    /// </summary>
    public static class PasswordDecryption
    {
        // This must match the SECRET_KEY in frontend encryption.ts
        private const string SECRET_KEY = "RunnaticsSecureKey2025";

        /// <summary>
        /// Decrypt password received from frontend
        /// </summary>
        /// <param name="encryptedPassword">Base64 encoded encrypted password</param>
        /// <returns>Decrypted plain text password</returns>
        public static string DecryptPassword(string encryptedPassword)
        {
            try
            {
                // Decode from Base64
                byte[] encryptedBytes = Convert.FromBase64String(encryptedPassword);
                string encrypted = Encoding.UTF8.GetString(encryptedBytes);

                // XOR decryption with secret key
                StringBuilder decrypted = new StringBuilder();
                for (int i = 0; i < encrypted.Length; i++)
                {
                    char encryptedChar = encrypted[i];
                    char keyChar = SECRET_KEY[i % SECRET_KEY.Length];
                    decrypted.Append((char)(encryptedChar ^ keyChar));
                }

                return decrypted.ToString();
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Decryption error: {ex.Message}");
                // Return encrypted password as fallback (or throw exception based on your needs)
                return encryptedPassword;
            }
        }
    }
}
```

## Usage in Your Login Controller

Update your login endpoint to decrypt the password before hashing with BCrypt:

```csharp
using YourNamespace.Utilities;
using BCrypt.Net;

[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    try
    {
        // 1. Decrypt the password received from frontend
        string decryptedPassword = PasswordDecryption.DecryptPassword(request.Password);
        
        // 2. Find user by email
        var user = await _userRepository.GetUserByEmailAsync(request.Email);
        
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }
        
        // 3. Verify the decrypted password against stored BCrypt hash
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(decryptedPassword, user.PasswordHash);
        
        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }
        
        // 4. Generate JWT token and return response
        var token = GenerateJwtToken(user);
        
        return Ok(new LoginResponse
        {
            Token = token,
            User = user,
            // ... other response data
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during login");
        return StatusCode(500, new { message = "An error occurred during login" });
    }
}
```

## Usage in Your Register Controller

Update your register endpoint to decrypt the password before hashing:

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    try
    {
        // 1. Decrypt the password received from frontend
        string decryptedPassword = PasswordDecryption.DecryptPassword(request.Password);
        
        // 2. Hash the decrypted password with BCrypt
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(decryptedPassword);
        
        // 3. Create new user with hashed password
        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = hashedPassword, // Store BCrypt hash
            CreatedAt = DateTime.UtcNow,
            // ... other user properties
        };
        
        // 4. Save user to database
        await _userRepository.CreateUserAsync(user);
        
        // 5. Generate JWT token and return response
        var token = GenerateJwtToken(user);
        
        return Ok(new LoginResponse
        {
            Token = token,
            User = user,
            // ... other response data
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during registration");
        return StatusCode(500, new { message = "An error occurred during registration" });
    }
}
```

## Important Security Notes

1. **SECRET_KEY**: Make sure the `SECRET_KEY` in both frontend (encryption.ts) and backend (C# class) are **EXACTLY THE SAME**

2. **HTTPS**: This encryption is for obfuscation only. **Always use HTTPS in production** for true security

3. **Key Management**: In production, store the SECRET_KEY in environment variables or configuration files, not hardcoded

4. **BCrypt Flow**:
   - Frontend: `password` → XOR encrypt → Base64 encode → send to API
   - Backend: receive → Base64 decode → XOR decrypt → BCrypt verify (login) or BCrypt hash (register)

5. **Testing**: Test thoroughly to ensure encryption/decryption works correctly before deploying

## Alternative: Use HTTPS Only (Recommended)

The **best practice** is to simply use HTTPS (SSL/TLS) which encrypts all data in transit automatically. 
In that case, you don't need this custom encryption/decryption - just send the password normally and 
let HTTPS handle the security.

```csharp
// Without custom encryption (when using HTTPS):
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userRepository.GetUserByEmailAsync(request.Email);
    
    if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
    {
        return Unauthorized(new { message = "Invalid credentials" });
    }
    
    // ... rest of login logic
}
```

This is simpler, more secure, and industry standard. Use HTTPS in production!
