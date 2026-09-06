export const SELECTED_ROOM_REFRESH_DELAY_MS = 5_000;

export type ConversationRefreshReason = "INITIAL" | "AUTO" | "MANUAL" | "VISIBLE";
export type ConversationReader = (room: string, signal: AbortSignal, reason: ConversationRefreshReason) => Promise<void>;

interface TimerHost {
  readonly setTimeout: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  readonly clearTimeout: (timer: ReturnType<typeof setTimeout>) => void;
}

const defaultTimers: TimerHost = {
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  clearTimeout: (timer) => clearTimeout(timer),
};

export class SelectedRoomAutoRefresh {
  private room?: string;
  private timer?: ReturnType<typeof setTimeout>;
  private controller?: AbortController;
  private generation = 0;
  private visible = true;
  private disposed = false;

  constructor(
    private readonly read: ConversationReader,
    private readonly onBusyChange: (busy: boolean) => void = () => undefined,
    private readonly delayMs = SELECTED_ROOM_REFRESH_DELAY_MS,
    private readonly timers: TimerHost = defaultTimers,
  ) {}

  select(room: string): void {
    this.cancelCurrent();
    this.room = room;
    this.disposed = false;
    void this.run("INITIAL");
  }

  manual(): boolean {
    if (!this.room || this.controller) return false;
    this.clearTimer();
    void this.run("MANUAL");
    return true;
  }

  setVisible(visible: boolean): void {
    if (this.visible === visible || this.disposed) return;
    this.visible = visible;
    this.clearTimer();
    if (visible && this.room && !this.controller) void this.run("VISIBLE");
  }

  stop(): void {
    this.disposed = true;
    this.room = undefined;
    this.cancelCurrent();
  }

  dispose(): void {
    this.disposed = true;
    this.room = undefined;
    this.generation += 1;
    this.clearTimer();
    this.controller?.abort();
    this.controller = undefined;
  }

  private async run(reason: ConversationRefreshReason): Promise<void> {
    const room = this.room;
    if (!room || this.controller || this.disposed) return;
    const generation = this.generation;
    const controller = new AbortController();
    this.controller = controller;
    this.onBusyChange(true);
    try { await this.read(room, controller.signal, reason); }
    catch { /* The Rooms reader owns restrained operational-error presentation. */ }
    finally {
      if (this.controller === controller) {
        this.controller = undefined;
        this.onBusyChange(false);
      }
      if (!this.disposed && this.room === room && this.generation === generation && this.visible) this.schedule();
    }
  }

  private schedule(): void {
    this.clearTimer();
    this.timer = this.timers.setTimeout(() => {
      this.timer = undefined;
      if (this.visible) void this.run("AUTO");
    }, this.delayMs);
  }

  private cancelCurrent(): void {
    this.generation += 1;
    this.clearTimer();
    this.controller?.abort();
    this.controller = undefined;
    this.onBusyChange(false);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) this.timers.clearTimeout(this.timer);
    this.timer = undefined;
  }
}
