import express from "express";
import multer from "multer";
import { AUTH_SERVICE_URL, GRADES_SERVICE_URL } from "../app.js";
import FormData from "form-data";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/upload-init", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  res.render("post-grades", { user: user, grades: "initial" });
});

router.get("/upload-final", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  res.render("post-grades", { user: user, grades: "final" });
});

// POST requests
router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  console.log(file);
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const result = await fetch(`${GRADES_SERVICE_URL}/grades/upload`, {
    method: "POST",
    body: formData,
    headers: {
      ...formData.getHeaders(),
      cookie: req.headers.cookie || "",
    },
    credentials: "include",
  });

  const result_json = await result.json();

  console.log(result_json);

  const parsedData = {
    courseName: "Math 101",
    examPeriod: "June 2025",
    numberOfGrades: 42,
  };

  res.render("partials/parsing-table", parsedData, (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error rendering modal content");
    }

    res.send({ html }); // Send rendered HTML as response
  });
});

router.post("/upload-init-confirm", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded in frontend" });
  }

  const parsedData = {
    courseName: "Math 101",
    examPeriod: "June 2025",
    numberOfGrades: 42,
  };

  res.json({ message: "Data successfully saved!" });
});

router.post(
  "/upload-final-confirm",
  upload.single("file"),
  async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const parsedData = {
      courseName: "Math 101",
      examPeriod: "June 2025",
      numberOfGrades: 42,
    };

    res.json({ message: "Data successfully saved!" });
  }
);

export default router;
