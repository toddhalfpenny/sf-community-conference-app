import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonFooter, IonIcon, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar, IonBadge } from '@ionic/angular/standalone';
import { scanCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import { LeadService } from './lead-service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, RouterLink, IonBadge]
})
export class LeadsPage implements OnInit {

  private readonly leadsService = new LeadService();
  protected isShowingScanner: boolean = false;
  protected leads: any[] = [];

  constructor() {
    addIcons({ scanCircle });
   }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    this.leads = await this.leadsService.getMyLeads();
  }



  protected showScanner() {
    console.log('Show scanner');
  }

}

