import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonLoading, IonToolbar, IonFooter, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonTextarea, IonTitle } from '@ionic/angular/standalone';
import { close, cameraReverse } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NgxScannerQrcodeComponent, LOAD_WASM, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { Lead } from '../leads/lead.model';
import { LeadService } from '../leads/lead-service';

interface ScannerResult {
  i: any,
  f?: string
  l?: string
}

const DEVICE_SCAN_TOKEN = 'lastUsedScannerDeviceId';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgxScannerQrcodeComponent, IonBackButton, IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonLoading, IonToolbar, IonFooter, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonTextarea, IonTitle]
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
  protected isSavingLead: boolean = false;
  protected lead!: Lead;
  protected scanComplete: boolean = false;

  constructor(private alertController: AlertController) {
    addIcons({ cameraReverse, close });}

  ngOnDestroy(): void {
    // TODO UNSUBSCRIBE
  }

  ngOnInit() {
    LOAD_WASM().subscribe(res => {
      console.log('LOAD_WASM',res)
    });
  }
  
  ngAfterViewInit(): void {
    this.isSavingLead = false;
    if (!(<any>window).LOCAL_DEV) {
      this.scanner?.isReady.subscribe((res: any) => {
        // this.handle(this.action, 'start');
        console.log('Scanner is ready:', res);
        this.startScanner();
      });
    } else {
      // DUMMMY LEAD FOR LOCAL DEV
      console.log('Running in local dev mode, skipping scanner initialization');
      setTimeout(() => {        
        this.isLoading = false;
      }, 300);
      const dummyUser = { i: 9001, f: "Bob", l: "Smith"};
      this.lead = {
        id: 'tmp',
        user: {
          id: dummyUser.i,
          firstname: dummyUser.f,
          lastname: dummyUser.l
        }
      }
      this.inProgress = true;
      this.scanComplete = true;
    }
  }

  protected async cancel() {
    const alert = await this.alertController.create({
      header :'Cancel?',
      message :'Cancelling this lead collection will lose any unsaved data.',
      buttons :[
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
    ]});
    await alert.present();
  }

  protected handleScan(event: any, action: any) {
    console.log('Scanned QR Code:', event, action);
    // Here you can process the scanned data and add it to your leads list
    // this.leads.push({name: '', email: event[0].value});
    this.scanner.stop();
    this.inProgress = true;
    this.scanComplete = true;
    const ScannerResult = JSON.parse(event[0].value) as ScannerResult;
    this.lead = {
      id: 'tmp',
      user: {
        id: ScannerResult.i,
        firstname: ScannerResult.f ?? '',
        lastname: ScannerResult.l ?? ''
      }
    }
  }

  protected async save() {
    try {
      this.isSavingLead = true;
      const newLead  = await this.leadsService.newLead(this.lead);
      console.log('New lead saved:', newLead);
      setTimeout(() => {
        setTimeout(() => {
          this.router.navigate(['/leads']);
        }, 500);
        this.isSavingLead = false;
      }, 500);
    } catch (error) {
      console.error('Error saving lead:', error);
      this.isSavingLead = false;
      alert('Failed to save lead. Please try again.' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }


  async startScanner() {
    console.log('Starting scanner, fetching devices...');
    setTimeout(() => {
      this.scanner.devices.subscribe((devices) => {
        this.devices = devices;
        console.log('Available devices:', devices);
        if (this.devices.length === 0) {
          console.warn('No camera devices found.');
          this.isLoading = false;
          return;
        } else {
          this.devices = devices;
          const lastUsedDeviceId = localStorage.getItem(DEVICE_SCAN_TOKEN);
          if (lastUsedDeviceId) {
            console.log('Last used device ID found in localStorage:', lastUsedDeviceId);
            const lastUsedDevice = devices.find((device) => device.deviceId === lastUsedDeviceId);
            if (lastUsedDevice) {
              console.log('Playing last used device:', lastUsedDevice);
              this.scanner.playDevice(lastUsedDeviceId);
              this.currDeviceIdx = devices.indexOf(lastUsedDevice);
            }
          } else {
            this.scanner.playDevice(devices[devices.length - 1].deviceId);
            this.currDeviceIdx = devices.length - 1;
            localStorage.setItem(DEVICE_SCAN_TOKEN, this.devices[this.currDeviceIdx].deviceId);
          }
          this.isLoading = false;
          return;
        }
      });
      
    }, 200);
      // await this.scanner.stop();
      // await this.scanner.start();
      // this.isLoading = false;
      // return;
      
  }

  protected async toggleCamera() {
    this.currDeviceIdx++;
    if (this.currDeviceIdx >= this.devices.length) {
      this.currDeviceIdx = 0;
    } 
    console.log('Switching to device index:', this.currDeviceIdx, this.devices[this.currDeviceIdx]);
    localStorage.setItem(DEVICE_SCAN_TOKEN, this.devices[this.currDeviceIdx].deviceId);
    if (this.devices[this.currDeviceIdx].deviceId === '') {
      console.warn('Device ID is empty, cannot switch camera.');
      // LOAD_WASM().subscribe(res => {
      //   console.log('LOAD_WASM in toggleCamera',res)

          await this.scanner.start().subscribe((res: any) => {
            console.log('Scanner restarted after empty device ID:', res);

        console.log('Reloading scanner page to reset camera state');
        this.router.navigate(['/leads'], { replaceUrl: true});
          });
          // this.startScanner();
      // });
      return;
    } else {
      console.log('Playing device:', this.devices[this.currDeviceIdx]);
      this.scanner.playDevice(this.devices[this.currDeviceIdx].deviceId);
      return;
    }
  }


}
