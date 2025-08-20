import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../../../../shared/interfaces/api.interfaces';
import { VideoService } from '../../../../shared/services/video.service';

declare var Hls: any;

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-player" [class.main-player]="isMainPlayer">
      <div class="video-container">
        <video 
          #videoElement
          [poster]="video?.thumbnail"
          [controls]="showControls"
          (click)="onVideoClick()"
          (loadstart)="onLoadStart()"
          (loadeddata)="onLoadedData()"
          (error)="onVideoError($event)">
          Your browser does not support the video tag.
        </video>
        
        <!-- Custom Controls Overlay -->
         @if(!showControls) {
           <div class="video-overlay" (click)="onVideoClick()">
            @if(!isPlaying) {
              <div class="play-button">
                <img src="/icons/play_arrow.svg" alt="Play" />
              </div>
            }
             
             <!-- Video Info -->
              @if(isMainPlayer) {
                <div class="video-info-overlay">
                  <h1>{{ video?.title }}</h1>
                  @if(video?.description) {
                    <p>{{ video?.description }}</p>
                  }
                  <div class="video-actions">
                    <button class="play-btn" (click)="togglePlay($event)">
                      <img [src]="isPlaying ? '/icons/pause.svg' : '/icons/play_arrow.svg'" alt="Play/Pause" />
                      {{ isPlaying ? 'Pause' : 'Play' }}
                    </button>
                  </div>
                </div>
              }
           </div>
         }

        <!-- Loading State -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
        </div>

        <!-- Error State -->
        <div class="error-overlay" *ngIf="hasError">
          <div class="error-content">
            <img src="/img/warning.png" alt="Error" />
            <p>Video konnte nicht geladen werden</p>
            <button (click)="retryLoad()">Erneut versuchen</button>
          </div>
        </div>

        <!-- Resolution Selector -->
        <div class="resolution-selector" *ngIf="showResolutionSelector">
          <select (change)="onResolutionChange($event)" [value]="currentResolution">
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-player {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
    }

    .main-player {
      height: 70vh;
    }

    .video-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.8) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      padding: 2rem;
      transition: all 0.2s;
    }

    .play-button:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: translate(-50%, -50%) scale(1.1);
    }

    .play-button img {
      width: 3rem;
      height: 3rem;
      filter: invert(1);
    }

    .video-info-overlay {
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      right: 2rem;
      color: #fff;
      z-index: 10;
    }

    .video-info-overlay h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0 0 1rem 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    }

    .video-info-overlay p {
      font-size: 1.1rem;
      margin: 0 0 1.5rem 0;
      max-width: 50%;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      line-height: 1.4;
    }

    .video-actions {
      display: flex;
      gap: 1rem;
    }

    .play-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #e50914;
      color: #fff;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .play-btn:hover {
      background: #f40612;
    }

    .play-btn img {
      width: 1.5rem;
      height: 1.5rem;
      filter: invert(1);
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #333;
      border-top: 3px solid #e50914;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .error-content {
      text-align: center;
      color: #fff;
    }

    .error-content img {
      height: 4rem;
      opacity: 0.7;
      margin-bottom: 1rem;
    }

    .error-content button {
      background: #e50914;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .resolution-selector {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 15;
    }

    .resolution-selector select {
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 0.5rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() video: Video | null = null;
  @Input() isMainPlayer = false;
  @Input() autoPlay = false;
  @Output() playVideo = new EventEmitter<Video>();

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  isLoading = false;
  hasError = false;
  showControls = false;
  showResolutionSelector = false;
  currentResolution = '720p';
  
  private hls: any;
  private controlsTimeout: any;

  constructor(private videoService: VideoService) {}

  ngOnInit(): void {
    this.showControls = !this.isMainPlayer;
  }

  ngAfterViewInit(): void {
    if (this.video) {
      this.loadVideo();
    }
  }

  ngOnDestroy(): void {
    this.destroyHls();
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
  }

  private loadVideo(): void {
    if (!this.video) return;

    this.isLoading = true;
    this.hasError = false;

    const hlsUrl = this.videoService.getHlsUrl(this.video.id, this.currentResolution);
    
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      this.loadWithHls(hlsUrl);
    } else if (this.videoElement.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      this.loadNative(hlsUrl);
    } else {
      console.error('HLS is not supported in this browser');
      this.hasError = true;
      this.isLoading = false;
    }
  }

  private loadWithHls(hlsUrl: string): void {
    this.destroyHls();
    
    this.hls = new Hls({
      xhrSetup: (xhr: XMLHttpRequest) => {
        xhr.withCredentials = true;
      }
    });

    this.hls.loadSource(hlsUrl);
    this.hls.attachMedia(this.videoElement.nativeElement);

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

  private loadNative(hlsUrl: string): void {
    this.videoElement.nativeElement.src = hlsUrl;
    this.videoElement.nativeElement.load();
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  onVideoClick(): void {
    if (this.isMainPlayer) {
      this.togglePlay();
      this.showControlsTemporarily();
    } else {
      this.playVideo.emit(this.video!);
    }
  }

  togglePlay(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private play(): void {
    this.videoElement.nativeElement.play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch(error => {
        console.error('Play error:', error);
        this.hasError = true;
      });
  }

  private pause(): void {
    this.videoElement.nativeElement.pause();
    this.isPlaying = false;
  }

  private showControlsTemporarily(): void {
    this.showControls = true;
    
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
      }
    }, 3000);
  }

  onResolutionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentResolution = select.value;
    this.loadVideo();
  }

  onLoadStart(): void {
    this.isLoading = true;
  }

  onLoadedData(): void {
    this.isLoading = false;
  }

  onVideoError(event: Event): void {
    console.error('Video error:', event);
    this.hasError = true;
    this.isLoading = false;
  }

  retryLoad(): void {
    this.hasError = false;
    this.loadVideo();
  }
}
