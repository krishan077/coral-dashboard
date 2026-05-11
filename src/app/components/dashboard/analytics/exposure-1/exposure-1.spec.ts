import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exposure1 } from './exposure-1';

describe('Exposure1', () => {
  let component: Exposure1;
  let fixture: ComponentFixture<Exposure1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exposure1],
    }).compileComponents();

    fixture = TestBed.createComponent(Exposure1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
