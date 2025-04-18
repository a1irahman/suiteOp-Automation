// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Suite OP Automation Hub';
  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: [''] },
      { label: 'Create Rule', icon: 'pi pi-plus', routerLink: ['/create-rule'] },
      { label: 'Logs', icon: 'pi pi-list', routerLink: ['/logs'] },
      { label: 'Settings', icon: 'pi pi-cog', routerLink: ['/settings'] }
    ];
  }
}
