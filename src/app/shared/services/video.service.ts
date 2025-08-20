import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Video, ApiResponse } from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  // private readonly API_BASE_URL = 'http://127.0.0.1:8000/api/'; 
  private readonly API_BASE_URL = 'http://localhost:8000/api/'; 
  private readonly VIDEOS_URL = 'video/';

  // State Management - wie im DA_Frontend mit VIDEOS und LATESTVIDEOS
  private videosSubject = new BehaviorSubject<Video[]>([]);
  public videos$ = this.videosSubject.asObservable();
  
  private latestVideosSubject = new BehaviorSubject<Video[]>([]);
  public latestVideos$ = this.latestVideosSubject.asObservable();
  
  private currentVideoSubject = new BehaviorSubject<Video | null>(null);
  public currentVideo$ = this.currentVideoSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Lädt alle Videos vom Backend mit HTTP-Only Cookie JWT Authentication
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
   * Filtert neueste Videos (innerhalb der letzten 5 Tage) - entspricht getNewestVideos()
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
   * Gibt eindeutige Kategorien zurück - für dynamisches Rendering
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
   * Gibt Videos nach Kategorie zurück
   */
  getVideosByCategory(category: string): Video[] {
    const videos = this.videosSubject.value;
    return videos.filter(video => 
      video.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Baut die HLS-URL für Video-Streaming
   */
  getHlsUrl(videoId: number, resolution: string): string {
    return `${this.API_BASE_URL}video/${videoId}/${resolution}/index.m3u8`;
  }

  /**
   * Setzt das aktuelle Video
   */
  setCurrentVideo(video: Video): void {
    this.currentVideoSubject.next(video);
  }

  /**
   * Gibt aktuelle Videos aus dem State zurück
   */
  getCurrentVideos(): Video[] {
    return this.videosSubject.value;
  }

  /**
   * Gibt aktuelle neueste Videos aus dem State zurück
   */
  getCurrentLatestVideos(): Video[] {
    return this.latestVideosSubject.value;
  }

  /**
   * Error Handler für API-Calls
   */
  private handleError(error: any): Observable<ApiResponse> {
    let errorMessage = 'Failed to load videos';
    
    if (error.status === 401) {
      errorMessage = 'Nicht autorisiert. Bitte melden Sie sich erneut an.';
    } else if (error.status === 403) {
      errorMessage = 'Zugriff verweigert.';
    } else if (error.status === 404) {
      errorMessage = 'Videos nicht gefunden.';
    } else if (error.status === 500) {
      errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
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