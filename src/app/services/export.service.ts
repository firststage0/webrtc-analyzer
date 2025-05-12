import { Injectable } from '@angular/core';
import { AnalysisResult } from './analysis.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  exportResult(result: AnalysisResult): void {
    const content = this.formatResult(result);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-result-${result.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private formatResult(result: AnalysisResult): string {
    const lines: string[] = [];
    
    // Заголовок
    lines.push('=== Результат анализа WebRTC лога ===');
    lines.push('');
    
    // Метаданные
    lines.push('Метаданные:');
    lines.push(`ID: ${result.id}`);
    lines.push(`Дата: ${result.date}`);
    lines.push(`Модель: ${result.model}`);
    lines.push(`ID лога: ${result.logId}`);
    lines.push(`ID инструкции: ${result.instructionId}`);
    lines.push('');
    
    // Результат анализа
    lines.push('Результат анализа:');
    lines.push(result.result);
    lines.push('');
    
    // Информация о графиках
    if (result.charts?.length) {
      lines.push('Графики:');
      result.charts.forEach(chart => {
        lines.push(`- ${chart.id}: ${chart.type}`);
      });
    }
    
    return lines.join('\n');
  }
} 