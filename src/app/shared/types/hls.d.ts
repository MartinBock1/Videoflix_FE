/**
 * @fileoverview
 * This file provides TypeScript type declarations for the Hls.js library.
 * Hls.js is a third-party library loaded from a CDN via a <script> tag in `index.html`.
 * These declarations allow TypeScript to understand the Hls.js API, providing
 * type checking and autocompletion within the development environment without needing
 * to install it as an npm package.
 */

/**
 * Declares the module shape for `hls.js` when it is imported using ES6 module syntax.
 * This is primarily for type-checking and is not used for runtime module loading in this project.
 */
declare module 'hls.js' {
  /**
   * Represents the main Hls.js player class.
   * This class provides all the necessary methods and properties to handle
   * HTTP Live Streaming (HLS) playback in browsers that do not natively support it.
   */
  export default class Hls {
    /**
     * A static method to check if Hls.js is supported in the current browser.
     * @returns {boolean} `true` if Hls.js is supported, otherwise `false`.
     */
    static isSupported(): boolean;

    /**
     * A static property that provides an enumeration of event names dispatched by the Hls.js instance.
     * These can be used to register event listeners via the `on()` method.
     */
    static Events: {
      MANIFEST_PARSED: string;
      ERROR: string;
      LEVEL_LOADED: string;
      FRAG_LOADED: string;
    };
    
    /**
     * Creates an instance of the Hls.js player.
     * @param {any} [config] - An optional configuration object to customize the player's behavior (e.g., xhrSetup, debug flags).
     */
    constructor(config?: any);
    
    /**
     * Loads the HLS manifest (e.g., a `.m3u8` file) from the specified URL.
     * @param {string} url - The URL of the HLS manifest to load.
     * @returns {void}
     */
    loadSource(url: string): void;

     /**
     * Attaches the Hls.js player instance to a native HTML `<video>` element.
     * This allows Hls.js to control the video element and feed it video data.
     * @param {HTMLMediaElement} media - The `<video>` element to attach to.
     * @returns {void}
     */
    attachMedia(media: HTMLMediaElement): void;

    /**
     * Destroys the Hls.js instance, stops all network requests, and cleans up resources.
     * This is crucial for preventing memory leaks when a component is destroyed.
     * @returns {void}
     */
    destroy(): void;
    
    /**
     * Registers a callback function to be executed when a specific Hls.js event occurs.
     * @param {string} event - The name of the event to listen for (e.g., `Hls.Events.ERROR`).
     * @param {(event: string, data: any) => void} callback - The function to call when the event is dispatched.
     * @returns {void}
     */
    on(event: string, callback: (event: string, data: any) => void): void;
  }
}

/**
 * Declares the `Hls` class in the global scope.
 * This is essential because the library is loaded via a `<script>` tag, which
 * makes the `Hls` variable available on the global `window` object. This declaration
 * allows TypeScript to access it globally without requiring an import.
 */
declare global {
  const Hls: typeof import('hls.js').default;
}

export {};
