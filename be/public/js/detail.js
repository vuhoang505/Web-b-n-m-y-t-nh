const changeStatus = async (id, data) => {
  try {
    await $.ajax({
      url: `../api/v1/orders/${id}`,
      method: "PATCH",
      data,
      success: function (data) {
        showAlert("success", "Update Order Status successfully!");
        window.setTimeout(() => {
          window.location.reload();
        }, 500);
      },
    });
  } catch (error) {
    showAlert("error", error);
  }
};
function cancelOrder(value) {
  if (confirm("Are you sure you want to delete this brand?")) {
    const id = $(value).data("id");
    data = { status: "Cancelled" };
    changeStatus(id, data);
  }
}
function acceptOrder(value) {
  if (confirm("Are you sure you want to delete this brand?")) {
    const id = $(value).data("id");
    data = { status: $(value).val() };
    changeStatus(id, data);
  }
}
$(document).ready(function () {
  $(".navbar-nav li").removeClass("active");
  $(".navbar-nav li")[2].className = "nav-item active";
  if ($("#status").val() == "Cancelled") $("#progress-bar").width("0%");
  if ($("#status").val() == "Processed") $("#progress-bar").width("5%");
  if ($("#status").val() == "Waiting Goods") $("#progress-bar").width("35%");
  if ($("#status").val() == "Delivery") $("#progress-bar").width("63%");
  if ($("#status").val() == "Success") $("#progress-bar").width("100%");
});
