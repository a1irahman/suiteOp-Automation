// src/app/components/logs/logs.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggingService, LogEntry } from '../../services/logging.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class LogsComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  subscription: Subscription = new Subscription();

  constructor(
    private loggingService: LoggingService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.subscription = this.loggingService.getLogs().subscribe(logs => {
      this.logs = logs;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getSeverity(type: string): string {
    switch(type) {
      case 'ERROR': return 'danger';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      default: return 'info';
    }
  }

  clearLogs(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to clear all logs?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loggingService.clearLogs();
        this.messageService.add({
          severity: 'success',
          summary: 'Logs Cleared',
          detail: 'All logs have been cleared.'
        });
      }
    });
  }
}
