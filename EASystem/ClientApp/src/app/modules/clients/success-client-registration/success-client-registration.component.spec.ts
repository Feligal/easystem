import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessClientRegistrationComponent } from './success-client-registration.component';

describe('SuccessClientRegistrationComponent', () => {
  let component: SuccessClientRegistrationComponent;
  let fixture: ComponentFixture<SuccessClientRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessClientRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessClientRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
