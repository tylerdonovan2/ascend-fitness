const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const workoutId = urlParams.get('workoutId');

let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let exercises = JSON.parse(localStorage.getItem(workoutId)) || [];
document.addEventListener("DOMContentLoaded", () => {
    let workoutEntry;
    workouts.forEach(entry => {
        console.log(entry.id)
        if(entry.id === workoutId) {
            workoutEntry = entry;
        }
    });

    const dateContainer = document.querySelector("#date-container")
    if(workoutEntry) {
        dateContainer.innerHTML = workoutEntry.formattedDate + " • " + workoutEntry.muscleGroups.join(", ");
    }

    const backButton = document.querySelector("#back-button");
    backButton.addEventListener("click", () => {
        window.location.href = ".."
    });
})

function createExerciseEntry(){

}