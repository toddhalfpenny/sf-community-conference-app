import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonList, IonButton, IonIcon } from '@ionic/angular/standalone';
import { globe, logoLinkedin, logoInstagram } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SponsorsService } from '../sponsors.service';

@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonList, IonButton, IonIcon]
})
export class SponsorListComponent  implements OnInit {
  
  @Input() showDetails: boolean = false;
  @Input() showTitle: boolean = false;

  private readonly sponsorsService = inject(SponsorsService);
  protected readonly tiers = this.sponsorsService.getTiers();
  sponsorList: any

  constructor() {
    addIcons({ globe, logoLinkedin, logoInstagram});
   }

  async ngOnInit() {
    this.sponsorList = await this.sponsorsService.getSponsors();
    console.log('Sponsor list in component:', this.sponsorList);
  }

}
