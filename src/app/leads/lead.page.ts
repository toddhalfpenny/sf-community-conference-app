/**
 * lead.page.ts - Page for a single lead.
 * 
 * TODO
 * - Edit mode
 * - delete 
 * - sync
 * - scannedBy
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonItem, IonTextarea, IonCard, IonLabel, IonText, IonRow, IonCol } from '@ionic/angular/standalone';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Lead } from './lead.model';
import { LeadService } from './lead-service';

@Component({
  selector: 'app-lead',
  templateUrl: './lead.page.html',
  styleUrls: ['./lead.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonItem, IonTextarea, IonCard, IonLabel, IonText, IonRow, IonCol]
})
export class LeadPage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly leadsService = inject(LeadService);
  protected isEditing: boolean = false;
  protected lead?: Lead;

  constructor() {
    addIcons({ close, create, save});
   }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    const leadId = this.activatedRoute.snapshot.paramMap.get('inspectionId') as string;
    this.lead = await this.leadsService.getLead(leadId) as Lead;
  }

  protected async cancel() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Cancel?';
    alert.message = 'Cancelling will lose any unsaved data.';
    alert.buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Alert canceled');
        },
      },
      {
        text: 'OK',
        role: 'confirm',
        handler: () => {
          console.log('Alert confirmed');
          this.location.back();
        },
      },
    ];


    document.body.appendChild(alert);
    await alert.present();
  }

  protected async delete() {
  }

  protected edit() {
    this.isEditing = true;
  }

  protected save() {
    this.isEditing = false;
    this.router.navigate(['/leads'], { replaceUrl:true });
  }

  protected async sync() {
  }
}
