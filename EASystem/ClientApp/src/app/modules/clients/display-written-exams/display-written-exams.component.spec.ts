import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayWrittenExamsComponent } from './display-written-exams.component';

describe('DisplayWrittenExamsComponent', () => {
  let component: DisplayWrittenExamsComponent;
  let fixture: ComponentFixture<DisplayWrittenExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayWrittenExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayWrittenExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
