import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AnalysisService, AnalysisResult } from '../../services/analysis.service';
import { LogsService } from '../../services/logs.service';
import { InstructionsService } from '../../services/instructions.service';
import { ResultDialogComponent } from './result-dialog.component';
import { ExportService } from '../../services/export.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-history',
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
    <div class="history-container">
      <div class="header">
        <h1>История анализов</h1>
        <div class="header-actions">
          <button mat-raised-button color="warn" (click)="clearAllHistory()">
            <mat-icon>delete_sweep</mat-icon>
            Очистить все
          </button>
          <button mat-icon-button [matMenuTriggerFor]="bulkMenu" [disabled]="!hasSelectedResults()">
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
        @for (result of analysisResults$ | async; track result.id) {
          <mat-list-item>
            <div class="result-item">
              <mat-checkbox
                [checked]="isSelected(result)"
                (change)="toggleResultSelection(result)"
                (click)="$event.stopPropagation()"
              ></mat-checkbox>
              <div class="result-info">
                <span class="result-title">{{ getLogName(result.logId) }}</span>
                <span class="result-date">{{ result.date | date:'medium' }}</span>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewResult(result)">
                  <mat-icon>visibility</mat-icon>
                  <span>Просмотреть</span>
                </button>
                <button mat-menu-item (click)="exportResult(result)">
                  <mat-icon>download</mat-icon>
                  <span>Экспорт</span>
                </button>
                <button mat-menu-item (click)="deleteResult(result)">
                  <mat-icon>delete</mat-icon>
                  <span>Удалить</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        }
      </mat-list>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      height: 100%;
    }
    .history-container {
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
    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    h1 {
      margin: 0;
    }
    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }
    .result-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .result-title {
      font-weight: 500;
    }
    .result-date {
      font-size: 0.9em;
      color: #888;
    }
  `]
})
export class HistoryComponent {
  private readonly analysisService = inject(AnalysisService);
  private readonly logsService = inject(LogsService);
  private readonly instructionsService = inject(InstructionsService);
  private readonly dialog = inject(MatDialog);
  private readonly exportService = inject(ExportService);
  private readonly notificationService = inject(NotificationService);

  analysisResults$ = this.analysisService.analysisResults$;
  selectedResults = new Set<string>();

  getLogName(logId: string): string {
    const log = this.logsService.getLog(logId);
    return log ? log.name : 'Неизвестный лог';
  }

  getInstructionName(instructionId: string): string {
    const instruction = this.instructionsService.getInstruction(instructionId);
    return instruction?.name || 'Неизвестная инструкция';
  }

  viewResult(result: AnalysisResult): void {
    this.dialog.open(ResultDialogComponent, {
      data: { result },
      maxWidth: '900px',
      maxHeight: '70vh',
      height: '70vh'
    });
  }

  exportResult(result: AnalysisResult): void {
    this.exportService.exportResult(result);
  }

  deleteResult(result: AnalysisResult): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить результат анализа?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.analysisService.deleteResult(result.id);
        this.selectedResults.delete(result.id);
        this.notificationService.showSuccess('Результат анализа удален');
      }
    });
  }

  clearAllHistory() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить всю историю анализов?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.analysisService.clearAll();
        this.selectedResults.clear();
        this.notificationService.showSuccess('История анализов очищена');
      }
    });
  }

  isSelected(result: AnalysisResult): boolean {
    return this.selectedResults.has(result.id);
  }

  toggleResultSelection(result: AnalysisResult) {
    if (this.selectedResults.has(result.id)) {
      this.selectedResults.delete(result.id);
    } else {
      this.selectedResults.add(result.id);
    }
  }

  hasSelectedResults(): boolean {
    return this.selectedResults.size > 0;
  }

  exportSelected() {
    const results = Array.from(this.selectedResults)
      .map(id => this.analysisService.getResult(id))
      .filter((result): result is AnalysisResult => result !== undefined);
    
    this.analysisService.exportSelectedResults(results);
  }

  deleteSelected() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: `Вы действительно хотите удалить выбранные результаты анализа (${this.selectedResults.size})?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.selectedResults.forEach(id => {
          this.analysisService.deleteResult(id);
        });
        this.selectedResults.clear();
        this.notificationService.showSuccess('Выбранные результаты анализа удалены');
      }
    });
  }
}
