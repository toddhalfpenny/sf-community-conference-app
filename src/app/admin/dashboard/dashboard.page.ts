import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonItem, IonList, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { book, calendar, diamondOutline, gameController, home, map, megaphone, people, person, logIn, logOut, scanCircle, peopleCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonItem, IonList, IonIcon, IonLabel]
})
export class DashboardPage implements OnInit {

  constructor() { 
    addIcons({ book, calendar, diamondOutline, gameController, home, map, megaphone, people, person, logIn, logOut, scanCircle, peopleCircle });

  }

  ngOnInit() {
  }

}
