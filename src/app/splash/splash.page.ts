import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit {

  showContent = false;
  animateLogo = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Trigger animasi logo
    setTimeout(() => { this.showContent = true; }, 100);
    setTimeout(() => { this.animateLogo = true; }, 300);

    // Setelah 2.8 detik, cek session lalu redirect
    setTimeout(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    }, 2800);
  }
}