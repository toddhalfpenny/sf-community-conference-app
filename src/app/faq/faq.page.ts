import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { FaqService } from  './faq-service';
import { type FAQ } from './faq.model';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonLabel]
})
export class FaqPage implements OnInit {
  private readonly FaqService = inject(FaqService);
  protected faqs: FAQ[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.faqs = await this.FaqService.getFaqs();
  }

}
