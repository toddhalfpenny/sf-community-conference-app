import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonCard, IonButton, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonAlert } from '@ionic/angular/standalone';
import { trashBin, trash } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { StorageService } from '../storage/storage-service';
import { UserService } from '../user/user-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonButton, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonAlert]
})
export class ProfilePage implements OnInit {

  private readonly userService = inject(UserService);
  private readonly storageService = inject(StorageService);

  protected alertAction!: 'clearTTL' | 'clearLocalData';
  protected alertButtons = [
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
        switch (this.alertAction) {
          case 'clearTTL':
            this.doClearTTL();
            break;
          case 'clearLocalData':
            this.doClearLocalData();
            break;
        }
      },
    },
  ];
  protected alertHeader: string = 'Confirm';
  protected alertMessage: string = '';
  protected showAlert:boolean = false;

  constructor() {
    addIcons({ trashBin, trash }); }

  ngOnInit() {
      const user  = this.userService.getUser()
      console.log('User data in ProfilePage:', user);
  }

  protected clearTTL() {
    this.alertHeader = 'Clear TTL';
    this.alertMessage = 'Are you sure you want to clear the cache TTL data? This action cannot be undone. Fresh data will be fetched as needed.';
    this.alertAction = 'clearTTL';
    this.showAlert = true;
  }

  protected clearLocalData() {
    this.alertHeader = 'Clear Local Data';
    this.alertMessage = 'Are you sure you want to clear all local data? This action cannot be undone.';
    this.alertAction = 'clearLocalData';
    this.showAlert = true;
  }


  private doClearTTL() {
    this.storageService.clearTTL();
  }

  private doClearLocalData() {
    this.storageService.clearLocalData();
  }

}
