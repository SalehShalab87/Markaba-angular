import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyRequestModalComponent } from './buy-request-modal.component';

describe('BuyRequestModalComponent', () => {
  let component: BuyRequestModalComponent;
  let fixture: ComponentFixture<BuyRequestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyRequestModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
