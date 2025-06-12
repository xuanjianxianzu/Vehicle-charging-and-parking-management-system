import { Component, OnInit } from '@angular/core';
import { comment } from 'src/models';
import { DataService } from 'src/data.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
  standalone: false,
})
export class CommentPage implements OnInit {
  comment:comment[]=[];
  constructor(private dataService:DataService) { }

  ngOnInit(){
    this.loadComment()
  }

  loadComment() {
  this.dataService.getComplete().subscribe({
    next: (data: any) => {
      this.comment = data.data;
      console.log(this.comment,data.data);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}

deleteCom(cId:number){
    this.dataService.deleteComment(cId).subscribe({
    next: (data: any) => {
      this.loadComment();
      alert(data.message);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}


}
