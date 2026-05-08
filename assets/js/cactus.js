//get the cactus image and set the side of the screen randomly on page load
$(document).ready(function () {
    const $cactus = $(".cactus-img");

    //get right position from css and convert to number
    const rightPos = parseInt($cactus.css("right").replace("px", ""));

    // randomly choose left or right side of the screen
    const side = Math.random() < 0.5 ? "left" : "right";
    console.log("Cactus side: " + side);

    //change style depending on which side is chosen
    if (side === "left") {
        $cactus.css("right", "");
        $cactus.css("left", rightPos + "px");
        
        //randomize rotation +- 15 degrees (base is 40 degrees for left side)
        const rotation = 40 + (Math.random() * 30 - 15);
        $cactus.css("transform", "rotate(" + rotation + "deg)");
    } else {
        //randomize rotation +- 15 degrees (base is 320 degrees for right side)
        const rotation = 320 + (Math.random() * 30 - 15);
        $cactus.css("transform", "rotate(" + rotation + "deg)");
    }

    //set opacity to 1 after a short delay to fade in the cactus
    setTimeout(function() {
        $cactus.css("opacity", 1);
    }, 100);
});