import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Анализ лога</h2>
    <mat-dialog-content>
      <div class="form-container">
        <mat-form-field>
          <mat-label>Модель</mat-label>
          <mat-select [(ngModel)]="selectedModel">
            <mat-option value="google/gemma-3-12b-it:free">Gemma 3.12B</mat-option>
            <mat-option value="google/gemini-2.0-flash-exp:free">Google: Gemini 2.0 (Free)</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Инструкция</mat-label>
          <mat-select [(ngModel)]="selectedInstruction">
            @for (instruction of instructions$ | async; track instruction.id) {
              <mat-option [value]="instruction">{{ instruction.name }}</mat-option>
            }
          </mat-select>
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
          <pre>{{ analysisResult.result }}</pre>
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

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
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
  isAnalyzing = false;
  analysisResult: any = null;
  instructions$ = this.instructionsService.instructions$;

  get canAnalyze(): boolean {
    return !!this.selectedModel && !!this.selectedInstruction;
  }

  constructor(
    public dialogRef: MatDialogRef<AnalysisDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AnalysisDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAnalyze(): void {
    if (!this.canAnalyze || !this.selectedInstruction) return;

    this.isAnalyzing = true;
    this.analysisResult = null;

    this.analysisService.analyzeLog({
      log: this.data.log,
      instruction: this.selectedInstruction,
      model: this.selectedModel
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