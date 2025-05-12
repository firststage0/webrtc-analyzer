import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Settings {
  apiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'webrtc_analyzer_settings';
  private settings = new BehaviorSubject<Settings>(this.loadSettings());
  settings$ = this.settings.asObservable();

  constructor() {}

  private loadSettings(): Settings {
    const savedSettings = localStorage.getItem(this.STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : { apiKey: '' };
  }

  updateSettings(settings: Partial<Settings>): void {
    const currentSettings = this.settings.value;
    const newSettings = { ...currentSettings, ...settings };
    this.settings.next(newSettings);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSettings));
  }

  getApiKey(): string {
    return this.settings.value.apiKey;
  }
} 