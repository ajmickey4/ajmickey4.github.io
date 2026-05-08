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
        
        //randomize rotation +- 20 degrees (base is 43 degrees for left side)
        const rotation = 43 + (Math.random() * 40 - 20);
        $cactus.css("transform", "rotate(" + rotation + "deg)");
    } else {
        //randomize rotation +- 20 degrees (base is 317 degrees for right side)
        const rotation = 317 + (Math.random() * 40 - 20);
        $cactus.css("transform", "rotate(" + rotation + "deg)");
    }

    //set opacity to 1 after a short delay to fade in the cactus
    setTimeout(function() {
        $cactus.css("opacity", 1);
    }, 100);
});