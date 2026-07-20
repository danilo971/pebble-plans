import { Router } from "express";
import {
  createAccount,
  listAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} from "../controllers/accounts-controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", createAccount);
router.get("/", listAccounts);
router.get("/:id", getAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
