// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Video } from '../../../shared/interfaces/api.interfaces';
import { VideoService } from '../../../shared/services/video.service';
import { NotificationService } from '../../../shared/services/notification.service';

/**
 * Declares the Hls.js library as a global variable.
 * This is necessary because Hls.js is loaded from a CDN via a <script> tag in index.html,
 * and this declaration makes it accessible within the TypeScript environment without type errors.
 */
declare var Hls: any;

/**
 * @Component
 * Defines the metadata for the VideoPlayer component.
 */
@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.html',
  styleUrls: ['./video-player.scss'],
})
export class VideoPlayer
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  /**
   * The video object containing metadata like title, description, and ID.
   * @Input
   */
  @Input() video: Video | null = null;
  /**
   * A flag to determine if the player should render in its main, featured layout.
   * @Input
   * @default false
   */
  @Input() isMainPlayer = false;

  /**
   * A flag to enable or disable automatic playback when a video is loaded.
   * @Input
   * @default false
   */
  @Input() autoPlay = false;

  /**
   * An event emitter that fires when a non-main player card is clicked,
   * signaling the parent component to play this video in the main player.
   * @Output
   */
  @Output() playVideo = new EventEmitter<Video>();

  /**
   * A reference to the native <video> element in the template.
   * This allows for direct manipulation of the video element (e.g., play, pause, attach Hls.js).
   * @ViewChild
   */
  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  /**
   * Tracks the current playback state of the video.
   * @type {boolean}
   */
  isPlaying = false;

  /**
   * Tracks whether the video is currently in a loading/buffering state.
   * @type {boolean}
   */
  isLoading = false;

  /**
   * Tracks if an error has occurred during video loading or playback.
   * @type {boolean}
   */
  hasError = false;

  /**
   * Controls the visibility of the native video controls.
   * @type {boolean}
   */
  showControls = false;
  
  /**
   * The currently selected video resolution (e.g., '720p').
   * @type {string}
   */
  currentResolution = '720p';

  /**
   * Holds the instance of the Hls.js player.
   * @private
   */
  private hls: any;

  /**
   * Holds the timeout ID for the timer that hides the video controls.
   * @private
   */
  private controlsTimeout: any;

  /**
   * The constructor for the VideoPlayer component.
   * @param {VideoService} videoService - Service to get video stream URLs.
   * @param {NotificationService} notificationService - Service to show user notifications.
   */
  constructor(
    private videoService: VideoService,
    private notificationService: NotificationService
  ) {}

  // =================================================================
  // Lifecycle Hooks (No changes needed, already short)
  // =================================================================

  /**
   * Angular lifecycle hook that runs on component initialization.
   * Sets the default resolution and initial state of the controls.
   */
  ngOnInit(): void {
    this.setDefaultResolution();
    if (this.isMainPlayer) {
      this.showControls = false;
    }
  }

  /**
   * Angular lifecycle hook that runs after the component's view has been initialized.
   * Initiates the video loading process if a video is already present.
   */
  ngAfterViewInit(): void {
    if (this.video) {
      this.loadVideo();
    }
  }

  /**
   * Angular lifecycle hook that detects changes to @Input properties.
   * If the `video` input changes, it reloads the player with the new video.
   * @param {SimpleChanges} changes - An object containing the changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['video'] && !changes['video'].isFirstChange()) {
      this.loadVideo();
    }
  }

  /**
   * Angular lifecycle hook that runs just before the component is destroyed.
   * Cleans up resources, such as the Hls.js instance and any active timers.
   */
  ngOnDestroy(): void {
    this.destroyHls();
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
  }

  // =================================================================
  // Video Loading Logic
  // =================================================================

  /**
   * Main method to orchestrate the loading of a video stream.
   * It sets the initial loading state and delegates the playback initialization.
   * @private
   */
  private loadVideo(): void {
    if (!this.video) return;

    this.isLoading = true;
    this.hasError = false;

    const hlsUrl = this.videoService.getHlsUrl(
      this.video.id,
      this.currentResolution
    );

    this.initializePlayback(hlsUrl);
  }

  /**
   * Determines the appropriate playback method (Hls.js or native) and initiates it.
   * This is the core decision-making part of the video loading process.
   * @private
   * @param {string} hlsUrl - The URL of the .m3u8 manifest file.
   */
  private initializePlayback(hlsUrl: string): void {
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      this.loadWithHls(hlsUrl);
    } else if (
      this.videoElement.nativeElement.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
      this.loadNative(hlsUrl);
    } else {
      console.error('HLS is not supported in this browser');
      this.hasError = true;
      this.isLoading = false;
    }
  }

  /**
   * Loads the video stream using the Hls.js library.
   * Now focuses on creating the instance and attaching the media.
   * @private
   * @param {string} hlsUrl - The URL of the .m3u8 manifest file.
   */
  private loadWithHls(hlsUrl: string): void {
    this.destroyHls();

    this.hls = new Hls({
      xhrSetup: (xhr: XMLHttpRequest) => {
        xhr.withCredentials = true;
      },
    });

    this.hls.loadSource(hlsUrl);
    this.hls.attachMedia(this.videoElement.nativeElement);
    this.setupHlsEvents();
  }

  /**
   * Registers event listeners for the Hls.js instance.
   * This isolates the event handling logic from the HLS setup.
   * @private
   */
  private setupHlsEvents(): void {
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS manifest parsed successfully');
      if (this.autoPlay) {
        this.play();
      }
    });

    this.hls.on(Hls.Events.ERROR, (event: any, data: any) => {
      console.error('HLS error:', data);
      if (data.fatal) {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  /**
   * Loads the video stream using the browser's native HLS capabilities.
   * @private
   * @param {string} hlsUrl - The URL of the .m3u8 manifest file.
   */
  private loadNative(hlsUrl: string): void {
    this.videoElement.nativeElement.src = hlsUrl;
    this.videoElement.nativeElement.load();
  }

  /**
   * Destroys the current Hls.js instance to free up resources.
   * @private
   */
  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  // =================================================================
  // Playback Control (No changes needed, already short)
  // =================================================================

  /**
   * Handles click events directly on the video element.
   * Toggles play/pause for the main player or emits an event for card players.
   */
  onVideoClick(): void {
    if (this.isMainPlayer) {
      this.togglePlay();
    } else {
      this.playVideo.emit(this.video!);
    }
  }

  /**
   * Toggles the video between playing and paused states.
   * Also ensures the controls are shown temporarily on interaction.
   * @param {Event} [event] - The optional click event to stop its propagation.
   */
  togglePlay(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const video = this.videoElement.nativeElement;

    if (video.paused) {
      video.play();
      this.showControlsTemporarily();
    } else {
      video.pause();
    }
  }

  /**
   * Initiates video playback.
   * @private
   */
  private play(): void {
    this.videoElement.nativeElement
      .play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch((error) => {
        console.error('Play error:', error);
        this.hasError = true;
      });
  }  

  /**
   * Shows the video controls for a short duration (3 seconds) and then hides them if the video is playing.
   * @private
   */
  private showControlsTemporarily(): void {
    this.showControls = true;

    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }

    this.controlsTimeout = setTimeout(() => {
      if (!this.videoElement.nativeElement.paused) {
        this.showControls = false;
      }
    }, 3000);
  }

  // =================================================================
  // Event Handlers & Misc (No changes needed, already short)
  // =================================================================

  /**
   * Sets a default video resolution based on the current screen width.
   * @private
   */
  private setDefaultResolution(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth < 720) {
      this.currentResolution = '480p'; // Mobile
    } else if (screenWidth < 1920) {
      this.currentResolution = '720p'; // Laptop/Tablet
    } else {
      this.currentResolution = '1080p'; // Desktop
    }
    console.log(
      `%c[VideoPlayer] Default resolution set to: ${this.currentResolution} based on screen width ${screenWidth}px`,
      'color: orange;'
    );
  }

  /**
   * Handles the change event from the resolution selector.
   * Reloads the video with the newly selected resolution.
   * @param {Event} event - The change event from the <select> element.
   */
  onResolutionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentResolution = select.value;
    this.loadVideo();
    this.notificationService.show(
      `Qualität auf ${this.currentResolution} umgeschaltet`
    );
  }

  /**
   * Event handler for the 'loadstart' video event. Sets the loading state.
   */
  onLoadStart(): void {
    this.isLoading = true;
  }

  /**
   * Event handler for the 'loadeddata' video event. Clears the loading state.
   */
  onLoadedData(): void {
    this.isLoading = false;
  }

  /**
   * Event handler for the 'error' video event. Sets the error state.
   * @param {Event} event - The error event.
   */
  onVideoError(event: Event): void {
    console.error('Video error:', event);
    this.hasError = true;
    this.isLoading = false;
  }

  /**
   * Allows the user to retry loading the video after an error has occurred.
   */
  retryLoad(): void {
    this.hasError = false;
    this.loadVideo();
  }
}