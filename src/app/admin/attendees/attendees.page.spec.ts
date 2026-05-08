import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendeesPage } from './attendees.page';

describe('AttendeesPage', () => {
  let component: AttendeesPage;
  let fixture: ComponentFixture<AttendeesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
