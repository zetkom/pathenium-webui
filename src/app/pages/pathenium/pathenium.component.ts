import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ix-pathenium',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="pathenium-shell">
      <h1>Pathenium</h1>
      <p>Administrative File Explorer &amp; ACL Inspector</p>
      <p>Read-only foundation. No filesystem modifications are available.</p>
      <section aria-labelledby="pathenium-explorer">
        <h2 id="pathenium-explorer">Explorer</h2>
        <p>Dataset browsing will be connected to the TrueNAS middleware API.</p>
      </section>
      <section aria-labelledby="pathenium-inspector">
        <h2 id="pathenium-inspector">ACL Inspector</h2>
        <p>NFSv4/POSIX ACL inspection will be connected to the TrueNAS middleware API.</p>
      </section>
    </main>
  `,
  styles: [`
    .pathenium-shell { padding: 24px; max-width: 1100px; margin: 0 auto; }
    section { margin-top: 24px; }
  `],
})
export class PatheniumComponent {}
