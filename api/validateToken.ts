// This is a Vercel Serverless Function. It runs on Vercel's servers.
// To learn more, see: https://vercel.com/docs/functions/serverless-functions/typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Get the token from the query string parameters (e.g., /?token=YOUR_TOKEN)
  const { token } = request.query;

  // --- Add a special test mode token for development ---
  if (token === 'test-mode') {
    // If the token is 'test-mode', grant access immediately.
    response.status(200).json({ message: 'Access granted in test mode.' });
    return;
  }

  // Retrieve the valid token from a secure environment variable.
  // You will set this in your Vercel project's UI under "Settings" -> "Environment Variables".
  const validToken = process.env.VALID_ACCESS_TOKEN;
  
  // --- Validation Logic ---

  // 1. Check if a secret token has been configured in Vercel's settings.
  // If not, return an error because the system is not set up correctly.
  if (!validToken) {
    response.status(500).json({ message: 'Server configuration error: VALID_ACCESS_TOKEN is not set.' });
    return;
  }

  // 2. Check if the provided token matches the secret token.
  if (token && token === validToken) {
    // If the tokens match, the user is granted access.
    response.status(200).json({ message: 'Access granted.' });
  } else {
    // If the tokens do NOT match (or if no token was provided), deny access.
    response.status(403).json({ message: 'Invalid or missing token.', reason: 'invalid' });
  }
}
