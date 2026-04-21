import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-annoucements',
  templateUrl: './annoucements.page.html',
  styleUrls: ['./annoucements.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AnnoucementsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
