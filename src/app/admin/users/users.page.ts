import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { UserService } from  '../../user/user-service';
import { type AppUser } from '../../user/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
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
