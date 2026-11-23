
// ===============================
// MOBILE NAVIGATION
// ===============================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});


// ===============================
// SURVEY ELEMENTS
// ===============================

const surveyForm = document.getElementById("surveyForm");
const successMessage = document.getElementById("successMessage");
const anotherResponse = document.getElementById("anotherResponse");


// ===============================
// GET SAVED RESPONSES
// ===============================

function getResponses() {
    try {
        return JSON.parse(localStorage.getItem("moveYourBodyResponses")) || [];
    } catch (error) {
        console.error("Could not read saved responses:", error);
        return [];
    }
}


// ===============================
// FORM SUBMISSION
// ===============================

surveyForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Verify that all required fields are valid
    if (!surveyForm.checkValidity()) {
        surveyForm.reportValidity();
        return;
    }

    // Get form data
    const formData = new FormData(surveyForm);

    // Get all selected barriers
    const barriers = formData.getAll("barriers");

    // Create a response object
    const response = {
        date: new Date().toLocaleString(),
        name: formData.get("name") || "Anonymous",
        studyLevel: formData.get("year"),
        frequency: formData.get("frequency"),
        duration: formData.get("duration") || "Not specified",
        barriers: barriers.join(", ") || "None selected",
        favoriteActivity: formData.get("activity"),
        participation: formData.get("participation"),
        suggestion: formData.get("suggestion") || "No suggestion"
    };

    // Save response in localStorage
    const responses = getResponses();

    responses.push(response);

    try {
        localStorage.setItem(
            "moveYourBodyResponses",
            JSON.stringify(responses)
        );
    } catch (error) {
        alert("Unable to save your response. Please check your browser storage.");
        console.error(error);
        return;
    }

    // Hide form and show confirmation
    surveyForm.hidden = true;
    successMessage.hidden = false;

    // Display export button for the campaign organizer
    showExportButton();

});


// ===============================
// EXPORT RESPONSES TO CSV
// ===============================

function exportResponses() {

    const responses = getResponses();

    if (responses.length === 0) {
        alert("No responses available.");
        return;
    }

    const headers = [
        "Date",
        "First Name",
        "Study Level",
        "Frequency",
        "Duration",
        "Barriers",
        "Favorite Activity",
        "Campus Participation",
        "Suggestions"
    ];

    // Escape special CSV characters
    function escapeCSV(value) {
        return '"' + String(value ?? "").replace(/"/g, '""') + '"';
    }

    const rows = responses.map(response => [
        response.date,
        response.name,
        response.studyLevel,
        response.frequency,
        response.duration,
        response.barriers,
        response.favoriteActivity,
        response.participation,
        response.suggestion
    ]);

    const csvContent = [
        headers,
        ...rows
    ]
    .map(row => row.map(escapeCSV).join(","))
    .join("\r\n");

    // Create downloadable CSV file
    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = "move-your-body-survey.csv";

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(url);
}


// ===============================
// EXPORT BUTTON
// ===============================

function showExportButton() {

    let exportButton = document.getElementById("exportButton");

    if (!exportButton) {

        exportButton = document.createElement("button");

        exportButton.id = "exportButton";
        exportButton.type = "button";
        exportButton.className = "btn btn-dark";

        exportButton.textContent = "DOWNLOAD SAVED RESPONSES ↓";

        exportButton.style.marginTop = "15px";

        successMessage.appendChild(exportButton);

        exportButton.addEventListener("click", exportResponses);

    }
}


// ===============================
// SUBMIT ANOTHER RESPONSE
// ===============================

anotherResponse.addEventListener("click", () => {

    surveyForm.reset();

    successMessage.hidden = true;
    surveyForm.hidden = false;

    document.getElementById("survey").scrollIntoView({
        behavior: "smooth"
    });

});
