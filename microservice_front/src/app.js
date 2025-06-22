import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/admin/", adminRoutes);

app.get("/", async (req, res) => {
  res.render("index", { user: "Belesis" });
});

app.get("/gradestatistics", async (req, res) => {
  res.render("grade-stats", { user: "Belesis" });
});

app.get("/upload-init", async (req, res) => {
  res.render("post-grades", { user: "Belesis", grades: "initial" });
});

app.get("/upload-final", async (req, res) => {
  res.render("post-grades", { user: "Belesis", grades: "final" });
});

app.get("/review-requests", async (req, res) => {
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
  res.render("review-requests", { user: "Belesis", requests: data });
});

app.get("/courses", async (req, res) => {
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
  res.render("courses", { user: "Belesis", courses: data });
});

app.post("/login", async (req, res) => {
  const result = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  // if fdsaf == instrucotr
  //   redirect /fdsafs
});

// post requests
app.post("/upload", upload.single("file"), async (req, res) => {
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

    res.send({ html }); // Send rendered HTML as response
  });
});

app.post("/upload-init-confirm", upload.single("file"), async (req, res) => {
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

app.post("/upload-final-confirm", upload.single("file"), async (req, res) => {
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
  upload.single("attachment"),
  async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    res.json({ message: "Response successfully saved!" });
  }
);

app.get("/test", async (req, res) => {
  res.render("testpage", { user: "Belesis" });
});

app.get("/dashboard", async (req, res) => {
  try {
    // Fetch from other microservices
    // const [userRes, postsRes] = await Promise.all([
    //   fetch('http://user-service.local/api/user', {
    //     headers: { Authorization: `Bearer ${req.authToken}` }
    //   }),
    //   fetch('http://post-service.local/api/posts')
    // ]);

    // if (!userRes.ok || !postsRes.ok) throw new Error('Service fetch failed');

    // const user = await userRes.json();
    // const posts = await postsRes.json();

    // Render page with data
    user = "Belesis";
    posts = "blah blah";
    res.render("dashboard", { user, posts });
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
