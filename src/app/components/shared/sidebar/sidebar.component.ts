import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/logs" routerLinkActive="active">
        <mat-icon matListItemIcon>description</mat-icon>
        <span matListItemTitle>Логи</span>
      </a>
      <a mat-list-item routerLink="/instructions" routerLinkActive="active">
        <mat-icon matListItemIcon>list_alt</mat-icon>
        <span matListItemTitle>Инструкции</span>
      </a>
      <a mat-list-item routerLink="/history" routerLinkActive="active">
        <mat-icon matListItemIcon>history</mat-icon>
        <span matListItemTitle>История</span>
      </a>
      <a mat-list-item routerLink="/settings" routerLinkActive="active">
        <mat-icon matListItemIcon>settings</mat-icon>
        <span matListItemTitle>Настройки</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    mat-icon {
      margin-right: 16px;
    }
  `]
})
export class SidebarComponent {}
