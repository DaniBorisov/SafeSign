import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseRoadworkComponent } from './close-roadwork.component';

describe('CloseRoadworkComponent', () => {
  let component: CloseRoadworkComponent;
  let fixture: ComponentFixture<CloseRoadworkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CloseRoadworkComponent]
    });
    fixture = TestBed.createComponent(CloseRoadworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
