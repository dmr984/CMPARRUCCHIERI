// src/firebase/error-emitter.ts

// Using a simple event emitter pattern to decouple error source from error handling.
type Listener = (error: any) => void;

class ErrorEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, listener: Listener): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);

    // Return a function to unsubscribe
    return () => {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    };
  }

  emit(event: string, data: any): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(listener => listener(data));
  }
}

// Export a singleton instance
export const errorEmitter = new ErrorEmitter();
