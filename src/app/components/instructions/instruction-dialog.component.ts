import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Instruction } from '../../services/instructions.service';

@Component({
  selector: 'app-instruction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    FormsModule,
    MarkdownModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.instruction ? 'Редактировать инструкцию' : 'Создать инструкцию' }}</h2>
    <mat-dialog-content>
      <div class="dialog-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Название</mat-label>
          <input matInput [(ngModel)]="name" required>
        </mat-form-field>

        <mat-tab-group animationDuration="0ms" class="editor-tabs">
          <mat-tab label="Редактирование">
            <div class="editor-container">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Содержание</mat-label>
                <textarea matInput [(ngModel)]="content" rows="15" required></textarea>
                <mat-hint>Поддерживается Markdown форматирование</mat-hint>
              </mat-form-field>
            </div>
          </mat-tab>
          <mat-tab label="Предпросмотр">
            <div class="preview-container">
              <markdown [data]="content"></markdown>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Отмена</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!name || !content">
        {{ data?.instruction ? 'Сохранить' : 'Создать' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-container {
      min-width: 600px;
      padding-top: 16px;
    }

    .editor-tabs {
      margin-top: 16px;
    }

    .editor-container {
      padding: 16px 0;
    }

    .preview-container {
      padding: 16px;
      // background-color: #fafafa;
      border-radius: 4px;
      min-height: 300px;
      max-height: 40vh;
      overflow-y: auto;
    }

    .full-width {
      width: 100%;
    }

    textarea {
      resize: none;
    }

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
  `]
})
export class InstructionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  name: string = this.data?.instruction?.name || '';
  content: string = this.data?.instruction?.content || '';

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({ name: this.name, content: this.content });
  }
} 