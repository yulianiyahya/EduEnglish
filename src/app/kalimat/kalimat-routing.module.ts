import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KalimatPage } from './kalimat.page';

const routes: Routes = [
  { path: '', component: KalimatPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KalimatPageRoutingModule {}