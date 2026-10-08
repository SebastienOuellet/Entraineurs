/* eslint-disable no-console */
// Donne le rôle admin à un utilisateur déjà connecté une première fois (un nouveau
// compte reçoit le rôle « user », sans aucun accès). À utiliser pour le tout premier
// administrateur ; ensuite, les rôles se gèrent dans l'écran Utilisateurs.
//
// Usage :
//   npm run set-admin                      -> liste les utilisateurs
//   npm run set-admin -- courriel@exemple  -> promeut cet utilisateur

import db from "../models/index.js";
import { USER_ROLES } from "../src/components/user/user.constants.js";

const { User, sequelize } = db;
const email = process.argv[2]?.trim().toLowerCase();

try {
  if (!email) {
    const users = await User.findAll({ attributes: ["Id", "Email", "Name", "Role"], order: [["Id", "ASC"]], raw: true });
    if (users.length === 0) {
      console.log("Aucun utilisateur. Connectez-vous d'abord une fois à l'application, puis relancez.");
    } else {
      console.table(users);
    }
  } else {
    const user = await User.findOne({
      where: sequelize.where(sequelize.fn("lower", sequelize.col("Email")), email)
    });
    if (!user) {
      throw new Error(`Aucun utilisateur avec le courriel ${email}. Il doit s'être connecté une première fois.`);
    }
    await user.update({ Role: USER_ROLES.ADMIN });
    console.log(`${user.Email} est maintenant administrateur.`);
  }
  await sequelize.close();
  process.exit(0);
} catch (error) {
  console.error("Erreur :", error.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
}
