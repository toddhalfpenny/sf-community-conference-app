import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContestPage } from './contest.page';

describe('ContestPage', () => {
  let component: ContestPage;
  let fixture: ComponentFixture<ContestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
