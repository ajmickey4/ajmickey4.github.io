$(document).ready(function () {
    //intitalize progress bar

    //get with of carousel
    let width = $('#image_carousel').width();
    //get number of images
    let num_images = $('#carousel_entries').children().length;
    let bar_width = width / num_images;
    let bar_pos = 0;
    //set width of progress bar
    $('#carousel_progress_bar').width(bar_width);


    $('#left_button').click(function () {
        //get width of carousel and current scroll position
        let width = $('#image_carousel').width();
        let scroll = $('#carousel_entries').scrollLeft();

        //if not max left, scroll left
        if (scroll > 5) {
            $('#carousel_entries').scrollLeft(scroll - width - 5);

            bar_pos -= bar_width;
            $('#carousel_progress_bar').css('transform', 'translateX(' + bar_pos + 'px)');
        }

    });

    $('#right_button').click(function () {
        //get width of carousel and current scroll position
        let width = $('#image_carousel').width();
        let scroll = $('#carousel_entries').scrollLeft();

        //if not max right, scroll right
        if (scroll < width * (num_images - 1) - 5) {
            $('#carousel_entries').scrollLeft(scroll + width + 5);

            bar_pos += bar_width;
            $('#carousel_progress_bar').css('transform', 'translateX(' + bar_pos + 'px)');
        }

    });
});