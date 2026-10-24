let totalRevenue = 0;
let totalInvoice = 0;
let theDay;
let theWeek;
let theYear;
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const oneJan = new Date(currentDate.getFullYear(), 0, 1);
const numberOfDays = Math.floor((currentDate - oneJan) / (24 * 60 * 60 * 1000));
const currentWeek = Math.ceil((numberOfDays - 1) / 7);
const arr_status = [
  {
    status: "Cancelled",
    quantity: 0,
  },
  {
    status: "Processed",
    quantity: 0,
  },
  {
    status: "Waiting Goods",
    quantity: 0,
  },
  {
    status: "Delivery",
    quantity: 0,
  },
  {
    status: "Success",
    quantity: 0,
  },
];
function showChart() {
  $("#myPieChart").remove();
  $("#noData-chart").remove();
  $("#showChartPie").append('<canvas id="myPieChart"><canvas>');
  let ctx = document.getElementById("myPieChart");
  if (
    arr_status[0].quantity == 0 &&
    arr_status[1].quantity == 0 &&
    arr_status[2].quantity == 0 &&
    arr_status[3].quantity == 0 &&
    arr_status[4].quantity == 0
  ) {
    $("#showChartPie").append(
      `<h2 class="text-center" id="noData-chart">Chưa có đơn hàng nào</h2>`
    );
  } else {
    const myPieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          arr_status[0].status,
          arr_status[1].status,
          arr_status[2].status,
          arr_status[3].status,
          arr_status[4].status,
        ],
        datasets: [
          {
            data: [
              arr_status[0].quantity,
              arr_status[1].quantity,
              arr_status[2].quantity,
              arr_status[3].quantity,
              arr_status[4].quantity,
            ],
            backgroundColor: ["red", "orange", "gray", "blue", "green"],
            hoverBackgroundColor: [
              "#dc3545",
              "#ffc107",
              "#adb5bd",
              "#2c9faf",
              "#20c997",
            ],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: "#dddfeb",
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: false,
        },
        cutoutPercentage: 80,
      },
    });
  }
}
async function loadPieChart(dt) {
  try {
    arr_status[0].quantity = 0;
    arr_status[1].quantity = 0;
    arr_status[2].quantity = 0;
    arr_status[3].quantity = 0;
    arr_status[4].quantity = 0;
    let data;
    if (!dt) {
      data = await $.ajax({
        url: "api/v1/orders/countOption",
        method: "POST",
      });
    } else {
      data = await $.ajax({
        url: "api/v1/orders/statusInRange",
        method: "POST",
        data: dt,
      });
    }
    await data.forEach(async (value) => {
      await arr_status.forEach((status) => {
        if (status.status == value._id.status) status.quantity = value.count;
      });
    });
    showChart();
  } catch (error) {
    showAlert("error", "Đã có lỗi xảy ra");
  }
}
$(document).ready(async function () {
  $("select").select2({
    theme: "bootstrap-5",
  });
  $("#dateRange").flatpickr();
  flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
  });
  $(".navbar-nav li").removeClass("active");
  $(".navbar-nav li")[0].className = "nav-item active";
  loadPieChart();
  const countUser = await $.ajax({
    url: "api/v1/users",
    method: "GET",
  });
  const totalRevenue = await $.ajax({
    url: "api/v1/orders/sumOption",
    method: "POST",
  });
  const totalImport = await $.ajax({
    url: "api/v1/imports/sumOption",
    method: "POST",
  });
  const topProduct = await $.ajax({
    url: "api/v1/orders/topProduct",
    method: "POST",
  });
  const topInventory = await $.ajax({
    url: "api/v1/products?sort=-inventory&limit=5",
    method: "GET",
  });
  if (topProduct.length == 0) {
    $("#sell-product").append(
      `<h2 class = "text-center">Chưa có sản phẩm nào </h2>`
    );
  } else {
    topProduct.forEach((value, index) => {
      $("#sell-product")
        .append(`<div class="col-md-1 d-flex text-center align-items-center justify-content-center">
    ${index + 1}
</div>
<div class="col-md-2">
    <img src="${value.image[0]}" onerror="this.src='https://res.cloudinary.com/dbekkzxtt/image/upload/v1668578244/dwxqdvfwehpklx9fzx6l.webp'"
        class="img-fluid" alt="Phone">
</div>
<div class="col-md-7 d-flex text-center align-items-center">
${value.title}
</div>
<div class="col-md-2 d-flex text-center align-items-center justify-content-center">
${value.quantity} sản phẩm
</div>`);
    });
    $("#inventory-product").empty();
    topInventory.data.data.forEach((value, index) => {
      $("#inventory-product")
        .append(`<div class="col-md-1 d-flex text-center align-items-center justify-content-center">
    ${index + 1}
</div>
<div class="col-md-2">
    <img src="${value.images[0]}"
        class="img-fluid" alt="Phone">
</div>
<div class="col-md-7 d-flex text-center align-items-center">
${value.title}
</div>
<div class="col-md-2 d-flex text-center align-items-center justify-content-center">
${value.inventory} sản phẩm
</div>`);
    });
  }
  $("#inventory-product").empty();
  topInventory.data.data.forEach((value, index) => {
    $("#inventory-product")
      .append(`<div class="col-md-1 d-flex text-center align-items-center justify-content-center">
    ${index + 1}
</div>
<div class="col-md-2">
    <img src="${value.images[0]}"
        class="img-fluid" alt="Phone">
</div>
<div class="col-md-7 d-flex text-center align-items-center">
${value.title}
</div>
<div class="col-md-2 d-flex text-center align-items-center justify-content-center">
${value.inventory} sản phẩm
</div>`);
  });
  const a = totalRevenue[0] ? totalRevenue[0].total_revenue : 0;
  const b = totalImport[0] ? totalImport[0].total : 0;
  document.getElementById("totalRevenue").innerHTML =
    Number((a / 1000000).toFixed())
      .toLocaleString()
      .replace(/,/g, ".") + " Triệu VND";
  document.getElementById("totalInvoice").innerHTML =
    Number((b / 1000000).toFixed())
      .toLocaleString()
      .replace(/,/g, ".") + " Triệu VND";
  $("#totalUser").html(countUser.results);
  $("#totalOrder").html(arr_status[4].quantity);
});
async function changeData(e) {
  if (e === "inRange") {
    $("#birthday").val(null);
  } else {
    $("#dateRange").val(null);
    if(e !== "inDay") {
      $("#birthday").val(null);
    }
  }
  let dateFrom;
  let dateTo;
  let data;
  if (e.id == "allYear") {
    loadPieChart();
    const countUser = await $.ajax({
      url: "api/v1/users",
      method: "GET",
    });
    const totalRevenue = await $.ajax({
      url: "api/v1/orders/sumOption",
      method: "POST",
    });
    const totalImport = await $.ajax({
      url: "api/v1/imports/sumOption",
      method: "POST",
    });
    const topProduct = await $.ajax({
      url: "api/v1/orders/topProduct",
      method: "POST",
    });
    const topInventory = await $.ajax({
      url: "api/v1/products?sort=-inventory&limit=5",
      method: "GET",
    });
    $("#sell-product").empty();
    if (topProduct.length == 0) {
      $("#sell-product").append(
        `<h2 class = "text-center">Chưa có sản phẩm nào </h2>`
      );
    } else {
      topProduct.forEach((value, index) => {
        $("#sell-product")
          .append(`<div class="col-md-1 d-flex text-center align-items-center justify-content-center">
      ${index + 1}
  </div>
  <div class="col-md-2">
      <img src="${value.image[0]}"
          class="img-fluid" alt="Phone">
  </div>
  <div class="col-md-7 d-flex text-center align-items-center">
  ${value.title}
  </div>
  <div class="col-md-2 d-flex text-center align-items-center justify-content-center">
  ${value.quantity} sản phẩm
  </div>`);
      });
      $("#inventory-product").empty();
      topInventory.data.data.forEach((value, index) => {
        $("#inventory-product")
          .append(`<div class="col-md-1 d-flex text-center align-items-center justify-content-center">
      ${index + 1}
  </div>
  <div class="col-md-2">
      <img src="${value.images[0]}"
          class="img-fluid" alt="Phone">
  </div>
  <div class="col-md-7 d-flex text-center align-items-center">
  ${value.title}
  </div>
  <div class="col-md-2 d-flex text-center align-items-center justify-content-center">
  ${value.inventory} sản phẩm
  </div>`);
      });
    }
    const a = totalRevenue[0] ? totalRevenue[0].total_revenue : 0;
    const b = totalImport[0] ? totalImport[0].total : 0;
    document.getElementById("totalRevenue").innerHTML =
      Number((a / 1000000).toFixed())
        .toLocaleString()
        .replace(/,/g, ".") + " Triệu VND";
    document.getElementById("totalInvoice").innerHTML =
      Number((b / 1000000).toFixed())
        .toLocaleString()
        .replace(/,/g, ".") + " Triệu VND";
    $("#totalUser").html(countUser.results);
    $("#totalOrder").html(arr_status[4].quantity);
  } else {
    if (e.id == "inYear") {
      //get range in current year
      const currentYear = new Date().getFullYear();
      const firstDay = new Date(currentYear, 0, 1, 23);
      const lastDay = new Date(currentYear, 11, 31, 23);
      dateFrom = firstDay.toISOString().split("T")[0];
      dateTo = lastDay.toISOString().split("T")[0];
    }
    if (e.id == "inMonth") {
      //get range in current month
      const now = new Date(new Date().getTime());
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 23);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23);
      dateFrom = firstDay.toISOString().split("T")[0];
      dateTo = lastDay.toISOString().split("T")[0];
    }
    if (e.id == "inWeek") {
      //get range in current week
      let today = new Date(new Date().getTime());
      const stt = today.getDate() - (today.getDay() == 0 ? 7 : today.getDay());
      const firstDay = new Date(today.setDate(stt + 1));
      const lastDay = new Date(today.setDate(stt + 7));
      firstDay.setHours(23);
      lastDay.setHours(23);
      dateFrom = firstDay.toISOString().split("T")[0];
      dateTo = lastDay.toISOString().split("T")[0];
    }
    if (e == "inDay") {
      const dateInput = $("#birthday").val();
      dateFrom = dateInput;
      dateTo = dateInput;
    }
    if (e == "inRange") {
      const arr = $("#dateRange").val().split(" to ");
      dateFrom = arr[0];
      dateTo = arr[1];
    }
    data = { dateFrom, dateTo };

    loadPieChart(data);
    const totalRevenue = await $.ajax({
      url: "api/v1/orders/sumInRange",
      method: "POST",
      data,
    });
    const revenueValue = totalRevenue[0] ? totalRevenue[0].total_revenue : 0;
    document.getElementById("totalRevenue").innerHTML =
      Number((revenueValue / 1000000).toFixed())
        .toLocaleString()
        .replace(/,/g, ".") + " Triệu VND";

    const totalImport = await $.ajax({
      url: "api/v1/imports/sumInRange",
      method: "POST",
      data,
    });
    let importValue = totalImport[0] ? totalImport[0].total : 0;

    document.getElementById("totalInvoice").innerHTML =
      Number((importValue / 1000000).toFixed())
        .toLocaleString()
        .replace(/,/g, ".") + " Triệu VND";

    const topProduct = await $.ajax({
      url: "api/v1/orders/topProductInRange",
      method: "POST",
      data,
    });
    $("#sell-product").empty();
    if (topProduct.length == 0) {
      $("#sell-product").append(
        `<h2 class = "text-center">Chưa có sản phẩm nào </h2>`
      );
    } else {
      await topProduct.forEach((value, index) => {
        $("#sell-product")
          .append(`<div class="col-md-1 d-flex text-center align-items-center justify-content-center">
      ${index + 1}
  </div>
  <div class="col-md-2">
      <img src="${value.image[0]}"
          class="img-fluid" alt="Phone">
  </div>
  <div class="col-md-7 d-flex text-center align-items-center">
  ${value.title}
  </div>
  <div class="col-md-2 d-flex text-center align-items-center justify-content-center">
  ${value.quantity} sản phẩm
  </div>`);
      });
    }
    $("#totalOrder").html(arr_status[4].quantity);
  }
}

$("#birthday").on("change", function () {
  changeData("inDay");
});
$("#dateRange").on("change", function () {
  if (this.value.includes("to")) {
    changeData("inRange");
  }
});
