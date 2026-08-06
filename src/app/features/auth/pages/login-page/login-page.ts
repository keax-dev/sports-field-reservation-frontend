import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  selector: 'app-login-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  private readonly notifications = inject(NotificationStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly validationErrors = signal<Record<string, string>>({});

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    tokenName: ['frontend-web'],
  });

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.serverError.set(null);
    this.validationErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    try {
      const session = await firstValueFrom(
        this.authApi.login({
          email: this.form.controls.email.getRawValue(),
          password: this.form.controls.password.getRawValue(),
          token_name: this.form.controls.tokenName.getRawValue(),
        }),
      );

      this.authSession.setSession(session);
      this.notifications.show({
        tone: 'success',
        title: 'Welcome back.',
        description: 'Your session is ready.',
      });

      const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/reservations';
      await this.router.navigateByUrl(redirect);
    } catch (error: unknown) {
      this.serverError.set(getApiErrorMessage(error, 'We could not sign you in.'));
      this.validationErrors.set(getValidationErrors(error));
    } finally {
      this.submitting.set(false);
    }
  }

  fieldError(fieldName: 'email' | 'password'): string | null {
    const serverError = this.validationErrors()[fieldName];

    if (serverError) {
      return serverError;
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

    return null;
  }
}
