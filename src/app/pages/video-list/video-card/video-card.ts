import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../../../shared/interfaces/api.interfaces';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-card.html',
  styleUrls: ['./video-card.scss']
})
export class VideoCard {
  @Input() video!: Video;
  @Output() playVideo = new EventEmitter<Video>();

  onPlayVideo(): void {
    this.playVideo.emit(this.video);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/img/index_bg.jpg'; // Fallback
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
