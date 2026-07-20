import { Router } from "express";
import {
  createCard,
  listCards,
  getCard,
  updateCard,
  deleteCard,
} from "../controllers/cards-controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", createCard);
router.get("/", listCards);
router.get("/:id", getCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;
