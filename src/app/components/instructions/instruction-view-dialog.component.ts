import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.instruction.name }}</h2>
    <mat-dialog-content>
      <div class="content-container">
        <pre>{{ data.instruction.content }}</pre>
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
      max-height: 60vh;
      overflow-y: auto;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
      font-family: inherit;
    }

    mat-dialog-content {
      min-width: 500px;
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