import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), provideFirebaseApp(() => initializeApp({ projectId: "londonscalling", appId: "1:363827905463:web:f0ee89d70cf6d07491de32", storageBucket: "londonscalling.firebasestorage.app", apiKey: "AIzaSyDkKbJ2rwaK5RMqSk7xTQRQWNofuEa5BMw", authDomain: "londonscalling.firebaseapp.com", messagingSenderId: "363827905463"})), 
    provideAuth(() => getAuth()),
    // provideAuth(() => {
    //   if (Capacitor.isNativePlatform()) {
    //     return initializeAuth(getApp(), {
    //       persistence: indexedDBLocalPersistence,
    //     });
    //   } else {
    //     return getAuth();
    //   }
    // }),
    provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore()), provideFunctions(() => getFunctions()),
  ],
});
