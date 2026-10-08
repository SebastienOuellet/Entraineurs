import { healthController } from "../components/health/health.controller.js";
import { mailController } from "../components/mail/mail.controller.js";
import { userController } from "../components/user/user.controller.js";

/**
 * Agrège les routes de chaque composant et préfixe chacune par /api/<feature>.
 */
export class Routes {
  constructor(server) {
    this.config = server.config;
  }

  routes() {
    return [
      ...healthController.routes.map(this.addAPIUrl("/health")),
      ...mailController.routes.map(this.addAPIUrl("/mail")),
      ...userController.routes.map(this.addAPIUrl("/user"))
    ];
  }

  addAPIUrl = (apiURL) => (route) => {
    const prefix = "/api";
    const cleanedUrl = route.url?.replace(/^\/api/, "") || "";
    const subUrl = cleanedUrl.startsWith("/") ? cleanedUrl : `/${cleanedUrl}`;
    return {
      ...route,
      url: `${prefix}${apiURL}${subUrl}`
    };
  };
}
