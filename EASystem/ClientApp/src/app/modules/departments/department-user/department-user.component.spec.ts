import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentUserComponent } from './department-user.component';

describe('DepartmentUserComponent', () => {
  let component: DepartmentUserComponent;
  let fixture: ComponentFixture<DepartmentUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
