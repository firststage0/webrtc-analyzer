import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';
import { Instruction } from '../../services/instructions.service';

interface InstructionViewDialogData {
  instruction: Instruction;
}

@Component({
  selector: 'app-instruction-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MarkdownModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.instruction.name }}</h2>
    <mat-dialog-content>
      <div class="content-container">
        <markdown [data]="data.instruction.content"></markdown>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Закрыть</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .content-container {
      padding: 16px;
      border-radius: 4px;
      max-height: 50vh;
      height: 50vh;
      overflow-y: auto;
    }

    mat-dialog-content {
      min-width: 500px;
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
export class InstructionViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InstructionViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InstructionViewDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
} 