import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsListingComponent } from './cars-listing.component';

describe('CarsListingComponent', () => {
  let component: CarsListingComponent;
  let fixture: ComponentFixture<CarsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
