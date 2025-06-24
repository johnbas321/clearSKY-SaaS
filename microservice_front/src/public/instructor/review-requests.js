document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.btn[data-bs-target="#reviewModal"]')
    .forEach((element) => {
      element.addEventListener("click", async () => {
        document.getElementById("reviewID").value =
          element.getAttribute("review-id");

        document.getElementById(
          "modalPop"
        ).textContent = `${element.getAttribute(
          "course"
        )} | ${element.getAttribute("period")} | ${element.getAttribute(
          "student"
        )}`;
        try {
          const response = await fetch(
            `/instructor/review-requests/student-message`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                review_id: element.getAttribute("review-id"),
              }),
            }
          );

          const data = await response.json();

          console.log(data);

          document.getElementById("studentMessage").innerHTML = data.message;
          // Populate modal content
          // document.getElementById("parsingModalBody").innerHTML = data.html;

          // Show Bootstrap modal
          // const modal = new bootstrap.Modal(
          //   document.getElementById("parsingModal")
          // );
          // modal.show();
        } catch (error) {
          alert("Error:", error);
        }
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
