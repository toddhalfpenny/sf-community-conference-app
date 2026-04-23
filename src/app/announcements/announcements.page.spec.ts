import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnoucementsPage } from './announcements.page';

describe('AnnoucementsPage', () => {
  let component: AnnoucementsPage;
  let fixture: ComponentFixture<AnnoucementsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnoucementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
