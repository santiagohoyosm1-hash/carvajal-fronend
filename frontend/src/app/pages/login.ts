import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { mensajeLogin } from '../errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <section class="login">
      <h1>Iniciar sesión</h1>
      <p class="ayuda">Entra con tu cuenta de Wishlist. Las cuentas las crea el administrador.</p>

      @if (auth.aviso(); as aviso) {
        <p class="aviso-login" role="status">{{ aviso }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
        <label class="campo">
          <span>Usuario</span>
          <input type="text" formControlName="username" autocomplete="username" autocapitalize="none" />
          @if (form.controls.username.touched && form.controls.username.invalid) {
            <small class="error">Escribe tu usuario.</small>
          }
        </label>

        <label class="campo">
          <span>Contraseña</span>
          <input type="password" formControlName="password" autocomplete="current-password" />
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="error">Escribe tu contraseña.</small>
          }
        </label>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button type="submit" class="btn" [disabled]="enviando()">
          {{ enviando() ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  `,
})
export class LoginPage {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected async entrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    try {
      await this.auth.iniciarSesion(username, password);
      await this.router.navigate(['/productos']);
    } catch (e) {
      this.error.set(mensajeLogin(e));
    } finally {
      this.enviando.set(false);
    }
  }
}
