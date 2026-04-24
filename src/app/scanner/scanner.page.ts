import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonLoading, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NgxScannerQrcodeComponent, LOAD_WASM, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { Lead } from '../leads/lead.model';
import { LeadService } from '../leads/lead-service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgxScannerQrcodeComponent, IonBackButton, IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonLoading, IonToolbar, IonFooter]
})
export class ScannerPage implements OnDestroy{

  @ViewChild('action') scanner!: NgxScannerQrcodeComponent;

  private readonly leadsService = inject(LeadService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private currDeviceIdx = 0;
  private devices: any[] = [];
  
  protected isLoading: boolean = true;
  protected inProgress:boolean = false;
  protected lead!: Lead;
  protected scanComplete: boolean = false;

  constructor() {
    addIcons({ close });}

  ngOnDestroy(): void {
    // TODO UNSUBSCRIBE
  }

  ngOnInit() {
    LOAD_WASM().subscribe(res => {
      console.log('LOAD_WASM',res)
    });
  }
  
  ngAfterViewInit(): void {
    this.scanner?.isReady.subscribe((res: any) => {
      // this.handle(this.action, 'start');
      console.log('Scanner is ready:', res);
      this.startScanner();
    });
  }

  protected async cancel() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Cancel?';
    alert.message = 'Cancelling this lead collection will lose any unsaved data.';
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

  protected handleScan(event: any, action: any) {
    console.log('Scanned QR Code:', event, action);
    // Here you can process the scanned data and add it to your leads list
    // this.leads.push({name: '', email: event[0].value});
    this.scanner.stop();
    this.inProgress = true;
    this.scanComplete = true;
    this.lead = JSON.parse(event[0].value) as Lead;
  }

  protected async save() {
    // TODO save and navigate to leads page
    const newLead  = await this.leadsService.newLead(this.lead);
    console.log('New lead saved:', newLead);
    this.router.navigate(['/leads']);
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
    // await this.scanner.stop();
    await this.scanner.start();
    this.isLoading = false;
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
