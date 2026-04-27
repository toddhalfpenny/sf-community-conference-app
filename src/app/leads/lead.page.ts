/**
 * lead.page.ts - Page for a single lead.
 * 
 * TODO
 * - delete 
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonItem, IonTextarea, IonCard, IonLabel, IonText, IonRow, IonCol } from '@ionic/angular/standalone';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Lead, SyncStatus } from './lead.model';
import { LeadService } from './lead-service';

@Component({
  selector: 'app-lead',
  templateUrl: './lead.page.html',
  styleUrls: ['./lead.page.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonItem, IonTextarea, IonCard, IonLabel, IonText, IonRow, IonCol]
})
export class LeadPage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly leadsService = inject(LeadService);
  private readonly formBuilder = inject(FormBuilder);

  protected isEditing: boolean = false;

  protected leadForm: FormGroup = this.formBuilder.group({
    firstname: [{value: '', disabled: true}, Validators.required],
    lastname: [{value: '', disabled: true}, Validators.required],
    company: [{value: '', disabled: true}],
    notes: [{value: '', disabled: true}],
  });

  protected lead?: Lead;

  constructor() {
    addIcons({ close, create, save});
   }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    const leadId = this.activatedRoute.snapshot.paramMap.get('leadId') as string;
    this.lead = await this.leadsService.getLead(leadId) as Lead;
    this.leadForm.setValue({
      firstname: this.lead.user?.firstname,
      lastname: this.lead.user?.lastname,
      company: this.lead.user?.company,
      notes: this.lead.notes ?? ''
    });
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
    this.leadForm.enable();
  }

  protected async save() {
    this.isEditing = false;
    const updatedLead: Lead = {
      id: this.lead?.id ?? '',
      user : {
        firstname: this.leadForm.value.firstname,
        lastname: this.leadForm.value.lastname,
        company: this.leadForm.value.company
      },
      notes: this.leadForm.value.notes,
      status: SyncStatus.pending
    };
    console.log('Saving lead:', updatedLead);
    await this.leadsService.saveLead(updatedLead);
    this.router.navigate(['/leads'], { replaceUrl:true });
  }

  protected async sync() {
    await this.leadsService.syncOutstanding();
    this.lead = await this.leadsService.getLead(this.lead?.id as string) as Lead;
  }
}
