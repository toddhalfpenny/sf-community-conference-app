import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthenticationService } from '../authentication/authentication.service';
import { Subscription } from 'rxjs';
import { SponsorListComponent } from '../sponsors/sponsor-list/sponsor-list.component';
import { UserService } from '../user/user-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    RouterLink,
    CommonModule,
    FormsModule,
    SponsorListComponent
]
})
export class HomePage implements OnDestroy {

  private readonly authenticationService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private authubscription?: Subscription;

  protected user: any;

  constructor() { }

  ngOnInit() {
    this.authubscription = this.authenticationService.getUser().subscribe(user => {
      this.user = user;
    });
    // const eventUser = this.userService.getUser();
    // console.log('Event user from UserService:', eventUser);
  }

  ngOnDestroy(): void {
    this.authubscription?.unsubscribe();
  }

}
