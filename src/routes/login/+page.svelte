<script lang="ts">
  import { startAuthentication } from '@simplewebauthn/browser';
  import { goto } from '$app/navigation';

  async function login() {
    try {
      const optionsResponse = await fetch('/api/auth/login-options');
      const options = await optionsResponse.json();
      
      const authenticationResponse = await startAuthentication(options);
      
      const verificationResponse = await fetch('/api/auth/login-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authenticationResponse)
      });
      
      if (verificationResponse.ok) {
        goto('/');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  }
</script>

<h1>Login</h1>
<button on:click={login}>Login with Passkey</button>