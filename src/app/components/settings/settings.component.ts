// src/app/components/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NlpService } from '../../services/nlp.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [MessageService]
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  hasApiKey: boolean = false;

  constructor(
    private fb: FormBuilder,
    private nlpService: NlpService,
    private messageService: MessageService
  ) {
    this.settingsForm = this.fb.group({
      apiKey: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {
    this.hasApiKey = this.nlpService.hasApiKey();
    if (this.hasApiKey) {
      this.settingsForm.patchValue({
        apiKey: '••••••••••••••••••••••' // Placeholder for security
      });
    }
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    const apiKey = this.settingsForm.value.apiKey;

    // Don't update if it's the placeholder value
    if (apiKey === '••••••••••••••••••••••') {
      return;
    }

    this.nlpService.setApiKey(apiKey);
    this.hasApiKey = true;

    this.messageService.add({
      severity: 'success',
      summary: 'Settings Updated',
      detail: 'Your OpenAI API key has been saved.'
    });

    // Replace actual key with placeholder for security
    this.settingsForm.patchValue({
      apiKey: '••••••••••••••••••••••'
    });
  }
}
