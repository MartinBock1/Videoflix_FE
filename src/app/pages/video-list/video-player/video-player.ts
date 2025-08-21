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
import { Video } from '../../../shared/interfaces/api.interfaces';
import { VideoService } from '../../../shared/services/video.service';
import { NotificationService } from '../../../shared/services/notification.service';

declare var Hls: any;

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
  @Input() video: Video | null = null;
  @Input() isMainPlayer = false;
  @Input() autoPlay = false;
  @Output() playVideo = new EventEmitter<Video>();

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  isLoading = false;
  hasError = false;
  showControls = false;
  showResolutionSelector = false;
  currentResolution = '720p';

  private hls: any;
  private controlsTimeout: any;

  constructor(
    private videoService: VideoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setDefaultResolution();
    this.showControls = !this.isMainPlayer;
  }

  private setDefaultResolution(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth < 720) {
      // Für kleine Bildschirme (Mobile)
      this.currentResolution = '480p';
    } else if (screenWidth < 1920) {
      // Für mittlere Bildschirme (Laptop)
      this.currentResolution = '720p';
    } else {
      // Für große Bildschirme (Desktop)
      this.currentResolution = '1080p';
    }
    console.log(
      `%c[VideoPlayer] Default resolution set to: ${this.currentResolution} based on screen width ${screenWidth}px`,
      'color: orange;'
    );
  }

  ngAfterViewInit(): void {
    if (this.video) {
      this.loadVideo();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['video'] && !changes['video'].isFirstChange()) {
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

    const hlsUrl = this.videoService.getHlsUrl(
      this.video.id,
      this.currentResolution
    );

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      this.loadWithHls(hlsUrl);
    } else if (
      this.videoElement.nativeElement.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
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
      },
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
    this.notificationService.show(`Qualität auf ${this.currentResolution} umgeschaltet`);
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
