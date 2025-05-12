import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ErrorLog {
  id: string;
  date: Date;
  message: string;
  details: any;
}

@Injectable({ providedIn: 'root' })
export class ErrorLogService {
  private errorLogs = new BehaviorSubject<ErrorLog[]>([]);
  errorLogs$ = this.errorLogs.asObservable();

  constructor() {
    const saved = localStorage.getItem('errorLogs');
    if (saved) {
      this.errorLogs.next(JSON.parse(saved));
    }
  }

  addError(message: string, details: any) {
    const error: ErrorLog = {
      id: crypto.randomUUID(),
      date: new Date(),
      message,
      details
    };
    const current = this.errorLogs.value;
    this.errorLogs.next([error, ...current]);
    this.save();
  }

  deleteError(id: string) {
    this.errorLogs.next(this.errorLogs.value.filter(e => e.id !== id));
    this.save();
  }

  clearAll() {
    this.errorLogs.next([]);
    this.save();
  }

  private save() {
    localStorage.setItem('errorLogs', JSON.stringify(this.errorLogs.value));
  }
} 