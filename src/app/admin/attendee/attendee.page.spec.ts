import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendeePage } from './attendee.page';

describe('AttendeePage', () => {
  let component: AttendeePage;
  let fixture: ComponentFixture<AttendeePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
