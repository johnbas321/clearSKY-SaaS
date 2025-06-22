import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import cookieParser from "cookie-parser";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { validateToken } from "./middlewares/validateToken.js"; // You'll need to create this

const AUTH_SERVICE_URL = "http://auth:3001";

const upload = multer({ storage: multer.memoryStorage() });

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app and set views directory location
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser

// Remove express-session entirely

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Public routes (no authentication needed)
app.get("/login", async (req, res) => {
  // Check if already logged in
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    // Optional: verify session is still valid
    res.redirect("/gradestatistics");
    return;
  }
  res.render("index", { user: "Belesis" });
});

app.post("/login", async (req, res) => {
  // Check if already logged in
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    res.redirect("/gradestatistics");
    return;
  }

  try {
    const result = await fetch(`${AUTH_SERVICE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: req.body.username,
        password: req.body.password,
      }),
    });

    const result_json = await result.json();

    if (!result.ok) {
      const { message } = result_json;
      res.render("error", { user: "", error: message });
      return;
    }

    // Extract Set-Cookie header from auth service response and forward it
    const setCookieHeader = result.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    res.redirect("/gradestatistics");
  } catch (error) {
    console.error("Login error:", error);
    res.render("error", { user: "", error: "Login failed" });
  }
});

app.get("/logout", async (req, res) => {
  try {
    // Call auth service logout
    await fetch(`${AUTH_SERVICE_URL}/logout`, {
      method: "POST",
      headers: {
        "Cookie": req.headers.cookie || ""
      }
    });
    
    // Clear cookie locally as well
    res.clearCookie('sessionId');
    res.redirect("/login");
  } catch (error) {
    console.error("Logout error:", error);
    res.clearCookie('sessionId');
    res.redirect("/login");
  }
});

// Protected routes - use validateToken middleware
app.use("/admin/", validateToken, adminRoutes);

app.get("/error", validateToken, async (req, res) => {
  res.render("error", {
    user: req.user.userName,
    error: "You are already signed in",
  });
});

app.get("/gradestatistics", validateToken, async (req, res) => {
  res.render("grade-stats", { user: req.user.userName });
});

app.get("/upload-init", validateToken, async (req, res) => {
  res.render("post-grades", { user: req.user.userName, grades: "initial" });
});

app.get("/upload-final", validateToken, async (req, res) => {
  res.render("post-grades", { user: req.user.userName, grades: "final" });
});

app.get("/review-requests", validateToken, async (req, res) => {
  const data = [
    {
      review_id: 1,
      course_name: "Math",
      period: "June",
      student: "Mpelesis",
    },
    {
      review_id: 2,
      course_name: "CS",
      period: "May",
      student: "Bazdekis",
    },
  ];
  res.render("review-requests", { user: req.user.userName, requests: data });
});

app.get("/courses", validateToken, async (req, res) => {
  const data = [
    {
      course_id: 1,
      name: "Math",
      period: "June",
      status: "open",
    },
    {
      review_id: 2,
      name: "CS",
      period: "May",
      status: "closed",
    },
  ];
  res.render("courses", { user: req.user.userName, courses: data });
});

// Protected POST routes
app.post("/upload", validateToken, upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

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

    res.send({ html });
  });
});

app.post("/upload-init-confirm", validateToken, upload.single("file"), async (req, res) => {
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
});

app.post("/upload-final-confirm", validateToken, upload.single("file"), async (req, res) => {
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
});

app.post(
  "/submit-review-response", 
  validateToken,
  upload.single("attachment"),
  async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    res.json({ message: "Response successfully saved!" });
  }
);

app.get("/test", validateToken, async (req, res) => {
  res.render("testpage", { user: req.user.userName });
});

app.get("/dashboard", validateToken, async (req, res) => {
  try {
    res.render("dashboard", { 
      user: req.user.userName, 
      posts: "blah blah" 
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Frontend service listening on port ${PORT}`)
);