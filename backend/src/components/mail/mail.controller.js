import * as mailService from "./mail.service.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { mailTestRateLimit } from "../../middlewares/rateLimit.js";
import { USER_ROLES } from "../user/user.constants.js";

const adminOnly = requireRole(USER_ROLES.ADMIN);

const getStatus = async (req, res, next) => {
  try {
    res.status(200).json(mailService.getMailStatus());
  } catch (error) {
    next(error);
  }
};

const sendTest = async (req, res, next) => {
  try {
    res.status(200).json(await mailService.sendTestEmail(req.body?.to, req.user));
  } catch (error) {
    next(error);
  }
};

export const mailController = {
  routes: [
    { method: "GET", url: "/status", middleware: [adminOnly, getStatus], authRequired: true },
    { method: "POST", url: "/test", middleware: [adminOnly, mailTestRateLimit, sendTest], authRequired: true }
  ]
};
