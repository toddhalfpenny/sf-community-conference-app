import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SponsorPage } from './sponsor.page';

describe('SponsorPage', () => {
  let component: SponsorPage;
  let fixture: ComponentFixture<SponsorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
