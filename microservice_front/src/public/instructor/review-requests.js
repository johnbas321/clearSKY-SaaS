document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[review-id]").forEach(function (element) {
    element.addEventListener("click", async () => {
      try {
        const response = await fetch(
          `/instructor/review-requests/student-message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course_id: id,
              time_period: period,
              final: final,
            }),
          }
        );

        const data = await response.json();

        // Populate modal content
        document.getElementById("parsingModalBody").innerHTML = data.html;

        // Show Bootstrap modal
        const modal = new bootstrap.Modal(
          document.getElementById("parsingModal")
        );
        modal.show();
      } catch (error) {
        alert("Error:", error);
      }

      document.getElementById("reviewID").value =
        this.getAttribute("review-id");

      document.getElementById("modalPop").textContent = `${this.getAttribute(
        "course"
      )} | ${this.getAttribute("period")} | ${this.getAttribute("student")}`;
    });
  });
});

document.getElementById("reviewForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the default form submission

  const formData = new FormData(this); // Get form data

  fetch("/submit-review-response", {
    method: "POST",
    body: new FormData(this),
  })
    .then((response) => response.json()) // assuming the backend returns JSON
    .then((data) => {
      // Show success alert
      alert("Response from server: " + data.message);
    })
    .catch((error) => {
      // Show error alert
      alert("An error occurred: " + error.message);
    });
  const modalEl = document.getElementById("reviewModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance.hide();
});

document
  .getElementById("reviewModal")
  .addEventListener("show.bs.modal", function () {
    document.getElementById("reviewForm").reset();
  });
