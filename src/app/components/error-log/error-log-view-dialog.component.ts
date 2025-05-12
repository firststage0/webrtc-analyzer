import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ErrorLog } from '../../services/error-log.service';

@Component({
  selector: 'app-error-log-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Детали ошибки</h2>
    <mat-dialog-content>
      <div style="max-height:60vh;overflow:auto;">
        <p><strong>Сообщение:</strong> {{ data.error.message }}</p>
        <p><strong>Дата:</strong> {{ data.error.date | date:'medium' }}</p>
        <pre>{{ data.error.details | json }}</pre>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Закрыть</button>
    </mat-dialog-actions>
  `
})
export class ErrorLogViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorLogViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { error: ErrorLog }
  ) {}
  onClose() { this.dialogRef.close(); }
} 