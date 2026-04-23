import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage {

  // ─── Step 1: Cek email ────────────────────────────────────────
  email = '';
  emailError = '';

  // ─── Step 2: Buat password baru ───────────────────────────────
  newPassword = '';
  confirmPassword = '';
  newPasswordError = '';
  confirmPasswordError = '';
  showNewPassword = false;
  showConfirmPassword = false;

  // ─── State ────────────────────────────────────────────────────
  currentStep: 'email' | 'reset' | 'success' = 'email';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {}

  // ─── Step 1: Validasi email terdaftar ─────────────────────────
  onEmailChange() {
    this.emailError = this.authService.validateEmail(this.email) ?? '';
  }

  async checkEmail() {
    this.emailError = '';
    const emailErr = this.authService.validateEmail(this.email);
    if (emailErr) { this.emailError = emailErr; return; }

    this.isLoading = true;
    // Simulasi delay network
    await new Promise(r => setTimeout(r, 800));

    const exists = this.authService.isEmailRegistered(this.email);
    this.isLoading = false;

    if (!exists) {
      this.emailError = 'Email ini belum terdaftar. Periksa kembali.';
      return;
    }

    this.currentStep = 'reset';
  }

  // ─── Step 2: Reset password ───────────────────────────────────
  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onNewPasswordChange() {
    this.newPasswordError = this.authService.validatePassword(this.newPassword) ?? '';
    if (this.confirmPassword) {
      this.confirmPasswordError = this.newPassword !== this.confirmPassword
        ? 'Password tidak cocok.' : '';
    }
  }

  onConfirmPasswordChange() {
    this.confirmPasswordError = this.newPassword !== this.confirmPassword
      ? 'Password tidak cocok.' : '';
  }

  async resetPassword() {
    this.newPasswordError = '';
    this.confirmPasswordError = '';

    const pwErr = this.authService.validatePassword(this.newPassword);
    if (pwErr) { this.newPasswordError = pwErr; return; }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmPasswordError = 'Password tidak cocok.';
      return;
    }

    this.isLoading = true;
    await new Promise(r => setTimeout(r, 800));

    const result = this.authService.resetPassword(this.email, this.newPassword);
    this.isLoading = false;

    if (result.success) {
      this.currentStep = 'success';
    } else {
      await this.showToast(result.message, 'danger');
    }
  }

  // ─── Navigasi ─────────────────────────────────────────────────
  goToLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goBack() {
    if (this.currentStep === 'reset') {
      this.currentStep = 'email';
    } else {
      this.router.navigate(['/login']);
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }
}