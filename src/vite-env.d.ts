/// <reference types="vite/client" />

// requestIdleCallback polyfill type
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

interface IdleRequestOptions {
  timeout?: number;
}

declare function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: IdleRequestOptions
): number;

declare function cancelIdleCallback(handle: number): void;
