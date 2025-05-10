import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/data.service';
import { comment } from 'src/models/comment';

@Component({
  selector: 'app-my-comment',
  templateUrl: './my-comment.page.html',
  styleUrls: ['./my-comment.page.scss'],
  standalone: false,
})
export class MyCommentPage implements OnInit {
  comment:comment[]=[];
  myUserID = localStorage.getItem('myUserID');
  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadComment();
    this.route.params.subscribe(() => {
      this.loadComment();
    });
  }

  loadComment() {
  this.dataService.getComplete2(Number(this.myUserID)).subscribe({
    next: (data: any) => {
      this.comment = data.data;
      console.log(this.comment,data.data);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}

}
