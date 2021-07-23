import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleExamsListComponent } from './schedule-exams-list.component';

describe('ScheduleExamsListComponent', () => {
  let component: ScheduleExamsListComponent;
  let fixture: ComponentFixture<ScheduleExamsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleExamsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleExamsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
