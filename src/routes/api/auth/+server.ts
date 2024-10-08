import { json } from '@sveltejs/kit';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { VerifiedRegistrationResponse, VerifiedAuthenticationResponse } from '@simplewebauthn/server';

const rpName = 'Multi-user Todo App';
const rpID = 'localhost';
const origin = `http://${rpID}:5173`;

// In-memory user storage (replace with database in production)
const users: Record<string, any> = {};

export async function POST({ request, url }) {
  const route = url.pathname.split('/').pop();

  switch (route) {
    case 'register-options':
      const { username } = await request.json();
      const userId = `${username}_${Date.now()}`;
      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: userId,
        userName: username,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred',
        },
      });
      users[userId] = { username, currentChallenge: options.challenge };
      return json(options);

    case 'register-verification':
      const regResponse = await request.json();
      const user = Object.values(users).find(u => u.currentChallenge === regResponse.response.clientDataJSON);
      if (!user) {
        return new Response('User not found', { status: 400 });
      }
      let verification: VerifiedRegistrationResponse;
      try {
        verification = await verifyRegistrationResponse({
          response: regResponse,
          expectedChallenge: user.currentChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
        });
      } catch (error) {
        console.error(error);
        return new Response('Registration failed', { status: 400 });
      }
      if (verification.verified) {
        user.devices = [verification.registrationInfo];
        user.currentChallenge = undefined;
        return new Response('Registration successful', { status: 200 });
      }
      return new Response('Registration failed', { status: 400 });

    case 'login-options':
      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: [],
        userVerification: 'preferred',
      });
      // Store the challenge for verification
      users['currentChallenge'] = options.challenge;
      return json(options);

    case 'login-verification':
      const authResponse = await request.json();
      let dbAuthenticator;
      const userHandle = Buffer.from(authResponse.response.userHandle, 'base64').toString('utf8');
      const user = users[userHandle];
      if (!user) {
        return new Response('User not found', { status: 400 });
      }
      dbAuthenticator = user.devices[0];
      let verification: VerifiedAuthenticationResponse;
      try {
        verification = await verifyAuthenticationResponse({
          response: authResponse,
          expectedChallenge: users['currentChallenge'],
          expectedOrigin: origin,
          expectedRPID: rpID,
          authenticator: dbAuthenticator,
        });
      } catch (error) {
        console.error(error);
        return new Response('Authentication failed', { status: 400 });
      }
      if (verification.verified) {
        users['currentChallenge'] = undefined;
        return new Response('Authentication successful', { status: 200 });
      }
      return new Response('Authentication failed', { status: 400 });

    default:
      return new Response('Not found', { status: 404 });
  }
}

export async function GET({ url }) {
  const route = url.pathname.split('/').pop();

  if (route === 'session') {
    // Implement session check logic here
    // For simplicity, we're just returning a mock session
    return json({ user: { id: 'user123', username: 'testuser' } });
  }

  return new Response('Not found', { status: 404 });
}