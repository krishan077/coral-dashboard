import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPerfromanceBarchart } from './group-perfromance-barchart';

describe('GroupPerfromanceBarchart', () => {
  let component: GroupPerfromanceBarchart;
  let fixture: ComponentFixture<GroupPerfromanceBarchart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupPerfromanceBarchart],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupPerfromanceBarchart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
