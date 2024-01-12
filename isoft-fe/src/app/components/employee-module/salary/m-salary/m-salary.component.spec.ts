import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MSalaryComponent } from './m-salary.component';

describe('MSalaryComponent', () => {
  let component: MSalaryComponent;
  let fixture: ComponentFixture<MSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MSalaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
