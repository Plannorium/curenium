// Augment the global scope with Cloudflare Worker types
export {};

declare global {
  interface DurableObjectState {
    id: DurableObjectId;
    storage: DurableObjectStorage;
    blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
  }

  interface DurableObjectStorage {
    get<T = unknown>(key: string, options?: DurableObjectStorageOperationsGetOptions): Promise<T | undefined>;
    get<T = unknown>(keys: string[], options?: DurableObjectStorageOperationsGetOptions): Promise<Map<string, T>>;
    put<T>(key: string, value: T, options?: DurableObjectStorageOperationsPutOptions): Promise<void>;
    put<T>(entries: Record<string, T>, options?: DurableObjectStorageOperationsPutOptions): Promise<void>;
    delete(key: string, options?: DurableObjectStorageOperationsDeleteOptions): Promise<boolean>;
    delete(keys: string[], options?: DurableObjectStorageOperationsDeleteOptions): Promise<number>;
    deleteAll(options?: DurableObjectStorageOperationsDeleteOptions): Promise<void>;
    list<T = unknown>(options?: DurableObjectStorageOperationsListOptions): Promise<Map<string, T>>;
  }

  interface WebSocketPair {
    0: WebSocket; // client
    1: WebSocket; // server
  }

  interface WebSocket {
    accept(): void;
  }

  interface ResponseInit {
    webSocket?: WebSocket;
  }

  interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub;
  }

  interface DurableObjectId {
    toString(): string;
  }

  interface DurableObjectStub {
    fetch(request: Request | string, requestInit?: RequestInit | Request): Promise<Response>;
  }

  interface DurableObjectStorageOperationsGetOptions {
    allowConcurrency?: boolean;
    noCache?: boolean;
  }

  interface DurableObjectStorageOperationsPutOptions {
    allowConcurrency?: boolean;
    allowUnconfirmed?: boolean;
    noCache?: boolean;
  }

  interface DurableObjectStorageOperationsDeleteOptions {
    allowConcurrency?: boolean;
    allowUnconfirmed?: boolean;
  }

  interface DurableObjectStorageOperationsListOptions {
    start?: string;
    startAfter?: string;
    end?: string;
    prefix?: string;
    reverse?: boolean;
    limit?: number;
    allowConcurrency?: boolean;
    noCache?: boolean;
  }

  const WebSocketPair: {
    new (): WebSocketPair;
  };

  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }

  interface ExportedHandler<Env = unknown> {
    fetch?(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> | Response;
  }
}