import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../service/article.service';
import { KandyEyeSliderComponent } from "../kandy-eye-slider/kandy-eye-slider.component";

@Component({
  selector: 'app-all-news',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, KandyEyeSliderComponent],
  templateUrl: './all-news.component.html',
  styleUrls: ['./all-news.component.css']
})
export class AllNewsComponent implements OnInit {

  news: any[] = [];
  mainImage: string = ''; // Stores the first news image

 

  constructor(private httpArticle:ArticleService , private router: Router) {}

   heading: string[] = [
    'Celebrity',
    'Politices',
    "Crime",
    "Bussninss",
    "Entertainment",
 
  ];



  getHeading(index: number): string {
    return this.heading[Math.floor(index / 8) % this.heading.length];
  }

setSelectedArticle(article: any) {
  this.httpArticle.setSelectedArticle(article);
}

   // Convert the published_at timestamp to a relative time
  getRelativeTime(publishedAt: string): string {
    const parsedDate = parseISO(publishedAt); // Parse the ISO 8601 string to a Date object
    return formatDistanceToNowStrict(parsedDate); // Get the relative time without "about"
  }


  ngOnInit(): void {
    this.getArticles();

  }

  
  private baseUrl = 'https://new.hardknocknews.tv/upload/media/posts';


  getArticles(): void {
    this.httpArticle.getArticle().subscribe({
      next: (response) => {
        console.log('API Response more news:', response);
  
        if (response && Array.isArray(response.posts)) {
          this.news = response.posts.map((post: any) => {
            const updatedThumb = post.thumb ? `${this.baseUrl}/${post.thumb}-s.jpg` : null;
            return {
              ...post,
              thumb: updatedThumb,
              relativeTime: this.getRelativeTime(post.spdate), // Add relative time to each post
            };
          });
  
          // Sort the news array by the spdate (latest date first)
          this.news.sort((a, b) => {
            const dateA = new Date(a.spdate).getTime();
            const dateB = new Date(b.spdate).getTime();
            return dateB - dateA; // Sort in descending order
          });
        } else {
          console.error('Invalid API response format:', response);
          this.news = [];
        }
      },
      error: (error) => console.error('Error fetching articles:', error),
    });
  }
  
  
  
  
  
  getPost(type: string, slug: string, article: any) {
    // Clear the previously selected article from localStorage
    localStorage.removeItem('selectedArticle');
  
    this.httpArticle.getsinglepost(type, slug).subscribe(result => {
      this.httpArticle.setSelectedArticle(article);
      localStorage.setItem('selectedArticle', JSON.stringify(article)); // Save the new article to localStorage
  
      // Navigate based on type, pass real values, not param names
      if (type === 'video') {
        this.router.navigate(['video-news', type, slug]);
      } else if (type === 'news') {
        this.router.navigate(['article', type, slug]);
      }
  
      console.log(result);
    });
  }
  
  
  
}
