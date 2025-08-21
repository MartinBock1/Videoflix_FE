import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { VideoService } from '../../shared/services/video.service';
import { AuthService } from '../../shared/services/auth.service';
import { Video, User } from '../../shared/interfaces/api.interfaces';
import { VideoCard } from './video-card/video-card';
import { VideoPlayer } from './video-player/video-player';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, VideoCard, VideoPlayer],
  templateUrl: './video-list.html',
  styleUrls: ['./video-list.scss']
})
export class VideoList implements OnInit, OnDestroy {
  videos$: Observable<Video[]>;
  latestVideos$: Observable<Video[]>;
  currentVideo$: Observable<Video | null>;
  
  categories: string[] = [];
  isLoading = false;
  errorMessage = '';
  
  currentUser: User | null = null;
  
  private subscriptions = new Subscription();

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.videos$ = this.videoService.videos$;
    this.latestVideos$ = this.videoService.latestVideos$;
    this.currentVideo$ = this.videoService.currentVideo$;
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Check if user is authenticated before loading videos
    if (this.currentUser && this.authService.isAuthenticated()) {
      // Load videos directly
      this.loadVideos();
      this.setupSubscriptions();
    } else {
      // Redirect to login if not authenticated
      this.router.navigate(['/auth/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupSubscriptions(): void {
    // Update categories when videos change
    this.subscriptions.add(
      this.videos$.subscribe(videos => {
        this.categories = this.videoService.getCategories();
      })
    );
  }

  /**
   * Test session and then load videos
   */
  testSessionAndLoadVideos(): void {
    // Directly load videos
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.subscriptions.add(
      this.videoService.loadAndSetupVideos().subscribe({
        next: (response) => {
          this.isLoading = false;
          if (!response.success) {
            this.errorMessage = response.message || 'Failed to load videos';
            
            // If authorization error, redirect to login
            if (response.message?.includes('autorisiert') || response.message?.includes('Unauthorized')) {
              setTimeout(() => {
                this.authService.logout();
                this.router.navigate(['/auth/login']);
              }, 2000);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.status === 401) {
            this.errorMessage = 'Sitzung abgelaufen. Sie werden zur Anmeldung weitergeleitet...';
            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.errorMessage = 'Fehler beim Laden der Videos. Bitte versuchen Sie es erneut.';
          }
        }
      })
    );
  }

  onPlayVideo(video: Video): void {
    this.videoService.setCurrentVideo(video);
  }

  getVideosByCategory(category: string): Video[] {
    return this.videoService.getVideosByCategory(category);
  }

  getCategoryDisplayName(category: string): string {
    // Capitalize first letter and handle special cases
    const displayNames: { [key: string]: string } = {
      'action': 'Action',
      'comedy': 'Komödie',
      'drama': 'Drama',
      'thriller': 'Thriller',
      'horror': 'Horror',
      'romance': 'Romantik',
      'scifi': 'Science Fiction',
      'documentary': 'Dokumentation'
    };
    
    return displayNames[category.toLowerCase()] || 
           category.charAt(0).toUpperCase() + category.slice(1);
  }

  logout(): void {
    // Clear auth data and navigate to login
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}