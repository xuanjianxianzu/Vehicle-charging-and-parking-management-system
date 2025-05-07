import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { User } from 'src/models/user';
import { DataService } from 'src/data.service';
@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  user!:User;
  myUserID = localStorage.getItem('myUserID');

  constructor(
    private router: Router,
    private toastController: ToastController,
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



  async logout() {
    localStorage.removeItem('myUserID');
    localStorage.removeItem('token');

    const toast = await this.toastController.create({
      message: '已退出登录',
      duration: 2000,
      position: 'top'
    });
    await toast.present();

    this.router.navigate(['/login']);
  }

 
  goToInfor(){
    this.router.navigate(['/personal-information'], { 
      state: { 
        userI: this.user 
      } 
    });
  }


  goToWallet() {
    this.router.navigate(['/wallet'], { 
      state: { 
        balance: this.user.balance 
      } 
    });
  }
   
  goToAllOrders() {
    this.router.navigate(['/my-bill']);
  }
   
  goToMyUsage() {
    this.router.navigate(['/tabs/tab3']);
  }
   
  goToMyCar() {
    this.router.navigate(['/tabs/tab2']);
  }
   
  goToSetup() {
    this.router.navigate(['/setup']);
  }
   

}
