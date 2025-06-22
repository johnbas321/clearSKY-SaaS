import express from "express";
import session from "express-session";
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

app.use(
  session({
    secret: "mpelesis",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/admin/", adminRoutes);

app.get("/login", async (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/error");
    return;
  }
  res.render("index", { user: "Belesis" });
});

app.get("/error", async (req, res) => {
  res.render("error", {
    user: req.session.name,
    error: "You are already signed in",
  });
});

// need to integrate this and test
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
      // res.status(200).json({ msg: `Successfully logged out...` });
    }
  });
});

app.get("/gradestatistics", async (req, res) => {
  const { email, name, role } = req.session;
  res.render("grade-stats", { user: name });
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
  if (req.session.isLoggedIn) {
    console.log(req.session.isLoggedIn);
    res.redirect("/error");
    return;
  }
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

  const result_json = await result.json();

  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: "", error: message });
  }

  const { user } = result_json;

  req.session.isLoggedIn = true;
  req.session.email = user.email;
  req.session.name = user.fullName;
  req.session.role = user.role;

  res.redirect("/gradestatistics");
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
