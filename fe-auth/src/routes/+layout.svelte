<script>
  import "../app.css";
</script>

<div class="background">
  <div class="header-container">
    <slot />
  </div>
</div>

<style>
  .background {
    @apply w-full;
    @apply h-full;
    @apply absolute;
    @apply flex flex-row justify-center items-center;
    background: linear-gradient(45deg, #073b4c 0%, #ef476f 100%);
  }
</style>
