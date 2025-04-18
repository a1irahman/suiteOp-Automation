import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleCreatorComponent } from './rule-creator.component';

describe('RuleCreatorComponent', () => {
  let component: RuleCreatorComponent;
  let fixture: ComponentFixture<RuleCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleCreatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RuleCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
