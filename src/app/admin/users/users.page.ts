import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonButton, IonText } from '@ionic/angular/standalone';
import { UserService } from  '../../user/user.service';
import { type AppUser } from '../../user/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonList, IonButton, IonText]
})
export class UsersPage implements OnInit {
  @ViewChild('userInput') userInput!: any;
  
  private readonly userService = inject(UserService);

  protected users: AppUser[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.users = await this.userService.getAppUsers();
  }

}
