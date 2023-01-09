import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegiterClientComponent } from './regiter-client.component';

describe('RegiterClientComponent', () => {
  let component: RegiterClientComponent;
  let fixture: ComponentFixture<RegiterClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegiterClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegiterClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
