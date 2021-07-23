import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportQuestionsComponent } from './import-questions.component';

describe('ImportQuestionsComponent', () => {
  let component: ImportQuestionsComponent;
  let fixture: ComponentFixture<ImportQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
