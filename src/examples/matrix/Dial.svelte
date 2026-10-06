<script lang="ts">
  /**
   * An angle as a dial: drag the handle round, or focus it and use the arrow
   * keys (Shift for 15°, Page Up/Down for 45°, Home for 0°). A slider to
   * assistive technology.
   */
  let {
    value,
    onchange,
    label,
    min = -360,
    max = 360,
    disabled = false,
  }: {
    value: number | undefined;
    onchange: (degrees: number) => void;
    label: string;
    min?: number;
    max?: number;
    disabled?: boolean;
  } = $props();

  const degrees = $derived(
    typeof value === "number" && Number.isFinite(value) ? value : 0,
  );
  const radians = $derived((degrees * Math.PI) / 180);

  const R = 26;
  const handle = $derived([
    32 + R * Math.cos(radians),
    32 - R * Math.sin(radians),
  ]);

  /** the swept arc from 0° to the angle, counter-clockwise for positive */
  const arc = $derived.by(() => {
    const sweep = Math.max(-359.99, Math.min(359.99, degrees));
    if (Math.abs(sweep) < 0.5) return "";
    const r = 14;
    const end = (sweep * Math.PI) / 180;
    const large = Math.abs(sweep) > 180 ? 1 : 0;
    const flag = sweep > 0 ? 0 : 1;
    return `M ${32 + r} 32 A ${r} ${r} 0 ${large} ${flag} ${32 + r * Math.cos(end)} ${32 - r * Math.sin(end)}`;
  });

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

  let svg = $state<SVGSVGElement>();
  let dragging = $state(false);

  const fromPointer = (event: PointerEvent) => {
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const x = event.clientX - (box.left + box.width / 2);
    const y = box.top + box.height / 2 - event.clientY;
    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    // keep turning the way the value already points: -90 stays -90, not 270
    if (degrees < 0 && angle > 0) angle -= 360;
    if (degrees >= 0 && angle < 0) angle += 360;
    if (Math.abs(angle - degrees) > 180) angle += angle > degrees ? -360 : 360;
    onchange(clamp(event.shiftKey ? Math.round(angle / 15) * 15 : angle));
  };

  const down = (event: PointerEvent) => {
    if (disabled) return;
    dragging = true;
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    fromPointer(event);
  };

  const keys: Record<string, (d: number, big: boolean) => number> = {
    ArrowUp: (d, big) => d + (big ? 15 : 5),
    ArrowRight: (d, big) => d + (big ? 15 : 5),
    ArrowDown: (d, big) => d - (big ? 15 : 5),
    ArrowLeft: (d, big) => d - (big ? 15 : 5),
    PageUp: (d) => d + 45,
    PageDown: (d) => d - 45,
    Home: () => 0,
  };

  const keydown = (event: KeyboardEvent) => {
    const step = keys[event.key];
    if (!step || disabled) return;
    event.preventDefault();
    onchange(clamp(step(degrees, event.shiftKey)));
  };
</script>

<svg
  bind:this={svg}
  class="dial"
  class:dragging
  viewBox="0 0 64 64"
  role="slider"
  tabindex={disabled ? -1 : 0}
  aria-label={label}
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={degrees}
  aria-valuetext={`${degrees}°`}
  aria-disabled={disabled}
  onpointerdown={down}
  onpointermove={(e) => dragging && fromPointer(e)}
  onpointerup={() => (dragging = false)}
  onpointercancel={() => (dragging = false)}
  onkeydown={keydown}
>
  <circle class="face" cx="32" cy="32" r="30" />
  {#each Array.from({ length: 24 }, (_, i) => i * 15) as tick}
    {@const t = (tick * Math.PI) / 180}
    {@const inner = tick % 90 === 0 ? 23 : 26}
    <line
      class="tick"
      class:major={tick % 90 === 0}
      x1={32 + inner * Math.cos(t)}
      y1={32 - inner * Math.sin(t)}
      x2={32 + 29 * Math.cos(t)}
      y2={32 - 29 * Math.sin(t)}
    />
  {/each}
  <line class="zero" x1="32" y1="32" x2="58" y2="32" />
  {#if arc}<path class="arc" d={arc} />{/if}
  <line class="hand" x1="32" y1="32" x2={handle[0]} y2={handle[1]} />
  <circle class="pivot" cx="32" cy="32" r="2.5" />
  <circle class="knob" cx={handle[0]} cy={handle[1]} r="5" />
</svg>

<style>
  .dial {
    width: 4.75rem;
    height: 4.75rem;
    flex: none;
    touch-action: none;
    cursor: grab;
    border-radius: 50%;
    color: var(--sc-accent, currentColor);
  }

  .dial.dragging {
    cursor: grabbing;
  }

  .dial:focus-visible {
    outline: 2px solid var(--sc-accent, currentColor);
    outline-offset: 3px;
  }

  .dial[aria-disabled="true"] {
    cursor: default;
    opacity: 0.6;
  }

  .face {
    fill: var(--sc-surface, transparent);
    stroke: var(--sc-border, #d4d4d4);
    stroke-width: 1;
  }

  .tick {
    stroke: var(--sc-border, #d4d4d4);
    stroke-width: 1;
  }

  .tick.major {
    stroke: var(--sc-muted, #737373);
  }

  .zero {
    stroke: var(--sc-border, #d4d4d4);
    stroke-dasharray: 2 2;
  }

  .arc {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    opacity: 0.45;
  }

  .hand {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .pivot,
  .knob {
    fill: currentColor;
  }

  .knob {
    stroke: var(--sc-background, #fff);
    stroke-width: 1.5;
  }
</style>
