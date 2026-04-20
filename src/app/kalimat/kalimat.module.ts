import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KalimatPageRoutingModule } from './kalimat-routing.module';
import { KalimatPage } from './kalimat.page';

@NgModule({
  imports: [
    KalimatPage,
    CommonModule,
    FormsModule,
    IonicModule,
    KalimatPageRoutingModule
  ]
})
export class KalimatPageModule {}