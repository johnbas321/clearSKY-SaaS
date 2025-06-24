document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.btn[data-bs-target="#graphModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", async () => {
        // Example: set hidden fields in the form from button attributes
        console.log("reached");
        const id = btn.getAttribute("course-id");
        const period = btn.getAttribute("course-period");
        const final = btn.getAttribute("course-final");

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

          document.getElementById("gradesModalBody").innerHTML = data.html;
        } catch (error) {
          alert("Error:", error);
        }
      });
    });
});
