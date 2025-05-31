import { Component } from '@angular/core';
import { UserProfileComponent } from "../../../shared/components/user-profile/user-profile.component";

@Component({
  selector: 'app-customer-profile',
  imports: [UserProfileComponent],
  template: `<app-user-profile [userRole]="'customer'"></app-user-profile>`,
  styles: ''
})
export class CustomerProfileComponent {

}
