import { Component, OnInit , Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.scss'],
  standalone: false,
})
export class ReviewModalComponent{
  @Input() orderId!: number;
  rating: number=0;
  comment: string = '';



  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.rating) {
      this.modalCtrl.dismiss({
        rating: this.rating,
        comment: this.comment
      });
    }
  }


  setRating(value: number) {
    this.rating = value;
  }


}
