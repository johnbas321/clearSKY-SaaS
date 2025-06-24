import express from "express";
import multer from "multer";
import { GRADES_SERVICE_URL, REVIEW_SERVICE_URL } from "../app.js";
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

router.get("/review-requests", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  const result = await fetch(`${REVIEW_SERVICE_URL}/reviews/pending-requests`, {
    method: "GET",
    headers: {
      Cookie: req.headers.cookie || "",
    },
  });

  const result_json = await result.json();
  console.log(result_json);
  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }

  res.render("review-requests", { user: user, requests: result_json });
});

router.post(
  "/review-requests/student-message",
  express.json(),
  async (req, res) => {
    console.log(req.body);
    const user = {
      name: req.session.name,
      email: req.session.email,
      role: req.session.role,
    };
    const result = await fetch(
      `${REVIEW_SERVICE_URL}/reviews/request/${req.body.review_id}/message`,
      {
        method: "GET",
        headers: {
          Cookie: req.headers.cookie || "",
        },
      }
    );

    const result_json = await result.json();
    console.log(result_json);
    if (!result.ok) {
      const { message } = result_json;
      res.render("error", { user: user, error: message });
      return;
    }

    res.send({ message: result_json });
  }
);

router.post("/upload-init-confirm", express.json(), async (req, res) => {
  const result = await fetch(
    `${GRADES_SERVICE_URL}/grades/upload/initial/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
      body: JSON.stringify(req.body),
    }
  );

  const result_json = await result.json();
  console.log(result_json);
  if (!result.ok) {
    const { message } = result_json;
    const user = {
      name: req.session.name,
      email: req.session.email,
      role: req.session.role,
    };
    res.render("error", { user: user, error: message });
    return;
  }

  res.json(result_json);
});

router.post("/upload-final-confirm", express.json(), async (req, res) => {
  const result = await fetch(
    `${GRADES_SERVICE_URL}/grades/upload/final/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
      body: JSON.stringify(req.body),
    }
  );

  const result_json = await result.json();
  console.log(result_json);
  if (!result.ok) {
    const user = {
      name: req.session.name,
      email: req.session.email,
      role: req.session.role,
    };
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }

  res.json(result_json);
});

export default router;
