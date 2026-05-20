import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/bookings/my', label: 'My Bookings', icon: '📅' },
    { path: '/lots', label: 'Parking Lots', icon: '🏢' },
    { path: '/slots', label: 'Parking Slots', icon: '🅿️' },
    { path: '/vehicles', label: 'My Vehicles', icon: '🚗' },
    { path: '/reports', label: 'Reports', icon: '📊' },
  ];
}
