import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerRetention } from './viewer-retention';

describe('ViewerRetention', () => {
  let component: ViewerRetention;
  let fixture: ComponentFixture<ViewerRetention>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerRetention],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewerRetention);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
