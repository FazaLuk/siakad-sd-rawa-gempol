let studentChart = null;

export function renderStudentChart(labels = [], data = []) {
  const ctx = document.getElementById("studentChart");

  if (!ctx || typeof Chart === "undefined") return;

  if (studentChart) {
    studentChart.destroy();
  }

  studentChart = new Chart(ctx, {
    type: "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Jumlah Siswa",

          data,

          borderRadius: 10,

          backgroundColor: "#2563eb",
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}
