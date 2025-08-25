import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Video, ApiResponse } from '../interfaces/api.interfaces';

/**
 * @Injectable
 * Provided in the root of the application, making it a singleton service available
 * to all components and services.
 *
 * @description
 * This service is responsible for managing all video-related data. It handles
 * fetching videos from the backend API, managing the application's video state,
 * and providing utility functions for accessing and manipulating that data.
 * It uses RxJS BehaviorSubjects to create observable streams of data, allowing
 * components to reactively update when the video state changes.
 */
@Injectable({
  providedIn: 'root'
})
export class VideoService {
  // private readonly API_BASE_URL = 'http://127.0.0.1:8000/api/'; 
  private readonly API_BASE_URL = 'http://localhost:8000/api/'; 
  private readonly VIDEOS_URL = 'video/';

  // =================================================================
  // State Management Properties
  // =================================================================
  private videosSubject = new BehaviorSubject<Video[]>([]);
  public videos$ = this.videosSubject.asObservable();
  
  private latestVideosSubject = new BehaviorSubject<Video[]>([]);
  public latestVideos$ = this.latestVideosSubject.asObservable();
  
  private currentVideoSubject = new BehaviorSubject<Video | null>(null);
  public currentVideo$ = this.currentVideoSubject.asObservable();

  /**
   * Constructs the VideoService.
   * @param {HttpClient} http The Angular service for making HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Fetches all videos from the backend, then processes and stores them in the service's state.
   * This method updates the `videos$`, `latestVideos$`, and `currentVideo$` streams.
   * It uses `withCredentials: true` to support HTTP-Only cookie-based authentication.
   *
   * @returns {Observable<ApiResponse<Video[]>>} An observable that emits a structured ApiResponse
   * containing the video data on success, or an error response on failure.
   */
  loadAndSetupVideos(): Observable<ApiResponse<Video[]>> {
    return this.http.get<Video[]>(`${this.API_BASE_URL}${this.VIDEOS_URL}`, {
      withCredentials: true
    })
      .pipe(
        map(videos => {
          // Store videos in state
          this.videosSubject.next(videos);
          
          // Calculate latest videos
          this.calculateLatestVideos(videos);
          
          // Set first video as current
          if (videos.length > 0) {
            this.currentVideoSubject.next(videos[0]);
          }
          
          return {
            success: true,
            data: videos
          } as ApiResponse<Video[]>;
        }),
        catchError(error => {
          return this.handleError(error);
        })
      );
  }

  /**
   * Filters the master list of videos to find those created within the last 5 days.
   * The result is then pushed to the `latestVideosSubject`.
   *
   * @private
   * @param {Video[]} videos The complete array of videos to filter.
   * @returns {void}
   */
  private calculateLatestVideos(videos: Video[]): void {
    const currentDate = new Date();
    const fiveDaysAgo = new Date(currentDate.getTime() - (5 * 24 * 60 * 60 * 1000));
    
    const latestVideos = videos.filter(video => {
      if (!video.created_at) return false;
      const videoDate = new Date(video.created_at);
      return videoDate >= fiveDaysAgo;
    });
    
    this.latestVideosSubject.next(latestVideos);
  }

  /**
   * Extracts all unique video categories from the current list of videos.
   * This is useful for dynamically rendering category sections in the UI.
   *
   * @returns {string[]} An array of unique, lowercased category names.
   */
  getCategories(): string[] {
    const videos = this.videosSubject.value;
    const categories = new Set(
      videos
        .map(video => video.category)
        .filter(category => category)
        .map(category => category!.toLowerCase())
    );
    return Array.from(categories);
  }

  /**
   * Filters the master video list to return only videos that match a specific category.
   * The comparison is case-insensitive.
   *
   * @param {string} category The category name to filter by.
   * @returns {Video[]} An array of videos that belong to the specified category.
   */
  getVideosByCategory(category: string): Video[] {
    const videos = this.videosSubject.value;
    return videos.filter(video => 
      video.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Constructs the full URL for an HLS video stream manifest (.m3u8).
   *
   * @param {number} videoId The unique ID of the video.
   * @param {string} resolution The desired resolution (e.g., '720p', '1080p').
   * @returns {string} The complete URL for the HLS stream.
   */
  getHlsUrl(videoId: number, resolution: string): string {
    return `${this.API_BASE_URL}video/${videoId}/${resolution}/index.m3u8`;
  }

  /**
   * Sets the specified video as the "current" video in the application state.
   * This typically updates the main video player.
   *
   * @param {Video} video The video object to set as the current video.
   * @returns {void}
   */
  setCurrentVideo(video: Video): void {
    this.currentVideoSubject.next(video);
  }

  /**
   * Returns a snapshot of the current list of all videos.
   *
   * @returns {Video[]} The current array of all videos.
   */
  getCurrentVideos(): Video[] {
    return this.videosSubject.value;
  }

  /**
   * Returns a snapshot of the current list of latest videos.
   *
   * @returns {Video[]} The current array of latest videos.
   */
  getCurrentLatestVideos(): Video[] {
    return this.latestVideosSubject.value;
  }

  /**
   * A centralized error handler for HTTP requests made within this service.
   * It transforms a raw HTTP error into a standardized `ApiResponse` format.
   *
   * @private
   * @param {any} error The error object caught from an HttpClient request.
   * @returns {Observable<ApiResponse>} An observable that emits a single `ApiResponse`
   * object with `success: false` and a user-friendly error message.
   */
  private handleError(error: any): Observable<ApiResponse> {
    let errorMessage = 'Failed to load videos';
    
    if (error.status === 401) {
      errorMessage = 'Unauthorized. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied.';
    } else if (error.status === 404) {
      errorMessage = 'Videos not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Observable(observer => {
      observer.next({
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      });
      observer.complete();
    });
  }
}