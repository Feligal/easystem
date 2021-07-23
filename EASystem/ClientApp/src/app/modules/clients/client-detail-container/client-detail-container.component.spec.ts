import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailContainerComponent } from './client-detail-container.component';

describe('ClientDetailContainerComponent', () => {
  let component: ClientDetailContainerComponent;
  let fixture: ComponentFixture<ClientDetailContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientDetailContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDetailContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
