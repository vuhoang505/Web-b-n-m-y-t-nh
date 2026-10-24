const err_src = "/images/unnamed.jpg";
let arr_product = [];
let arr_invoice = [];
let arr_stored = [];
const loadData = async () => {
  try {
    $("#sample_data").DataTable({
      processing: true,
      serverSide: true,
      serverMethod: "get",
      columnDefs: [{ width: "40%", targets: 1 }],
      ajax: {
        url: "api/v1/imports/getTableImport",
      },
      columns: [
        {
          data: "user",
          render: function (data) {
            return '<div class= "my-3">' + data.name + "</div>";
          },
        },
        {
          data: "invoice",
          render: function (data) {
            let html = "";
            data.forEach((value, index) => {
              const name =
                value.title.length > 39
                  ? value.title.slice(0, 40) + "..."
                  : value.title;
              html += `<div class= "my-3"> ${name} </div>`;
            });
            return html;
          },
        },
        {
          data: "totalPrice",
          render: function (data) {
            return '<div class= "my-3">' + data + "</div>";
          },
        },
        {
          data: "createdAt",
          render: function (data) {
            const theDate = new Date(Date.parse(data));
            const date = theDate.toLocaleString();
            return '<div class= "my-3">' + date + "</div>";
          },
        },
        {
          data: null,
          render: function (row) {
            let btnView = `<a href="/imports/${row.id}"><button type="button" class="btn btn-primary btn-sm mr-1">View</button></a>`;
            let btnEdit =
              '<button type="button" class="btn btn-primary btn-sm mr-1 edit" data-id="' +
              row.id +
              '"><i class="fa fa-edit"></i></button>';
            let btnDelete =
              '<button type="button" class="btn btn-danger btn-sm delete" data-id="' +
              row.id +
              '"><i class="fa fa-trash-alt"></i></button></div>';
            return `<div class= "my-3">${btnEdit}${btnDelete}${btnView}</div>`;
          },
        },
      ],
    });

    showAlert("success", "Load Data successfully!");
  } catch (err) {
    showAlert("error", err);
  }
};

function reloadData() {
  $("#sample_data").DataTable().ajax.reload();
}

async function loadProducts() {
  await $.ajax({
    url: "/api/v1/products",
    method: "get",
    success: (data) => {
      arr_product = data.data.data;
      arr_product.forEach((value) => {
        const name =
          value.title.length > 39
            ? value.title.slice(0, 40) + "..."
            : value.title;
        $("#invoice_items").append(
          "<option value=" + value.id + ">" + name + "</option>"
        );
      });
    },
  });
}

$("#add_data").click(function () {
  $("#dynamic_modal_title").text("Add Invoice");
  arr_invoice = [];
  $("#invoice_items").val(null).trigger("change");
  $("#action").val("Add");
  $("#id").val("");
  $("#action_button").text("Add");
  $("#action_modal").modal("show");
});

$("#invoice_items").change(async function () {
  $(".list-item").empty();
  //   arr_invoice = [];
  arr_stored = [];
  await $(this)
    .val()
    .forEach(async (value, index) => {
      let data = await arr_product.find((item) => item._id == value);

      const price = Number(((data.price * 70) / 100).toFixed());
      const item = {
        product: value,
        image: data.images[0],
        title: data.title,
        quantity: 1,
        price,
      };
      arr_stored.push(item);
      //   arr_invoice.push(item);
    });

  await arr_stored.forEach(async (value, index) => {
    const data = await arr_invoice.find(
      (item) => item.product == value.product
    );
    if (data != undefined) arr_stored[index] = data;
    const quantity = arr_stored[index].quantity;
    const name =
      value.title.length > 39 ? value.title.slice(0, 40) + "..." : value.title;
    let html =
      `<hr><div class="d-flex"><div class="col-md-2"><img src="` +
      value.image +
      `" alt=""height="65" width="65" onerror="this.src='` +
      err_src +
      `';" style="border-radius: 0.275rem;" ></div><div class="col-md-5 product-name"><p class="mt-1">` +
      name +
      `</p></div><div class="col-md-2 quantity"><input id="` +
      index +
      `" type="number" value="${quantity}"class="form-control quantity-input" min="1" onchange="updateQuantity(this)"> </div><div class="col-md-3 price"> <p id="price` +
      index +
      `" class="my-2" >` +
      value.price * quantity +
      ` VND</p> </div> </div>`;
    $(".list-item").append(html);
  });
  arr_invoice = arr_stored;
});
function updateQuantity(value) {
  const price = Number(
    (
      (arr_invoice[value.id].price * value.value) /
      arr_invoice[value.id].quantity
    ).toFixed()
  );
  arr_invoice[value.id].price = price;
  arr_invoice[value.id].quantity = value.value;
  $(`#price${value.id}`).html(`${price} VND`);
}
$(document).on("click", ".delete", function () {
  const id = $(this).data("id");
  if (confirm("Are you sure you want to delete this invoice?")) {
    try {
      $.ajax({
        url: `/api/v1/imports/${id}`,
        method: "delete",
        success: function (data) {
          showAlert("success", `Delete invoice Successfully`);
          reloadData();
        },
      });
    } catch (error) {
      return showAlert("error", "Đã có lỗi xảy ra");
    }
  }
});
$(document).on("click", ".edit", function () {
  const id = $(this).data("id");

  $("#dynamic_modal_title").text("Edit Invoice");

  $("#action").val("Edit");

  $("#action_button").text("Edit");

  $("#action_modal").modal("show");
  $.ajax({
    url: `/api/v1/imports/${id}`,
    method: "GET",
    success: async function (data) {
      const invoice = data.data.data;
      let arr_id = [];
      await invoice.invoice.forEach((value, index) => {
        arr_id.push(value.product);
      });
      // arr_invoice =invoice.invoice;
      await $("#invoice_items").val(arr_id).trigger("change");
      $("#id").val(invoice._id);
    },
  });
});

$("#action_button").click(async function (e) {
  e.preventDefault();
  const id = $("#id").val();
  // if (id == undefined) id = "";
  let totalPrice = 0;
  await arr_invoice.forEach(function (value, index) {
    totalPrice += value.price;
  });
  const url = `api/v1/imports/${id}`;
  const method = $("#action").val() == "Add" ? "POST" : "PATCH";
  const invoice = JSON.stringify(arr_invoice);
  try {
    await $.ajax({
      url,
      method,
      data: { invoice, totalPrice },
      beforeSend: function () {
        $("#action_button").attr("disabled", "disabled");
      },
      success: (data) => {
        $("#action_button").attr("disabled", false);
        $("#action_modal").modal("hide");
        showAlert("success", `${$("#action").val()} Invoice successfully!`);
        reloadData();
      },
    });
  } catch (error) {
    $("#action_button").attr("disabled", false);
    return showAlert("error", error);
  }
});

$(document).ready(async function () {
  $("select").select2({
    theme: "bootstrap-5",
  });
  $(".navbar-nav li").removeClass("active");
  $(".navbar-nav li")[7].className = "nav-item active";
  loadData();
  await loadProducts();
});
