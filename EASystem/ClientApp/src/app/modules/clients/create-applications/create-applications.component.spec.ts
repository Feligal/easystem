import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateApplicationsComponent } from './create-applications.component';

describe('CreateApplicationsComponent', () => {
  let component: CreateApplicationsComponent;
  let fixture: ComponentFixture<CreateApplicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateApplicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
