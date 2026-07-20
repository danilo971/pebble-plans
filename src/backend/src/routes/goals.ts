import { Router } from "express";
import {
  createGoal,
  listGoals,
  getGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goals-controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", createGoal);
router.get("/", listGoals);
router.get("/:id", getGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
