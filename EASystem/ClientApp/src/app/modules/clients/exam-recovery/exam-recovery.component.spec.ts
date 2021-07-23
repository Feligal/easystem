import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamRecoveryComponent } from './exam-recovery.component';

describe('ExamRecoveryComponent', () => {
  let component: ExamRecoveryComponent;
  let fixture: ComponentFixture<ExamRecoveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamRecoveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
