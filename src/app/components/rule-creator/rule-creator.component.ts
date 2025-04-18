import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RuleService, Trigger, Action, AutomationRule } from '../../services/rule.service';
import { NlpService } from '../../services/nlp.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-rule-creator',
  templateUrl: './rule-creator.component.html',
  styleUrls: ['./rule-creator.component.css']
})
export class RuleCreatorComponent implements OnInit {
  ruleForm: FormGroup;
  availableTriggers: Trigger[] = [];
  availableActions: {type: string, description: string}[] = [];

  aiInputText: string = '';
  aiGeneratedRule: Partial<AutomationRule> | null = null;
  isProcessingAi: boolean = false;

  constructor(
    private fb: FormBuilder,
    private ruleService: RuleService,
    private nlpService: NlpService,
    private loggingService: LoggingService
  ) {
    this.ruleForm = this.initForm();
  }

  ngOnInit(): void {
    this.availableTriggers = this.ruleService.getAvailableTriggers();
    this.availableActions = this.ruleService.getAvailableActions();
  }

  private initForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      trigger: this.fb.group({
        type: ['', Validators.required],
        description: ['']
      }),
      actions: this.fb.array([this.createActionForm()]),
      isActive: [true]
    });
  }

  private createActionForm(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      config: this.fb.group({
        // This will be dynamically populated based on action type
      }),
      timing: this.fb.group({
        type: ['immediate', Validators.required],
        delay: [null],
        scheduledTime: [null]
      })
    });
  }

  get actionsFormArray(): FormArray {
    return this.ruleForm.get('actions') as FormArray;
  }

  addAction(): void {
    this.actionsFormArray.push(this.createActionForm());
  }

  removeAction(index: number): void {
    this.actionsFormArray.removeAt(index);
  }

  onTriggerTypeChange(event: any): void {
    const triggerType = event.value;
    const trigger = this.availableTriggers.find(t => t.type === triggerType);

    if (trigger) {
      this.ruleForm.patchValue({
        trigger: {
          description: trigger.description
        }
      });
    }
  }

  onActionTypeChange(index: number, event: any): void {
    const actionType = event.value;
    const action = this.availableActions.find(a => a.type === actionType);

    if (action) {
      // Here we would dynamically create form controls based on action type
      const actionForm = this.actionsFormArray.at(index);
      // Reset and recreate the config form group based on action type
      // This is a simplified example
    }
  }

  onTimingTypeChange(index: number, event: any): void {
    const timingType = event.value;
    const actionForm = this.actionsFormArray.at(index);

    if (timingType === 'immediate') {
      actionForm.get('timing.delay')?.setValue(null);
      actionForm.get('timing.scheduledTime')?.setValue(null);
    }
  }

  processNaturalLanguage(): void {
    if (!this.aiInputText.trim()) {
      return;
    }

    if (!this.nlpService.hasApiKey()) {
      this.loggingService.warning('No OpenAI API key configured');
      // Show error message to user
      return;
    }

    this.isProcessingAi = true;
    this.aiGeneratedRule = null;

    this.nlpService.parseNaturalLanguage(
      this.aiInputText,
      this.availableTriggers,
      this.availableActions
    ).subscribe(
      (result) => {
        this.aiGeneratedRule = result;
        this.isProcessingAi = false;

        // Log the result
        this.loggingService.info('AI processed rule request', {
          input: this.aiInputText,
          result
        });
      },
      (error) => {
        this.isProcessingAi = false;
        this.loggingService.error('Error processing natural language', error);
        // Show error message to user
      }
    );
  }

  applyAiRule(): void {
    if (!this.aiGeneratedRule) return;

    // Reset the form and apply AI rule
    this.ruleForm = this.initForm();

    // Apply the rule name and trigger
    this.ruleForm.patchValue({
      name: this.aiGeneratedRule.name,
      trigger: this.aiGeneratedRule.trigger
    });

    // Remove default action
    while (this.actionsFormArray.length > 0) {
      this.actionsFormArray.removeAt(0);
    }

    // Add AI-generated actions
    if (this.aiGeneratedRule.actions && this.aiGeneratedRule.actions.length > 0) {
      this.aiGeneratedRule.actions.forEach(action => {
        const actionForm = this.createActionForm();
        actionForm.patchValue(action);
        this.actionsFormArray.push(actionForm);
      });
    } else {
      // Add a default action if none were generated
      this.actionsFormArray.push(this.createActionForm());
    }

    // Clear AI input
    this.aiInputText = '';
    this.aiGeneratedRule = null;
  }

  saveRule(): void {
    if (this.ruleForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.ruleForm);
      return;
    }

    const ruleData = this.ruleForm.value;
    const newRule = this.ruleService.createRule(ruleData);

    this.loggingService.info('Rule created', { rule: newRule });

    // Reset form after saving
    this.ruleForm = this.initForm();

    // Show success message to user
  }

  // Helper to trigger validation on all form fields
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      }
    });
  }
}
