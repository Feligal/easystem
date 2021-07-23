import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WrittenExamsComponent } from './written-exams.component';

describe('WrittenExamsComponent', () => {
  let component: WrittenExamsComponent;
  let fixture: ComponentFixture<WrittenExamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WrittenExamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrittenExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
