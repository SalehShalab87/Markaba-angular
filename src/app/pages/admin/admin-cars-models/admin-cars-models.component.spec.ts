import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCarsModelsComponent } from './admin-cars-models.component';

describe('AdminCarsModelsComponent', () => {
  let component: AdminCarsModelsComponent;
  let fixture: ComponentFixture<AdminCarsModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCarsModelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCarsModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
