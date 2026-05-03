import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { tabletojson } from 'tabletojson';
import { SponsorsService } from  '../../sponsors/sponsors.service'
import { UtilService } from 'src/app/utils/util-service';
import { type Sponsor } from '../../sponsors/sponsor.model';

const SESSION_XLS_COLUMN_MAP: any = {
  'id': 'Opportunity ID',
  'name': 'Company Promo Name',
  'order': 'Payment Order',
  'tiers': 'Products',
  'website': 'Website',
  'landingPageUrl': 'Landing Page',
  'linkedInUrl': 'LinkedIn Page',
  'InstagramUrl': 'Instagram',
  'bio': 'Company Bio',
}

@Component({
  selector: 'app-sponsors',
  templateUrl: './sponsors.page.html',
  styleUrls: ['./sponsors.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton]
})
export class SponsorsPage implements OnInit {
  @ViewChild('sponsorInput') sponsorInput!: any;
  
  private readonly sponsorService = inject(SponsorsService);
  private readonly utilService = inject(UtilService);
  private sponsorArray: Sponsor[] = [];

  protected sponsors: Sponsor[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.sponsors = await this.sponsorService.getRawSponsors();
    console.log('Sponsors fetched for display:', this.sponsors);
  }

  public async importSponsors() {
    const sponsorArray: Sponsor[] = [];
    const file = this.sponsorInput.nativeElement.files[0];
    console.log('Importing sponsors from file:', file);
    const timeNow = new Date();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      console.log('File content:', e.target.result);
      if (!e.target.result) return;
      const data = e.target.result as string;

      const converted = tabletojson.convert(data)[0];
      console.log('Converted CSV to JSON:', converted.length, 'rows');

      for (let index = 0; index < converted.length; index++) {
        let row = converted[index];
        if (row) {

          const tiers = row[SESSION_XLS_COLUMN_MAP.tiers] ? row[SESSION_XLS_COLUMN_MAP.tiers].split(',').map((tier: string) => this.parseTier(tier.trim())) : [];

          const landingPageUrl = this.parseUrl(row[SESSION_XLS_COLUMN_MAP.landingPageUrl] ? row[SESSION_XLS_COLUMN_MAP.landingPageUrl].trim() : row[SESSION_XLS_COLUMN_MAP.website].trim());
          // todo parse po👆️ so it's a link

          const sponsor: Sponsor = {
            id: row[SESSION_XLS_COLUMN_MAP.id],
            name: row[SESSION_XLS_COLUMN_MAP.name],
            order: parseInt(row[SESSION_XLS_COLUMN_MAP.order]),
            tiers: tiers,
            landingPageUrl: landingPageUrl,
            linkedInUrl: this.parseUrl(row[SESSION_XLS_COLUMN_MAP.linkedInUrl] ?? ''),
            // instagramUrl: row[SESSION_XLS_COLUMN_MAP.instagramUrl] ?? '',
            bio: row[SESSION_XLS_COLUMN_MAP.bio],
            lastModified: timeNow,
          }
          sponsorArray.push(sponsor);
        }
      }
      console.log(sponsorArray);
      await this.sponsorService.upsertSponsors(sponsorArray);
    };
    reader.readAsText(file, 'ISO-8859-4');
    this.sponsorInput.nativeElement.value = '';
  }

  private parseUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }

  private parseTier(tier: string) {
    if (tier.includes("DemoJam")) {
      return "Demo Jam";
    }
    if (tier.includes("Room")) {
      return "Room & Video";
    }
    if (tier.includes("Stair")) {
      return "Stairs";
    }
    return tier.replace(" Sponsor", "");
  }

}
