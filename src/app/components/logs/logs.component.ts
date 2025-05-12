import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LogsService, Log } from '../../services/logs.service';
import { AnalysisDialogComponent } from './analysis-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { LogEditDialogComponent } from './log-edit-dialog.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  template: `
    <div class="logs-container">
      <div class="header">
        <h1>Логи</h1>
        <div class="header-actions">
          <button mat-raised-button color="warn" (click)="clearAllLogs()">
            <mat-icon>delete_sweep</mat-icon>
            Очистить все
          </button>
          <button mat-raised-button color="primary" (click)="uploadLogs()">
            <mat-icon>upload</mat-icon>
            Загрузить логи
          </button>
          <button mat-icon-button [matMenuTriggerFor]="bulkMenu" [disabled]="!hasSelectedLogs()">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #bulkMenu="matMenu">
            <button mat-menu-item (click)="exportSelected()">
              <mat-icon>download</mat-icon>
              <span>Экспорт выбранных</span>
            </button>
            <button mat-menu-item (click)="deleteSelected()">
              <mat-icon>delete</mat-icon>
              <span>Удалить выбранные</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <mat-list>
        @for (log of logs$ | async; track log.id) {
          <mat-list-item>
            <div class="log-item">
              <mat-checkbox
                [checked]="isSelected(log)"
                (change)="toggleLogSelection(log)"
                (click)="$event.stopPropagation()"
              ></mat-checkbox>
              <div class="log-info">
                <span class="log-title">{{ log.name }}</span>
                <span class="log-date">{{ log.date | date:'medium' }}</span>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editLog(log)">
                  <mat-icon>edit</mat-icon>
                  <span>Редактировать</span>
                </button>
                <button mat-menu-item (click)="analyzeLog(log)">
                  <mat-icon>analytics</mat-icon>
                  <span>Анализировать</span>
                </button>
                <button mat-menu-item (click)="exportLog(log)">
                  <mat-icon>download</mat-icon>
                  <span>Экспорт</span>
                </button>
                <button mat-menu-item (click)="deleteLog(log)">
                  <mat-icon>delete</mat-icon>
                  <span>Удалить</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        }
      </mat-list>

      <input
        #fileInput
        type="file"
        accept=".txt,.json"
        style="display: none"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      height: 100%;
    }
    .logs-container {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: transparent;
      padding: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
    }
    .log-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }
    .log-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .log-title {
      font-weight: 500;
    }
    .log-date {
      font-size: 0.9em;
      color: #888;
    }
    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .bulk-actions {
      display: flex;
      gap: 8px;
      padding-right: 16px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }
    .main-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class LogsComponent {
  private readonly logsService = inject(LogsService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  logs$ = this.logsService.logs$;
  selectedLogs = new Set<string>();

  uploadLogs() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.logsService.addLog(file)
        .then(() => {
          this.notificationService.showSuccess('Лог успешно загружен');
          input.value = '';
        })
        .catch(error => {
          console.error('Error uploading log:', error);
          this.notificationService.showError('Ошибка при загрузке лога');
          input.value = '';
        });
    }
  }

  analyzeLog(log: Log) {
    this.dialog.open(AnalysisDialogComponent, {
      data: { log },
      maxWidth: '900px',
      width: '900px',
      maxHeight: '70vh',
      height: '70vh'
    });
  }

  deleteLog(log: Log) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить лог?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.logsService.deleteLog(log.id);
        this.selectedLogs.delete(log.id);
        this.notificationService.showSuccess('Лог успешно удален');
      }
    });
  }

  clearAllLogs() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить все логи?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.logsService.clearAll();
        this.selectedLogs.clear();
        this.notificationService.showSuccess('Все логи удалены');
      }
    });
  }

  isSelected(log: Log): boolean {
    return this.selectedLogs.has(log.id);
  }

  toggleLogSelection(log: Log) {
    if (this.selectedLogs.has(log.id)) {
      this.selectedLogs.delete(log.id);
    } else {
      this.selectedLogs.add(log.id);
    }
  }

  hasSelectedLogs(): boolean {
    return this.selectedLogs.size > 0;
  }

  exportLog(log: Log) {
    this.logsService.exportLog(log);
  }

  exportSelected() {
    const logs = Array.from(this.selectedLogs)
      .map(id => this.logsService.getLog(id))
      .filter((log): log is Log => log !== undefined);
    
    this.logsService.exportSelectedLogs(logs);
  }

  deleteSelected() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: `Вы действительно хотите удалить выбранные логи (${this.selectedLogs.size})?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.selectedLogs.forEach(id => {
          this.logsService.deleteLog(id);
        });
        this.selectedLogs.clear();
        this.notificationService.showSuccess('Выбранные логи удалены');
      }
    });
  }

  editLog(log: Log) {
    const dialogRef = this.dialog.open(LogEditDialogComponent, {
      data: { log }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logsService.updateLogName(log.id, result);
        this.notificationService.showSuccess('Имя лога обновлено');
      }
    });
  }
}
