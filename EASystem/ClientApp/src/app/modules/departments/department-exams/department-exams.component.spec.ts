import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentExamsComponent } from './department-exams.component';

describe('DepartmentExamsComponent', () => {
  let component: DepartmentExamsComponent;
  let fixture: ComponentFixture<DepartmentExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
