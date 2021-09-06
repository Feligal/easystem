import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReviewComponent } from './exam-review.component';

describe('ExamReviewComponent', () => {
  let component: ExamReviewComponent;
  let fixture: ComponentFixture<ExamReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
