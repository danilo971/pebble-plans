import { Router } from "express";
import { health, live, ready } from "../controllers/health-controller.js";

const router = Router();

router.get("/", health);
router.get("/live", live);
router.get("/ready", ready);

export default router;
