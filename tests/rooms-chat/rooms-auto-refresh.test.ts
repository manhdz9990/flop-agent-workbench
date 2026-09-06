import { beforeEach, describe, expect, it, vi } from "vitest";

import { SELECTED_ROOM_REFRESH_DELAY_MS, SelectedRoomAutoRefresh, type ConversationRefreshReason } from "../../lib/rooms-auto-refresh";

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

describe("selected-room bounded auto-refresh lifecycle", () => {
  beforeEach(() => vi.useFakeTimers());

  it("reads once on selection, waits five seconds after settlement, and never overlaps", async () => {
    let settle!: () => void;
    const calls: Array<{ room: string; reason: ConversationRefreshReason }> = [];
    const read = vi.fn((room: string, _signal: AbortSignal, reason: ConversationRefreshReason) => new Promise<void>((resolve) => { calls.push({ room, reason }); settle = resolve; }));
    const lifecycle = new SelectedRoomAutoRefresh(read);
    lifecycle.select("garden");
    expect(calls).toEqual([{ room: "garden", reason: "INITIAL" }]);
    await vi.advanceTimersByTimeAsync(SELECTED_ROOM_REFRESH_DELAY_MS * 2);
    expect(read).toHaveBeenCalledTimes(1);
    settle(); await flush();
    await vi.advanceTimersByTimeAsync(SELECTED_ROOM_REFRESH_DELAY_MS - 1);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls.at(-1)).toEqual({ room: "garden", reason: "AUTO" });
  });

  it("serializes manual refresh and restarts cadence after it settles", async () => {
    const resolvers: Array<() => void> = [];
    const read = vi.fn(() => new Promise<void>((resolve) => resolvers.push(resolve)));
    const lifecycle = new SelectedRoomAutoRefresh(read);
    lifecycle.select("garden");
    expect(lifecycle.manual()).toBe(false);
    resolvers.shift()!(); await flush();
    expect(lifecycle.manual()).toBe(true);
    expect(lifecycle.manual()).toBe(false);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(read).toHaveBeenCalledTimes(2);
    resolvers.shift()!(); await flush();
    await vi.advanceTimersByTimeAsync(SELECTED_ROOM_REFRESH_DELAY_MS);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it("pauses while hidden and performs one catch-up before resuming cadence", async () => {
    const read = vi.fn(async () => undefined);
    const lifecycle = new SelectedRoomAutoRefresh(read);
    lifecycle.select("garden"); await flush();
    lifecycle.setVisible(false);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(read).toHaveBeenCalledTimes(1);
    lifecycle.setVisible(true); await flush();
    expect(read).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(SELECTED_ROOM_REFRESH_DELAY_MS);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it("aborts and invalidates Room A on switch, then owns Room B cadence", async () => {
    const signals: AbortSignal[] = [];
    const calls: string[] = [];
    const read = vi.fn((room: string, signal: AbortSignal) => { calls.push(room); signals.push(signal); return new Promise<void>(() => undefined); });
    const lifecycle = new SelectedRoomAutoRefresh(read);
    lifecycle.select("a");
    lifecycle.select("b");
    expect(signals[0]?.aborted).toBe(true);
    expect(calls).toEqual(["a", "b"]);
  });

  it("cleans up timers and requests on stop without queued ticks", async () => {
    const signals: AbortSignal[] = [];
    const read = vi.fn(async (_room: string, signal: AbortSignal) => { signals.push(signal); });
    const lifecycle = new SelectedRoomAutoRefresh(read);
    lifecycle.select("garden"); await flush();
    lifecycle.stop();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(read).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("disposes without invoking UI state callbacks after unmount", () => {
    const busy = vi.fn();
    const lifecycle = new SelectedRoomAutoRefresh(async () => new Promise<void>(() => undefined), busy);
    lifecycle.select("garden");
    expect(busy).toHaveBeenLastCalledWith(true);
    busy.mockClear();
    lifecycle.dispose();
    expect(busy).not.toHaveBeenCalled();
  });
});
