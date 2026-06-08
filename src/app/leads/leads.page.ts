import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonFooter, IonIcon, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonSearchbar, IonCol, IonRow } from '@ionic/angular/standalone';
import { scanCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import { LeadService } from './lead-service';
import { LeadsListComponent } from "./leads-list/leads-list.component";
import  { UserService } from '../user/user.service';
import { User } from '../user/user.model';
import { Lead } from './lead.model';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, RouterLink, LeadsListComponent, IonSearchbar, IonCol, IonRow]
})
export class LeadsPage implements OnInit {
  @ViewChild('downloadlink') downloadlink!: any;

  private readonly leadsService = inject(LeadService);
  private readonly userService = inject(UserService);
  private user!: User;

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
    // TODO SUBSCRIPTION THIS
    if (!this.user) {
      this.user = await this.userService.getUser() as User;
      console.log('User in leads page', this.user);
    }
    if (this.user) {
      this.leads = await this.leadsService.getLeads((this.user.sponsorAdmin ?? "") !== "" ? this.user.sponsorAdmin : this.user.boothStaff);
    }
  }

  protected async exportLeads() {
    console.log('Exporting leads', this.leads);
    if (this.leads.length === 0) {
      console.warn('No leads to export');
      return;
    }

    const csvHeader = 'User ID,First Name,Last Name,Job Title,Email,Telephone,Company,Country\n';
    const csvContent = this.leads.map((e: Lead) => {
      return `${e.user?.id},${e.user?.firstname},${e.user?.lastname},${e.user?.jobTitle},${e.user?.email},${e.user?.telephone},${e.user?.company},${e.user?.country}`;
    }).join('\n');
    // const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = encodeURI('data:text/csv;charset=utf-8,' + csvHeader + csvContent);
    console.log('Generated CSV URL', url);
    this.downloadlink.nativeElement.href = url;
    this.downloadlink.nativeElement.click();
  }

  protected handleSearchChange(event: any) {
    console.log("handleSearchChange", event);
    this.searchTerm = event.detail.value.toLowerCase();
  }

  protected showScanner() {
    console.log('Show scanner');
  }

}

