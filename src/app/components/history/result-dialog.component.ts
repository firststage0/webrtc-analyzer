import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';
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
    MatIconModule,
    MarkdownModule
  ],
  template: `
    <h2 mat-dialog-title>Результат анализа</h2>
    <mat-dialog-content>
      <div class="result-container">
        <div class="result-header">
          <div class="info">
            <p><strong>Модель:</strong> {{ data.result.model }}</p>
            <p><strong>Дата:</strong> {{ data.result.date | date:'medium' }}</p>
            @if (data.result.temperature !== undefined) {
              <p><strong>Температура:</strong> {{ data.result.temperature }}</p>
            }
            @if (data.result.max_tokens !== undefined) {
              <p><strong>Макс. токенов:</strong> {{ data.result.max_tokens }}</p>
            }
            @if (data.result.additional_prompt) {
              <p><strong>Доп. запрос:</strong> {{ data.result.additional_prompt }}</p>
            }
          </div>
          <button mat-icon-button (click)="exportResult()">
            <mat-icon>download</mat-icon>
          </button>
        </div>

        <div class="result-content">
          <markdown [data]="data.result.result"></markdown>
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
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;

      ::ng-deep {
        .markdown-body {
          font-family: inherit;
          font-size: inherit;
          line-height: 1.6;
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
          }

          h1 { font-size: 2em; }
          h2 { font-size: 1.5em; }
          h3 { font-size: 1.25em; }
          h4 { font-size: 1em; }
          h5 { font-size: 0.875em; }
          h6 { font-size: 0.85em; }

          p {
            margin-top: 0;
            margin-bottom: 16px;
          }

          code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            background-color: rgba(27,31,35,0.05);
            border-radius: 3px;
          }

          pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 3px;
            margin-bottom: 16px;

            code {
              padding: 0;
              margin: 0;
              background-color: transparent;
              border: 0;
            }
          }

          ul, ol {
            padding-left: 2em;
            margin-top: 0;
            margin-bottom: 16px;
          }

          blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            margin: 0 0 16px 0;
          }

          table {
            display: block;
            width: 100%;
            overflow: auto;
            margin-top: 0;
            margin-bottom: 16px;
            border-spacing: 0;
            border-collapse: collapse;

            th, td {
              padding: 6px 13px;
              border: 1px solid #dfe2e5;
            }

            tr {
              background-color: #fff;
              border-top: 1px solid #c6cbd1;

              &:nth-child(2n) {
                background-color: #f6f8fa;
              }
            }
          }
        }
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