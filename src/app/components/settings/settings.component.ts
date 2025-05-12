import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="settings-container">
      <h1>Настройки</h1>
      
      <div class="settings-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>API Ключ</mat-label>
          <input matInput [(ngModel)]="apiKey" placeholder="Введите ваш API ключ">
          <mat-hint>Ключ API для доступа к сервису анализа</mat-hint>
        </mat-form-field>

        <div class="actions">
          <button mat-raised-button color="primary" (click)="saveSettings()">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 20px;
    }
    .settings-form {
      max-width: 600px;
      margin-top: 20px;
    }
    .full-width {
      width: 100%;
    }
    .actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
  `]
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly notificationService = inject(NotificationService);
  
  apiKey: string = this.settingsService.getApiKey();

  saveSettings(): void {
    this.settingsService.updateSettings({ apiKey: this.apiKey });
    this.notificationService.showSuccess('Настройки сохранены');
  }
} 