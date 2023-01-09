import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleExamManyComponent } from './schedule-exam-many.component';

describe('ScheduleExamManyComponent', () => {
  let component: ScheduleExamManyComponent;
  let fixture: ComponentFixture<ScheduleExamManyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleExamManyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleExamManyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
