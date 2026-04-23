import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  emailError = '';
  passwordError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    // DEBUG: Lihat semua user yang tersimpan saat halaman login dibuka
    console.log('=== [LoginPage] ngOnInit ===');
    this.authService.debugListUsers();

    const isLoggedIn = this.authService.isLoggedIn();
    console.log('[LoginPage] isLoggedIn:', isLoggedIn);

    if (isLoggedIn) {
      console.log('[LoginPage] Session aktif → redirect ke dashboard');
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onEmailChange() {
    this.emailError = this.authService.validateEmail(this.email) ?? '';
  }

  onPasswordChange() {
    this.passwordError = this.authService.validatePassword(this.password) ?? '';
  }

  async login() {
    this.emailError = '';
    this.passwordError = '';

    const emailErr = this.authService.validateEmail(this.email);
    const passwordErr = this.authService.validatePassword(this.password);

    if (emailErr) {
      this.emailError = emailErr;
      return;
    }
    if (passwordErr) {
      this.passwordError = passwordErr;
      return;
    }

    // DEBUG: Cek kondisi storage & hash sebelum login
    console.log('=== [LoginPage] Attempting login ===');
    console.log('[LoginPage] Email input:', this.email);
    this.authService.debugListUsers();
    this.authService.debugCheckLogin(this.email, this.password);

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Memverifikasi...',
      duration: 1500,
      spinner: 'crescent',
      cssClass: 'custom-loading',
    });
    await loading.present();

    await new Promise((r) => setTimeout(r, 800));

    const result = this.authService.login(this.email, this.password);
    console.log('[LoginPage] Login result:', result);

    await loading.dismiss();
    this.isLoading = false;

    if (result.success) {
      await this.showToast(result.message, 'success');
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } else {
      await this.showToast(result.message, 'danger');
      if (result.message.includes('Email')) {
        this.emailError = result.message;
      } else {
        this.passwordError = result.message;
      }
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      cssClass: 'custom-toast',
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }
}