import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/data.service';
import { Vehicle } from 'src/models/vehicle';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {


  MyCarArray:Vehicle[]=[];
  myUserID = localStorage.getItem('myUserID');



  constructor(
    private router: Router,
    private dataService:DataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getMyCar();
    this.route.params.subscribe(() => {
      this.getMyCar();
    });
  }
  
  ionViewWillEnter() {
    this.getMyCar();
  }

  getMyCar(){
    if(!this.myUserID){
        return;
    }
    console.log('aaa');
    this.dataService.getMyCar(Number(this.myUserID)).subscribe({
      next: (data: any) => {
        this.MyCarArray = data.data;
      },
      error: (error) => {
        console.error('Error:', error);

      }
    });

  }


  toAddCar(){
    this.router.navigate(['/add-car']);
  }

  toChangeCar(vehicle: Vehicle) {
    console.log(vehicle);
    this.router.navigate(['/update-car'], {
      state: { vehicle }
    });
  }


}
