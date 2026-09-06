import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectedRoomLiveSession, type LiveRoomReader } from "../../lib/rooms-live-session";

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
const fakeTimerHost = { setTimeout: (callback: () => void, delay: number) => setTimeout(callback, delay), clearTimeout: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer) };

describe("SelectedRoomLiveSession", () => {
  afterEach(() => vi.useRealTimers());

  it("initializes a cursor and reconnects an explicitly held long poll", async () => {
    vi.useFakeTimers();
    const read = vi.fn<LiveRoomReader>()
      .mockResolvedValueOnce({ ok: true, cursor: "12" })
      .mockResolvedValueOnce({ ok: true, cursor: "13", recordCount: 1 })
      .mockResolvedValue({ ok: true, cursor: "13", recordCount: 0 });
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("lobby"); await flush();
    expect(read.mock.calls[0]?.slice(0, 2)).toEqual(["lobby", undefined]);
    await vi.advanceTimersByTimeAsync(0); await flush();
    expect(read.mock.calls[1]?.slice(0, 2)).toEqual(["lobby", "12"]);
    await flush(); await vi.runOnlyPendingTimersAsync(); await flush();
    expect(read.mock.calls[2]?.slice(0, 2)).toEqual(["lobby", "13"]);
    session.dispose();
  });

  it("backs off after failures while retaining the cursor", async () => {
    vi.useFakeTimers();
    const read = vi.fn<LiveRoomReader>()
      .mockResolvedValueOnce({ ok: true, cursor: "4", recordCount: 1 })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ ok: true, cursor: "5", recordCount: 0 });
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("alpha"); await flush();
    await vi.advanceTimersByTimeAsync(0); await flush();
    await vi.advanceTimersByTimeAsync(2_999); expect(read).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1); await flush();
    expect(read.mock.calls[2]?.[1]).toBe("4");
    session.dispose();
  });

  it("re-polls immediately after a normally held empty response", async () => {
    vi.useFakeTimers();
    let settle: ((value: { ok: true; cursor: string; recordCount: number }) => void) | undefined;
    const read = vi.fn<LiveRoomReader>()
      .mockResolvedValueOnce({ ok: true, cursor: "20", recordCount: 2 })
      .mockImplementationOnce(() => new Promise((resolve) => { settle = resolve; }))
      .mockImplementation(() => new Promise(() => undefined));
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("lobby"); await flush();
    await vi.advanceTimersByTimeAsync(0); await flush();
    await vi.advanceTimersByTimeAsync(10_000);
    settle?.({ ok: true, cursor: "20", recordCount: 0 }); await flush();
    await vi.advanceTimersByTimeAsync(0); await flush();
    expect(read).toHaveBeenCalledTimes(3);
    expect(read.mock.calls[2]?.[1]).toBe("20");
    session.dispose();
  });

  it("uses only the official two-second guard for an instant empty refusal", async () => {
    vi.useFakeTimers();
    const read = vi.fn<LiveRoomReader>()
      .mockResolvedValueOnce({ ok: true, cursor: "31", recordCount: 1 })
      .mockResolvedValueOnce({ ok: true, cursor: "31", recordCount: 0 })
      .mockImplementation(() => new Promise(() => undefined));
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("lobby"); await flush();
    await vi.advanceTimersByTimeAsync(0); await flush();
    await vi.advanceTimersByTimeAsync(1_999); expect(read).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1); await flush();
    expect(read).toHaveBeenCalledTimes(3);
    session.dispose();
  });

  it("restarts the same cursor after a send without allowing the aborted read to duplicate the pump", async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const read = vi.fn<LiveRoomReader>((_room, cursor, signal) => {
      signals.push(signal);
      return cursor ? new Promise(() => undefined) : Promise.resolve({ ok: true, cursor: "41", recordCount: 1 });
    });
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("lobby"); await flush(); await vi.advanceTimersByTimeAsync(0); await flush();
    session.restart(); await flush();
    expect(signals[1]?.aborted).toBe(true);
    expect(read.mock.calls[2]?.[1]).toBe("41");
    expect(read).toHaveBeenCalledTimes(3);
    session.dispose();
  });

  it("aborts and invalidates the prior room when switching", async () => {
    let oldSignal: AbortSignal | undefined;
    const read = vi.fn<LiveRoomReader>((room, _cursor, signal) => {
      if (room === "old") { oldSignal = signal; return new Promise(() => undefined); }
      return Promise.resolve({ ok: true, cursor: "9", recordCount: 0 });
    });
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("old"); await flush();
    session.select("new"); await flush();
    expect(oldSignal?.aborted).toBe(true);
    expect(read.mock.calls[1]?.slice(0, 2)).toEqual(["new", undefined]);
    session.dispose();
  });

  it("pauses while hidden, resumes from its cursor, and aborts on dispose", async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const read = vi.fn<LiveRoomReader>((_room, cursor, signal) => {
      signals.push(signal);
      if (cursor) return new Promise(() => undefined);
      return Promise.resolve({ ok: true, cursor: "7", recordCount: 1 });
    });
    const session = new SelectedRoomLiveSession(read, undefined, fakeTimerHost);
    session.select("lobby"); await flush();
    await vi.advanceTimersByTimeAsync(0); await flush();
    session.setVisible(false);
    expect(signals.at(-1)?.aborted).toBe(true);
    session.setVisible(true); await flush();
    expect(read.mock.calls.at(-1)?.[1]).toBe("7");
    session.dispose();
    expect(signals.at(-1)?.aborted).toBe(true);
  });
});
