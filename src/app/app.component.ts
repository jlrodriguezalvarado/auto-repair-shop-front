import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app-taller-mecanico';
  private router = inject(Router);
  private onMessage = (event: MessageEvent) => {
    if (event.data?.type !== 'NOTIFICATION_CLICK') return;
    const url = event.data?.data?.url;
    if (typeof url === 'string' && url) {
      void this.router.navigateByUrl(url);
    }
  };

  ngOnInit(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.onMessage);
    }
  }

  ngOnDestroy(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this.onMessage);
    }
  }
}
