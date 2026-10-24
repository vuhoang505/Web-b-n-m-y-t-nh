const loadData = async () => {
  try {
    $("#sample_data").DataTable({
      processing: true,
      serverSide: true,
      serverMethod: "get",
      ajax: {
        url: "api/v1/brands/getTableBrand",
      },
      columns: [
        {
          data: "name",
          render: function (data) {
            const value = data.length > 39 ? data.slice(0, 40) + "..." : data;
            return '<div class= "my-3">' + value + "</div>";
          },
        },
        {
          data: null,
          render: function (row) {
            let btnEdit =
              '<button type="button" class="btn btn-primary btn-sm mr-1 edit" data-id="' +
              row._id +
              '"><i class="fa fa-edit"></i></button>';
            let btnDelete =
              '<button type="button" class="btn btn-danger btn-sm delete" data-id="' +
              row._id +
              '"><i class="fa fa-trash-alt"></i></button></div>';
            return `<div class= "my-3">${btnEdit}${btnDelete}</div>`;
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

$("#add_data").click(function () {
  $("#dynamic_modal_title").text("Add Brand");
  $("#sample_form")[0].reset();
  $("#action").val("Add");
  $("#id").val("");

  $("#action_button").text("Add");
  $("#action_modal").modal("show");
});
$(document).on("click", ".edit", function () {
  const id = $(this).data("id");

  $("#dynamic_modal_title").text("Edit Brand");

  $("#action").val("Edit");

  $("#action_button").text("Edit");

  $("#action_modal").modal("show");
  $.ajax({
    url: `/api/v1/brands/${id}`,
    method: "GET",
    success: function (data) {
      const brand = data.data.data;
      $("#name").val(brand.name);
      $("#id").val(brand._id);

    },
  });
});

$(document).on("click", ".delete", function () {
  const id = $(this).data("id");

  if (confirm("Are you sure you want to delete this brand?")) {
    try {
      $.ajax({
        url: `/api/v1/brands/${id}`,
        method: "delete",
        success: function (data) {
          showAlert("success", `Delete brand Successfully`);
          reloadData();
        },
      });
    } catch (error) {
      return showAlert("error", "Đã có lỗi xảy ra");
    }
  }
});

$("#sample_form").on("submit", async (e) => {
  e.preventDefault();
  const action = $("#action").val();
  const method = action == "Add" ? "POST" : "PATCH";
  const data = { name: $("#name").val() };
  const id = $("#id").val();
  const url = `/api/v1/brands/${id}`;
  try {
    await $.ajax({
      url,
      method,
      data,
      beforeSend: function () {
        $("#action_button").attr("disabled", "disabled");
      },
      success: (data) => {
        $("#action_button").attr("disabled", false);
        $("#action_modal").modal("hide");
        showAlert("success", `${action} Brand successfully!`);
        reloadData();
      },
    });
  } catch (error) {
    $("#action_button").attr("disabled", false);
    return showAlert("error", error.responseJSON.message);
  }
});

$(document).ready(function () {
  $("select").select2({
    theme: "bootstrap-5",
  });
  loadData();
  $(".navbar-nav li").removeClass("active");
  $(".navbar-nav li")[5].className = "nav-item active";
});
