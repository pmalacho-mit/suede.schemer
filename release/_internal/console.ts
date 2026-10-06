// Helpers for the namespace tests beside release/ code. Tests import this
// module only as a type, so neither it nor vitest reaches a build.
import { onTestFinished, vi } from "vitest";

/** Silences `console.warn` for the current test, recording each call's arguments. */
export const consoleWarnings = () => {
  const calls: unknown[][] = [];
  const spy = vi.spyOn(console, "warn").mockImplementation((...args) => {
    calls.push(args);
  });
  onTestFinished(() => spy.mockRestore());
  return calls;
};
