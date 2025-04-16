import { Component, OnInit } from '@angular/core';
import { WriteCommentComponent } from "../write-comment/write-comment.component";
import { CommonModule } from '@angular/common';
import { CommentService } from '../service/comment.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [WriteCommentComponent, CommonModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  comments: any[] = [];

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.getCommentByPost(); // no need to pass commentId
  }

  getCommentByPost(): void {
    this.commentService.getComments().subscribe(
      response => {
        console.log('Comments:', response);
        this.comments = response ?? [];

      },
      error => {
        console.error('Failed to fetch comments:', error);
      }
    );
  }

  getParsedUser(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  

  
}
