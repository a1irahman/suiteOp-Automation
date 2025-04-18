// src/app/services/rule.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface Trigger {
  type: string;
  description: string;
}

export interface ActionTiming {
  type: 'immediate' | 'scheduled';
  delay?: number; // Delay in minutes
  scheduledTime?: string; // Time of day for scheduled actions
}

export interface Action {
  type: string;
  config: any;
  timing: ActionTiming;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: Trigger;
  actions: Action[];
  isActive: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RuleService {
  private STORAGE_KEY = 'automation_rules';

  private rulesSubject = new BehaviorSubject<AutomationRule[]>([]);
  rules$ = this.rulesSubject.asObservable();

  constructor() {
    this.loadRules();
  }

  getAvailableTriggers(): Trigger[] {
    return [
      { type: 'CHECK_IN', description: 'Guest checks in' },
      { type: 'CHECK_OUT', description: 'Guest checks out' },
      { type: 'CLEANING_COMPLETED', description: 'Cleaning completed' },
      { type: 'MAINTENANCE_REQUEST', description: 'Maintenance requested' },
      { type: 'ROOM_SERVICE_ORDER', description: 'Room service ordered' },
      { type: 'GUEST_COMPLAINT', description: 'Guest files complaint' },
      { type: 'LATE_CHECK_OUT', description: 'Late check-out requested' }
    ];
  }

  getAvailableActions(): {type: string, description: string}[] {
    return [
      { type: 'EMAIL', description: 'Send email' },
      { type: 'SLACK', description: 'Send Slack notification' },
      { type: 'NOTIFICATION', description: 'Send native notification' },
      { type: 'TASK', description: 'Create task' },
      { type: 'DEVICE_CONTROL', description: 'Turn on/off device' }
    ];
  }

  private loadRules(): void {
    const storedRules = localStorage.getItem(this.STORAGE_KEY);
    if (storedRules) {
      const rules = JSON.parse(storedRules);

      // Convert string dates back to Date objects
      rules.forEach((rule: AutomationRule) => {
        rule.createdAt = new Date(rule.createdAt);
      });

      this.rulesSubject.next(rules);
    }
  }

  private saveRules(rules: AutomationRule[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rules));
    this.rulesSubject.next(rules);
  }

  getAllRules(): Observable<AutomationRule[]> {
    return this.rules$;
  }

  getRuleById(id: string): AutomationRule | undefined {
    return this.rulesSubject.value.find(rule => rule.id === id);
  }

  createRule(rule: Omit<AutomationRule, 'id' | 'createdAt'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date()
    };

    const updatedRules = [...this.rulesSubject.value, newRule];
    this.saveRules(updatedRules);

    // Trigger actions if the rule is active
    if (newRule.isActive) {
      this.scheduleRuleActions(newRule);
    }

    return newRule;
  }

  updateRule(id: string, updates: Partial<AutomationRule>): AutomationRule | null {
    const rules = this.rulesSubject.value;
    const index = rules.findIndex(rule => rule.id === id);

    if (index === -1) return null;

    const updatedRule = { ...rules[index], ...updates };
    const updatedRules = [...rules.slice(0, index), updatedRule, ...rules.slice(index + 1)];

    this.saveRules(updatedRules);
    return updatedRule;
  }

  deleteRule(id: string): boolean {
    const rules = this.rulesSubject.value;
    const index = rules.findIndex(rule => rule.id === id);

    if (index === -1) return false;

    const updatedRules = [...rules.slice(0, index), ...rules.slice(index + 1)];
    this.saveRules(updatedRules);
    return true;
  }

  toggleRuleActive(id: string): AutomationRule | null {
    const rules = this.rulesSubject.value;
    const index = rules.findIndex(rule => rule.id === id);

    if (index === -1) return null;

    const updatedRule = {
      ...rules[index],
      isActive: !rules[index].isActive
    };

    const updatedRules = [...rules.slice(0, index), updatedRule, ...rules.slice(index + 1)];
    this.saveRules(updatedRules);

    // If activated, schedule actions
    if (updatedRule.isActive) {
      this.scheduleRuleActions(updatedRule);
    }

    return updatedRule;
  }

  // Mock method to handle rule execution
  private scheduleRuleActions(rule: AutomationRule): void {
    console.log(`Scheduling actions for rule: ${rule.name}`);

    rule.actions.forEach(action => {
      if (action.timing.type === 'immediate') {
        console.log(`Executing immediate action: ${action.type}`);
        // In a real app, this would call the ActionService to execute the action
      } else if (action.timing.type === 'scheduled') {
        if (action.timing.delay) {
          console.log(`Scheduling action: ${action.type} with delay of ${action.timing.delay} minutes`);
          // In a real app, this would register with a proper scheduler
        } else if (action.timing.scheduledTime) {
          console.log(`Scheduling action: ${action.type} at ${action.timing.scheduledTime}`);
          // In a real app, this would register with a proper scheduler
        }
      }
    });
  }
}
