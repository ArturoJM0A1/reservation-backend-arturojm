import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrl: './toast-message.component.css'
})
export class ToastMessageComponent {
  readonly title = input('No se pudo completar la accion');
  readonly message = input.required<string>();
  readonly tone = input<'error' | 'success'>('error');
  readonly dismissed = output<void>();

  protected close(): void {
    this.dismissed.emit();
  }
}
