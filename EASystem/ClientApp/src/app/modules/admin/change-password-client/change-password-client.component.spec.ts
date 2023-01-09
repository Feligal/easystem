import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordClientComponent } from './change-password-client.component';

describe('ChangePasswordClientComponent', () => {
  let component: ChangePasswordClientComponent;
  let fixture: ComponentFixture<ChangePasswordClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePasswordClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
