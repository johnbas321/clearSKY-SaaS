import express from "express";
import { GRADES_SERVICE_URL, REVIEW_SERVICE_URL } from "../app.js";

const router = express.Router();

router.get("/courses", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };

  const result = await fetch(`${GRADES_SERVICE_URL}/grades/self/courses`, {
    method: "GET",
    headers: {
      Cookie: req.headers.cookie,
    },
  });

  const result_json = await result.json();
  console.log(result_json);
  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }

  res.render("courses", { user: user, courses: result_json });
});

router.post("/courses/grades", express.json(), async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };
  console.log(req.body);

  const queryParams = new URLSearchParams({
    course_id: req.body.course_id,
    time_period: req.body.time_period,
  }).toString();

  const result = await fetch(
    `${GRADES_SERVICE_URL}/grades/self/grades?` + queryParams,
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

  res.render("partials/courses-grades", result_json, (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error rendering modal content");
    }

    res.send({ html });
  });
});

router.post("/review-request", async (req, res) => {
  const user = {
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
  };

  console.log(req.body);

  // const queryParams = new URLSearchParams({
  //   course_id: req.body.course_id,
  //   time_period: req.body.time_period,
  // }).toString();

  // req.body.grade_state = req.body.grade_state === ? "newValue";

  const result = await fetch(`${REVIEW_SERVICE_URL}/reviews/new/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.cookie || "",
    },
    body: JSON.stringify(req.body),
  });

  const result_json = await result.json();
  console.log(result_json);
  if (!result.ok) {
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }
  res.send(
    `<script>alert('Review request submitted successfully!'); window.location.href='/student/courses';</script>`
  );
  // res.render("partials/courses-grades", result_json, (err, html) => {
  //   if (err) {
  //     console.error(err);
  //     return res.status(500).send("Error rendering modal content");
  //   }

  //   res.send({ html });
  // });
});

router.post("/review-status", express.json(), async (req, res) => {
  console.log(req.body);

  const queryParams = new URLSearchParams({
    course_name: req.body.course_name,
    time_period: req.body.time_period,
    student_id: req.session.user_id,
  }).toString();

  const result = await fetch(
    `${REVIEW_SERVICE_URL}/reviews/status?` + queryParams,
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
    const user = {
      name: req.session.name,
      email: req.session.email,
      role: req.session.role,
    };
    const { message } = result_json;
    res.render("error", { user: user, error: message });
    return;
  }

  res.render("partials/statusModal", result_json, (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error rendering modal content");
    }

    res.send({ html });
  });
});
export default router;
