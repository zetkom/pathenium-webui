import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { Acl, toAcl } from 'app/interfaces/acl.interface';
import { ApiService } from 'app/modules/websocket/api.service';

/**
 * Read-only ACL inspection. No write methods are exposed by this component.
 * Paths must be absolute dataset paths beneath /mnt, not /mnt itself.
 */
@Component({
  selector: 'ix-pathenium',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="pathenium-shell">
      <h1>Pathenium</h1>
      <p>Know Your Files. Understand Your Permissions.</p>
      <p class="notice">Read-only preview. ACL modifications are disabled.</p>

      <section aria-labelledby="inspector-title">
        <h2 id="inspector-title">ACL Inspector</h2>
        <form (ngSubmit)="inspect()">
          <label for="pathenium-path">Dataset or directory path</label>
          <div class="input-row">
            <input id="pathenium-path" name="path" type="text"
              [ngModel]="path()" (ngModelChange)="path.set($event)"
              placeholder="/mnt/pool/dataset" autocomplete="off" />
            <button type="submit" [disabled]="loading()">Inspect ACL</button>
          </div>
        </form>
        @if (loading()) {
          <p role="status">Loading ACL…</p>
        }
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        @if (acl(); as result) {
          <dl>
            <dt>ACL type</dt><dd>{{ result.acltype }}</dd>
            <dt>Owner UID</dt><dd>{{ result.uid }}</dd>
            <dt>Group GID</dt><dd>{{ result.gid }}</dd>
            <dt>Trivial ACL</dt><dd>{{ result.trivial ? 'Yes' : 'No' }}</dd>
            <dt>Entries</dt><dd>{{ result.acl.length }}</dd>
          </dl>
          <h3>Access control entries</h3>
          <pre>{{ aclJson() }}</pre>
        }
      </section>
      <section aria-labelledby="explorer-title">
        <h2 id="explorer-title">Explorer</h2>
        <p>Directory browsing is planned for the next read-only increment.</p>
      </section>
    </div>
  `,
  styles: [`
    .pathenium-shell { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .notice { font-weight: 600; }
    section { margin-top: 24px; }
    label { display: block; margin-bottom: 8px; }
    .input-row { display: flex; gap: 12px; flex-wrap: wrap; }
    input { flex: 1 1 320px; padding: 8px; }
    button { padding: 8px 16px; }
    .error { color: #c62828; }
    dl { display: grid; grid-template-columns: 160px 1fr; gap: 8px; }
    dt { font-weight: 600; }
    dd { margin: 0; }
    pre { overflow: auto; padding: 16px; border: 1px solid currentColor; white-space: pre-wrap; }
  `],
})
export class PatheniumComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly path = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly acl = signal<Acl | null>(null);
  readonly aclJson = signal('');

  inspect(): void {
    const requestedPath = this.path().trim().replace(/\\/g, '/');
    this.acl.set(null);
    this.aclJson.set('');
    this.error.set('');

    // Prevent inspecting the mount root and obvious path traversal.
    if (!/^\/mnt\/[^/]+(?:\/[^/]+)*$/.test(requestedPath)
      || requestedPath.split('/').some((segment) => segment === '.' || segment === '..')) {
      this.error.set('Enter an absolute path below /mnt/pool (without . or .. segments).');
      return;
    }

    this.loading.set(true);
    this.api.call('filesystem.getacl', [requestedPath, true, true]).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
      catchError(() => {
        this.error.set('Unable to read ACL. Check the path and your TrueNAS permissions.');
        return of(null);
      }),
    ).subscribe((result) => {
      if (!result) return;
      const acl = toAcl(result);
      this.acl.set(acl);
      this.aclJson.set(JSON.stringify(acl.acl, null, 2));
    });
  }
}
