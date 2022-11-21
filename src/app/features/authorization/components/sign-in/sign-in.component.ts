
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordPattern, PasswordRulesStartValue, RouterLinks } from '../../../../app.config';
import { PASSWORD_VALIDATION_RULES } from '../../../../core/models/authorization.models';
import { Observable, take,  tap } from 'rxjs';
import { validatePassword } from '../../../../shared/utils';
import { AuthorizationService } from '../../authorization.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../../shared/components/modals/info-dialog/info-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: [
    './sign-in.component.scss',
    '../../container/authorization.component.scss'
  ],
})
export class SignInComponent implements OnInit {

  signInForm!: FormGroup;
  passwordTitle: string = 'Password';
  isPasswordRulesValid: PASSWORD_VALIDATION_RULES = PasswordRulesStartValue;

  passwordSubscription$!: Observable<string>;

  constructor(
    private fb: FormBuilder,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  get email(): FormControl {
    return this.signInForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.signInForm.get('password') as FormControl;
  }

   get isPasswordTouched(): boolean {
    return this.password.touched;
  }

  get isEmailInvalid(): boolean {
    return this.email.touched && this.email.invalid;
  }

  get isFormValid(): boolean {
    const isAllControlTouched = this.isPasswordTouched  && this.email.touched
    return !this.signInForm.valid && isAllControlTouched;
  }

  get isPasswordValid(): boolean {
    return this.password.valid;
  }

  get isResetPasswordPage(): boolean {
    return this.router.url.includes(RouterLinks.resetPass);
  }

  ngOnInit(): void {
    this.initForm();
    this.signInForm.valueChanges.subscribe(value => console.log(value))
    this.checkPassword();
  }

  signIn(): void {
    if (this.signInForm.valid) {
      const requestBody = {...this.signInForm.value};
      this.authorizationService.signIn(requestBody).pipe(
        take(1),
      ).subscribe(() => this.confirmModalCall());
    } else {
      this.signInForm.markAllAsTouched();
    }
  }

  private checkPassword(): void {
    this.passwordSubscription$ = this.password.valueChanges.pipe(
      tap(value => this.isPasswordRulesValid = validatePassword(value)),
    );
  }

  private confirmModalCall(): void {
    this.dialog.open(InfoDialogComponent, {
      hasBackdrop: false,
      data: {
        content: 'We successfully received your data and sent data for confirmation',
        description: 'Please go to your email to confirm the account',
        type: 'SUCCESS'
      }
    }).afterClosed().pipe(
      take(1),
      tap(() => this.router.navigate([ RouterLinks.confirmRegistration ]))
    ).subscribe()
  }

  private initForm(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.pattern(passwordPattern)
      ]]
    })
  }

}
