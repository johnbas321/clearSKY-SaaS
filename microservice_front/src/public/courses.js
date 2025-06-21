document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[course-id]").forEach(function (element) {
    element.addEventListener("click", function () {
      // document.getElementById("reviewID").value =
      //   this.getAttribute("review-id");

      document.getElementById("modalTitle").textContent = `${this.getAttribute(
        "course"
      )} | ${this.getAttribute("period")}`;
    });
  });
});
