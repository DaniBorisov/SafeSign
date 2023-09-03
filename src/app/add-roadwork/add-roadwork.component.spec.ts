import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoadworkComponent } from './add-roadwork.component';

describe('AddRoadworkComponent', () => {
  let component: AddRoadworkComponent;
  let fixture: ComponentFixture<AddRoadworkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddRoadworkComponent]
    });
    fixture = TestBed.createComponent(AddRoadworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
