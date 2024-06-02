<script>
  import Button from "$lib/button.svelte";
</script>

<div class="flex flex-col space-y-5">
  <h1 class="text-2xl text-white max-w-md text-center">
    Successfull authenticated with Helth. <br /> Add the bot to your server to start
    receiving updates!
  </h1>
  <div class="flex flex-col items-center space-y-2">
    <Button href="/" text="Invite Health to Discord" />
    <Button href="/" text="Read the Docs" />
  </div>
</div>
