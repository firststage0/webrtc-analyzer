import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import JSZip from 'jszip';

export interface Instruction {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InstructionsService {
  private instructions = new BehaviorSubject<Instruction[]>([]);
  instructions$ = this.instructions.asObservable();

  private defaultInstruction: Instruction = {
    id: 'default',
    name: 'Базовая инструкция анализа',
    content: '',
    isDefault: true
  };

  constructor(private http: HttpClient) {
    // Загружаем дефолтную инструкцию из файла
    this.http.get('assets/tools/verto_calls_analysis_instructions.md', { responseType: 'text' }).subscribe(content => {
      this.defaultInstruction.content = content;
      this.loadInstructions();
    }, () => {
      // Если файл не найден, используем пустую инструкцию
      this.loadInstructions();
    });
  }

  private loadInstructions() {
    const savedInstructions = localStorage.getItem('instructions');
    if (savedInstructions) {
      const instructions = JSON.parse(savedInstructions);
      this.instructions.next([this.defaultInstruction, ...instructions]);
    } else {
      this.instructions.next([this.defaultInstruction]);
    }
  }

  addInstruction(name: string, content: string): void {
    const instruction: Instruction = {
      id: crypto.randomUUID(),
      name,
      content,
      isDefault: false
    };

    const currentInstructions = this.instructions.value;
    this.instructions.next([...currentInstructions, instruction]);
    this.saveInstructions();
  }

  updateInstruction(id: string, name: string, content: string): void {
    if (id === 'default') return; // Нельзя редактировать дефолтную инструкцию
    const currentInstructions = this.instructions.value;
    const updatedInstructions = currentInstructions.map(instruction => {
      if (instruction.id === id) {
        return { ...instruction, name, content };
      }
      return instruction;
    });
    this.instructions.next(updatedInstructions);
    this.saveInstructions();
  }

  deleteInstruction(id: string): void {
    if (id === 'default') return; // Нельзя удалять дефолтную инструкцию
    const currentInstructions = this.instructions.value;
    this.instructions.next(currentInstructions.filter(instruction => instruction.id !== id));
    this.saveInstructions();
  }

  duplicateInstruction(id: string): void {
    // Теперь можно дублировать дефолтную инструкцию
    const instruction = this.instructions.value.find(i => i.id === id);
    if (instruction) {
      const duplicatedInstruction: Instruction = {
        id: crypto.randomUUID(),
        name: `${instruction.name} (copy)`,
        content: instruction.content,
        isDefault: false
      };
      const currentInstructions = this.instructions.value;
      this.instructions.next([...currentInstructions, duplicatedInstruction]);
      this.saveInstructions();
    }
  }

  getInstruction(id: string): Instruction | undefined {
    return this.instructions.value.find(instruction => instruction.id === id);
  }

  private saveInstructions(): void {
    const instructions = this.instructions.value.filter(i => !i.isDefault);
    localStorage.setItem('instructions', JSON.stringify(instructions));
  }

  clearAll() {
    this.instructions.next([this.defaultInstruction]);
    this.saveInstructions();
  }

  exportInstruction(instruction: Instruction): void {
    const blob = new Blob([instruction.content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${instruction.name}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async importInstruction(file: File): Promise<void> {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      throw new Error('Поддерживаются только файлы .txt и .md');
    }

    const content = await file.text();
    const name = file.name.replace(/\.(txt|md)$/, '');
    this.addInstruction(name, content);
  }

  exportSelectedInstructions(instructions: Instruction[]): void {
    if (instructions.length === 0) return;
    
    if (instructions.length === 1) {
      this.exportInstruction(instructions[0]);
      return;
    }

    // Для множественного экспорта создаем zip архив
    const zip = new JSZip();
    instructions.forEach(instruction => {
      zip.file(`${instruction.name}.txt`, instruction.content);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructions_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
