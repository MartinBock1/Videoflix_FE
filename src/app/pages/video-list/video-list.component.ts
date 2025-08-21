import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { VideoService } from '../../shared/services/video.service';
import { AuthService } from '../../shared/services/auth.service';
import { Video, User } from '../../shared/interfaces/api.interfaces';
import { VideoCardComponent } from './components/video-card/video-card.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, VideoPlayerComponent],
  template: `
    <div class="video-list-container">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <img src="/assets/icons/logo_icon.svg" alt="Videoflix" />
          <span>Videoflix</span>
        </div>
        <div class="header-actions">
          <span>{{ currentUser?.first_name || currentUser?.email }}</span>
          <button (click)="logout()" class="logout-btn">
            <img src="/assets/icons/logout.svg" alt="Logout" />
          </button>
        </div>
      </header>

      <!-- Main Video Player -->
      <section class="main-video" *ngIf="currentVideo$ | async as currentVideo">
        <app-video-player 
          [video]="currentVideo"
          [isMainPlayer]="true"
          (playVideo)="onPlayVideo($event)">
        </app-video-player>
      </section>

      <!-- Video Categories -->
      <main class="video-categories">
        <!-- Latest Videos Section -->
        <section class="category-section" *ngIf="(latestVideos$ | async)?.length">
          <h2>Neueste Videos</h2>
          <div class="video-grid">
            <app-video-card 
              *ngFor="let video of latestVideos$ | async" 
              [video]="video"
              (playVideo)="onPlayVideo($event)">
            </app-video-card>
          </div>
        </section>

        <!-- Category Sections -->
        <section 
          class="category-section" 
          *ngFor="let category of categories"
          [attr.data-category]="category">
          <h2>{{ getCategoryDisplayName(category) }}</h2>
          <div class="video-grid">
            <app-video-card 
              *ngFor="let video of getVideosByCategory(category)" 
              [video]="video"
              (playVideo)="onPlayVideo($event)">
            </app-video-card>
          </div>
        </section>
      </main>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Videos werden geladen...</p>
      </div>

      <!-- Error State -->
      <div class="error" *ngIf="errorMessage">
        <img src="/assets/img/warning.png" alt="Error" />
        <p>{{ errorMessage }}</p>
        <button (click)="loadVideos()" class="retry-btn">Erneut versuchen</button>
      </div>
    </div>
  `,
  styles: [`
    .video-list-container {
      min-height: 100vh;
      background: #000;
      color: #fff;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .logo img {
      height: 2rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .test-btn {
      background: #0070f3;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }

    .test-btn:hover {
      background: #0051cc;
    }

    .logout-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .logout-btn img {
      height: 1.5rem;
      filter: invert(1);
    }

    .main-video {
      height: 70vh;
      margin-bottom: 2rem;
    }

    .video-categories {
      padding: 0 2rem 2rem;
    }

    .category-section {
      margin-bottom: 3rem;
    }

    .category-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #fff;
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #333;
      border-top: 3px solid #e50914;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      gap: 1rem;
      text-align: center;
    }

    .error img {
      height: 4rem;
      opacity: 0.7;
    }

    .retry-btn {
      background: #e50914;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }

    .retry-btn:hover {
      background: #f40612;
    }
  `]
})
export class VideoListComponent implements OnInit, OnDestroy {
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
