<script lang="ts">
  /** A drawn glyph (no font or image needed): a plus, or a cross. */
  let { name }: { name: "add" | "close" } = $props();
</script>

<span class="icon {name}" aria-hidden="true"></span>

<style>
  .icon {
    position: relative;
    display: inline-block;
    flex: none;
    width: 1.125em;
    height: 1.125em;
  }

  .icon::before,
  .icon::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.8em;
    height: 0.125em;
    background: currentColor;
    border-radius: 0.0625em;
    transform: translate(-50%, -50%);
  }

  .add::after {
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .close::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .close::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
</style>
