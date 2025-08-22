// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { VideoService } from '../../shared/services/video.service';
import { AuthService } from '../../shared/services/auth.service';
import { Video, User, ApiResponse } from '../../shared/interfaces/api.interfaces';
import { VideoCard } from './video-card/video-card';
import { VideoPlayer } from './video-player/video-player';
import { Footer } from '../../shared/footer/footer';

/**
 * @Component
 * Defines the metadata for the VideoList component.
 */
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, VideoCard, VideoPlayer, Footer],
  templateUrl: './video-list.html',
  styleUrls: ['./video-list.scss'],
})
export class VideoList implements OnInit, OnDestroy {
  /**
   * An observable stream of all available videos.   *
   */
  videos$: Observable<Video[]>;
  /**
   * An observable stream of the most recently added videos.   *
   */
  latestVideos$: Observable<Video[]>;
  /**
   * An observable stream of the video currently selected for playback in the main player.   *
   */
  currentVideo$: Observable<Video | null>;

  /**
   * An array of unique video category names.   *
   */
  categories: string[] = [];
  /**
   *  A flag to indicate when video data is being loaded.   *
   */
  isLoading = false;
  /**
   * A string to hold and display any error messages.   *
   */
  errorMessage = '';
  /**
   * The currently authenticated user's data.   *
   */
  currentUser: User | null = null;

  /**
   * A collection of all active subscriptions to be cleaned up on component destruction.   *
   */
  private subscriptions = new Subscription();

  /**
   * A map of category keys to their display-friendly names.
   * @private
   */
  private categoryDisplayNames: { [key: string]: string } = {
    action: 'Action',
    cartoon: "Cartoon",
    comedy: 'Comedy',
    drama: 'Drama',
    thriller: 'Thriller',
    horror: 'Horror',
    romance: 'Romance',
    scifi: 'Science Fiction',
    documentary: 'Documentary',
  };

  /**
   * The constructor for the VideoList component.
   * @param {VideoService} videoService Service for fetching video data.
   * @param {AuthService} authService Service for authentication and user data.
   * @param {Router} router Angular service for navigation.
   */
  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.videos$ = this.videoService.videos$;
    this.latestVideos$ = this.videoService.latestVideos$;
    this.currentVideo$ = this.videoService.currentVideo$;
  }

  /**
   * Angular lifecycle hook. Initializes video loading and sets up subscriptions.
   */
  ngOnInit(): void {
    this.loadVideos();
    this.setupSubscriptions();
  }

  /**
   * Angular lifecycle hook. Cleans up all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Sets up subscriptions to observables that the component needs to monitor.
   * @private
   */
  private setupSubscriptions(): void {
    const categorySubscription = this.videos$.subscribe(() => {
        this.categories = this.videoService.getCategories();
    });
    const userSubscription = this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
    });

    this.subscriptions.add(categorySubscription);
    this.subscriptions.add(userSubscription);
  }

  /**
   * Initiates the process of loading and setting up videos from the video service.
   * Sets the loading state and subscribes to the observable, delegating the response
   * handling to helper methods.
   */
  loadVideos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const videoSub = this.videoService.loadAndSetupVideos().subscribe({
      next: (response) => this.handleLoadSuccess(response),
      error: (error) => this.handleLoadError(error),
    });

    this.subscriptions.add(videoSub);
  }

  /**
   * Handles the successful response from the video loading request.
   * @private
   * @param {ApiResponse<Video[]>} response The API response.
   */
  private handleLoadSuccess(response: ApiResponse<Video[]>): void {
    this.isLoading = false;
    if (response.success) return; // Happy path, do nothing more.

    const message = response.message || 'Failed to load videos';
    const isAuthError = message.includes('autorisiert') || message.includes('Unauthorized');
    
    if (isAuthError) {
      this.handleUnauthorizedError(message);
    } else {
      this.errorMessage = message;
    }
  }

   /**
   * Handles an error response from the video loading request.
   * @private
   * @param {any} error The error object.
   */
  private handleLoadError(error: any): void {
    this.isLoading = false;
    if (error.status === 401) {
      const message = 'Session expired. You will be redirected to the login page...';
      this.handleUnauthorizedError(message);
    } else {
      this.errorMessage = 'Error loading videos. Please try again.';
    }
  }

  /**
   * Handles authorization-related errors by displaying a message, logging out the user,
   * and redirecting to the login page after a short delay.
   * @private
   * @param {string} message The error message to display.
   */
  private handleUnauthorizedError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

   /**
   * Sets the provided video as the current video for the main player.
   * @param {Video} video The video to be played.
   */
  onPlayVideo(video: Video): void {
    this.videoService.setCurrentVideo(video);
  }

  /**
   * Retrieves a list of videos that belong to a specific category.
   * @param {string} category The category to filter by.
   * @returns {Video[]} An array of videos matching the category.
   */
  getVideosByCategory(category: string): Video[] {
    return this.videoService.getVideosByCategory(category);
  }

  /**
   * Gets the display-friendly name for a given category key.
   * @param {string} category The category key (e.g., 'scifi').
   * @returns {string} The display name (e.g., 'Science Fiction').
   */
  getCategoryDisplayName(category: string): string {
    const key = category.toLowerCase();
    const defaultName = category.charAt(0).toUpperCase() + category.slice(1);
    return this.categoryDisplayNames[key] || defaultName;
  }

  /**
   * Logs the user out by clearing authentication data and navigating to the login page.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}