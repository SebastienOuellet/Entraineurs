import { inject, Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { MailStatus, MailTestResult } from "../models/mail.model";

@Injectable({
  providedIn: "root"
})
export class MailService {
  private readonly api = inject(ApiService);

  /** Admin seulement. */
  getStatus(): Promise<MailStatus> {
    return this.api.get<MailStatus>("mail/status");
  }

  /** Admin seulement. Sans destinataire, le test part à l'administrateur connecté. */
  sendTest(to?: string): Promise<MailTestResult> {
    return this.api.post<MailTestResult>("mail/test", to ? { to } : {});
  }
}
