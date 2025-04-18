// src/app/services/logging.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private STORAGE_KEY = 'automation_logs';
  private logsSubject = new BehaviorSubject<LogEntry[]>([]);
  logs$ = this.logsSubject.asObservable();

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    const storedLogs = localStorage.getItem(this.STORAGE_KEY);
    if (storedLogs) {
      const logs = JSON.parse(storedLogs);

      // Convert string dates back to Date objects
      logs.forEach((log: LogEntry) => {
        log.timestamp = new Date(log.timestamp);
      });

      this.logsSubject.next(logs);
    }
  }

  private saveLogs(logs: LogEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    this.logsSubject.next(logs);
  }

  log(type: 'INFO' | 'WARNING' | 'ERROR', message: string, details?: any): LogEntry {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    };

    const updatedLogs = [newLog, ...this.logsSubject.value].slice(0, 1000); // Limit to 1000 entries
    this.saveLogs(updatedLogs);
    return newLog;
  }

  info(message: string, details?: any): LogEntry {
    return this.log('INFO', message, details);
  }

  warning(message: string, details?: any): LogEntry {
    return this.log('WARNING', message, details);
  }

  error(message: string, details?: any): LogEntry {
    return this.log('ERROR', message, details);
  }

  getLogs(): Observable<LogEntry[]> {
    return this.logs$;
  }

  clearLogs(): void {
    this.saveLogs([]);
  }
}
