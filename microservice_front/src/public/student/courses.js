function setModalTitleFromButton(btn) {
  const courseName = btn.getAttribute("name");
  const period = btn.getAttribute("period");
  const modalTitle = document.getElementById("gradesModalTitle");
  if (modalTitle) {
    modalTitle.textContent = `${courseName} (${period})`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.review-btn[data-bs-target="#gradesModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", async function () {
        setModalTitleFromButton(btn); // Set modal title on button click
      });
    });
});

function setModalTitleFromButton2(btn) {
  const courseName = btn.getAttribute("name");
  const period = btn.getAttribute("period");
  const modalTitle = document.getElementById("newReviewModalTitle");
  if (modalTitle) {
    modalTitle.textContent = `New Review Request | ${courseName} (${period})`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.review-btn[data-bs-target="#newReviewModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", async function () {
        setModalTitleFromButton2(btn); // Set modal title on button click
      });
    });
});

function setModalTitleFromButton3(btn) {
  const courseName = btn.getAttribute("name");
  const period = btn.getAttribute("period");
  const modalTitle = document.getElementById("statusModalTitle");
  if (modalTitle) {
    modalTitle.textContent = `Review Request Status | ${courseName} (${period})`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.review-btn[data-bs-target="#statusModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", async function () {
        setModalTitleFromButton3(btn); // Set modal title on button click

        try {
          const response = await fetch(`/student/review-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course_name: btn.getAttribute("name"),
              time_period: btn.getAttribute("period"),
            }),
          });

          console.log("3");
          const data = await response.json();

          document.getElementById("statusModalBody").innerHTML = data.html;
        } catch (error) {
          alert("Error:", error);
        }
      });
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.review-btn[data-bs-target="#gradesModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", async function () {
        const courseId = btn.getAttribute("course-id");
        const period = btn.getAttribute("period");

        try {
          const response = await fetch(`/student/courses/grades`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course_id: courseId,
              time_period: period,
            }),
          });

          const data = await response.json();

          document.getElementById("gradesModalBody").innerHTML = data.html;
        } catch (error) {
          alert("Error:", error);
        }
      });
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.review-btn[data-bs-target="#newReviewModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", function () {
        const reviewForm = document.getElementById("reviewForm");
        if (reviewForm) {
          // Example: set hidden fields in the form from button attributes
          const courseName = btn.getAttribute("name");
          const period = btn.getAttribute("period");
          const state = btn.getAttribute("state");
          const instructorId = btn.getAttribute("instructor-id");

          // console.log(courseName, period, state, instructorId);

          let input = reviewForm.querySelector('input[name="course_name"]');
          if (input) input.value = courseName;
          input = reviewForm.querySelector('input[name="time_period"]');
          if (input) input.value = period;
          input = reviewForm.querySelector('input[name="grade_state"]');
          if (input) input.value = state;
          input = reviewForm.querySelector('input[name="instructor_id"]');
          if (input) input.value = instructorId;
        }
      });
    });
});
