tinymce.init({
  selector: "textarea",
  theme: "silver",
  paste_data_images: true,
  plugins: ["advlist", "searchreplace", "insertdatetime", "emoticons", "image"],
  toolbar1:
    "undo redo | bold italic | alignleft aligncenter alignright alignjustify |outdent indent |image",
  toolbar2: "print | forecolor backcolor emoticons",
});

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  // scroll to top
  // Get the button
  const myButton = $(".scroll-to-top");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    myButton.css("display", "block");
  } else {
    myButton.css("display", "none");
  }
};
$(".scroll-to-top").on("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("#logout").click(function () {
  $("#logoutModal").modal("show");
})
function logout() {
  $.ajax({
    url: "/api/v1/users/logout",
    method: "GET",
    success: () => {
      window.location = "/login";
    },
  });
}
