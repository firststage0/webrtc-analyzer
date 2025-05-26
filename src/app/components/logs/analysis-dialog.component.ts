import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MarkdownModule } from 'ngx-markdown';
import { Log } from '../../services/logs.service';
import { Instruction } from '../../services/instructions.service';
import { AnalysisService } from '../../services/analysis.service';
import { InstructionsService } from '../../services/instructions.service';
import { NotificationService } from '../../services/notification.service';

interface AnalysisDialogData {
  log: Log;
}

@Component({
  selector: 'app-analysis-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MarkdownModule
  ],
  template: `
    <h2 mat-dialog-title>Анализ лога</h2>
    <mat-dialog-content>
      <div class="form-container">
        <mat-form-field>
          <mat-label>Модель</mat-label>
          <mat-select [(ngModel)]="selectedModel">
            <mat-option value="google/gemini-2.5-flash-preview">Gemini 2.5 Flash </mat-option>
            <mat-option value="google/gemma-3-12b-it:free">Gemma 3.12B</mat-option>
            <mat-option value="google/gemini-2.0-flash-exp:free">Google: Gemini 2.0 (Free)</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Инструкция</mat-label>
          <mat-select [(ngModel)]="selectedInstruction">
            <mat-option [value]="null">Без инструкции</mat-option>
            @for (instruction of instructions$ | async; track instruction.id) {
              <mat-option [value]="instruction">{{ instruction.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Температура</mat-label>
          <input matInput type="number" [(ngModel)]="temperature" min="0" max="1" step="0.1">
          <mat-hint>Значение от 0 до 1. Чем выше значение, тем более креативным будет ответ</mat-hint>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Максимальное количество токенов</mat-label>
          <input matInput type="number" [(ngModel)]="maxTokens" min="1" max="4000">
          <mat-hint>Максимальное количество токенов в ответе</mat-hint>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Дополнительный запрос</mat-label>
          <textarea matInput [(ngModel)]="additionalPrompt" rows="3" placeholder="Введите дополнительный запрос для анализа"></textarea>
        </mat-form-field>
      </div>

      @if (isAnalyzing) {
        <div class="analyzing">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Анализируем логи...</p>
        </div>
      }

      @if (analysisResult) {
        <div class="result">
          <h3>Результат анализа:</h3>
          <markdown [data]="analysisResult.result"></markdown>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Отмена</button>
      <button mat-raised-button color="primary" (click)="onAnalyze()" [disabled]="!canAnalyze || isAnalyzing">
        Анализировать
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .analyzing {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin: 20px 0;
    }

    .result {
      margin-top: 20px;
      padding: 16px;
      border-radius: 4px;

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

    mat-dialog-content {
      min-width: 500px;
      max-height: 70vh;
    }
  `]
})
export class AnalysisDialogComponent {
  private readonly analysisService = inject(AnalysisService);
  private readonly instructionsService = inject(InstructionsService);
  private readonly notificationService = inject(NotificationService);

  selectedModel = 'deepseek/deepseek-coder-33b-instruct';
  selectedInstruction: Instruction | null = null;
  temperature = 0.2;
  maxTokens = 1000;
  additionalPrompt = '';
  isAnalyzing = false;
  analysisResult: any = null;
  instructions$ = this.instructionsService.instructions$;

  get canAnalyze(): boolean {
    return !!this.selectedModel;
  }

  constructor(
    public dialogRef: MatDialogRef<AnalysisDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AnalysisDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAnalyze(): void {
    if (!this.canAnalyze) return;

    this.isAnalyzing = true;
    this.analysisResult = null;

    this.analysisService.analyzeLog({
      log: this.data.log,
      instruction: this.selectedInstruction,
      model: this.selectedModel,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      additional_prompt: this.additionalPrompt
    }).subscribe({
      next: (result) => {
        this.analysisResult = result;
        this.isAnalyzing = false;
        this.notificationService.showSuccess('Анализ успешно завершен');
      },
      error: (error) => {
        console.error('Analysis error:', error);
        this.isAnalyzing = false;
        this.notificationService.showError(error.message || 'Произошла ошибка при анализе');
      }
    });
  }
} 