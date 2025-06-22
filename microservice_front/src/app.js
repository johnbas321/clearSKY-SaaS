import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import {
  checkLoggedIn,
  checkNotLoggedIn,
  checkRole,
} from "./middleware/userHandler.js";
import { logRequests } from "./middleware/logging.js";

export const AUTH_SERVICE_URL = "http://localhost:3001"; //"http://auth:3001";
export const GRADES_SERVICE_URL = "http://localhost:3002"; //"http://auth:3001";

const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(logRequests);

app.use("/admin/", checkLoggedIn, checkRole("institution_admin"), adminRoutes);
app.use(
  "/instructor/",
  checkLoggedIn,
  checkRole("instructor"),
  instructorRoutes
);

app.get("/", checkNotLoggedIn, async (req, res) => {
  res.redirect("/login");
});

app.get("/login", checkNotLoggedIn, async (req, res) => {
  res.render("index", { user: "" });
});

app.get("/logout", checkLoggedIn, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/gradestatistics", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  res.render("grade-stats", { user: user });
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

app.post("/login", checkNotLoggedIn, async (req, res) => {
  const result = await fetch(`${AUTH_SERVICE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: req.body.username,
      password: req.body.password,
    }),
    // To include cookies from the auth service in the response:
    credentials: "include",
  });

  const setCookie = result.headers.get("set-cookie");
  const match = result.headers.get("set-cookie").match(/sessionId=([^;]+)/);
  const sessionId = match ? decodeURIComponent(match[1]) : null;
  console.log(setCookie);
  // Note: In Node.js, fetch does not automatically handle cookies between services.
  // You would need to manually forward cookies if you want to maintain the session across services.
  // For example, you could set the cookie in the response to the browser:
  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }

  const result_json = await result.json();

  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: "", error: message });
  }

  const { user } = result_json;

  req.session.isLoggedIn = true;
  req.session.email = user.email;
  req.session.name = user.fullName;
  req.session.role = user.role.toLowerCase();

  res.redirect("/gradestatistics");
});

// post requests

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Frontend service listening on port ${PORT}`)
);
