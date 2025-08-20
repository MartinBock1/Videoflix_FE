import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import Hls (default) und HlsConfig (benannter Typ)
import Hls, { HlsConfig } from 'hls.js';

import { Video } from '../../shared/interfaces/api.interfaces';
import { VideoService } from '../../shared/services/video.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './video-list.html',
  styleUrls: ['./video-list.scss']
})
export class VideoListComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayVideo') overlayVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayTitle') overlayTitleRef!: ElementRef<HTMLHeadingElement>;

  // ... (Component State bleibt gleich) ...
  videos: Video[] = [];
  latestVideos: Video[] = [];
  videosByCategory = new Map<string, Video[]>();
  categories: string[] = [];
  previewVideo: Video | null = null;
  selectedVideo: Video | null = null;
  isOverlayVisible = false;
  currentResolution = '480p';
  
  private hlsPreview!: Hls;
  private hlsOverlay!: Hls;

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  ngOnDestroy(): void {
    this.hlsPreview?.destroy();
    this.hlsOverlay?.destroy();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    if (this.isOverlayVisible) {
      this.closeVideoOverlay();
    }
  }

  loadVideos(): void {
    this.videoService.loadAndSetupVideos().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          this.videos = response.data;
          this.previewVideo = this.videos[0];
          this.processVideos();
          this.cdr.detectChanges();
          this.setupPreviewPlayer();
        }
      },
      error: (err: any) => {
        // Error handling without console output
      }
    });
  }

  processVideos(): void {
    const fiveDaysAgo = new Date().getTime() - (5 * 24 * 60 * 60 * 1000);
    this.latestVideos = this.videos.filter(v => v.created_at && new Date(v.created_at).getTime() >= fiveDaysAgo);

    const categoryMap = new Map<string, Video[]>();
    this.videos.forEach(video => {
      const category = video.category?.toLowerCase() || 'uncategorized';
      if (!categoryMap.has(category)) categoryMap.set(category, []);
      categoryMap.get(category)?.push(video);
    });
    this.videosByCategory = categoryMap;
    this.categories = Array.from(categoryMap.keys());
  }

  showVideo(video: Video): void {
    this.previewVideo = video;
    this.setupPreviewPlayer();
  }

  playVideo(videoId: number): void {
    this.selectedVideo = this.videos.find(v => v.id === videoId) || null;
    if (this.selectedVideo) {
      this.isOverlayVisible = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();
      this.setupOverlayPlayer();
    }
  }

  closeVideoOverlay(): void {
    this.isOverlayVisible = false;
    document.body.style.overflow = 'auto';
    this.hlsOverlay?.destroy();
    if (this.overlayVideoRef?.nativeElement) {
      this.overlayVideoRef.nativeElement.pause();
      this.overlayVideoRef.nativeElement.src = '';
    }
  }

  onResolutionChange(): void {
    if (this.isOverlayVisible && this.selectedVideo) {
      this.setupOverlayPlayer();
    }
  }

  /**
   * Erstellt die Konfiguration für eine HLS.js-Instanz.
   * Gibt ein partielles Konfigurationsobjekt zurück.
   */
  private getHlsConfig(): Partial<HlsConfig> {
    const token = this.authService.getToken();
    return {
      // Authentifizierung
      xhrSetup: (xhr: XMLHttpRequest) => {
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      },

      // Puffer-Management aus der ursprünglichen Konfiguration
      maxBufferLength: 45,
      maxMaxBufferLength: 900,
      maxBufferSize: 90 * 1000 * 1000,
      
      // Performance-Optimierungen
      enableWorker: true,
      startFragPrefetch: true,

      // Netzwerk-Konfiguration
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
      fragLoadingMaxRetry: 6,
      
      // Debugging
      debug: false // Für die Entwicklung auf true setzen
    };
  }

  private setupPreviewPlayer(): void {
    if (this.hlsPreview) this.hlsPreview.destroy();
    if (!this.previewVideo || !Hls.isSupported()) return;

    this.hlsPreview = new Hls(this.getHlsConfig());
    const url = this.videoService.getHlsUrl(this.previewVideo.id, '480p');
    this.hlsPreview.loadSource(url);
    this.hlsPreview.attachMedia(this.videoPlayerRef.nativeElement);
  }

  private setupOverlayPlayer(): void {
    if (this.hlsOverlay) this.hlsOverlay.destroy();
    if (!this.selectedVideo || !Hls.isSupported()) return;
    
    this.hlsOverlay = new Hls(this.getHlsConfig());
    const url = this.videoService.getHlsUrl(this.selectedVideo.id, this.currentResolution);
    this.hlsOverlay.loadSource(url);
    this.hlsOverlay.attachMedia(this.overlayVideoRef.nativeElement);
    
    this.hlsOverlay.on(Hls.Events.MANIFEST_PARSED, () => {
      this.overlayVideoRef.nativeElement.play().catch(e => {
        // Error handling without console output
      });
    });

    if (this.overlayTitleRef) {
      this.overlayTitleRef.nativeElement.style.animation = 'none';
      this.overlayTitleRef.nativeElement.offsetHeight;
      this.overlayTitleRef.nativeElement.style.animation = 'fadeOut 5s ease-in-out forwards';
    }
  }
}
