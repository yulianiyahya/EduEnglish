import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  userName: string = 'Pengguna';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUserName();
  }

  // Dipanggil setiap kali halaman ditampilkan (termasuk balik dari profil)
  ionViewWillEnter() {
    this.loadUserName();
  }

  private loadUserName() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = savedName;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}