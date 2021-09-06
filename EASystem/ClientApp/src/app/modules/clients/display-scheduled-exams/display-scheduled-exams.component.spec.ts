import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayScheduledExamsComponent } from './display-scheduled-exams.component';

describe('DisplayScheduledExamsComponent', () => {
  let component: DisplayScheduledExamsComponent;
  let fixture: ComponentFixture<DisplayScheduledExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayScheduledExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayScheduledExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
