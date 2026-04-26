import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeadPage } from './lead.page';

describe('LeadPage', () => {
  let component: LeadPage;
  let fixture: ComponentFixture<LeadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
