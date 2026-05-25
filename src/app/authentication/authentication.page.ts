import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonAlert } from '@ionic/angular/standalone';
import { Subscription, tap } from 'rxjs';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { AuthenticationService } from './authentication.service';

const LOG_TAG = 'authentication.page';

export interface UserCredentials {
  email: string;
  password?: string;
}

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    AuthFormComponent,
    RouterLink,
    IonAlert
],
})
export class AuthenticationPage implements OnDestroy {
  /**
   * We're injecting the router to get the current URL
   */
  private readonly router = inject(Router);

  private readonly authenticationService = inject(AuthenticationService);


  /**
   * From the current URL, we're getting the last part
   * of the URL to determine the current page.
   */
  readonly currentPage = this.router.url.split('/')[
    this.router.url.split('/').length - 1
  ] as 'login' | 'logout' | 'signup' | 'reset' | 'verify';

 /**
   * This object holds the configuration for the authentication page.
   * It has the page title and action button text for each page.
   * That way we don't need switch case or if/else to determine this values
   */
  readonly AUTH_PAGE_CONFIG = {
    login: {
      pageTitle: 'Sign In',
      actionButtonText: 'Sign In',
    },
    logout: {
      pageTitle: 'Log out?',
      actionButtonText: 'Log out',
    },
    signup: {
      pageTitle: 'Create your account',
      actionButtonText: 'Create Account',
    },
    reset: {
      pageTitle: 'Reset your password',
      actionButtonText: 'Reset Password',
    },
    verify: {
      pageTitle: 'Verify your email',
      actionButtonText: 'Verify email',
    },
  };

  /**
   * Here we assign the page title and button text based
   * on our configuration object.
   */
  readonly pageTitle = this.AUTH_PAGE_CONFIG[this.currentPage].pageTitle;
  readonly actionButtonText =
    this.AUTH_PAGE_CONFIG[this.currentPage].actionButtonText;

  private activeSubscription?: Subscription;

  protected isFailedLoginAlertOpen: boolean = false;
  protected failedLoginAlertButtons = [
    {
      text: 'OK',
      role: 'cancel'
    },
  ];
  protected failedLoginAlertMessage = 'Login failed. Please check your credentials and try again.';

  protected isResetCredsAlertOpen: boolean = false;
  protected resetCredsAlertButtons = [
    {
      text: 'OK',
      role: 'cancel',
      handler: () => {
        this.router.navigateByUrl('auth/login');
      }      
    },
  ];
  protected resetCredsAlertMessage = 'If your email is registered, you will receive instructions to reset your password.';
  
  protected isVerfEmailAlertOpen: boolean = false;
  protected verfEmailAlertButtons = [
    {
      text: 'OK',
      role: 'cancel',
      handler: () => {
        this.router.navigateByUrl('auth/login');
      }      
    },
  ];
  protected verfEmailAlertMessage = 'There was an error sending the verification email. Please try again in a moment.';

  protected isNotYetEmailVerfedAlertOpen: boolean = false;
  protected notYetEmailVerfedAlertButtons = [
    {
      text: 'OK',
      role: 'cancel',
      handler: () => {
        this.authenticationService.logout();
        this.router.navigateByUrl('auth/login');
      }      
    },
    {
      text: 'Resend verification email',
      role: 'confirm',
      handler: () => {
        console.log(LOG_TAG, 'Resending verification email');
        this.handleSignUpComplete();
      }      
    },
  ];
  protected notYetEmailVerfedAlertMessage = 'Please verify your email before logging in. Check your inbox for the verification email.';


  ngOnDestroy(): void {
    this.activeSubscription?.unsubscribe();
  }

  handleLogout() {
  
  }

  /**
  * This method gets the form value from the authentication component,
  * then it calls the respective method.
  */
  handleUserCredentials(userCredentials: UserCredentials) {
    switch (this.currentPage) {
      case 'login':
        this.login(userCredentials);
        break;
      case 'signup':
        this.signup(userCredentials);
        break;
      case 'reset':
        this.resetPassword(userCredentials);
        break;
    }
  }

  async login({ email, password }: UserCredentials) {
    try {
      const res = await this.authenticationService.login(email, password as string);
      this.router.navigateByUrl('');
    } catch (error) {
      this.failedLoginAlertMessage = 'Login failed. Please check your credentials and try again.';
      if ((<any>error)?.message?.includes('email-not-verified')) {
        this.isNotYetEmailVerfedAlertOpen = true;
        return;
      }

      console.error(LOG_TAG, 'Login error:', error);
      this.isFailedLoginAlertOpen = true;
    }
  }

  logout() {
    this.activeSubscription = this.authenticationService
      .logout()
      .pipe(tap(() => this.router.navigateByUrl('home')))
      .subscribe();
  }
  
  signup({ email, password }: UserCredentials) {
    this.activeSubscription = this.authenticationService
      .signup(email, password as string)
      // .pipe(tap(() => this.router.navigateByUrl('')))
      .pipe(tap(() => this.handleSignUpComplete()))
      .subscribe();
  }
  
  async resetPassword({ email }: UserCredentials) {
    try {
      const res = await this.authenticationService.resetPassword(email);
      this.resetCredsAlertMessage = 'If your email is registered, you will receive instructions to reset your password.';
      this.isResetCredsAlertOpen = true;
    } catch (error) {
      console.error(LOG_TAG, 'Login error:', error);
      this.resetCredsAlertMessage = 'There was an issue resetting your password. Please try again.';
      this.isResetCredsAlertOpen = true;
    }
  }

  private handleSignUpComplete() {
    console.log(LOG_TAG, 'Sign up complete');
    this.authenticationService.verifyEmail().then(() => {
      this.authenticationService.logout();
      this.verfEmailAlertMessage = 'You have been sent a verification email. Please check your inbox and click the verification link before clicking OK here and then logging in. PLEASE CHECK YOUR SPAM FOLDER TOO.';
      this.isVerfEmailAlertOpen = true;
    }).catch((error) => {
      console.error(LOG_TAG, 'Email verification error:', error);
      this.verfEmailAlertMessage = 'There was an error sending the verification email. Please try again in a moment.';
      this.isVerfEmailAlertOpen = true;
    });
  }
}