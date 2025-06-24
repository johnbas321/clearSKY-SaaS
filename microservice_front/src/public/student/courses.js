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

          const data = await response.json();

          console.log(data);
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

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.review-btn[data-bs-target="#graphModal"]')
    .forEach((btn) => {
      console.log(btn);
      btn.addEventListener("click", async () => {
        // Example: set hidden fields in the form from button attributes
        console.log("reached");
        const id = btn.getAttribute("course-id");
        const period = btn.getAttribute("period");
        const grade_state = btn.getAttribute("course-final");
        const final = grade_state === "FINAL" ? true : false;
        try {
          const response = await fetch(`/grade-stats/graph`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course_id: id,
              time_period: period,
              final: final,
            }),
          });

          const data = await response.json();

          document.getElementById("graphs").innerHTML = data.html;
          renderAllCharts();
        } catch (error) {
          alert("Error:", error);
        }
      });
    });
});

function renderAllCharts() {
  document.querySelectorAll(".grade-chart").forEach((canvas) => {
    const raw = canvas.dataset.chart;
    const label = canvas.dataset.label;

    try {
      const data = JSON.parse(raw);

      new Chart(canvas, {
        type: "bar",
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: label === "total" ? "Total Distribution" : label,
              data: Object.values(data),
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    } catch (err) {
      console.error(`Failed to render chart for ${label}:`, err);
    }
  });
}
