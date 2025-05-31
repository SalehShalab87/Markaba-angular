import { Component} from '@angular/core';
import { UserProfileComponent } from "../../../shared/components/user-profile/user-profile.component";
@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [UserProfileComponent],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
})
export class AdminProfileComponent {
 
}
