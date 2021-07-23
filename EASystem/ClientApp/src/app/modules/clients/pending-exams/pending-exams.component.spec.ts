import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingExamsComponent } from './pending-exams.component';

describe('PendingExamsComponent', () => {
  let component: PendingExamsComponent;
  let fixture: ComponentFixture<PendingExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
