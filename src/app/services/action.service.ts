// src/app/services/action.service.ts
import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';
import { Action } from './rule.service';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private scheduledActions: Map<string, any> = new Map();

  constructor(private loggingService: LoggingService) {}

  executeAction(action: Action, context: any = {}): void {
    this.loggingService.info(`Executing action: ${action.type}`, { action, context });

    // Mock implementations of different action types
    switch(action.type) {
      case 'EMAIL':
        this.sendEmail(action.config, context);
        break;
      case 'SLACK':
        this.sendSlackNotification(action.config, context);
        break;
      case 'NOTIFICATION':
        this.sendNativeNotification(action.config, context);
        break;
      case 'TASK':
        this.createTask(action.config, context);
        break;
      case 'DEVICE_CONTROL':
        this.controlDevice(action.config, context);
        break;
      default:
        this.loggingService.warning(`Unknown action type: ${action.type}`);
    }
  }

  scheduleAction(action: Action, context: any = {}, delayMinutes?: number): string {
    const actionId = Date.now().toString();

    this.loggingService.info(`Scheduling action: ${action.type}`, {
      action,
      context,
      delayMinutes
    });

    // Convert minutes to milliseconds
    const delayMs = (delayMinutes || 1) * 60 * 1000;

    // Schedule the action
    const timeout = setTimeout(() => {
      this.executeAction(action, context);
      this.scheduledActions.delete(actionId);
    }, delayMs);

    this.scheduledActions.set(actionId, { timeout, action, context });
    return actionId;
  }

  cancelScheduledAction(actionId: string): boolean {
    const scheduledAction = this.scheduledActions.get(actionId);
    if (!scheduledAction) {
      return false;
    }

    clearTimeout(scheduledAction.timeout);
    this.scheduledActions.delete(actionId);
    this.loggingService.info(`Cancelled scheduled action: ${actionId}`);
    return true;
  }

  // Mock implementation of actions
  private sendEmail(config: any, context: any): void {
    console.log(`[MOCK] Sending email: ${config.subject}`);
    // In a real implementation, this would connect to an email service
  }

  private sendSlackNotification(config: any, context: any): void {
    console.log(`[MOCK] Posting to Slack: ${config.message}`);
    // In a real implementation, this would use Slack's API
  }

  private sendNativeNotification(config: any, context: any): void {
    console.log(`[MOCK] System notification: ${config.message}`);
    // In a real implementation, this might use browser notifications
  }

  private createTask(config: any, context: any): void {
    console.log(`[MOCK] Creating task: ${config.title}`);
    // In a real implementation, this would connect to a task management system
  }

  private controlDevice(config: any, context: any): void {
    const status = config.turnOn ? 'ON' : 'OFF';
    console.log(`[MOCK] Setting device ${config.deviceId} to ${status}`);
    // In a real implementation, this would connect to IoT devices
  }
}
