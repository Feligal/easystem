import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableTwofactorComponent } from './enable-twofactor.component';

describe('EnableTwofactorComponent', () => {
  let component: EnableTwofactorComponent;
  let fixture: ComponentFixture<EnableTwofactorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnableTwofactorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableTwofactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
