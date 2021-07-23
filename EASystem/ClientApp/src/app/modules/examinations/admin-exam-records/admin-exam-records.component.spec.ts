import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminExamRecordsComponent } from './admin-exam-records.component';

describe('AdminExamRecordsComponent', () => {
  let component: AdminExamRecordsComponent;
  let fixture: ComponentFixture<AdminExamRecordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminExamRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminExamRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
