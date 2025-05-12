import { Routes } from '@angular/router';
import { LogsComponent } from './components/logs/logs.component';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { HistoryComponent } from './components/history/history.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'logs', pathMatch: 'full' },
  { path: 'logs', component: LogsComponent },
  { path: 'instructions', component: InstructionsComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'logs' }
];
