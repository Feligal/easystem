import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientUsersComponent } from './client-users.component';

describe('ClientUsersComponent', () => {
  let component: ClientUsersComponent;
  let fixture: ComponentFixture<ClientUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
