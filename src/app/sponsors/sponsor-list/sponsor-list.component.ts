import { Component, inject, Input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonList, IonButton, IonIcon } from '@ionic/angular/standalone';
import { globe, logoLinkedin, logoInstagram } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SponsorsService } from '../sponsors.service';

const LOG_TAG = 'sponsor-list.component';
@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonList, IonButton, IonIcon],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsorListComponent  implements OnInit {
  
  @Input() showDetails: boolean = false;
  @Input() showTitle: boolean = false;

  private readonly sponsorsService = inject(SponsorsService);
  protected readonly tiers = this.sponsorsService.getTiers();
  sponsorList: any
  result: any;

  constructor() {
    addIcons({ globe, logoLinkedin, logoInstagram});
    effect(() => {
      this.sponsorList = this.sponsorsService.sponsors$();
      console.log('Sponsor list in component:', this.sponsorList);
    });
   }

  async ngOnInit() {  
    this.sponsorList = this.sponsorsService.refreshSponsors()    
  }


}
