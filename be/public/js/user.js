const err_src = "/images/error-user.jpg";

const loadData = async () => {
  try {
    $("#sample_data").DataTable({
      processing: true,
      serverSide: true,
      serverMethod: "get",
      ajax: {
        url: "api/v1/users/getTableUser",
      },
      columns: [
        {
          data: "avatar",
          render: function (data) {
            return (
              `<img src="` +
              data +
              `" alt=""height="65" width="65" onerror="this.src='` +
              err_src +
              `';" style="border-radius: 0.275rem;" >`
            );
          },
        },
        {
          data: "name",
          render: function (data) {
            const value = data.length > 39 ? data.slice(0, 40) + "..." : data;
            return '<div class= "my-3">' + value + "</div>";
          },
        },
        {
          data: "email",
          render: function (data) {
            return '<div class= "my-3">' + data + "</div>";
          },
        },
        {
          data: "active",
          render: function (data) {
            return '<div class= "my-3">' + data + "</div>";
          },
        },
        {
          data: null,
          render: function (row) {
            let btnBanUser =
              row.active == "ban"
                ? '<button type="button" class="btn btn-warning btn-sm ban" data-id="' +
                  row._id +
                  '"><i class="fa fa-unlock-alt"></i></button>'
                : '<button type="button" class="btn btn-danger btn-sm ban" data-id="' +
                  row._id +
                  '"><i class="fa fa-user-lock"></i></button>';
            let btnEdit =
              '<button type="button" class="btn btn-primary btn-sm mr-1 edit" data-id="' +
              row._id +
              '"><i class="fa fa-edit"></i></button>';
            return `<div class= "my-3">${btnEdit}${btnBanUser}</div>`;
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
  $("#dynamic_modal_title").text("Add User");
  $("#sample_form")[0].reset();
  $("#action").val("Add");
  $("#id").val("");

  $("#action_button").text("Add");
  $("#action_modal").modal("show");
  $(".mb-2").show();
});
$(document).on("click", ".edit", function () {
  const id = $(this).data("id");

  $("#dynamic_modal_title").text("Edit User");

  $("#action").val("Edit");

  $("#action_button").text("Edit");

  $("#action_modal").modal("show");
  $(".mb-2").hide();
  $(".img-show").empty();
  $(".edit-show").show();
  $.ajax({
    url: `/api/v1/users/${id}`,
    method: "GET",
    success: function (data) {
      const user = data.data.data;
      $("#name").val(user.name);
      $("#id").val(user._id);
    },
  });
});

$(document).on("click", ".ban", function () {
  const id = $(this).data("id");
  const data =
    this.children[0].className == "fa fa-user-lock"
      ? { active: "ban" }
      : { active: "active" };
  const action =
    this.children[0].className == "fa fa-user-lock" ? "Ban" : "UnBan";
  if (confirm("Are you sure you want to ban this user?")) {
    try {
      $.ajax({
        url: `/api/v1/users/${id}`,
        method: "patch",
        data,
        success: function (data) {
          showAlert("success", `${action} ${data.data.data.name} Successfully`);
          reloadData();
        },
      });
    } catch (error) {
      return showAlert("error", error.responseJSON.message);
    }
  }
});

$("#sample_form").on("submit", async (e) => {
  e.preventDefault();
  const action = $("#action").val();
  const method = action == "Add" ? "POST" : "PATCH";
  const data =
    action == "Add"
      ? {
          name: $("#name").val(),
          email: $("#email").val(),
          password: $("#password").val(),
          passwordConfirm: $("#passwordConfirm").val(),
        }
      : { name: $("#name").val() };
  const id = $("#id").val();
  const url = id != "" ? `/api/v1/users/${id}` : `/api/v1/users/signup`;
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
        showAlert("success", `${action} User successfully!`);
        if (action == "Add") window.location.reload();
        else reloadData();
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
  $(".navbar-nav li")[1].className = "nav-item active";
});
