import express from "express";
import { USERMAN_SERVICE_URL } from "../app.js";

const router = express.Router();

router.get("/usermanagement", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  res.render("userman", { user: user });
});

router.post("/createUser", async (req, res) => {
  console.log(req.body);
  console.log(req.headers.cookie);

  const result = await fetch(`${USERMAN_SERVICE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.cookie || "",
    },
    body: JSON.stringify({
      id: Number(req.body.id),
      full_name: req.body.firstName + " " + req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    }),
  });

  const lo = await result.json();
  console.log(lo.message);
  res.json(lo);
});

export default router;
