// HLS.js Type Declarations
declare module 'hls.js' {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      MANIFEST_PARSED: string;
      ERROR: string;
      LEVEL_LOADED: string;
      FRAG_LOADED: string;
    };
    
    constructor(config?: any);
    
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    destroy(): void;
    
    on(event: string, callback: (event: string, data: any) => void): void;
  }
}

// Global Hls declaration for script tag usage
declare global {
  const Hls: typeof import('hls.js').default;
}

export {};
