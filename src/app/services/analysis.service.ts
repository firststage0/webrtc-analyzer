import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Log } from './logs.service';
import { Instruction } from './instructions.service';
import { BehaviorSubject } from 'rxjs';
import JSZip from 'jszip';
import { SettingsService } from './settings.service';

export interface AnalysisResult {
  id: string;
  logId: string;
  logName: string;
  model: string;
  date: Date;
  name: string;
  result: any;
  charts?: Array<{ id: string; type: string }>;
  instructionId: string;
}

export interface AnalysisRequest {
  log: Log;
  instruction: Instruction;
  model: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private readonly API_URL = 'https://openrouter.ai/api/v1/completions';
  private analysisResults = new BehaviorSubject<AnalysisResult[]>([]);
  analysisResults$ = this.analysisResults.asObservable();

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    const savedResults = localStorage.getItem('analysisResults');
    if (savedResults) {
      this.analysisResults.next(JSON.parse(savedResults));
    }
  }

  analyzeLog(request: AnalysisRequest): Observable<AnalysisResult> {
    const apiKey = this.settingsService.getApiKey();
    if (!apiKey) {
      return throwError(() => new Error('API ключ не настроен. Пожалуйста, настройте API ключ в настройках.'));
    }

    return new Observable(observer => {
      const prompt = `Проанализируй данный webrtc лог ${request.log.content} и дай развернутый ответ с рекомендациями по улучшению. Для анализа используй эту инструкцию ${request.instruction.content}; `;
      this.http.post(this.API_URL, {
        model: request.model,
        prompt,
        temperature: 0.2,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'WebRTC Analyzer'
        }
      }).subscribe({
        next: (response: any) => {
          const result: AnalysisResult = {
            id: crypto.randomUUID(),
            logId: request.log.id,
            logName: request.log.name,
            model: request.model,
            date: new Date(),
            name: request.log.name,
            result: response.choices ? response.choices[0].text : response.result || '',
            instructionId: request.instruction.id
          };

          const currentResults = this.analysisResults.value;
          this.analysisResults.next([...currentResults, result]);
          this.saveResults();
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  private saveResults() {
    localStorage.setItem('analysisResults', JSON.stringify(this.analysisResults.value));
  }

  deleteResult(id: string): void {
    const updatedResults = this.analysisResults.value.filter(result => result.id !== id);
    this.analysisResults.next(updatedResults);
    this.saveResults();
  }

  clearAll(): void {
    this.analysisResults.next([]);
    this.saveResults();
  }

  getResult(id: string): AnalysisResult | undefined {
    return this.analysisResults.value.find(result => result.id === id);
  }

  exportSelectedResults(results: AnalysisResult[]): void {
    if (results.length === 0) return;
    
    if (results.length === 1) {
      this.exportResult(results[0]);
      return;
    }

    const zip = new JSZip();
    results.forEach(result => {
      zip.file(`${result.name}.json`, JSON.stringify(result, null, 2));
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_results_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private exportResult(result: AnalysisResult): void {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.name}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}