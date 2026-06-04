import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder,ReactiveFormsModule, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonButton, IonCard, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular/standalone';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user/user.service';
import { User, UserType } from 'src/app/user/user.model';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-attendee',
  templateUrl: './attendee.page.html',
  styleUrls: ['./attendee.page.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonIcon, IonButton, IonCard, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonToggle]
})
export class AttendeePage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  protected isEditing: boolean = false;
  protected isNewUser: boolean = false;

  protected attendee!: User;
  protected userForm: FormGroup = this.formBuilder.group({
    id: [{value: null}],
    email: [{value: ''}, Validators.required],
    firstname: [{value: ''}, Validators.required],
    lastname: [{value: ''}, Validators.required],
    company: [{value: ''}],
    telephone: [{value: ''}],
    jobTitle: [{value: ''}],
    companyCountry: [{value: ''}],
    type: [UserType['Attendee-InPerson'], Validators.required],
    isActive: [true, Validators.required]
  });
  protected userTypes = [
    {name: 'Attendee-InPerson', value: 0},
    {name: 'Attendee-Virtual', value: 1},
    {name: 'Speaker', value: 2},
    {name: 'Sponsor', value: 3},
    {name: 'Guest', value: 7},
    {name: 'Crew', value: 90},
    {name: 'Admin', value: 91},
    {name: 'Super-Admin', value: 92},
  ]

  constructor() { 
    addIcons({ close, create, save});
  }

  ngOnInit() {
  }


    async ionViewWillEnter() {
      const attendeeId = this.activatedRoute.snapshot.paramMap.get('attendeeId') as string;
      if (attendeeId === 'new') {
        this.isNewUser = true;
        this.isEditing = true;
        this.attendee = {
          id: null,
          email: '',
          firstname: '',
          lastname: '',
          company: '',
          jobTitle: '',
          companyCountry: '',
          telephone: '',
          type: UserType['Attendee-InPerson'],
          isActive: true,
          prevUserId: null
        }
      } else {
        this.attendee = await this.userService.getUserById(attendeeId) as User;
        this.attendee.prevUserId = this.attendee.id; // Store the original ID in case it gets changed (for new users, this will be null and can be ignored)
      }
      console.log('Loaded attendee', this.attendee);

      this.userForm.setValue({
        id: this.attendee.id,
        email: this.attendee.email,
        firstname: this.attendee.firstname,
        lastname: this.attendee.lastname,
        company: this.attendee.company ?? '',
        jobTitle: this.attendee.jobTitle ?? '',
        telephone: this.attendee.telephone ?? '',
        companyCountry: this.attendee.companyCountry ?? '',
        type: this.attendee.type,
        isActive: this.attendee.isActive === false ? false : true
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
      this.userForm.enable();
    }
  
    protected onStatusChange(event:any) {
      console.log('Status changed', event.detail.value);
      this.userForm.patchValue({status: event.detail.value});
    }
  
    protected async save() {
      this.isEditing = false;
      const timeNow= new Date();
      console.log('Form values', JSON.stringify(this.userForm.value));
      const updatedUser: User = {
        id: this.userForm.value.id,        
        email: this.userForm.value.email,
        firstname: this.userForm.value.firstname,
        lastname: this.userForm.value.lastname,
        company: this.userForm.value.company,
        jobTitle: this.userForm.value.jobTitle,
        telephone: this.userForm.value.telephone,
        companyCountry: this.userForm.value.companyCountry,
        type: this.userForm.value.type,
        isActive: this.userForm.value.isActive,
        lastModified: timeNow,
        prevUserId: this.attendee.prevUserId // Include the original ID for upsert logic
      };
      console.log('Saving attendee:', updatedUser);
      await this.userService.upsertUsers([updatedUser], true);
      this.router.navigate(['/admin/attendees'], { replaceUrl:true });
    }
  

}
