let map = null;
let marker;

function setMapPosition(lng, lat) {
  if (!map) {
    map = L.map("map").setView([0, 0], 13);
    // Sử dụng dịch vụ bản đồ OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    $("#map").css("height", "300px");
    let location = { lng, lat };
    if (marker) {
      marker.remove();
    }
    marker = L.marker(location).addTo(map);
    map.setView(location, 17);
  }
}
function geocodeAddress() {
  const address = $("#address").val();
  if (!address) {
    showAlert("error", "Vui lòng nhập địa chỉ");
    return;
  }
  if (!map) {
    map = L.map("map").setView([0, 0], 13);
    // Sử dụng dịch vụ bản đồ OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    $("#map").css("height", "300px");
  }
  let geocoder = L.Control.Geocoder.nominatim();
  geocoder.geocode(address, function (results) {
    if (results.length > 0) {
      let location = results[0].center;
      let latitude = location.lat;
      let longitude = location.lng;
      if (marker) {
        marker.remove();
      }

      marker = L.marker(location).addTo(map);
      $("#latitude").val(latitude);
      $("#longitude").val(longitude);
      map.setView(location, 17);
    } else {
      showAlert("error", "Không tìm thấy địa chỉ này");
    }
  });
}
const loadData = async () => {
  try {
    $("#sample_data").DataTable({
      processing: true,
      serverSide: true,
      serverMethod: "get",
      ajax: {
        url: "api/v1/locations/get-table-locations",
      },
      columns: [
        {
          data: "name",
          render: function (data) {
            return '<div class= "my-3">' + data ?? "Chưa có dữ liệu" + "</div>";
          },
        },
        {
          data: "address",
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
  $("#dynamic_modal_title").text("Add Location");
  $("#sample_form")[0].reset();
  $("#action").val("Add");
  $(".map-container").empty();
  $(".map-container").append(`<div id="map"></div>`);
  map = null;
  $("#id").val("");

  $("#action_button").text("Add");
  $("#action_modal").modal("show");
});
$(document).on("click", ".edit", function () {
  const id = $(this).data("id");

  $("#dynamic_modal_title").text("Edit Location");

  $("#action").val("Edit");

  $("#action_button").text("Edit");
  $(".map-container").empty();
  $(".map-container").append(`<div id="map"></div>`);
  map = null;
  $("#action_modal").modal("show");
  $.ajax({
    url: `/api/v1/locations/${id}`,
    method: "GET",
    success: function (data) {
      const location = data.data.data;
      $("#name").val(location.name);
      $("#address").val(location.address);
      $("#longitude").val(location.location.coordinates[0]);
      $("#latitude").val(location.location.coordinates[1]);
      $("#id").val(location._id);
      setMapPosition(
        location.location.coordinates[0],
        location.location.coordinates[1]
      );
    },
  });
});

$(document).on("click", ".delete", function () {
  const id = $(this).data("id");

  if (confirm("Are you sure you want to delete this Location?")) {
    try {
      $.ajax({
        url: `/api/v1/locations/${id}`,
        method: "delete",
        success: function (data) {
          showAlert("success", `Delete Location Successfully`);
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
  const name = $("#name").val();
  const address = $("#address").val();
  const longitude = $("#longitude").val();
  const latitude = $("#latitude").val();
  if (!address || !longitude || !latitude) {
    showAlert("error", "Vui lòng nhập đầy đủ thông tin");
    return;
  }
  const data = { name, address, longitude, latitude };
  const id = $("#id").val();
  const url = `/api/v1/locations/${id}`;
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
        showAlert("success", `${action} Location successfully!`);
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
});
