<script lang="ts">
  import { keyboard } from "./notes.ts";

  /**
   * A piano keyboard. Notes sound while held: press a key with the mouse, a
   * finger or a pen and slide across to play the next (several fingers at
   * once on a touch screen). It is one stop in the tab order: the arrow keys
   * move between keys, and Space or Enter plays the focused one.
   */
  let {
    lowest,
    count = 17,
    held,
    onpress,
    onrelease,
  }: {
    /** the MIDI note of the leftmost key */
    lowest: number;
    count?: number;
    /** the notes sounding, drawn pressed */
    held: ReadonlySet<number>;
    onpress: (midi: number) => void;
    onrelease: (midi: number) => void;
  } = $props();

  const keys = $derived(keyboard(lowest, count));
  const whites = $derived(keys.filter((k) => !k.black).length);
  /** on a narrow screen only the first octave and its top C are drawn */
  const OCTAVE = 13;
  const octaveWhites = $derived(
    keys.slice(0, OCTAVE).filter((k) => !k.black).length,
  );

  /** which note each pointer is holding down */
  const pointers = new Map<number, number>();
  /** the key that takes focus when the keyboard is tabbed to */
  let focused = $state(0);
  let element: HTMLDivElement;

  const midiOf = (target: EventTarget | Element | null) => {
    const key = (target as Element | null)?.closest?.<HTMLElement>(
      "[data-midi]",
    );
    return key && element.contains(key) ? Number(key.dataset.midi) : undefined;
  };

  const hold = (pointer: number, midi: number | undefined) => {
    const was = pointers.get(pointer);
    if (was === midi) return;
    if (was !== undefined) {
      pointers.delete(pointer);
      if (![...pointers.values()].includes(was)) onrelease(was);
    }
    if (midi !== undefined) {
      pointers.set(pointer, midi);
      onpress(midi);
    }
  };

  const onpointerdown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const midi = midiOf(event.target);
    if (midi === undefined) return;
    // keep the pointer: a slide off the key still reaches us, and the page does not scroll
    event.preventDefault();
    element.setPointerCapture?.(event.pointerId);
    hold(event.pointerId, midi);
  };

  const onpointermove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    // with the pointer captured, the target is the keyboard: ask what is under it
    const under = document.elementFromPoint?.(event.clientX, event.clientY);
    hold(event.pointerId, midiOf(under ?? null));
  };

  const lift = (event: PointerEvent) => hold(event.pointerId, undefined);

  const onkeydown = (event: KeyboardEvent, index: number) => {
    const move = { ArrowLeft: -1, ArrowRight: 1, Home: -count, End: count }[
      event.key
    ];
    if (move !== undefined) {
      event.preventDefault();
      focused = Math.max(0, Math.min(count - 1, index + move));
      element.querySelectorAll<HTMLElement>("[data-midi]")[focused]?.focus();
      return;
    }
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      onpress(keys[index].midi);
    }
  };

  const onkeyup = (event: KeyboardEvent, index: number) => {
    if (event.key === " " || event.key === "Enter") onrelease(keys[index].midi);
  };
</script>

<div
  class="keyboard"
  role="group"
  aria-label="Keyboard"
  style:--all-whites={whites}
  style:--octave-whites={octaveWhites}
  bind:this={element}
  {onpointerdown}
  {onpointermove}
  onpointerup={lift}
  onpointercancel={lift}
  oncontextmenu={(event) => event.preventDefault()}
>
  {#each keys as key, index (key.midi)}
    <button
      type="button"
      class="key"
      class:black={key.black}
      class:white={!key.black}
      class:extra={index >= OCTAVE}
      data-midi={key.midi}
      style:--column={key.column}
      aria-label={key.name}
      aria-pressed={held.has(key.midi)}
      tabindex={index === focused ? 0 : -1}
      onfocus={() => (focused = index)}
      onkeydown={(event) => onkeydown(event, index)}
      onkeyup={(event) => onkeyup(event, index)}
      onblur={() => held.has(key.midi) && onrelease(key.midi)}
    >
      {#if key.letter}<span class="letter" aria-hidden="true">{key.letter}</span
        >{/if}
      {#if !key.black && key.name.startsWith("C")}<span
          class="octave"
          aria-hidden="true">{key.name}</span
        >{/if}
    </button>
  {/each}
</div>

<style>
  .keyboard {
    --whites: var(--all-whites);
    --white-width: calc(100% / var(--whites));
    --black-width: calc(var(--white-width) * 0.62);
    position: relative;
    display: flex;
    height: clamp(120px, 22vw, 190px);
    padding: 0;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .key {
    box-sizing: border-box;
    margin: 0;
    padding: 0 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
    font: inherit;
    font-size: 11px;
    border: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .white {
    flex: 1 1 0;
    min-width: 0;
    color: var(--synth-key-label, #6b6558);
    background: linear-gradient(
      to bottom,
      var(--synth-ivory-top, #e9e3d4) 0%,
      var(--synth-ivory, #fbf8f0) 12%,
      var(--synth-ivory, #fbf8f0) 92%,
      var(--synth-ivory-bottom, #ddd6c4) 100%
    );
    border-right: 1px solid var(--synth-key-gap, #9b9484);
    border-radius: 0 0 6px 6px;
    box-shadow: inset 0 -6px 0 var(--synth-ivory-lip, #e2dccb);
  }

  .white:first-child {
    border-left: 1px solid var(--synth-key-gap, #9b9484);
  }

  .black {
    position: absolute;
    top: 0;
    left: calc(
      (var(--column) + 1) * var(--white-width) - var(--black-width) / 2
    );
    z-index: 1;
    width: var(--black-width);
    height: 60%;
    padding-bottom: 8px;
    color: var(--synth-ebony-label, #9c978d);
    background: linear-gradient(
      to bottom,
      var(--synth-ebony-top, #050506),
      var(--synth-ebony, #232326) 85%,
      var(--synth-ebony-lip, #39393d) 100%
    );
    border-radius: 0 0 4px 4px;
    box-shadow:
      0 3px 4px rgb(0 0 0 / 0.45),
      inset 0 -5px 0 rgb(255 255 255 / 0.06);
  }

  .white[aria-pressed="true"] {
    background: linear-gradient(
      to bottom,
      var(--synth-ivory-top, #e9e3d4) 0%,
      var(--synth-ivory-down, #ece5d4) 14%,
      var(--synth-ivory-down, #ece5d4) 100%
    );
    box-shadow:
      inset 0 -2px 0 var(--synth-ivory-lip, #e2dccb),
      inset 0 0 0 100vmax
        color-mix(in srgb, var(--synth-accent, #ff7a2f) 26%, transparent);
  }

  .black[aria-pressed="true"] {
    background: linear-gradient(
      to bottom,
      var(--synth-ebony-top, #050506),
      color-mix(
          in srgb,
          var(--synth-accent, #ff7a2f) 55%,
          var(--synth-ebony, #232326)
        )
        96%
    );
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
  }

  .key:focus-visible {
    outline: 3px solid var(--synth-accent, #ff7a2f);
    outline-offset: -3px;
    z-index: 2;
  }

  .letter {
    font-weight: 700;
    letter-spacing: 0.04em;
    opacity: 0.85;
  }

  .octave {
    font-size: 9px;
    opacity: 0.6;
  }

  /* on a narrow screen the letters crowd the keys: a phone has no keyboard to type them on anyway */
  /* a phone gets one octave, with keys wide enough for fingers */
  @container (max-width: 460px) {
    .keyboard {
      --whites: var(--octave-whites);
    }

    .extra {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .letter {
      display: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .key {
      transition:
        background 60ms,
        box-shadow 60ms;
    }
  }
</style>
