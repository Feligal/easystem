import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayExamsComponent } from './display-exams.component';

describe('DisplayExamsComponent', () => {
  let component: DisplayExamsComponent;
  let fixture: ComponentFixture<DisplayExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
