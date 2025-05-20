import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRequestsComponent } from './client-requests.component';

describe('ClientRequestsComponent', () => {
  let component: ClientRequestsComponent;
  let fixture: ComponentFixture<ClientRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
