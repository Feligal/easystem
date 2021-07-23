import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveExamComponent } from './active-exam.component';

describe('ActiveExamComponent', () => {
  let component: ActiveExamComponent;
  let fixture: ComponentFixture<ActiveExamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveExamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
