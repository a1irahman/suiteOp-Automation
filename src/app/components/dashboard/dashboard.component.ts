// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RuleService, AutomationRule } from '../../services/rule.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  rules: AutomationRule[] = [];
  subscription: Subscription = new Subscription();

  constructor(
    private ruleService: RuleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.ruleService.getAllRules().subscribe(rules => {
      this.rules = rules;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleRuleActive(rule: AutomationRule): void {
    const updatedRule = this.ruleService.toggleRuleActive(rule.id);
    if (updatedRule) {
      const status = updatedRule.isActive ? 'activated' : 'deactivated';
      this.messageService.add({
        severity: 'success',
        summary: 'Rule Updated',
        detail: `Rule "${updatedRule.name}" has been ${status}.`
      });
    }
  }

  deleteRule(rule: AutomationRule, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete the rule "${rule.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.ruleService.deleteRule(rule.id)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Rule Deleted',
            detail: `Rule "${rule.name}" has been deleted.`
          });
        }
      }
    });
  }

  editRule(rule: AutomationRule): void {
    // Navigate to the edit route with the rule ID
    this.router.navigate(['/edit-rule', rule.id]);
  }

  formatTimingDescription(rule: AutomationRule): string {
    if (!rule.actions || rule.actions.length === 0) {
      return 'No actions';
    }

    const actionCounts = {
      immediate: 0,
      scheduled: 0
    };

    rule.actions.forEach(action => {
      actionCounts[action.timing.type]++;
    });

    const parts = [];
    if (actionCounts.immediate > 0) {
      parts.push(`${actionCounts.immediate} immediate`);
    }
    if (actionCounts.scheduled > 0) {
      parts.push(`${actionCounts.scheduled} scheduled`);
    }

    return parts.join(', ') + ' action(s)';
  }
}
