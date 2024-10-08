<script lang="ts">
  import { startRegistration } from '@simplewebauthn/browser';
  import { goto } from '$app/navigation';

  let username = '';

  async function register() {
    try {
      const optionsResponse = await fetch('/api/auth/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const options = await optionsResponse.json();
      
      const registrationResponse = await startRegistration(options);
      
      const verificationResponse = await fetch('/api/auth/register-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationResponse)
      });
      
      if (verificationResponse.ok) {
        alert('Registration successful');
        goto('/login');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  }
</script>

<h1>Register</h1>
<form on:submit|preventDefault={register}>
  <input bind:value={username} placeholder="Username" required />
  <button type="submit">Register with Passkey</button>
</form>