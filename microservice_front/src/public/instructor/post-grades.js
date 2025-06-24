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

    if (file) {
      formData.append("file", file);

      try {
        const response = await fetch(`/instructor/upload`, {
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
    const res = await fetch(`/instructor/upload-${gradesState}-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cache_id: document.querySelector("#parsingModalBody input").value,
      }),
    });
    // axios
    //   .post("/instructor/upload-init-confirm", {
    //     cache_id: document.querySelector("#parsingModalBody input").value,
    //   })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });

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
