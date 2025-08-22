// =================================================================
// Standard Angular Imports
// =================================================================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Video } from '../../../shared/interfaces/api.interfaces';

/**
 * @Component
 * Defines the metadata for the VideoCard component.
 */
@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-card.html',
  styleUrls: ['./video-card.scss']
})
export class VideoCard {
  /**
   * The video data object to be displayed in the card.
   * The `!` non-null assertion operator indicates that this required input
   * will always be provided by the parent component.
   * @Input
   */
  @Input() video!: Video;

  /**
   * An event emitter that fires when the video card is clicked.
   * It passes the full `video` object to the parent component.
   * @Output
   */
  @Output() playVideo = new EventEmitter<Video>();

  /**
   * Handles the click event on the video card.
   * Emits the `playVideo` event with the current video's data.
   * @returns {void}
   */
  onPlayVideo(): void {
    this.playVideo.emit(this.video);
  }

  /**
   * Handles errors when loading the video's thumbnail image.
   * If the original thumbnail URL fails, it sets a fallback image source.
   * @param {Event} event - The error event from the <img> element.
   * @returns {void}
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/img/index_bg.jpg'; // Fallback
  }

  /**
   * A helper method to format a date string into a more readable format.
   * @param {string} dateString - The ISO date string to be formatted.
   * @returns {string} The formatted date (e.g., "Aug 21, 2025").
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * A helper method to truncate a long string of text to a specified maximum length,
   * appending an ellipsis (...) if truncation occurs.
   * @param {string} text - The text to be truncated.
   * @param {number} maxLength - The maximum number of characters to allow.
   * @returns {string} The original text or the truncated text with an ellipsis.
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}
