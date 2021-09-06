import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportClientErrorComponent } from './import-client-error.component';

describe('ImportClientErrorComponent', () => {
  let component: ImportClientErrorComponent;
  let fixture: ComponentFixture<ImportClientErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportClientErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportClientErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
