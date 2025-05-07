import { Component, OnInit , Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-to-inf',
  templateUrl: './modal-to-inf.component.html',
  styleUrls: ['./modal-to-inf.component.scss'],
  standalone: false,
})
export class ModalToInfComponent  implements OnInit {

  @Input() fieldType!: string;
  @Input() currentValue!: string;

  constructor(private modalCtrl: ModalController) { }
  
  ngOnInit() {}
  get fieldLabel(): string {
    return {
      name: '姓名',
      email: '邮箱',
      phone: '电话'
    }[this.fieldType] || '';
  }

  get inputType(): string {
    return this.fieldType === 'email' ? 'email' : 'text';
  }

  get isValid(): boolean {
    if (this.fieldType === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.currentValue);
    }
    return this.currentValue.trim().length > 0;
  }



  save() {
    if (this.isValid) {
      this.modalCtrl.dismiss(this.currentValue.trim());
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}