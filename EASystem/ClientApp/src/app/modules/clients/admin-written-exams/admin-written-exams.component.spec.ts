import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWrittenExamsComponent } from './admin-written-exams.component';

describe('AdminWrittenExamsComponent', () => {
  let component: AdminWrittenExamsComponent;
  let fixture: ComponentFixture<AdminWrittenExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminWrittenExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWrittenExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
