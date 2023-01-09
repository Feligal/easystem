import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClientUploadsComponent } from './admin-client-uploads.component';

describe('AdminClientUploadsComponent', () => {
  let component: AdminClientUploadsComponent;
  let fixture: ComponentFixture<AdminClientUploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminClientUploadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminClientUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
