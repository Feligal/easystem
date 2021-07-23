import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemlogsComponent } from './systemlogs.component';

describe('SystemlogsComponent', () => {
  let component: SystemlogsComponent;
  let fixture: ComponentFixture<SystemlogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemlogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
