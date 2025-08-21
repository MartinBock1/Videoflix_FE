import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../../../../shared/interfaces/api.interfaces';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-card" (click)="onPlayVideo()">
      <div class="video-thumbnail">
        <img 
          [src]="video.thumbnail || '/assets/img/index_bg.jpg'" 
          [alt]="video.title"
          (error)="onImageError($event)" />
        <div class="play-overlay">
          <img src="/assets/icons/play_arrow.svg" alt="Play" />
        </div>
        <div class="video-duration">
          Video
        </div>
      </div>
      <div class="video-info">
        <h3 class="video-title">{{ video.title }}</h3>
        @if(video.description) {
          <p class="video-description">
            {{ truncateText(video.description, 100) }}
          </p>
        }
        <div class="video-meta">
          @if(video.category) {
            <span class="video-category">
              {{ video.category }}
            </span>
          }
          @if(video.created_at) {
            <span class="video-created">
              {{ formatDate(video.created_at) }}
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-card {
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;
      background: #1a1a1a;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .video-card:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    }

    .video-thumbnail {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      overflow: hidden;
    }

    .video-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .video-card:hover .play-overlay {
      opacity: 1;
    }

    .play-overlay img {
      width: 24px;
      height: 24px;
      filter: invert(1);
    }

    .video-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .video-info {
      padding: 1rem;
    }

    .video-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #fff;
      line-height: 1.3;
    }

    .video-description {
      font-size: 0.875rem;
      color: #ccc;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
    }

    .video-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: #999;
    }

    .video-category {
      background: #e50914;
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
  `]
})
export class VideoCardComponent {
  @Input() video!: Video;
  @Output() playVideo = new EventEmitter<Video>();

  onPlayVideo(): void {
    this.playVideo.emit(this.video);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/img/index_bg.jpg'; // Fallback zu vorhandenem Bild
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}
