import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonAlert } from '@ionic/angular/standalone';
import { Subscription, tap } from 'rxjs';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { AuthenticationService } from './authentication.service';

const LOG_TAG = 'authentication.page';

const DEFAULT_AUTH_ALERT_MESSAGE = 'There has been an issue. Please try again later.';
const DEFAULT_AUTH_ALERT_HEADER = 'Authentication Error';
const DEFAULT_AUTH_ALERT_BUTTONS = [
  {
    text: 'OK',
    role: 'cancel'
  },
];

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

  protected isAuthAlertOpen: boolean = false;
  protected authAlertButtons = DEFAULT_AUTH_ALERT_BUTTONS
  protected authAlertMessage = DEFAULT_AUTH_ALERT_MESSAGE;
  protected authAlertHeader = DEFAULT_AUTH_ALERT_HEADER;

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

  private resetCredsAlertMessage = 'If your email is registered, you will receive instructions to reset your password.';

  private verfEmailAlertButtons = [
    {
      text: 'OK',
      role: 'cancel',
      handler: () => {
        this.router.navigateByUrl('auth/login');
      }      
    },
  ];
  private verfEmailAlertMessage = 'There was an error sending the verification email. Please try again in a moment.';

  private notYetEmailVerfedAlertButtons = [
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
  private notYetEmailVerfedAlertMessage = 'Please verify your email before logging in. Check your inbox for the verification email.';


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
      if ((<any>error)?.message?.includes('email-not-verified')) {
        this.authAlertButtons = this.notYetEmailVerfedAlertButtons;
        this.authAlertMessage = this.notYetEmailVerfedAlertMessage;
        this.authAlertHeader = 'Email Not Verified';
        this.isAuthAlertOpen = true;
        return;
      }
      console.error(LOG_TAG, 'Login error:', error);

      this.authAlertMessage = 'Login failed. Please check your credentials and try again.';
      this.authAlertHeader = 'Login Failed';
      this.authAlertButtons = DEFAULT_AUTH_ALERT_BUTTONS;
      this.isAuthAlertOpen = true;
    }
  }

  logout() {
    this.activeSubscription = this.authenticationService
      .logout()
      .pipe(tap(() => this.router.navigateByUrl('home')))
      .subscribe();
  }
  
  async signup({ email, password }: UserCredentials) {
    try {
      const credentials = await this.authenticationService.signup(email, password as string);
      console.log(LOG_TAG, "signup", credentials);
      this.handleSignUpComplete();
    } catch (error) {
      console.error(LOG_TAG, 'Signup error:', error);
      this.authAlertHeader = 'Signup Failed';
      this.authAlertButtons = DEFAULT_AUTH_ALERT_BUTTONS;
      this.authAlertMessage = 'There was an error creating your account. Please try again in a moment.';
      if ((<any>error)?.message?.includes('email-already-in-use')) {
        this.authAlertMessage = 'This email is already in use. Please log in or use a different email to sign up. If this is your email and you forgot your password, please use the "Reset Password" option.';
        this.isAuthAlertOpen = true;
        return;
      }
      this.isAuthAlertOpen = true;
    }
  }
  
  async resetPassword({ email }: UserCredentials) {
    try {
      const res = await this.authenticationService.resetPassword(email);
      this.authAlertMessage = this.resetCredsAlertMessage;
      this.authAlertHeader = 'Reset Password';
      this.authAlertButtons = this.resetCredsAlertButtons;
      this.isAuthAlertOpen = true;
    } catch (error) {
      console.error(LOG_TAG, 'Login error:', error);
      this.authAlertHeader = 'Reset Password Failed';
      this.authAlertButtons = DEFAULT_AUTH_ALERT_BUTTONS;
      this.authAlertMessage = 'There was an issue resetting your password. Please try again.';
      this.isAuthAlertOpen = true;
    }
  }

  private handleSignUpComplete() {
    console.log(LOG_TAG, 'Sign up complete');
    this.authenticationService.verifyEmail().then(() => {
      this.authenticationService.logout();

      this.authAlertHeader = 'Verify your email';
      this.authAlertMessage = 'You have been sent a verification email. Please check your inbox and click the verification link before clicking OK here and then logging in. PLEASE CHECK YOUR SPAM FOLDER TOO.';
      this.authAlertButtons = this.verfEmailAlertButtons
      this.isAuthAlertOpen = true;
    }).catch((error) => {
      console.error(LOG_TAG, 'Email verification error:', error);
      this.authAlertHeader = DEFAULT_AUTH_ALERT_HEADER;
      this.authAlertButtons = DEFAULT_AUTH_ALERT_BUTTONS;
      this.authAlertMessage = this.verfEmailAlertMessage;
      this.isAuthAlertOpen = true;
    });
  }
}