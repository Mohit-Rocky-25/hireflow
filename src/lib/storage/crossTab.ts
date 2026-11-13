export interface CrossTabMessage {
  store: string;
  version: number;
  senderId: string;
}

const TAB_ID = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2);
const CHANNEL_NAME = 'hireflow-v5';

let channel: BroadcastChannel | null = null;
const listeners = new Set<(msg: { store: string; version: number }) => void>();

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<CrossTabMessage>) => {
        const data = event.data;
        if (!data || data.senderId === TAB_ID) return; // ignore self
        listeners.forEach((fn) => fn({ store: data.store, version: data.version }));
      };
    } catch {
      channel = null;
    }
  }
  return channel;
}

export function broadcastStoreChange(store: string, version: number): void {
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage({ store, version, senderId: TAB_ID });
    } catch {
      // ignore
    }
  }
}

export function onCrossTabChange(fn: (msg: { store: string; version: number }) => void): () => void {
  getChannel(); // ensure initialized
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
