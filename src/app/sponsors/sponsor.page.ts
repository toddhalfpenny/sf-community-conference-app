/**
 * Sponsor page
 * 
 * TODO
 * - Booth details
 * - Contact button?
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Sponsor } from './sponsor.model';
import { SponsorsService } from './sponsors.service';

@Component({
  selector: 'app-sponsor',
  templateUrl: './sponsor.page.html',
  styleUrls: ['./sponsor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon]
})
export class SponsorPage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly sponsorService = inject(SponsorsService);

  protected sponsor?: Sponsor;

  constructor() { }

  ngOnInit() {
  }


  async ionViewWillEnter() {
    const sponsorId = this.activatedRoute.snapshot.paramMap.get('sponsorId') as string;
    this.sponsor = await this.sponsorService.getSponsorById(sponsorId) as Sponsor;
  }
}
