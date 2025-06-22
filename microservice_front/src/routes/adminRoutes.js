import express from "express";

const router = express.Router();

router.get("/usermanagement", async (req, res) => {
  res.render("userman", { user: "Belesis" });
});

router.post("/createUser", async (req, res) => {
  console.log(req.body);
  console.log(req.headers.cookie);

  const result = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.cookie || "",
    },
    body: JSON.stringify({
      email: req.body.username,
      password: req.body.password,
    }),
  });

  // console.log(result);
  const lo = await result.json();
  console.log(lo);
  res.json(lo);
  // res.json({ message: "Logged in successfully saved!" });
});

export default router;
