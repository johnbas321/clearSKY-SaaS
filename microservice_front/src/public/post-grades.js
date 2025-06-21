let formData = new FormData();

let gradesState;
if ((window.state = "initial")) {
  gradesState = "init";
} else {
  gradesState = "final";
}

document
  .getElementById("gradesSubmitForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    // need to have init and final here
    if (file) {
      formData.append("file", file);

      try {
        const response = await fetch(`/upload`, {
          method: "POST",
          body: formData,
        });

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
    }
  });

document.getElementById("confirmBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(`/upload-${gradesState}-confirm`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    alert(result.message);

    // Optionally close modal
    const modalEl = document.getElementById("parsingModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
  } catch (err) {
    console.error("Error submitting confirmation:", err);
  }
});
