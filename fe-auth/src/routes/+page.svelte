<script lang="ts">
  import Button from "$lib/button.svelte";

  const GITHUB_URL = "https://github.com/Deogle/helth-service";
</script>

<h1 class="header">Helth.</h1>
<div class="flex flex-col space-y-4">
  <Button href="/app" text="App" />
  <Button href={GITHUB_URL} text="Github" />
</div>
