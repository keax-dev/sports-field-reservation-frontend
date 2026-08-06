import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AuthSession } from '../../../../core/auth/auth-session';
import { NotificationStore } from '../../../../core/notifications/notification-store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { getApiErrorMessage, getValidationErrors } from '../../../../shared/utils/http-error.utils';
import { AuthApi } from '../../data-access/auth-api';

@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  private readonly notifications = inject(NotificationStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly validationErrors = signal<Record<string, string>>({});

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required]],
    tokenName: ['frontend-web'],
  });

  submit(): void {
    this.submitted.set(true);
    this.serverError.set(null);
    this.validationErrors.set({});

    if (this.form.invalid || this.passwordsDoNotMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.authApi
      .register({
        name: this.form.controls.name.getRawValue(),
        email: this.form.controls.email.getRawValue(),
        password: this.form.controls.password.getRawValue(),
        password_confirmation: this.form.controls.passwordConfirmation.getRawValue(),
        token_name: this.form.controls.tokenName.getRawValue(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (session) => {
          this.authSession.setSession(session);
          this.notifications.show({
            tone: 'success',
            title: 'Your account was created.',
            description: 'You are now signed in.',
          });
          void this.router.navigate(['/reservations']);
        },
        error: (error: unknown) => {
          this.serverError.set(getApiErrorMessage(error, 'We could not create the account.'));
          this.validationErrors.set(getValidationErrors(error));
        },
      });
  }

  fieldError(fieldName: 'name' | 'email' | 'password' | 'passwordConfirmation'): string | null {
    const serverFieldMap: Record<string, string> = {
      passwordConfirmation: 'password',
    };
    const serverError = this.validationErrors()[serverFieldMap[fieldName] ?? fieldName];

    if (serverError) {
      return serverError;
    }

    if (fieldName === 'passwordConfirmation' && this.passwordsDoNotMatch() && this.submitted()) {
      return 'Passwords must match.';
    }

    const control = this.form.controls[fieldName];

    if (!(control.touched || this.submitted())) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    if (control.hasError('minlength')) {
      return 'The password must have at least 8 characters.';
    }

    if (control.hasError('maxlength')) {
      return 'The maximum length is 255 characters.';
    }

    return null;
  }

  private passwordsDoNotMatch(): boolean {
    return (
      this.form.controls.password.getRawValue() !==
      this.form.controls.passwordConfirmation.getRawValue()
    );
  }
}
