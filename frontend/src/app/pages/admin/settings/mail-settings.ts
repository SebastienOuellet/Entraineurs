import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthStore } from "../../../core/auth/auth.store";
import { MailService } from "../../../core/services/mail.service";
import { MailStatus, MailTestResult } from "../../../core/models/mail.model";
import { SettingsTabs } from "./settings-tabs/settings-tabs";

@Component({
  selector: "app-mail-settings",
  imports: [FormsModule, SettingsTabs],
  templateUrl: "./mail-settings.html"
})
export class MailSettings implements OnInit {
  private readonly mailService = inject(MailService);
  private readonly authStore = inject(AuthStore);

  readonly status = signal<MailStatus | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly sending = signal(false);
  readonly result = signal<MailTestResult | null>(null);
  readonly sendError = signal<string | null>(null);

  recipient = this.authStore.dbUser()?.Email ?? "";

  async ngOnInit(): Promise<void> {
    try {
      this.status.set(await this.mailService.getStatus());
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async sendTest(): Promise<void> {
    this.sending.set(true);
    this.result.set(null);
    this.sendError.set(null);
    try {
      this.result.set(await this.mailService.sendTest(this.recipient.trim()));
    } catch (e) {
      this.sendError.set((e as Error).message);
    } finally {
      this.sending.set(false);
    }
  }
}
