// Debug Component - Add this temporarily to your CreateEvent page to verify token
// You can remove this after verifying

import { Box, Paper, Typography, Button } from '@mui/material';
import { tokenManager } from '../utils/axios.config';

export const TokenDebugger = () => {
  const token = tokenManager.getToken();

  const handleTestRequest = async () => {
    try {
      console.log('🧪 Testing token...');
      console.log('Token from localStorage:', token);
      
      if (!token) {
        alert('❌ No token found! Please login first.');
        return;
      }

      // Test with a simple GET request
      const response = await fetch('http://localhost:5286/api/Events/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        alert('✅ Token is working! Check console for details.');
      } else {
        alert(`❌ Token test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      alert('❌ Request failed. Check console for details.');
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
      <Typography variant="h6" gutterBottom>
        🔍 Token Debugger (Remove after testing)
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Token exists:</strong> {token ? '✅ Yes' : '❌ No'}
        </Typography>
        {token && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Token preview:</strong> {token.substring(0, 50)}...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
              Full token (check console): 
              <Button size="small" onClick={() => console.log('Full Token:', token)}>
                Log to Console
              </Button>
            </Typography>
          </>
        )}
      </Box>

      <Button variant="contained" size="small" onClick={handleTestRequest}>
        Test Token with API
      </Button>

      <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="caption" display="block">
          <strong>Expected Request Headers:</strong>
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
          Authorization: Bearer {token ? token.substring(0, 30) + '...' : '[no token]'}
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
          Content-Type: application/json
        </Typography>
      </Box>
    </Paper>
  );
};

// HOW TO USE:
// 1. Import this component in CreateEvent.tsx:
//    import { TokenDebugger } from './TokenDebugger';
//
// 2. Add it at the top of your form:
//    <TokenDebugger />
//
// 3. Test the token before creating an event
// 4. Remove it after verifying everything works!
