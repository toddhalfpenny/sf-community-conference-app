import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonFooter, IonIcon, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonSearchbar } from '@ionic/angular/standalone';
import { scanCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import { LeadService } from './lead-service';
import { LeadsListComponent } from "./leads-list/leads-list.component";

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, RouterLink, LeadsListComponent, IonSearchbar]
})
export class LeadsPage implements OnInit {

  private readonly leadsService = new LeadService();

  protected header: string = 'My Leads';
  protected isShowingScanner: boolean = false;
  protected leads: any[] = [];
  protected searchTerm : string = '';

  constructor() {
    addIcons({ scanCircle });
   }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    this.leads = await this.leadsService.getMyLeads();
  }

  protected handleSearchChange(event: any) {
    console.log("handleSearchChange", event);
    this.searchTerm = event.detail.value.toLowerCase();
  }

  protected showScanner() {
    console.log('Show scanner');
  }

}

