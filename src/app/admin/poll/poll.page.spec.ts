import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PollPage } from './poll.page';

describe('PollPage', () => {
  let component: PollPage;
  let fixture: ComponentFixture<PollPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
