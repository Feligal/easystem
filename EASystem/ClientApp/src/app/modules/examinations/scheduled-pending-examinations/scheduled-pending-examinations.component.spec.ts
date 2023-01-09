import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledPendingExaminationsComponent } from './scheduled-pending-examinations.component';

describe('ScheduledPendingExaminationsComponent', () => {
  let component: ScheduledPendingExaminationsComponent;
  let fixture: ComponentFixture<ScheduledPendingExaminationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledPendingExaminationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledPendingExaminationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
