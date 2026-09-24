import { Directive, TemplateRef, ViewContainerRef, inject, signal, effect } from '@angular/core';

@Directive({
  selector: '[appDialogForm]',
  exportAs: 'appDialogForm',
  standalone: true,
})
export class DialogFormDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private isOpen = signal(false);

  constructor() {
    effect(() => {
      this.viewContainer.clear();
      if (this.isOpen()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
