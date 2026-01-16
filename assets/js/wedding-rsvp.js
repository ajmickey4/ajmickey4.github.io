
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby14RYFSfEMq6PLbRCpoMKBwYNpMNoMTTK2pnolxrNhXOEovG44y5XVuX9V1X54PoYM/exec";

$(document).ready(function () {
    const $formTitle = $("#form_title");
    const $searchSection = $("#rsvp_search_section");
    const $notFoundSection = $("#rsvp_not_found_section");
    const $submitSection = $("#rsvp_submit_section");
    const $guestListContainer = $("#rsvp_guest_list_container");
    const $status = $("#status");

    let currentPartyId = null;


    $(document).ready(function () {
        // get name from url param
        const urlParams = new URLSearchParams(window.location.search);
        let firstname = urlParams.get("firstname");
        let lastname = urlParams.get("lastname");
        console.log(firstname, lastname);
        if (firstname && lastname) {
            $("#first_name").val(firstname);
            $("#last_name").val(lastname);
            $("#find_rsvp_form").trigger("submit");;
        }

    });

    $(".rsvp-search").on("submit", function (e) {
        e.preventDefault();
        $status.html("Looking for your invitation... <i class='fa-solid fa-spinner fa-spin'></i>");

        // Collect form data
        const params = new URLSearchParams();
        params.append("action", "lookup");
        params.append("first_name", $("#first_name").val());
        params.append("last_name", $("#last_name").val());
        params.append("origin", window.location.origin);

        fetch(SCRIPT_URL, {
            method: "POST",
            body: params
        })
            .then(response => response.json())
            .then(response => {
                if (response.error) {
                    $status.text("Error: " + response.error);
                    return;
                }

                if (response.found) {
                    currentPartyId = response.partyId;
                    renderParty(response.guests);
                    $searchSection.hide();
                    $formTitle.text("Fill out RSVP Information");
                    $status.text("");
                    $submitSection.fadeIn();
                } else {
                    $searchSection.hide();
                    $status.text("");
                    $notFoundSection.fadeIn();
                }
            })
            .catch(error => {
                console.error("Error:", error);
                $status.html("Unable to connect.");
            });
    });

    function renderParty(guests) {
        $guestListContainer.empty();
        // Header
        $guestListContainer.append(`
                <div>
                   <b>Guest Name</b><b>Attending ?</b>
                </div>
            `);

        guests.forEach(guest => {
            const isChecked = guest.isAttending ? "checked" : "";
            const html = `
                    <label>
                        ${guest.first} ${guest.last}
                        <input type="checkbox" data-row="${guest.row}" ${isChecked} />
                    </label>
                `;
            $guestListContainer.append(html);
        });
    }

    $(".rsvp-submit").on("submit", function (e) {
        e.preventDefault();
        $status.html("Sending RSVP... <i class='fa-solid fa-spinner fa-spin'></i>");

        const attendance = {};
        // Gather checkboxes
        $guestListContainer.find("input[type='checkbox']").each(function () {
            const rowId = $(this).data("row");
            if ($(this).is(":checked")) {
                attendance[rowId] = true;
            }
        });

        const params = new URLSearchParams();
        params.append("action", "submit");
        params.append("partyId", currentPartyId);
        params.append("contact", $("#contact_info").val());
        params.append("attendance", JSON.stringify(attendance));
        params.append("origin", window.location.origin);

        fetch(SCRIPT_URL, {
            method: "POST",
            body: params
        })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    $status.html("RSVP saved! Thank you! <i class='fa-solid fa-heart'></i>");
                    $submitSection.hide();
                    $formTitle.hide();
                } else {
                    console.log(response);
                    $status.text("There was a problem saving your RSVP.");
                    $formTitle.hide();
                }
            })
            .catch(error => {
                console.error("Error:", error);
                $formTitle.hide();
                $status.text("There was a problem saving your RSVP. Please try again.");
            });
    });
});