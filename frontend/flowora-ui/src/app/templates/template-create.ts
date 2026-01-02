import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TemplateStore, TemplatePayload, TypeOption } from '../services/template-store';

@Component({
  selector: 'app-template-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './template-create.html',
  styleUrl: './template-create.scss'
})
export class TemplateCreateComponent {
  private readonly store = inject(TemplateStore);
  private readonly router = inject(Router);

  readonly typeOptions: TypeOption[] = ['Products', 'Materials', 'Spares', 'Assemblies'];

  readonly form = signal({
    templateName: '',
    name: '',
    code: '',
    category: '',
    subCategory: '',
    qty: 1,
    unit: 'no.s',
    importance: 'Normal',
    types: new Set<TypeOption>(['Products']),
    tags: ''
  });

  update<K extends keyof ReturnType<typeof this.form>>(key: K, value: ReturnType<typeof this.form>[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  toggleType(t: TypeOption) {
    const next = new Set(this.form().types);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    this.form.update(f => ({ ...f, types: next }));
  }

  save() {
    const f = this.form();
    const templateName = f.templateName.trim();
    if (!templateName || !f.name.trim() || !f.code.trim()) return;
    const payload: TemplatePayload = {
      name: f.name.trim(),
      code: f.code.trim(),
      category: f.category.trim(),
      subCategory: f.subCategory.trim(),
      qty: f.qty,
      unit: f.unit,
      importance: f.importance,
      types: Array.from(f.types),
      tags: f.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    };
    this.store.addCustomTemplate(templateName, payload);
    this.router.navigate(['/inventory/create'], { queryParams: { template: templateName } });
  }
}
