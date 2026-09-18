import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

describe("useDebouncedValue", () => {
  it("updates only after the configured delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "pik" },
    });

    rerender({ value: "pikachu" });
    expect(result.current).toBe("pik");

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("pik");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("pikachu");

    vi.useRealTimers();
  });
});
