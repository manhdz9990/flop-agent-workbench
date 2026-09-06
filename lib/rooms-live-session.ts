export type LiveRoomReadReason = "INITIAL" | "CURSOR" | "MANUAL" | "VISIBLE";
export interface LiveRoomReadResult { readonly cursor?: string; readonly recordCount?: number; readonly ok: boolean }
export type LiveRoomReader = (room: string, cursor: string | undefined, signal: AbortSignal, reason: LiveRoomReadReason) => Promise<LiveRoomReadResult>;

interface TimerHost {
  readonly setTimeout: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  readonly clearTimeout: (timer: ReturnType<typeof setTimeout>) => void;
}
// Browser timer functions are Web IDL methods and must retain the global
// receiver. Wrappers also keep the scheduler injectable without extracting
// `window.setTimeout`/`window.clearTimeout` as illegally invoked methods.
const timers: TimerHost = {
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimeout: (timer) => globalThis.clearTimeout(timer),
};

export class SelectedRoomLiveSession {
  private room?: string;
  private cursor?: string;
  private controller?: AbortController;
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private visible = true;
  private disposed = false;

  constructor(private readonly read: LiveRoomReader, private readonly onBusy: (busy: boolean) => void = () => undefined, private readonly timerHost: TimerHost = timers) {}

  select(room: string): void { this.cancel(); this.room = room; this.cursor = undefined; this.disposed = false; void this.run("INITIAL"); }
  manual(): boolean { if (!this.room || this.controller) return false; this.clearTimer(); void this.run(this.cursor ? "MANUAL" : "INITIAL"); return true; }
  restart(): void { if (!this.room || this.disposed || !this.visible) return; this.generation += 1; this.clearTimer(); this.controller?.abort(); this.controller = undefined; this.onBusy(false); void this.run(this.cursor ? "CURSOR" : "INITIAL"); }
  setVisible(visible: boolean): void {
    if (this.visible === visible || this.disposed) return;
    this.visible = visible; this.generation += 1; this.clearTimer(); this.controller?.abort(); this.controller = undefined; this.onBusy(false);
    if (visible && this.room) void this.run(this.cursor ? "VISIBLE" : "INITIAL");
  }
  stop(): void { this.disposed = true; this.room = undefined; this.cursor = undefined; this.cancel(); }
  dispose(): void { this.stop(); }

  private async run(reason: LiveRoomReadReason): Promise<void> {
    const room = this.room;
    if (!room || this.controller || this.disposed || !this.visible) return;
    const generation = this.generation;
    const controller = new AbortController();
    this.controller = controller; this.onBusy(true);
    let delay = 0;
    try {
      const started = Date.now();
      const result = await this.read(room, this.cursor, controller.signal, reason);
      if (result.ok && result.cursor !== undefined) this.cursor = result.cursor;
      // Match the official /humans pump: successful reads reconnect immediately.
      // Only a near-instant empty cursor response backs off, preventing a hot
      // loop when the server has declined to allocate a waiter slot.
      const quickEmpty = reason !== "INITIAL" && result.ok && result.recordCount === 0 && Date.now() - started < 500;
      delay = result.ok ? (quickEmpty ? 2_000 : 0) : 3_000;
    } catch { delay = 3_000; }
    finally {
      const ownsRequest = this.controller === controller;
      if (ownsRequest) { this.controller = undefined; this.onBusy(false); }
      if (ownsRequest && !this.disposed && this.visible && this.room === room && this.generation === generation) this.timer = this.timerHost.setTimeout(() => { this.timer = undefined; void this.run("CURSOR"); }, delay);
    }
  }

  private cancel(): void { this.generation += 1; this.clearTimer(); this.controller?.abort(); this.controller = undefined; this.onBusy(false); }
  private clearTimer(): void { if (this.timer !== undefined) this.timerHost.clearTimeout(this.timer); this.timer = undefined; }
}
