import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InstructionsService, Instruction } from '../../services/instructions.service';
import { InstructionDialogComponent } from './instruction-dialog.component';
import { InstructionViewDialogComponent } from './instruction-view-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  template: `
    <div class="instructions-container">
      <div class="header">
        <h1>Инструкции</h1>
        <div class="header-actions">
          <button mat-raised-button color="warn" (click)="clearAllInstructions()">
            <mat-icon>delete_sweep</mat-icon>
            Очистить все
          </button>
          <button mat-raised-button color="accent" (click)="importInstruction()">
            <mat-icon>upload</mat-icon>
            Импорт
          </button>
          <button mat-raised-button color="primary" (click)="createInstruction()">
            <mat-icon>add</mat-icon>
            Создать инструкцию
          </button>
          <button mat-icon-button [matMenuTriggerFor]="bulkMenu" [disabled]="!hasSelectedInstructions()">
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
        @for (instruction of instructions$ | async; track instruction.id) {
          <mat-list-item>
            <div class="instruction-item">
              <mat-checkbox
                [checked]="isSelected(instruction)"
                (change)="toggleInstructionSelection(instruction)"
                (click)="$event.stopPropagation()"
              ></mat-checkbox>
              <div class="instruction-info">
                <span matListItemTitle>{{ instruction.name }}</span>
                <span matListItemLine>{{ instruction.isDefault ? 'Дефолтная инструкция' : '' }}</span>
              </div>
              <div class="instruction-actions">
                @if (instruction.isDefault) {
                  <button mat-icon-button (click)="viewInstruction(instruction)" matTooltip="Просмотреть" >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="duplicateInstruction(instruction)" matTooltip="Дублировать">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                } @else {
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="editInstruction(instruction)">
                      <mat-icon>edit</mat-icon>
                      <span>Редактировать</span>
                    </button>
                    <button mat-menu-item (click)="duplicateInstruction(instruction)">
                      <mat-icon>content_copy</mat-icon>
                      <span>Дублировать</span>
                    </button>
                    <button mat-menu-item (click)="exportInstruction(instruction)">
                      <mat-icon>download</mat-icon>
                      <span>Экспорт</span>
                    </button>
                    <button mat-menu-item (click)="deleteInstruction(instruction)">
                      <mat-icon>delete</mat-icon>
                      <span>Удалить</span>
                    </button>
                  </mat-menu>
                }
              </div>
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

    .cdk-overlay-pane.mat-mdc-dialog-panel {
      max-width: 1200px !important;
    }

    .instructions-container {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: transparent;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      margin: 0;
    }

    .instruction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .instruction-info {
      flex: 1;
    }

    .instruction-actions {
      display: flex;
      gap: 8px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .bulk-actions {
      display: flex;
      gap: 8px;
      padding-right: 16px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }
    .main-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class InstructionsComponent {
  private readonly instructionsService = inject(InstructionsService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  instructions$ = this.instructionsService.instructions$;

  selectedInstructions = new Set<string>();

  isSelected(instruction: Instruction): boolean {
    return this.selectedInstructions.has(instruction.id);
  }

  toggleInstructionSelection(instruction: Instruction) {
    if (this.selectedInstructions.has(instruction.id)) {
      this.selectedInstructions.delete(instruction.id);
    } else {
      this.selectedInstructions.add(instruction.id);
    }
  }

  hasSelectedInstructions(): boolean {
    return this.selectedInstructions.size > 0;
  }

  exportSelected() {
    const instructions = Array.from(this.selectedInstructions)
      .map(id => this.instructionsService.getInstruction(id))
      .filter((instruction): instruction is Instruction => instruction !== undefined);
    
    this.instructionsService.exportSelectedInstructions(instructions);
  }

  deleteSelected() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: `Вы действительно хотите удалить выбранные инструкции (${this.selectedInstructions.size})?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.selectedInstructions.forEach(id => {
          this.instructionsService.deleteInstruction(id);
        });
        this.selectedInstructions.clear();
        this.notificationService.showSuccess('Выбранные инструкции удалены');
      }
    });
  }

  createInstruction() {
    const dialogRef = this.dialog.open(InstructionDialogComponent, {
      width: '900px',
      maxWidth: '900px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.instructionsService.addInstruction(result.name, result.content);
      }
    });
  }

  editInstruction(instruction: Instruction) {
    const dialogRef = this.dialog.open(InstructionDialogComponent, {
      data: { instruction },
      width: '900px',
      maxWidth: '900px',
      height: '75vh',
      maxHeight: '75vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.instructionsService.updateInstruction(
          instruction.id,
          result.name,
          result.content
        );
      }
    });
  }

  duplicateInstruction(instruction: Instruction) {
    this.instructionsService.duplicateInstruction(instruction.id);
  }

  deleteInstruction(instruction: Instruction) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить инструкцию?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.instructionsService.deleteInstruction(instruction.id);
      }
    });
  }

  viewInstruction(instruction: Instruction) {
    const dialogRef = this.dialog.open(InstructionViewDialogComponent, {
      data: { instruction },
      width: '900px',
      maxWidth: '900px'
    });
  }

  clearAllInstructions() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Вы действительно хотите удалить все инструкции (кроме базовой)?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.instructionsService.clearAll();
      }
    });
  }

  exportInstruction(instruction: Instruction) {
    this.instructionsService.exportInstruction(instruction);
  }

  importInstruction() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      try {
        await this.instructionsService.importInstruction(input.files[0]);
        this.notificationService.showSuccess('Инструкция успешно импортирована');
      } catch (error) {
        this.notificationService.showError(error instanceof Error ? error.message : 'Ошибка при импорте инструкции');
      }
      // Очищаем input для возможности повторного выбора того же файла
      input.value = '';
    }
  }
}
