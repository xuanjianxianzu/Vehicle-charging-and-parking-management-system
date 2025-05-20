import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/models';
import { DataService } from 'src/data.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.page.html',
  styleUrls: ['./personal-information.page.scss'],
  standalone: false,
})
export class PersonalInformationPage implements OnInit {
  user!:User;
  myUserID = localStorage.getItem('myUserID');

  constructor(
    private router: Router,
    private dataService:DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
   this.loadUser();
   this.route.params.subscribe(() => {
    this.loadUser();
  });
  }
  ionViewWillEnter() {
    this.loadUser();
  }
  
  loadUser() {
console.log('add');
    this.dataService.getUserInf(Number(this.myUserID)).subscribe({
      next: (data: any) => {
        this.user = data.data[0];
        console.log(this.user);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }


  get userAvatar(): string {
    return `../../assets/images/${this.user?.avatar_number}.png`;
  }

  goToInfor(){
    this.router.navigate(['/pidetail'], { 
      state: { 
        userI: this.user 
      } 
    });
  }

  goToSetup() {
    this.router.navigate(['/setup']);
  }

}
