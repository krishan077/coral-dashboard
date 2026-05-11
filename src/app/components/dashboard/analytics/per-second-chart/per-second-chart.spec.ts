import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerSecondChart } from './per-second-chart';

describe('PerSecondChart', () => {
  let component: PerSecondChart;
  let fixture: ComponentFixture<PerSecondChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerSecondChart],
    }).compileComponents();

    fixture = TestBed.createComponent(PerSecondChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
