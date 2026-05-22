import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementPage } from './announcement.page';

describe('AnnouncementPage', () => {
  let component: AnnouncementPage;
  let fixture: ComponentFixture<AnnouncementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
