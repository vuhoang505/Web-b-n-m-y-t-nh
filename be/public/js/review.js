const loadData = async () => {
  try {
    $("#sample_data").DataTable({
      processing: true,
      serverSide: true,
      serverMethod: "get",
      ajax: {
        url: "api/v1/reviews/getTableReview",
      },
      columns: [
        {
          data: "user",
          render: function (data) {
            return '<div class= "my-3">' + data.name + "</div>";
          },
        },
        {
          data: "product",
          render: function (data) {
            return '<div class= "my-3">' + data + "</div>";
          },
        },
        {
          data: "review",
          render: function (data) {
            const value = data.length > 29 ? data.slice(0, 30) + "..." : data;
            return `<div class= "my-3">${value}</div>`;
          },
        },
        {
          data: "rating",
          render: function (data) {
            let html = "";
            for (let i = 0; i < 5; i++) {
              if (i < data) html += '<i class="fas fa-star text-warning"></i>';
              else html += '<i class="fas fa-star"></i>';
            }
            return '<div class= "my-3">' + html + "</div>";
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
              row.id +
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

$(document).on("click", ".edit", function () {
  const id = $(this).data("id");

  $("#dynamic_modal_title").text("Edit Review");

  $("#action").val("Edit");

  $("#action_button").text("Edit");

  $("#action_modal").modal("show");
  $.ajax({
    url: `/api/v1/reviews/${id}`,
    method: "GET",
    success: function (data) {
      const review = data.data.data;
      $("#review").val(review.review);
      $("#rating").val(review.rating).trigger("change");
      $("#id").val(review._id);
    },
  });
});

$(document).on("click", ".delete", function () {
  const id = $(this).data("id");

  if (confirm("Are you sure you want to delete this Review?")) {
    try {
      $.ajax({
        url: `/api/v1/reviews/${id}`,
        method: "delete",
        success: function (data) {
          showAlert("success", `Delete review Successfully`);
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
  const data = { review: $("#review").val(), rating: $("#rating").val() };
  const id = $("#id").val();
  const url = `/api/v1/reviews/${id}`;
  try {
    await $.ajax({
      url,
      method: "patch",
      data,
      beforeSend: function () {
        $("#action_button").attr("disabled", "disabled");
      },
      success: (data) => {
        $("#action_button").attr("disabled", false);
        $("#action_modal").modal("hide");
        showAlert("success", `Edit Review successfully!`);
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
  $(".navbar-nav li")[4].className = "nav-item active";
});
