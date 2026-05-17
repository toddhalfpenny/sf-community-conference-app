import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonModal, IonButton } from '@ionic/angular/standalone';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: true,
  imports: [PinchZoomComponent, IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonModal, IonButton]
})
export class MapsPage implements OnInit {
  protected isMapModalOpen = false;
  protected selectedMap: string = '';
  protected selectedMapName:  string = '';


  constructor() { }

  ngOnInit() {
  }

  protected openMapModal(mapToOpen: string, mapName: string) {
    this.selectedMap = mapToOpen;
    this.selectedMapName = mapName;
    this.isMapModalOpen = true;
  }

}
