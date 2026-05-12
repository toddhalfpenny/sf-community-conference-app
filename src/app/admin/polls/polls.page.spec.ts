import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PollsPage } from './polls.page';

describe('PollsPage', () => {
  let component: PollsPage;
  let fixture: ComponentFixture<PollsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PollsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
