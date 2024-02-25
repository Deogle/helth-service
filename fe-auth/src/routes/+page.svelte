<script lang="ts">
  import axios from "axios";

  let email = "";
  let authStatus = "";

  const AuthStatus = Object.freeze({
    NOT_AUTHENTICATED: "User not found",
    AUTHENTICATED_WITH_WHOOP: "Authenticated with Whoop",
    AUTHENTICATED_WITH_FITBIT: "Authenticated with Fitbit",
    FAILED_TO_REVOKE: "Failed to revoke authentication",
    REVOKED: "Authentication revoked",
  });

  async function handleWhoopAuth() {
    const { url } = (await axios.get("/api/auth/whoop")).data;
    document.location = url;
  }

  async function handleFitbitAuth() {
    const { url } = (
      await axios.get("/api/auth/fitbit", {
        params: {
          email,
        },
      })
    ).data;
    document.location = url;
  }

  async function lookupAuthStatus() {
    try {
      const { data } = await axios.post(`/api/users`, {
        email,
      });
      authStatus =
        data.provider === "whoop"
          ? AuthStatus.AUTHENTICATED_WITH_WHOOP
          : AuthStatus.AUTHENTICATED_WITH_FITBIT;
    } catch (error) {
      authStatus = AuthStatus.NOT_AUTHENTICATED;
    }
  }

  async function revokeAuth(email: string) {
    try {
      await axios.delete(`/api/users`, {
        params: {
          email,
        },
      });
      authStatus = AuthStatus.REVOKED;
    } catch (error) {
      authStatus = AuthStatus.FAILED_TO_REVOKE;
    }
  }
</script>

<div class="w-screen h-screen flex justify-center px-3 py-10 bg-gray-200">
  <div class="w-full max-w-xs">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h1 class="text-xl text-center pb-2">Authenticate with Helth</h1>
      <div class="mt-2">
        <input
          type="email"
          bind:value={email}
          placeholder="Enter your email address"
        />
      </div>
      <div class="flex flex-col py-2 space-y-2">
        <button
          class="bg-black hover:bg-[#1a1a1a] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-75 disabled:hover:bg-black"
          disabled={email === ""}
          on:click={handleWhoopAuth}>Auth with Whoop</button
        >
        <button
          class="bg-[#00B0B9] hover:bg-[#1ab8c0] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-75 disabled:hover:bg-[#00B0B9]"
          disabled={email === ""}
          on:click={handleFitbitAuth}>Auth with Fitbit</button
        >
      </div>
      <button
        class="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-75 disabled:hover:bg-blue-500"
        disabled={email === ""}
        on:click={lookupAuthStatus}>Check auth status</button
      >
      <div class="mt-4 text-center w-full space-y-2">
        <p>{authStatus}</p>
        {#if authStatus && authStatus !== AuthStatus.NOT_AUTHENTICATED && authStatus !== AuthStatus.REVOKED}
          <button
            class="w-full bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-75 disabled:hover:bg-red-500"
            on:click={() => {
              revokeAuth(email);
            }}
          >
            Revoke authentication
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  input {
    @apply shadow;
    @apply appearance-none;
    @apply border;
    @apply border-gray-500;
    @apply rounded;
    @apply w-full;
    @apply py-2;
    @apply px-3;
    @apply text-gray-700;
    @apply mb-3;
    @apply leading-tight;
  }
</style>
