<script lang="ts">
  import { knobArc, polar, SWEEP } from "./geometry.ts";
  import {
    format,
    fromPosition,
    nudge,
    toPosition,
    type Param,
  } from "./params.ts";

  /**
   * A rotary knob: an ARIA slider. Drag up or down to turn it (Shift for fine
   * control), use the arrow keys, Page Up/Down, Home and End, or double-click
   * to put it back to its default.
   */
  let {
    value,
    param,
    label,
    size = "medium",
    disabled = false,
    describedby,
    onchange,
  }: {
    value: number;
    param: Param;
    /** its accessible name */
    label: string;
    size?: "medium" | "large";
    disabled?: boolean;
    describedby?: string;
    onchange: (value: number) => void;
  } = $props();

  const position = $derived(toPosition(value, param));
  const angle = $derived(-SWEEP / 2 + position * SWEEP);
  const tip = $derived(polar(32, 32, 15, angle));
  const tail = $derived(polar(32, 32, 6, angle));

  let drag: { y: number; position: number } | undefined;

  const set = (next: number) => {
    if (!disabled && next !== value) onchange(next);
  };

  const keys: Record<string, (v: number) => number> = {
    ArrowUp: (v) => nudge(v, param, 1),
    ArrowRight: (v) => nudge(v, param, 1),
    ArrowDown: (v) => nudge(v, param, -1),
    ArrowLeft: (v) => nudge(v, param, -1),
    PageUp: (v) => nudge(v, param, 10),
    PageDown: (v) => nudge(v, param, -10),
    Home: () => param.min,
    End: () => param.max,
  };

  const onkeydown = (event: KeyboardEvent) => {
    const key = keys[event.key];
    if (!key) return;
    event.preventDefault();
    set(key(value));
  };

  const onpointerdown = (event: PointerEvent) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0))
      return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).focus();
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    drag = { y: event.clientY, position };
  };

  const onpointermove = (event: PointerEvent) => {
    if (!drag) return;
    // a full turn is 160px of travel, or 640px with Shift held
    const travel = (drag.y - event.clientY) / (event.shiftKey ? 640 : 160);
    set(fromPosition(drag.position + travel, param));
  };

  const end = () => (drag = undefined);
</script>

<div
  class="knob {size}"
  class:disabled
  role="slider"
  tabindex={disabled ? -1 : 0}
  aria-label={label}
  aria-describedby={describedby}
  aria-valuemin={param.min}
  aria-valuemax={param.max}
  aria-valuenow={value}
  aria-valuetext={format(value, param)}
  aria-disabled={disabled || undefined}
  aria-orientation="vertical"
  {onkeydown}
  {onpointerdown}
  {onpointermove}
  onpointerup={end}
  onpointercancel={end}
  ondblclick={() => set(param.default)}
>
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <!-- the scale printed on the panel around the knob -->
    {#each Array.from({ length: 11 }, (_, i) => i / 10) as tick}
      {@const a = -SWEEP / 2 + tick * SWEEP}
      {@const [x0, y0] = polar(32, 32, 28, a)}
      {@const [x1, y1] = polar(32, 32, 31, a)}
      <line class="tick" x1={x0} y1={y0} x2={x1} y2={y1} />
    {/each}
    <path class="track" d={knobArc(32, 32, 25, 1)} />
    {#if position > 0.001}
      <path class="value" d={knobArc(32, 32, 25, position)} />
    {/if}
    <circle class="cap" cx="32" cy="32" r="20" />
    <circle class="cap-top" cx="32" cy="32" r="16" />
    <line class="pointer" x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} />
  </svg>
</div>

<style>
  .knob {
    --size: 52px;
    position: relative;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    cursor: ns-resize;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    outline: none;
  }

  .knob.large {
    --size: 92px;
  }

  .knob.disabled {
    cursor: default;
    opacity: 0.6;
  }

  .knob:focus-visible {
    box-shadow:
      0 0 0 2px var(--synth-panel, #222),
      0 0 0 4px var(--synth-accent, #ff7a2f);
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .tick {
    stroke: var(--synth-ink-dim, #888);
    stroke-width: 1.2;
    stroke-linecap: round;
  }

  .track,
  .value {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
  }

  .track {
    stroke: var(--synth-groove, #111);
  }

  .value {
    stroke: var(--synth-accent, #ff7a2f);
    filter: drop-shadow(0 0 2px var(--synth-accent-glow, transparent));
  }

  .cap {
    fill: var(--synth-knob-edge, #0f1012);
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.45));
  }

  .cap-top {
    fill: var(--synth-knob, #2c2d31);
    stroke: var(--synth-knob-rim, rgb(255 255 255 / 0.08));
    stroke-width: 1;
  }

  .pointer {
    stroke: var(--synth-pointer, #f4efe4);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .knob:hover .cap-top {
    fill: var(--synth-knob-hover, #34353a);
  }
</style>
