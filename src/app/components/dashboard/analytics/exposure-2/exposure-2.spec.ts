import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exposure2 } from './exposure-2';

describe('Exposure2', () => {
  let component: Exposure2;
  let fixture: ComponentFixture<Exposure2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exposure2],
    }).compileComponents();

    fixture = TestBed.createComponent(Exposure2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
