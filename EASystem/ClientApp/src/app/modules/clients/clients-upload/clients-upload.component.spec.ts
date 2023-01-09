import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsUploadComponent } from './clients-upload.component';

describe('ClientsUploadComponent', () => {
  let component: ClientsUploadComponent;
  let fixture: ComponentFixture<ClientsUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientsUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
