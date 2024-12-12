// Initialize DOM elements and constants
const inputsContainer = document.getElementById("inputs-container");
const addButton = document.getElementById("add-butt");
const subtractButton = document.getElementById("subb-butt");
const genButton = document.getElementById("gen-button");
const skillToggle = document.getElementById("skill-toggle");
const drawTitleInput = document.getElementById("draw-title-input");
const numberOfTeamsDropdown = document.getElementById("number-of-teams");
const teamsContainer = document.querySelector(".lineups-wrapper");
const teamElements = Array.from(document.querySelectorAll(".team"));
let showSkill = true; // Toggle for skill display

// Function to create a new input row
function createInputRow(index) {
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "input-wrapper";

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "square-butt";
    deleteButton.textContent = "x";
    deleteButton.onclick = () => {
        inputWrapper.remove();
        updatePlaceholders();
    };

    // Text input
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.className = "player-input-box";
    inputField.placeholder = `Player - #${index}`;

    // Dropdown
    const skillDropdown = document.createElement("select");
    skillDropdown.className = "dropdown-skill";
    [1, 2, 3, 4, 5].forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        skillDropdown.appendChild(option);
    });

    // Append elements to wrapper
    inputWrapper.appendChild(deleteButton);
    inputWrapper.appendChild(inputField);
    inputWrapper.appendChild(skillDropdown);

    return inputWrapper;
}

// Function to update placeholders dynamically
function updatePlaceholders() {
    const inputWrappers = inputsContainer.querySelectorAll(".input-wrapper");
    inputWrappers.forEach((wrapper, index) => {
        const inputField = wrapper.querySelector(".player-input-box");
        inputField.placeholder = `Player - #${index + 1}`;
    });
}

// Add input row
function addInputRow() {
    const newIndex = inputsContainer.children.length + 1;
    const newInputRow = createInputRow(newIndex);
    inputsContainer.appendChild(newInputRow);
}

// Remove last input row
function removeLastInputRow() {
    if (inputsContainer.children.length > 0) {
        inputsContainer.removeChild(inputsContainer.lastChild);
        updatePlaceholders();
    }
}

// Adjust the number of player inputs dynamically
function adjustPlayerInputs(numberOfInputs) {
    const currentInputs = inputsContainer.children.length;
    if (currentInputs < numberOfInputs) {
        for (let i = currentInputs; i < numberOfInputs; i++) {
            addInputRow();
        }
    } else if (currentInputs > numberOfInputs) {
        for (let i = currentInputs; i > numberOfInputs; i--) {
            removeLastInputRow();
        }
    }
}

// Initialize inputs on page load
function initializeInputs() {
    adjustPlayerInputs(20); // Default to 20 inputs
}

// Adjust team layout dynamically based on the number of teams
function adjustTeamLayout(numberOfTeams) {
    // Hide all teams initially
    teamElements.forEach(team => {
        team.style.display = "none";
    });

    // Show only the required number of teams
    teamElements.slice(0, numberOfTeams).forEach(team => {
        team.style.display = "flex";
        team.style.margin = ""; // Reset any custom margins
        team.style.flexDirection = "column";
        team.style.alignItems = "center";
        team.style.textAlign = "center"; // Center-align text
    });

    // Layout adjustments
    if (numberOfTeams === 2) {
        teamsContainer.style.flexDirection = "row";
        teamsContainer.style.flexWrap = "wrap";
        teamsContainer.style.gap = "25px";
    } else if (numberOfTeams === 3) {
        teamsContainer.style.flexDirection = "column";
        teamsContainer.style.gap = "20px";
        teamElements[2].style.margin = "0 auto"; // Center the 3rd team
    } else if (numberOfTeams === 4) {
        teamsContainer.style.flexDirection = "column";
        teamsContainer.style.gap = "25px";
    }
}

// Generate balanced teams
function generateTeams() {
    const numberOfTeams = parseInt(numberOfTeamsDropdown.value);
    const players = [];

    // Adjust layout and inputs for the selected number of teams
    adjustTeamLayout(numberOfTeams);

    // Collect player data
    inputsContainer.querySelectorAll(".input-wrapper").forEach(wrapper => {
        const name = wrapper.querySelector(".player-input-box").value.trim();
        const skill = parseInt(wrapper.querySelector(".dropdown-skill").value);

        if (name) {
            players.push({ name, skill });
        }
    });

    // Shuffle players to randomize team selection
    players.sort(() => Math.random() - 0.5);

    // Sort players by skill (highest first)
    players.sort((a, b) => b.skill - a.skill);

    // Create teams
    const teams = Array.from({ length: numberOfTeams }, () => ({ players: [], totalSkill: 0 }));

    players.forEach(player => {
        // Assign player to the team with the lowest total skill
        const team = teams.sort((a, b) => a.totalSkill - b.totalSkill)[0];
        team.players.push(player);
        team.totalSkill += player.skill;
    });

    // Update UI
    teamElements.forEach((teamElement, index) => {
        const team = teams[index];
        let teamRating = teamElement.querySelector("#team-rating");
        const teamNames = teamElement.querySelector(".team-names");

        if (team) {
            // Ensure team rating is above the names
            if (!teamRating) {
                teamRating = document.createElement("p");
                teamRating.id = "team-rating";
                teamElement.prepend(teamRating); // Insert above the names
            }

            // Update team rating and names
            teamRating.textContent = showSkill ? `TR: ${team.totalSkill}` : "";
            teamNames.innerHTML = team.players
                .map(player => (showSkill ? `${player.name} (${player.skill})` : player.name))
                .join("<br>");
        } else {
            // Reset team if no data exists
            if (teamRating) {
                teamRating.remove();
            }
            teamNames.innerHTML = "";
        }
    });

    // Update draw title
    const matchWeek = document.getElementById("match-week");
    matchWeek.textContent = `MW ${drawTitleInput.value || "#"}`;

    // Update button text
    genButton.textContent = "Re-Generate";
}

// Toggle skill and total rating visibility
function toggleSkillVisibility() {
    showSkill = !showSkill; // Toggle the visibility state
    generateTeams(); // Refresh teams with the new visibility setting

    // Set the background of team ratings to none
    teamElements.forEach(teamElement => {
        const teamRating = teamElement.querySelector("#team-rating");
        if (teamRating) {
            teamRating.style.background = showSkill ? "" : "none"; // Reset or remove background
        }
    });
}

// Event listeners
addButton.addEventListener("click", addInputRow);
subtractButton.addEventListener("click", removeLastInputRow);
genButton.addEventListener("click", generateTeams);
skillToggle.addEventListener("click", toggleSkillVisibility);
numberOfTeamsDropdown.addEventListener("change", () => {
    const numberOfTeams = parseInt(numberOfTeamsDropdown.value);
    adjustTeamLayout(numberOfTeams);

    // Adjust the number of player inputs dynamically
    if (numberOfTeams === 3) {
        adjustPlayerInputs(15);
    } else if (numberOfTeams === 4) {
        adjustPlayerInputs(20);
    }
});

// Initialize the page with 4 teams and 20 inputs
numberOfTeamsDropdown.value = "4";
initializeInputs();
adjustTeamLayout(4);

// Cycling images
// Array of image URLs
const images = [
    "images/Azzuri-01.png", // First image
    "images/il rosso-01.png", // Second image
    "images/los blancos-01.png", // Third image
    "images/neri-01.png"  // Add more images if needed
];

let currentIndex = 0; // Track the current image index

// Get the image element
const cycleImage1 = document.getElementById("cycle-image1");
const cycleImage2 = document.getElementById("cycle-image2");
const cycleImage3 = document.getElementById("cycle-image3");
const cycleImage4 = document.getElementById("cycle-image4");

// Function to cycle through images
function cycleThroughImages1() {
    currentIndex = (currentIndex + 1) % images.length; // Move to the next image, looping back to the first
    cycleImage1.src = images[currentIndex]; // Update the image source
}

function cycleThroughImages2() {
    currentIndex = (currentIndex + 1) % images.length; // Move to the next image, looping back to the first
    cycleImage2.src = images[currentIndex]; // Update the image source
}

function cycleThroughImages3() {
    currentIndex = (currentIndex + 1) % images.length; // Move to the next image, looping back to the first
    cycleImage3.src = images[currentIndex]; // Update the image source
}

function cycleThroughImages4() {
    currentIndex = (currentIndex + 1) % images.length; // Move to the next image, looping back to the first
    cycleImage4.src = images[currentIndex]; // Update the image source
}

// Add click event listener
cycleImage1.addEventListener("click", cycleThroughImages1);
cycleImage2.addEventListener("click", cycleThroughImages2);
cycleImage3.addEventListener("click", cycleThroughImages3);
cycleImage4.addEventListener("click", cycleThroughImages4);