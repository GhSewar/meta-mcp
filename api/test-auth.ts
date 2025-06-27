import { NextApiRequest, NextApiResponse } from 'next';
import { UserAuthManager } from '../src/utils/user-auth.js';

// Mock testing endpoint - DO NOT USE IN PRODUCTION
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a mock user session for testing
    const mockUser = {
      userId: 'test_user_123',
      email: 'test@example.com',
      name: 'Test User',
      metaUserId: 'mock_meta_123',
      accessToken: 'mock_access_token_for_testing',
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    // Store mock session
    await UserAuthManager.storeUserSession(mockUser);
    await UserAuthManager.storeUserTokens(mockUser.userId, {
      accessToken: 'mock_access_token_for_testing',
      tokenType: 'bearer',
      scope: ['ads_management', 'ads_read'],
    });

    // Generate session token
    const sessionToken = await UserAuthManager.createSessionToken(mockUser.userId);

    res.status(200).json({
      success: true,
      message: 'Mock user session created for testing',
      user: mockUser,
      sessionToken: sessionToken,
      mcpEndpoint: `https://${req.headers.host}/api/mcp`,
      testInstructions: {
        addToClaudeConfig: {
          mcpServers: {
            'meta-ads-test': {
              url: `https://${req.headers.host}/api/mcp`,
              headers: {
                Authorization: `Bearer ${sessionToken}`
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}