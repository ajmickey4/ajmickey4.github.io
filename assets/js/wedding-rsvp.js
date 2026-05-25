const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTukjpKWRKg-CAFhxurDMI_ozUF_SlVhZgH8ulDOhxKtFC173lTLv8Fs7pKsNt4q_o/exec";
const RSVP_CUTOFF = new Date(2026, 9, 18, 23, 59, 59); // October 18, 2026 at 11:59:59 PM

$(document).ready(function () {
    const $formTitle = $("#form_title");
    const $searchSection = $("#rsvp_search_section");
    const $notFoundSection = $("#rsvp_not_found_section");
    const $submitSection = $("#rsvp_submit_section");
    const $closedSection = $("#rsvp_closed_section");
    const $guestListContainer = $("#rsvp_guest_list_container");
    const $dueMessage = $("#rsvp_due_message");
    const $allergyInfoSection = $("#allergy_info_section");
    const $allergyInfo = $("#allergy_info");
    const $status = $("#status");

    let currentPartyId = null;

    function isRsvpOpen() {
        return new Date() < RSVP_CUTOFF;
    }

    function showClosedState() {
        $searchSection.hide();
        $notFoundSection.hide();
        $submitSection.hide();
        $formTitle.text("");
        $status.text("");
        $dueMessage.hide();
        $allergyInfoSection.hide();
        $closedSection.fadeIn();
    }

    function updateAllergySectionVisibility() {
        const hasAttendingGuest = $guestListContainer.find("input[type='checkbox']:checked").length > 0;

        if (hasAttendingGuest) {
            $allergyInfoSection.fadeIn();
            $allergyInfo.prop("required", false);
        } else {
            $allergyInfoSection.hide();
            $allergyInfo.val("");
            $allergyInfo.prop("required", false);
        }
    }

    if (!isRsvpOpen()) {
        showClosedState();
        return;
    }

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
                if (response.closed) {
                    showClosedState();
                    return;
                }

                if (response.error) {
                    $status.text("Error: " + response.error);
                    return;
                }

                if (response.found) {
                    currentPartyId = response.partyId;
                    renderParty(response.guests);
                    if (response.contact) {
                        $("#contact_info").val(response.contact);
                    }
                    if (response.allergyInfo) {
                        $allergyInfo.val(response.allergyInfo);
                    }
                    updateAllergySectionVisibility();
                    $searchSection.hide();
                    $formTitle.text("Fill out RSVP Information");
                    $status.text("");
                    $dueMessage.text("To RSVP YES to the wedding, please check the box under 'Attending?' next to your name. If you are not attending, no need to check the box! You can also provide contact information and allergy information (if applicable) before submitting.").show();
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

            $guestListContainer.find("input[type='checkbox']").on("change", updateAllergySectionVisibility);
    }

    $(".rsvp-submit").on("submit", function (e) {
        e.preventDefault();
        $status.html("Sending RSVP... <i class='fa-solid fa-spinner fa-spin'></i>");
        $submitSection.hide();
        $dueMessage.hide();
        $formTitle.hide();

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
        params.append("allergyInfo", $allergyInfo.val());
        params.append("attendance", JSON.stringify(attendance));
        params.append("origin", window.location.origin);
        

        fetch(SCRIPT_URL, {
            method: "POST",
            body: params
        })
            .then(response => response.json())
            .then(response => {
                if (response.closed) {
                    showClosedState();
                    return;
                }

                if (response.success) {
                    $status.html("RSVP saved! Thank you! <i class='fa-solid fa-heart'></i>");
                    $dueMessage.text("If you need to update your RSVP, please due so before December 18, 2026.").show();
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