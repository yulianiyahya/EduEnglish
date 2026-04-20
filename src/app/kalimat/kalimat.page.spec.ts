import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KalimatPage } from './kalimat.page';

describe('KalimatPage', () => {
  let component: KalimatPage;
  let fixture: ComponentFixture<KalimatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KalimatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
