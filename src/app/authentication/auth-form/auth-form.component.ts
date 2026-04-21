import { Component, input, output, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IonInput, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonButton, IonInput],
})
export class AuthFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  public actionButtonText = input<string>('Sign In');
  public isPasswordResetPage = input<boolean>(false);
  public formSubmitted = output<any>();

  protected readonly authForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
    password: [
      '',
      Validators.compose([
        !this.isPasswordResetPage ? Validators.required : null,
        Validators.minLength(6),
      ]),
    ],
  });

  protected submitCredentials(authForm: FormGroup): void {
    if (!authForm.valid) {
      console.log('Form is not valid yet, current value:', authForm.value);
    } else {
      const credentials = {
        email: authForm.value.email,
        password: authForm.value.password,
      };
      this.formSubmitted.emit(credentials);
    }
  }

}
