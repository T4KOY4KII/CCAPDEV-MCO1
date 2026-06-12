$(document).ready(function () {

    //Highlights the active navigation link based on the current page
    var page = window.location.pathname.split("/").pop() || "index.html";
    $(".nav-link").each(function () {
        if ($(this).attr("href") === page) {
            $(this).addClass("active");
        }
    });

});