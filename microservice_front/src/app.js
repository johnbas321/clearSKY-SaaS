import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import {
  checkLoggedIn,
  checkNotLoggedIn,
  checkRole,
} from "./middleware/userHandler.js";
import { logRequests } from "./middleware/logging.js";

export const AUTH_SERVICE_URL = "http://auth:3001"; //"http://auth:3001"; //"http://localhost:3001"; // "http://auth:3001";
export const GRADES_SERVICE_URL = "http://grading:3002"; // "http://localhost:3002"; // "http://grading:3002";
export const REVIEW_SERVICE_URL = "http://review:3003"; //"http://localhost:3003"; // "http://review":3003";
export const STATS_SERVICE_URL = "http://stats:3004"; //"http://localhost:3004"; // "http://stats":3003";
export const USERMAN_SERVICE_URL = "http://userman:3005"; //"http://localhost:3005"; // "http://userman:3005";

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
    secret: process.env.SESSION_SECRET,
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
app.use("/student/", checkLoggedIn, checkRole("student"), studentRoutes);

app.get("/", checkNotLoggedIn, async (req, res) => {
  res.redirect("/login");
});

app.get("/login", checkNotLoggedIn, async (req, res) => {
  res.render("index", { user: "" });
});

// app.get("/logout", checkLoggedIn, async (req, res) => {
//   // check tou basdeki oti epistrefei http 200 kai epistrefw me empty cookie
//   req.session.destroy((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.redirect("/login");
//     }
//   });
// });

app.get("/logout", checkLoggedIn, async (req, res) => {
  const result = await fetch(`${AUTH_SERVICE_URL}/logout`, {
    method: "POST",
    headers: {
      Cookie: req.headers.cookie || "",
    },
    // To include cookies from the auth service in the response:
    credentials: "include",
  });

  const result_json = await result.json();
  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: "", error: message });
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("sessionId", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.redirect("/");
    }
  });
});

app.get("/gradestatistics", checkLoggedIn, async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };

  const result = await fetch(`${GRADES_SERVICE_URL}/grades/courses`, {
    method: "GET",
    headers: {
      Cookie: req.headers.cookie,
    },
  });

  const result_json = await result.json();
  if (!result.ok) {
    console.log(result_json);
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }

  console.log(result_json);
  res.render("grade-stats", { user: user, data: result_json });
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

  const result_json = await result.json();
  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: "", error: message });
    return;
  }

  const setCookie = result.headers.get("set-cookie");
  console.log(setCookie);
  // Note: In Node.js, fetch does not automatically handle cookies between services.
  // You would need to manually forward cookies if you want to maintain the session across services.
  // For example, you could set the cookie in the response to the browser:
  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }

  const { user } = result_json;

  console.log(user);
  req.session.isLoggedIn = true;
  req.session.email = user.email;
  req.session.name = user.fullName;
  req.session.role = user.role;
  req.session.user_id = user.id;

  res.redirect("/gradestatistics");
});

// post requests

// app.post(
//   "/submit-review-response",
//   upload.single("attachment"),
//   async (req, res) => {
//     console.log(req.body);
//     console.log(req.file);
//     res.json({ message: "Response successfully saved!" });
//   }
// );

app.post("/grade-stats/graph", express.json(), async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  console.log(req.body);

  const queryParams = new URLSearchParams({
    course_id: req.body.course_id,
    time_period: req.body.time_period,
    grade_state: req.body.final ? "FINAL" : "OPEN",
  }).toString();

  console.log(`${STATS_SERVICE_URL}/stats?` + queryParams);
  const result = await fetch(`${STATS_SERVICE_URL}/stats?` + queryParams, {
    method: "GET",
    headers: {
      Cookie: req.headers.cookie || "",
    },
  });

  const result_json = await result.json();
  //console.log(result_json);
  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }

  res.render(
    "partials/stats-graphs",
    { distributions: result_json },
    (err, html) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error rendering modal content");
      }
      //console.log(html)
      res.json({ html });
    }
  );
});

app.get("/test", async (req, res) => {
  res.render("testpage", { user: "Belesis" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Frontend service listening on port ${PORT}`)
);
