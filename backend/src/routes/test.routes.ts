import { Router } from "express";
import { pool } from "../db/connection";

const router = Router();

router.get("/ping", async (req, res) => {
  const now = await pool.query("SELECT NOW()");
  res.json({ ok: true, now: now.rows[0] });
});

export default router;
