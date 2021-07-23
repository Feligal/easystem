import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledExamsComponent } from './scheduled-exams.component';

describe('ScheduledExamsComponent', () => {
  let component: ScheduledExamsComponent;
  let fixture: ComponentFixture<ScheduledExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
