import { Component, computed, input } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-status-badge',
  imports: [...HlmBadgeImports],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'info'>('neutral');

  readonly className = computed(() => {
    const tones: Record<'neutral' | 'success' | 'warning' | 'danger' | 'info', string> = {
      neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      danger: 'bg-rose-100 text-rose-700 border-rose-200',
      info: 'bg-sky-100 text-sky-700 border-sky-200',
    };

    return tones[this.tone()];
  });
}
