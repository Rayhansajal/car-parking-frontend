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
    { path: '/dashboard', label: 'Dashboard', icon: 'D' },
    { path: '/bookings/my', label: 'My Bookings', icon: 'B' },
    { path: '/parking-lots', label: 'Parking Lots', icon: 'L' },
    { path: '/slots', label: 'Parking Slots', icon: 'P' },
    { path: '/vehicles', label: 'My Vehicles', icon: 'V' },
    { path: '/reports', label: 'Reports', icon: 'R' }
  ];
}
