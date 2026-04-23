import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem } from '@ionic/angular/standalone';
import { Observable, of } from 'rxjs';
import { Sponsor } from '../sponsor.model';
import { SponsorsService } from '../sponsors.service';

@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem]
})
export class SponsorListComponent  implements OnInit {
  
  private readonly sponsorsService = inject(SponsorsService);
  protected readonly tiers = this.sponsorsService.getTiers();
  sponsorList: any

  constructor() { }

  async ngOnInit() {
    this.sponsorList = await this.sponsorsService.getSponsors();
    console.log('Sponsor list in component:', this.sponsorList);
  }

}
