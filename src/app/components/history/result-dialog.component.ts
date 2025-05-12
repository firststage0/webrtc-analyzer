import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AnalysisResult } from '../../services/analysis.service';
import { ExportService } from '../../services/export.service';

interface ResultDialogData {
  result: AnalysisResult;
}

@Component({
  selector: 'app-result-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Результат анализа</h2>
    <mat-dialog-content>
      <div class="result-container">
        <div class="result-header">
          <div class="info">
            <p><strong>Модель:</strong> {{ data.result.model }}</p>
            <p><strong>Дата:</strong> {{ data.result.date | date:'medium' }}</p>
          </div>
          <button mat-icon-button (click)="exportResult()">
            <mat-icon>download</mat-icon>
          </button>
        </div>

        <div class="result-content">
          <pre>{{ data.result.result }}</pre>
        </div>

        @if (data.result.charts?.length) {
          <div class="charts">
            @for (chart of data.result.charts; track chart.id) {
              <div class="chart">
                <!-- TODO: Добавить отображение графиков -->
              </div>
            }
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Закрыть</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .result-container {
      min-width: 600px;
      width: 100%;
      box-sizing: border-box;
      margin: 0 auto;
      max-width: 80vw;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .info {
      p {
        margin: 4px 0;
      }
    }

    .result-content {
      // background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
      }
    }

    .charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .chart {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 16px;
    }
  `]
})
export class ResultDialogComponent {
  private readonly exportService = inject(ExportService);

  constructor(
    public dialogRef: MatDialogRef<ResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResultDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  exportResult(): void {
    this.exportService.exportResult(this.data.result);
  }
} 