import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxScannerQrcodeComponent, LOAD_WASM, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { IonButton, IonButtons, IonContent, IonFooter, IonIcon, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { scanCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent,  IonIcon, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, NgxScannerQrcodeComponent]
})
export class LeadsPage implements OnInit {

  @ViewChild('action') scanner!: NgxScannerQrcodeComponent;
  private currDeviceIdx = 0;
  private devices: any[] = [];
  protected leads: any[] = [];

  constructor() {
    addIcons({ scanCircle });
   }

  ngOnInit() {
    LOAD_WASM().subscribe(res => {
      console.log('LOAD_WASM',res)
    });
  }

  ngAfterViewInit(): void {
    this.scanner.isReady.subscribe((res: any) => {
      // this.handle(this.action, 'start');
      console.log('Scanner is ready:', res);
    });
  }
  protected addLead() {
  }

  protected handleScan(event: any, action: any) {
    console.log('Scanned QR Code:', event, action);
    // Here you can process the scanned data and add it to your leads list
    this.leads.push({name: '', email: event[0].value});
    this.scanner.stop();
  }

  protected async startScanner() {
    this.scanner.devices.subscribe((devices) => {
      this.devices = devices;
      console.log('Available devices:', devices);
      if (devices.length > 1) {
        this.scanner.playDevice(devices[2].deviceId);
        this.currDeviceIdx = 2;
      }
    });
    await this.scanner.stop();
    await this.scanner.start();
    return;
  }

  protected toggleCamera() {
    this.currDeviceIdx++;
    if (this.currDeviceIdx >= this.devices.length) {
      this.currDeviceIdx = 0;
    } 
    console.log('Switching to device index:', this.currDeviceIdx, this.devices[this.currDeviceIdx]);
    this.scanner.playDevice(this.devices[this.currDeviceIdx].deviceId);
  }

}
