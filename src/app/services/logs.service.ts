import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import JSZip from 'jszip';

export interface Log {
  id: string;
  name: string;
  content: string;
  date: Date;
  type: 'txt' | 'json';
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private logs = new BehaviorSubject<Log[]>([]);
  logs$ = this.logs.asObservable();

  constructor() {
    // Загружаем сохраненные логи из localStorage при инициализации
    const savedLogs = localStorage.getItem('logs');
    if (savedLogs) {
      this.logs.next(JSON.parse(savedLogs));
    }
  }

  addLog(file: File): Promise<Log> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const log: Log = {
          id: crypto.randomUUID(),
          name: file.name,
          content,
          date: new Date(),
          type: file.name.endsWith('.json') ? 'json' : 'txt'
        };

        const currentLogs = this.logs.value;
        this.logs.next([...currentLogs, log]);
        this.saveLogs();
        resolve(log);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  deleteLog(id: string): void {
    const currentLogs = this.logs.value;
    this.logs.next(currentLogs.filter(log => log.id !== id));
    this.saveLogs();
  }

  getLog(id: string): Log | undefined {
    return this.logs.value.find(log => log.id === id);
  }

  private saveLogs(): void {
    localStorage.setItem('logs', JSON.stringify(this.logs.value));
  }

  clearAll() {
    this.logs.next([]);
    this.saveLogs();
  }

  exportLogs(): void {
    const logs = this.logs.value;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportLog(log: Log): void {
    const blob = new Blob([log.content], { type: log.type === 'json' ? 'application/json' : 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = log.name;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportSelectedLogs(logs: Log[]): void {
    if (logs.length === 0) return;
    
    if (logs.length === 1) {
      this.exportLog(logs[0]);
      return;
    }

    // Для множественного экспорта создаем zip архив
    const zip = new JSZip();
    logs.forEach(log => {
      zip.file(log.name, log.content);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  updateLogName(id: string, newName: string): void {
    const currentLogs = this.logs.value;
    const updatedLogs = currentLogs.map(log => {
      if (log.id === id) {
        return { ...log, name: newName };
      }
      return log;
    });
    this.logs.next(updatedLogs);
    this.saveLogs();
  }
}
