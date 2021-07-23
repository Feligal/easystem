import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClientUserComponent } from './create-client-user.component';

describe('CreateClientUserComponent', () => {
  let component: CreateClientUserComponent;
  let fixture: ComponentFixture<CreateClientUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateClientUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClientUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
