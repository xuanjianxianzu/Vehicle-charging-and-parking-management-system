import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-modal-to-pic',
  templateUrl: './modal-to-pic.component.html',
  styleUrls: ['./modal-to-pic.component.scss'],
  standalone: false,
})
export class ModalToPicComponent  implements OnInit {
  numbers = Array.from({ length: 14 }, (_, i) => i);
  selectedIndex: number | null = null;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  getImagePath(num: number): string {
    return `../../assets/images/${num}.png`;
  }

  selectImage(index: number) {
    this.selectedIndex = index;
    console.log('Selected:', index);
  }

  async closeModal() {
    await this.modalCtrl.dismiss(this.selectedIndex);
  }

}
