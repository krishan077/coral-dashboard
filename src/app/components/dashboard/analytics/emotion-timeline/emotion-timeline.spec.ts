import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmotionTimeline } from './emotion-timeline';

describe('EmotionTimeline', () => {
  let component: EmotionTimeline;
  let fixture: ComponentFixture<EmotionTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmotionTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(EmotionTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
