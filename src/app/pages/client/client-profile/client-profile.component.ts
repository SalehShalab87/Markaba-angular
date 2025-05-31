import { Component } from '@angular/core';
import { UserProfileComponent } from "../../../shared/components/user-profile/user-profile.component";

@Component({
  selector: 'app-client-profile',
  imports: [UserProfileComponent],
  template: `<app-user-profile [userRole]="'client'"></app-user-profile>`,
  styles: ''
})
export class ClientProfileComponent {

}
