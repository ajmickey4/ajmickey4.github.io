$(document).ready(function () {
    //intitalize progress bar
    
    //get with of carousels and number of images and width of progress bars
    let width = {};
    let num_images = {}
    let bar_width = {}
    let bar_pos = {};
    let entries = {};
    $('.carousel').each(function () {
        let w = $(this).width();
        let n = $(this).find('.carousel-body').find('.entries').children().length;
        width[$(this).attr('id')] = w;
        num_images[$(this).attr('id')] = n;
        entries[$(this).attr('id')] = $(this).find('.carousel-body').find('.entries');

        let b_w = w/n;
        bar_width[$(this).attr('id')] = b_w;
        bar_pos[$(this).attr('id')] = 0;

        $(this).find('.progress-bar').css('width', b_w);

    });

    //on screen resize, update progress bar width
    $(window).resize(function () {
        $('.carousel').each(function () {
            let w = $(this).width();
            let n = $(this).find('.carousel-body').find('.entries').children().length;
            width[$(this).attr('id')] = w;
            num_images[$(this).attr('id')] = n;
            entries[$(this).attr('id')] = $(this).find('.carousel-body').find('.entries');

            let b_w = w/n;
            bar_width[$(this).attr('id')] = b_w;

            $(this).find('.progress-bar').css('width', b_w);
        });
    });


    $('.left-button').click(function () {
        //get parent carousel
        let carousel = $(this).parent().parent().parent();
        //get width of carousel and current scroll position
        let width = carousel.width();
        let entry = entries[carousel.attr('id')];
        let scroll = entry.scrollLeft();

        //if not max left, scroll left
        if (scroll > 5) {
            entry.scrollLeft(scroll - width - 5);

            bar_pos[carousel.attr('id')] -= bar_width[carousel.attr('id')];
            carousel.find('.progress-bar').css('transform', 'translateX(' + bar_pos[carousel.attr('id')] + 'px)');
        }

        /*
        //get width of carousel and current scroll position
        let width = $('#image_carousel').width();
        let scroll = $('#carousel_entries').scrollLeft();

        //if not max left, scroll left
        if (scroll > 5) {
            $('#carousel_entries').scrollLeft(scroll - width - 5);

            bar_pos -= bar_width;
            $('#carousel_progress_bar').css('transform', 'translateX(' + bar_pos + 'px)');
        }
        */
    });

    $('.right-button').click(function () {
        //get parent carousel
        let carousel = $(this).parent().parent().parent();
        //get width of carousel and current scroll position
        let width = carousel.width();
        let entry = entries[carousel.attr('id')];
        let scroll = entry.scrollLeft();

        //if not max right, scroll right
        if (scroll < width * (num_images[carousel.attr('id')] - 1) - 5) {
            entry.scrollLeft(scroll + width + 5);

            bar_pos[carousel.attr('id')] += bar_width[carousel.attr('id')];
            carousel.find('.progress-bar').css('transform', 'translateX(' + bar_pos[carousel.attr('id')] + 'px)');
        }

        /*
        //get width of carousel and current scroll position
        let width = $('#image_carousel').width();
        let scroll = $('#carousel_entries').scrollLeft();

        //if not max right, scroll right
        if (scroll < width * (num_images - 1) - 5) {
            $('#carousel_entries').scrollLeft(scroll + width + 5);

            bar_pos += bar_width;
            $('#carousel_progress_bar').css('transform', 'translateX(' + bar_pos + 'px)');
        }
        */
    });
});