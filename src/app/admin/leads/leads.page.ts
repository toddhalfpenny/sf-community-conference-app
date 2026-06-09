import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonButton, IonCard, IonList } from '@ionic/angular/standalone';
import { Lead } from 'src/app/leads/lead.model';
import { LeadService } from 'src/app/leads/lead-service';
import { User } from 'src/app/user/user.model';
import { UserService } from 'src/app/user/user.service';
import { Sponsor } from 'src/app/sponsors/sponsor.model';
import { SponsorsService } from 'src/app/sponsors/sponsors.service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonButton, IonCard, IonList]
})
export class LeadsPage implements OnInit {

  @ViewChild('downloadlink') downloadlink!: any;
  private readonly leadsService = inject(LeadService);
  private readonly userService = inject(UserService);
  private readonly sponsorService = inject(SponsorsService);
  protected isLoaded = false;
  protected leads: Lead[] = [];
  protected users: User[] = [];
  protected usersMap: { [id: string]: User } = {};
  protected sponsors: Sponsor[] = [];
  protected sponsorsMap: { [id: string]: Sponsor } = {};

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    // Leads
    const leads = await this.leadsService.getAllLeads();
    console.log('Fetched leads:', leads);
    this.leads = leads;

    // Users
    const users = await this.userService.getUsers();
    console.log('Fetched users:', users);
    this.users = users;
    this.usersMap = this.users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {} as { [id: string]: User });
    console.log('Users map:', this.usersMap);
    this.isLoaded = true;

    // Sponsors
    const sponsors = await this.sponsorService.getRawSponsors();
    console.log('Fetched sponsors:', sponsors);
    this.sponsors = sponsors;
    this.sponsorsMap = this.sponsors.reduce((map, sponsor) => {
      map[sponsor.id] = sponsor;
      return map;
    }, {} as { [id: string]: Sponsor });
  }

  protected async fixLeads() {
    console.log('Fixing leads...'); 
    console.warn('No longer implemented');

    // OLD CODE, to be removed after running once
    // for (let lead of this.leads) {
    //   const user = this.usersMap[lead.createdById ?? ""];
    //   if (lead.sponsorId === "" && user) {
    //     const sponsorId = (user.sponsorAdmin ?? "") !== "" ? user.sponsorAdmin : user.boothStaff;
    //     const sponsor = this.sponsorsMap[sponsorId ?? ""];
    //     if (sponsor) {
    //       lead.sponsorId = sponsor.id;
    //       await this.leadsService.saveLead(lead);
    //       console.log(`Updated lead (${lead.id} with sponsorId ${sponsor.id}`);
    //     } else {
    //       console.warn(`No sponsor found for user ${user.id} with sponsorAdmin ${user.sponsorAdmin} and boothStaff ${user.boothStaff}`);
    //     }
    //   } else {
        
    //   }
    // }
  }


  protected async exportLeads() {
    console.log('Exporting leads', this.leads);
    if (this.leads.length === 0) {
      console.warn('No leads to export');
      return;
    }

    const csvHeader = 'User ID,First Name,Last Name,Job Title,Email,Telephone,Company,Country,Scanned By,Sponsor,Notes\n';
    const csvContent = this.leads.map((e: Lead) => {
      return `${e.user?.id},${e.user?.firstname},${e.user?.lastname},"${e.user?.jobTitle}",${e.user?.email},${e.user?.telephone},${e.user?.company},${e.user?.country},${this.usersMap[e.createdById ?? ""] ? this.usersMap[e.createdById ?? ""].firstname + " " + this.usersMap[e.createdById ?? ""].lastname : "Unknown"},${this.sponsorsMap[e.sponsorId ?? ""] ? this.sponsorsMap[e.sponsorId ?? ""].name : "Unknown"},${e.notes ? `"${e.notes.replace(/"/g, '""')}"` : ""}`;
    }).join('\n');
    // const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = encodeURI('data:text/csv;charset=utf-8,' + csvHeader + csvContent);
    console.log('Generated CSV URL', url);
    this.downloadlink.nativeElement.href = url;
    this.downloadlink.nativeElement.click();
  }

}
