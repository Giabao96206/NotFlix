function updateClock() {
  const now = new Date();
  const daysOfWeek = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  const dayOfWeek = daysOfWeek[now.getDay()];
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const formattedTime = `${dayOfWeek}, ${day}/${month}/${year} - ${hours} giờ ${minutes} phút ${seconds} giây`;
  document.getElementById("clock").textContent = formattedTime;
  setTimeout(updateClock, 1000);
}
updateClock();

// Chart
const rawData = mang;
console.log(rawData);
// 1. Tạo labels (năm)
const labels = Object.keys(rawData).map((year) => `Năm ${year}`);
console.log(labels);
// 2. Lấy danh sách thể loại
const genres = Object.keys(rawData["2020"].counts);
console.log(genres);
// 3. Tạo datasets động
const datasets = genres.map((genre, i) => {
  const colorBase = [
    "rgb(255, 99, 132)",
    "rgb(54, 162, 235)",
    "rgb(255, 206, 86)",
    "rgb(75, 192, 192)",
    "rgb(153, 102, 255)",
    "rgb(201, 203, 207)",
    "rgb(255, 159, 64)",
  ];
  const color = colorBase[i % colorBase.length];

  return {
    label: genre,
    data: Object.values(rawData).map((yearData) => yearData.counts[genre] || 0),
    backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.3)"),
    borderColor: color,
    fill: true,
    tension: 0.4,
  };
});

// 4. Khởi tạo biểu đồ
const ctx = document.getElementById("myChart").getContext("2d");
window.myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: datasets,
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Thống kê thể loại phim theo năm",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x", // Kéo sang trái phải
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "y", // Zoom lên xuống
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượng phim",
        },
      },
      x: {
        title: {
          display: true,
          text: "Năm",
        },
      },
    },
  },
});

//   Biểu đồ cột
// Dữ liệu mẫu theo từng năm
const dataByYear = mang;
const ctxBar = document.getElementById("myBarChart").getContext("2d");

// Khởi tạo biểu đồ chỉ 1 lần
const myBarChart = new Chart(ctxBar, {
  type: "bar",
  data: {
    labels: Object.keys(dataByYear[2024].counts),
    datasets: [
      {
        label: "Số lượng phim năm 2024",
        data: Object.values(dataByYear[2024].counts),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(221, 160, 221, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(221, 160, 221, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Thống kê số lượng phim theo thể loại - Năm 2024",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượng phim",
        },
      },
      x: {
        title: {
          display: true,
          text: "Thể loại",
        },
      },
    },
  },
});

// Cập nhật dữ liệu khi chọn năm mới
document.querySelector("#year").addEventListener("change", function () {
  const selectedYear = this.value;

  // Cập nhật dữ liệu và tiêu đề
  myBarChart.data.datasets[0].data = Object.values(
    dataByYear[selectedYear].counts
  );
  myBarChart.data.datasets[0].label = `Số lượng phim năm ${selectedYear}`;
  myBarChart.options.plugins.title.text = `Thống kê số lượng phim theo thể loại - Năm ${selectedYear}`;
  myBarChart.update();
});
