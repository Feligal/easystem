import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBulkyEmailComponent } from './send-bulky-email.component';

describe('SendBulkyEmailComponent', () => {
  let component: SendBulkyEmailComponent;
  let fixture: ComponentFixture<SendBulkyEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendBulkyEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendBulkyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
