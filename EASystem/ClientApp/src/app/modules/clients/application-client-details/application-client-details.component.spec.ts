import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationClientDetailsComponent } from './application-client-details.component';

describe('ApplicationClientDetailsComponent', () => {
  let component: ApplicationClientDetailsComponent;
  let fixture: ComponentFixture<ApplicationClientDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationClientDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationClientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
