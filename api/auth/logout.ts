import { NextApiRequest, NextApiResponse } from 'next';
import { UserAuthManager } from '../../src/utils/user-auth.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization;
    const user = await UserAuthManager.authenticateUser(authHeader);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No active session found'
      });
    }

    // Delete user session and tokens
    await UserAuthManager.deleteUserData(user.userId);

    // Clear session cookie
    res.setHeader('Set-Cookie', [
      `session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`, // Clear session cookie
    ]);

    res.status(200).json({
      success: true,
      message: 'Successfully logged out. Your tokens and session data have been deleted.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}