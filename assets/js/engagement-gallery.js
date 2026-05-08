$(document).ready(function () {
    const $galleryContainer = $("#engagement_photos");
    let rowHeights = [0, 0, 0];
    const photoCount=76;
    let renderMode = "desktop";
    let renderGeneration = 0;

    function getRenderMode() {
        if ($(window).width() < 600) {
            return "mobile";
        }

        if ($(window).width() < 900) {
            return "tablet";
        }

        return "desktop";
    }

    // attach event listener to window resize to re-render images on resize
    $(window).on("resize", async function() {
        // determine new render mode based on window width
        const newRenderMode = getRenderMode();

        if(newRenderMode !== renderMode) {
            renderMode = newRenderMode;
            await renderImages();
        }
    });

    renderMode = getRenderMode();
    renderImages();

    async function renderImages() {
        const activeGeneration = ++renderGeneration;
        $galleryContainer.empty(); // clear existing images

        if(renderMode === "mobile") {
            // set grid columns to 1 for mobile
            $galleryContainer.css("grid-template-columns", "1fr");
            // append all images in a single column for mobile
            for(let i=0; i < photoCount; i++) {
                const $img = $(`<img src="https://github.com/ajmickey4/ajmickey4.github.io/releases/download/testGallery/af-mickey-engagement-${i}-s.jpg" class="gallery-photo" alt="Engagement Photo ${i}">`);
                $galleryContainer.append($img);
                setHoverAndClick($img, i);
            }
        } 
        else 
        {
            if (renderMode === "desktop") {
                // set grid columns to 3 for desktop
                $galleryContainer.css("grid-template-columns", "repeat(3, 1fr)");
                
                //create 3 columns for desktop
                for(let i=0; i < 3; i++) {
                    $galleryContainer.append(`<div id="engagement_col_${i}" class="gallery-column"></div>`);
                }
                rowHeights = [0, 0, 0]
            }
            else {
                // set grid columns to 2 for tablet
                $galleryContainer.css("grid-template-columns", "repeat(2, 1fr)");
                //create 2 columns for tablet
                for(let i=0; i < 2; i++) {
                    $galleryContainer.append(`<div id="engagement_col_${i}" class="gallery-column"></div>`);
                }
                rowHeights = [0, 0]
            }


            for(let i=0; i < photoCount; i++) {
                // Find the column with the smallest total height
                const colIndex = rowHeights.indexOf(Math.min(...rowHeights));

                

                // Update the total height for that column getting the rendered height of the image
                const img = new Image();
                img.src = `https://github.com/ajmickey4/ajmickey4.github.io/releases/download/testGallery/af-mickey-engagement-${i}-s.jpg`;
                await img.decode(); // Wait for the image to load and decode to get accurate dimensions
                if (activeGeneration !== renderGeneration) {
                    return;
                }
                rowHeights[colIndex] += img.height;

                // Append the image to that column using already rendered image to avoid re-rendering
                const $img = $(img).addClass("gallery-photo");
                $('#engagement_col_'+colIndex).append($img);
                setHoverAndClick($img, i);               

            }
        }
    }

    
});

function setHoverAndClick($img, index) {
    $img.hover(
        function() {
            this.src = `https://github.com/ajmickey4/ajmickey4.github.io/releases/download/testGallery/af-mickey-engagement-${index}.jpg`;
        },
        function() {
            this.src = `https://github.com/ajmickey4/ajmickey4.github.io/releases/download/testGallery/af-mickey-engagement-${index}-s.jpg`;
        }
    );

    // Click to open full image overlay
    $img.on("click", function() {
        const $overlay = $(`
            <div class="image-overlay">
                <div>
                    <span class="close-btn">&times;</span>
                    <img src="https://github.com/ajmickey4/ajmickey4.github.io/releases/download/testGallery/af-mickey-engagement-${index}.jpg" alt="Engagement Photo ${index}">
                </div>
            </div>
        `);
        $("body").append($overlay);

        //prevent scrolling when overlay is open
        $("body").css("overflow", "hidden");

        //allow closing overlay by clicking close button or clicking outside the image
        $overlay.on("click", function(e) {
            if ($(e.target).is(".close-btn") || $(e.target).is(".image-overlay")) {
                $overlay.remove();

                //restore scrolling when overlay is closed
                $("body").css("overflow", "auto");
            }
        });
    });
}