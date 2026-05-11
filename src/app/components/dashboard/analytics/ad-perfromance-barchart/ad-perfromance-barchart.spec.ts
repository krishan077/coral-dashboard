import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdPerfromanceBarchart } from './ad-perfromance-barchart';

describe('AdPerfromanceBarchart', () => {
  let component: AdPerfromanceBarchart;
  let fixture: ComponentFixture<AdPerfromanceBarchart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdPerfromanceBarchart],
    }).compileComponents();

    fixture = TestBed.createComponent(AdPerfromanceBarchart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
