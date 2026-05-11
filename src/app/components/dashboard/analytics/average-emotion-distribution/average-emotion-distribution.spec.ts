import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageEmotionDistribution } from './average-emotion-distribution';

describe('AverageEmotionDistribution', () => {
  let component: AverageEmotionDistribution;
  let fixture: ComponentFixture<AverageEmotionDistribution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AverageEmotionDistribution],
    }).compileComponents();

    fixture = TestBed.createComponent(AverageEmotionDistribution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
