import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { IonAlert, IonContent, IonHeader, IonTitle, IonToggle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonList, IonItem, IonInput, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { UserService } from  '../../user/user.service';
import { User, type AppUser } from '../../user/user.model';
import { Sponsor } from 'src/app/sponsors/sponsor.model';
import { SponsorsService } from 'src/app/sponsors/sponsors.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule,IonAlert, IonContent, IonHeader, IonTitle, IonToggle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonList, IonItem, IonInput, IonSelect, IonSelectOption]
})
export class UserPage implements OnInit {

  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly sponsorService = inject(SponsorsService);
  private readonly location = inject(Location);

  protected user: User | null = null;
  protected eventUser: User | null = null;
  protected appUser: AppUser | null = null;
  protected isEditing: boolean = false;
  protected isFailedSaveAlertOpen: boolean = false;
  protected isNewUser: boolean = false;
  protected userForm: FormGroup = this.formBuilder.group({
    email: [{value: '', disabed: true}, Validators.email],
    canManageAdmins: [{value: false}],
    canManageSponsorAdmins: [{value: false}],
    canManageSponsorStaff: [{value: false}],
    canManageSessions: [{value: false}],
    canManageUsers: [{value: false}],
    canManageSpeakers: [{value: false}],
    canManageAnnouncements: [{value: false}],
    canManageFAQs: [{value: false}],
    canUpsertLeads: [{value: false}],
    isActive: [],
    associatedSponsors: [{value: null}],
  });
  protected sponsors!: Sponsor[];

  protected failedSaveAlertMessage: string = 'Failed to save user. Please try again.';
  protected failedSaveAlertButtons = [
    {
      text: 'OK',
      role: 'cancel',
      handler: () => {
        console.log('Failed save alert dismissed');
      },
    },
  ];

  constructor() { 
    const navigation = this.router.currentNavigation();
    console.log("Navigation extras:", navigation?.extras);
    if (navigation?.extras?.state) {
      this.appUser = navigation?.extras?.state["user"];
    } else {
      this.isNewUser = true;
    }
    console.log("AppUser:", this.appUser);
    addIcons({ close, create, save});

    // Set initial form values based on the appUser data
    this.userForm.setValue({ 
      email: this.appUser?.email || '',
      canManageAdmins: this.appUser?.canManageAdmins || false,
      canManageSponsorAdmins: this.appUser?.canManageSponsorAdmins || false,
      canManageSponsorStaff: this.appUser?.canManageSponsorStaff || false,
      canManageSessions: this.appUser?.canManageSessions || false,
      canManageUsers: this.appUser?.canManageUsers || false,
      canManageSpeakers: this.appUser?.canManageSpeakers || false,
      canManageAnnouncements: this.appUser?.canManageAnnouncements || false,
      canManageFAQs: this.appUser?.canManageFAQs || false,
      canUpsertLeads: this.appUser?.canUpsertLeads || false,
      isActive: this.appUser?.isActive || false,
      associatedSponsors:  null,
    });
    console.log("isNew User", this.isNewUser);  
    if(this.isNewUser) {
      this.userForm.get('email')?.enable();
      this.isEditing = true;
    } else {
      this.userForm.get('email')?.disable();
    }
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    // TODO SUBSCRIPTION THIS
    if (!this.user) {
      console.log('Fetching user for user page');
      this.user = await this.userService.getUser() as User;
      console.log('User in user page', this.user);
    } 
    if (this.user) {
    }
    this.sponsors = (await this.sponsorService.getRawSponsors()).sort((a, b) => a.name.localeCompare(b.name));
    if(!this.isNewUser) {
      this.eventUser = await this.userService.getUserByEmail(this.appUser?.email || '');
      if (this.eventUser?.boothStaff) {
        this.userForm.get('associatedSponsors')?.setValue(this.eventUser.boothStaff);
      }
      if (this.eventUser?.sponsorAdmin) {
        this.userForm.get('associatedSponsors')?.setValue(this.eventUser.sponsorAdmin);
      }
    }
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

  protected edit() {
    this.isEditing = true;
    this.userForm.enable();
  }

  protected async save() {
    this.isEditing = false;
    const updatedUser: AppUser = {
      email: this.isNewUser ?  this.userForm.value.email : this.appUser?.email || '',
      userId : this.appUser?.userId || '',
      canUpsertLeads: this.userForm.value.canUpsertLeads,
      canManageAdmins: this.userForm.value.canManageAdmins,
      canManageSponsorAdmins: this.userForm.value.canManageSponsorAdmins,
      canManageSponsorStaff: this.userForm.value.canManageSponsorStaff,
      canManageSessions: this.userForm.value.canManageSessions,
      canManageUsers: this.userForm.value.canManageUsers,
      canManageSpeakers: this.userForm.value.canManageSpeakers,
      canManageAnnouncements: this.userForm.value.canManageAnnouncements,
      canManageFAQs: this.userForm.value.canManageFAQs,
      isActive: this.userForm.value.isActive,
    }
    console.log('Saving user:', updatedUser);
    const res = await this.userService.upsertAppUsers([{appUser: updatedUser, sponsorId: this.userForm.value.associatedSponsors}]);
    if (res.length > 0) {
      console.error('Error saving user:', res);
      this.failedSaveAlertMessage = `Failed to save user ${updatedUser.email}. ${res[0].error}`;
      this.isFailedSaveAlertOpen = true;
    } else {
      this.router.navigate(['/admin/users'], { replaceUrl:true });
    }
  }


}
