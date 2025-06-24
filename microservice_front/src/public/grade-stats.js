document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('.btn[data-bs-target="#graphModal"]')
    .forEach((btn) => {
      btn.addEventListener("click", async () => {
        // Example: set hidden fields in the form from button attributes
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

          document.getElementById("graphs").innerHTML = data.html;
          renderAllCharts();
        } catch (error) {
          alert("Error:", error);
        }
      });
    });
});

function renderAllCharts(){
   document.querySelectorAll('.grade-chart').forEach((canvas) => {
    const raw = canvas.dataset.chart;
    const label = canvas.dataset.label;

    try {
      const data = JSON.parse(raw);

      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: label === 'total' ? 'Total Distribution' : label,
            data: Object.values(data),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
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
