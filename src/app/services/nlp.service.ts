// src/app/services/nlp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AutomationRule, Trigger, Action } from './rule.service';

@Injectable({
  providedIn: 'root'
})
export class NlpService {
  private apiKey: string | null = null;
  private apiEndpoint = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  parseNaturalLanguage(input: string, availableTriggers: Trigger[], availableActions: {type: string, description: string}[]): Observable<Partial<AutomationRule>> {
    if (!this.apiKey) {
      return of({
        name: 'Error',
        trigger: { type: 'ERROR', description: 'No OpenAI API key configured' },
        actions: []
      });
    }

    // Format triggers and actions to include in the prompt
    const triggersText = availableTriggers
      .map(t => `- ${t.description} (${t.type})`)
      .join('\n');

    const actionsText = availableActions
      .map(a => `- ${a.description} (${a.type})`)
      .join('\n');

    const prompt = `
Parse the following natural language automation request and convert it to a structured rule.
Extract a rule name, trigger, and actions with their timing (immediate or scheduled).

Available triggers:
${triggersText}

Available actions:
${actionsText}

User input: "${input}"

Respond in JSON format only:
{
  "name": "Rule name",
  "trigger": {
    "type": "One of the trigger types from above",
    "description": "Human readable description"
  },
  "actions": [
    {
      "type": "One of the action types from above",
      "config": {
        // Additional configuration based on action type
      },
      "timing": {
        "type": "immediate or scheduled",
        "delay": null or number of minutes if scheduled,
        "scheduledTime": null or time of day if scheduled
      }
    }
  ]
}`;

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that parses natural language into structured automation rules.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    return this.http.post(this.apiEndpoint, payload, { headers }).pipe(
      map((response: any) => {
        const content = response.choices[0].message.content;
        try {
          return JSON.parse(content) as Partial<AutomationRule>;
        } catch (err) {
          console.error('Failed to parse OpenAI response:', content);
          return {
            name: 'Parsing Error',
            trigger: { type: 'ERROR', description: 'Failed to parse AI response' },
            actions: []
          };
        }
      }),
      catchError(error => {
        console.error('OpenAI API error:', error);
        return of({
          name: 'API Error',
          trigger: { type: 'ERROR', description: 'OpenAI API error' },
          actions: []
        });
      })
    );
  }
}
