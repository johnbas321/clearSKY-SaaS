import express from "express";
import multer from "multer";
import { GRADES_SERVICE_URL } from "../app.js";
import FormData from "form-data";
import axios from "axios";

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
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  formData.getLength(async (err, length) => {
    if (err) {
      console.error("Error calculating content length:", err);
      return;
    }

    axios
      .post(`${GRADES_SERVICE_URL}/grades/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Cookie: req.headers.cookie,
          "Content-Length": length,
        },
      })
      .then((result) => {
        console.log(result.data.data);
        res.render("partials/parsing-table", result.data.data, (err, html) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error rendering modal content");
          }

          res.send({ html });
        });
      })
      .catch((err) => {
        console.error("Upload failed:", err.response?.data || err.message);
        const user = {
          name: req.session.name,
          email: req.session.email,
          role: req.session.role,
        };
        res.render("error", { user: user, error: err.message });
        return;
      });
  });
});

router.post("/upload-init-confirm", express.json(), async (req, res) => {
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
