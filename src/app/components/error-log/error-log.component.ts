import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ErrorLogService, ErrorLog } from '../../services/error-log.service';
import { ErrorLogViewDialogComponent } from './error-log-view-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-error-log',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule
  ],
  template: `
    <div class="error-log-container">
      <div class="header">
        <h1>Ошибки</h1>
        <button mat-raised-button color="warn" (click)="clearAll()">
          <mat-icon>delete_sweep</mat-icon>
          Очистить все
        </button>
      </div>
      <mat-list>
        @for (error of errorLogs$ | async; track error.id) {
          <mat-list-item>
            <div class="error-item">
              <div class="error-info">
                <span matListItemTitle>{{ error.message }}</span>
                <span matListItemLine>{{ error.date | date:'medium' }}</span>
              </div>
              <div class="error-actions">
                <button mat-icon-button (click)="viewError(error)" matTooltip="Просмотреть">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteError(error)" matTooltip="Удалить">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-list-item>
        }
      </mat-list>
    </div>
  `,
  styles: [`
    .error-log-container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .error-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .error-info {
      flex: 1;
    }
    .error-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class ErrorLogComponent {
  private readonly errorLogService = inject(ErrorLogService);
  private readonly dialog = inject(MatDialog);
  errorLogs$ = this.errorLogService.errorLogs$;

  viewError(error: ErrorLog) {
    this.dialog.open(ErrorLogViewDialogComponent, { data: { error } });
  }

  deleteError(error: ErrorLog) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить ошибку?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.errorLogService.deleteError(error.id);
      }
    });
  }

  clearAll() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить все ошибки?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.errorLogService.clearAll();
      }
    });
  }
} 