let workouts = JSON.parse(localStorage.getItem("workouts")) || [];

document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("#navigation-button-container .nav-button");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.innerText.toLowerCase();
            window.location.href = "../" + page;
        });
    });


    resetWorkoutEntryTable();

    const addWorkoutButton = document.querySelector("#add-button")
    const addWorkoutContainer = document.querySelector("body > div.workout-entry-container")

    addWorkoutButton.addEventListener("click", () => {
        addWorkoutContainer.classList.toggle("hidden")
    })

    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    const bubbles = document.querySelectorAll(".bubble");
    const muscleInput = document.getElementById("muscleGroupsInput");

    bubbles.forEach(bubble => {
      bubble.addEventListener("click", () => {
        bubble.classList.toggle("selected");
        const selected = Array.from(document.querySelectorAll(".bubble.selected"))
          .map(b => b.dataset.value);
        muscleInput.value = selected.join(",");
      });
    });

    const createWorkoutButton = document.querySelector("#create-workout")

    createWorkoutButton.addEventListener("click", (e) => {
        e.preventDefault();

        const date = dateInput.value;
        const muscleGroups = muscleInput.value.split(",").filter(Boolean);

        createWorkoutEntry(date, muscleGroups, 0, 0);

        resetWorkoutEntryView();
        addWorkoutContainer.classList.toggle("hidden")
    })

    const exitWorkoutEntryView = document.querySelector("#exit-workout-entry-view")
    exitWorkoutEntryView.addEventListener("click", () => {
        resetWorkoutEntryView();
        addWorkoutContainer.classList.toggle("hidden")
    })

    function resetWorkoutEntryView() {
        dateInput.value = new Date().toISOString().split('T')[0];
        bubbles.forEach(bubble => bubble.classList.remove("selected"));
        muscleInput.value = "";
    }
});

function createWorkoutEntry(date, muscleGroups){
    const workoutEntry = {
        id: crypto.randomUUID(),
        date: date,
        formattedDate: formatDate(date),
        muscleGroups: muscleGroups,
        volume: 0,
        reps: 0,
    }

    workouts.push(workoutEntry);
    sortWorkouts();
    localStorage.setItem("workouts", JSON.stringify(workouts));
    resetWorkoutEntryTable();
}

function sortWorkouts(){
    workouts.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
}

function resetWorkoutEntryTable(){
    const workoutTable = document.querySelector("body > div.centered-container > div > table > tbody");
    workoutTable.innerHTML = "";

    workouts.forEach(entry => {
      addWorkoutEntryToTable(entry);
    });
}

function addWorkoutEntryToTable(workoutEntry) {
    const workoutTable = document.querySelector("body > div.centered-container > div > table > tbody")

    let tableRow = document.createElement("tr")

    tableRow.appendChild(createElementWithText("td", workoutEntry.formattedDate));
    tableRow.appendChild(createElementWithText("td", workoutEntry.muscleGroups.join(", ")));
    tableRow.appendChild(createElementWithText("td", workoutEntry.volume + "lbs"));
    tableRow.appendChild(createElementWithText("td", workoutEntry.reps + "reps"));

    tableRow.value = workoutEntry.id;

    workoutTable.appendChild(tableRow);

    tableRow.addEventListener("click", () => {
        navigateToWorkoutEntry(workoutEntry.id);
    })
}

function createElementWithText(tag, text) {
    let element = document.createElement(tag);
    element.textContent = text;
    return element;
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${month} ${day}${suffix}, ${year}`;
}

function navigateToWorkoutEntry(workoutId){
    window.location.href = "workout?workoutId=" + workoutId;
}