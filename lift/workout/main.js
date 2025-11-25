const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const workoutId = urlParams.get('workoutId');

let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let exercises = JSON.parse(localStorage.getItem(workoutId)) || [];
let selectedExercise;
document.addEventListener("DOMContentLoaded", () => {
    let workoutEntry;
    workouts.forEach(entry => {
        if(entry.id === workoutId) {
            workoutEntry = entry;
        }
    });

    resetWorkoutEntryTable();

    const dateContainer = document.querySelector("#date-container")
    if(workoutEntry) {
        dateContainer.innerHTML = workoutEntry.formattedDate + " • " + workoutEntry.muscleGroups.join(", ");
    }

    const inputExerciseButton = document.querySelector("#add-button")
    const addExerciseContainer = document.querySelector("body > div.exercise-entry-container.hidden")

    inputExerciseButton.addEventListener("click", () => {
        addExerciseContainer.classList.remove("hidden")
    })

    const exercises = ['Barbell Bench Press', 'Smith Machine Barbell Bench Press', 'Incline Barbell Bench Press', 'Smith Machine Incline Barbell Bench Press', 'Decline Barbell Bench Press', 'Smith Machine Decline Barbell Bench Press', 'Dumbbell Bench Press', 'Single-Arm Dumbbell Bench Press', 'Incline Dumbbell Press', 'Single-Arm Incline Dumbbell Press', 'Decline Dumbbell Press', 'Single-Arm Decline Dumbbell Press', 'Chest Fly', 'Incline Chest Fly', 'Cable Fly', 'Resistance Band Cable Fly', 'Low to High Cable Fly', 'Resistance Band Low to High Cable Fly', 'High to Low Cable Fly', 'Resistance Band High to Low Cable Fly', 'Pec Deck Machine', 'Resistance Band Pec Deck Machine', 'Push-Up', 'Incline Push-Up', 'Decline Push-Up', 'Chest Dip', 'Pull-Up', 'Chin-Up', 'Neutral-Grip Pull-Up', 'Lat Pulldown', 'Resistance Band Lat Pulldown', 'Close-Grip Pulldown', 'Resistance Band Close-Grip Pulldown', 'Reverse-Grip Pulldown', 'Resistance Band Reverse-Grip Pulldown', 'Seated Cable Row', 'Resistance Band Seated Cable Row', 'Wide-Grip Cable Row', 'Resistance Band Wide-Grip Cable Row', 'Barbell Row', 'Smith Machine Barbell Row', 'Pendlay Row', 'Smith Machine Pendlay Row', 'Dumbbell Row', 'Single-Arm Dumbbell Row', 'T-Bar Row', 'Smith Machine T-Bar Row', 'Inverted Row', 'Face Pull', 'Resistance Band Face Pull', 'Straight-Arm Pulldown', 'Resistance Band Straight-Arm Pulldown', 'Deadlift', 'Smith Machine Deadlift', 'Rack Pull', 'Smith Machine Rack Pull', 'Overhead Press', 'Smith Machine Overhead Press', 'Seated Overhead Press', 'Smith Machine Seated Overhead Press', 'Dumbbell Shoulder Press', 'Single-Arm Dumbbell Shoulder Press', 'Arnold Press', 'Front Raise', 'Lateral Raise', 'Cable Lateral Raise', 'Resistance Band Cable Lateral Raise', 'Machine Lateral Raise', 'Resistance Band Machine Lateral Raise', 'Rear Delt Fly', 'Cable Rear Delt Fly', 'Resistance Band Cable Rear Delt Fly', 'Upright Row', 'Smith Machine Upright Row', 'Smith Machine Shoulder Press', 'Resistance Band Smith Machine Shoulder Press', 'Push Press', 'Smith Machine Push Press', 'Barbell Curl', 'Smith Machine Barbell Curl', 'EZ-Bar Curl', 'Smith Machine EZ-Bar Curl', 'Dumbbell Curl', 'Single-Arm Dumbbell Curl', 'Alternating Dumbbell Curl', 'Single-Arm Alternating Dumbbell Curl', 'Hammer Curl', 'Incline Dumbbell Curl', 'Single-Arm Incline Dumbbell Curl', 'Concentration Curl', 'Preacher Curl', 'Smith Machine Preacher Curl', 'Cable Curl', 'Resistance Band Cable Curl', 'Rope Hammer Curl', 'Resistance Band Rope Hammer Curl', 'Machine Curl', 'Resistance Band Machine Curl', 'Reverse Curl', 'Smith Machine Reverse Curl', 'Cable Tricep Extension', 'Resistance Band Cable Tricep Extension', 'V-Bar Tricep Pushdown', 'Resistance Band V-Bar Tricep Pushdown', 'Rope Tricep Pushdown', 'Resistance Band Rope Tricep Pushdown', 'Overhead Cable Extension', 'Resistance Band Overhead Cable Extension', 'Dumbbell Overhead Extension', 'Single-Arm Dumbbell Overhead Extension', 'Barbell Skull Crusher', 'Smith Machine Barbell Skull Crusher', 'Dumbbell Kickback', 'Single-Arm Dumbbell Kickback', 'Close-Grip Bench Press', 'Smith Machine Close-Grip Bench Press', 'Bench Dips', 'Machine Tricep Extension', 'Resistance Band Machine Tricep Extension', 'Diamond Push-Up', 'Back Squat', 'Smith Machine Back Squat', 'Front Squat', 'Smith Machine Front Squat', 'Box Squat', 'Smith Machine Box Squat', 'Hack Squat', 'Resistance Band Hack Squat', 'Leg Press', 'Resistance Band Leg Press', 'Walking Lunge', 'Reverse Lunge', 'Bulgarian Split Squat', 'Step-Up', 'Romanian Deadlift', 'Smith Machine Romanian Deadlift', 'Sumo Deadlift', 'Smith Machine Sumo Deadlift', 'Glute Bridge', 'Barbell Hip Thrust', 'Smith Machine Barbell Hip Thrust', 'Leg Extension', 'Resistance Band Leg Extension', 'Seated Leg Curl', 'Resistance Band Seated Leg Curl', 'Lying Leg Curl', 'Resistance Band Lying Leg Curl', 'Standing Calf Raise', 'Resistance Band Standing Calf Raise', 'Seated Calf Raise', 'Resistance Band Seated Calf Raise', 'Crunch', 'Sit-Up', 'Cable Crunch', 'Resistance Band Cable Crunch', 'Plank', 'Side Plank', 'Russian Twist', 'Hanging Leg Raise', 'Knee Raise', 'Ab Wheel Rollout', 'Mountain Climber', 'V-Up', 'Wrist Curl', 'Smith Machine Wrist Curl', 'Reverse Wrist Curl', 'Smith Machine Reverse Wrist Curl', 'Farmer’s Carry', 'Plate Pinch Hold', 'Towel Pull-Up Hold', 'Clean and Press', 'Smith Machine Clean and Press', 'Power Clean', 'Smith Machine Power Clean', 'Snatch', 'Smith Machine Snatch', 'Kettlebell Swing', 'Turkish Get-Up', 'Burpee'];
    const exerciseDatalist = document.querySelector("#exercise-options")

    exercises.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        exerciseDatalist.appendChild(option);
    });


    const backButton = document.querySelector("#back-button");
    backButton.addEventListener("click", () => {
        window.location.href = ".."
    });

    const addExerciseButton = document.querySelector("#add-exercise")
    const exerciseInput = document.querySelector("#exercise-input")
    const setInput = document.querySelector("#set-input")
    const repInput = document.querySelector("#rep-input")
    const weightInput = document.querySelector("#weight-input")

    addExerciseButton.addEventListener("click", () => {
        let exerciseName = exerciseInput.value;
        let setCount = +setInput.value;
        let repCount = +repInput.value;
        let weight = +weightInput.value;

        createExerciseEntry(exerciseName, setCount, repCount, weight);
        resetExerciseEntryView();
        addExerciseContainer.classList.add("hidden")
    })

    const exitExerciseEntryView = document.querySelector("#exit-exercise-entry-view")
    exitExerciseEntryView.addEventListener("click", () => {
        resetExerciseEntryView();
        addExerciseContainer.classList.add("hidden")
    })

    const exerciseDetailView = document.querySelector("#exercise-view-container")
    const exitExerciseDetailView = document.querySelector("#exit-exercise-view")
    exitExerciseDetailView.addEventListener("click", () => {
        exerciseDetailView.classList.add("hidden")
    })

    const deleteExerciseButton = document.querySelector("#delete-exercise")
    deleteExerciseButton.addEventListener("click", () => {
        deleteExerciseEntryById(selectedExercise.id)
        exerciseDetailView.classList.add("hidden")
    })

    const deleteWorkoutButton = document.querySelector("#delete-button")
    deleteWorkoutButton.addEventListener("click", () => {
        deleteWorkoutById(workoutId);
    })

    function resetExerciseEntryView() {
        exerciseInput.value = "";
        setInput.value = "";
        repInput.value = "";
        weightInput.value = "";
    }
})

function createExerciseEntry(exerciseName, setCount, repCount, weight){
    let exerciseEntry = {
        id: crypto.randomUUID(),
        name: exerciseName,
        setCount: setCount,
        repCount: repCount,
        weight: weight,
        totalReps: setCount * repCount,
        volume: setCount * repCount * weight,
    }

    exercises.push(exerciseEntry);

    localStorage.setItem(workoutId, JSON.stringify(exercises));

    resetWorkoutEntryTable();
}


function resetWorkoutEntryTable(){
    const exerciseTable = document.querySelector("body > div.centered-container > div > table > tbody")
    exerciseTable.innerHTML = "";

    exercises.forEach(entry => {
      addExerciseEntryToTable(entry);
    });
}

function addExerciseEntryToTable(exerciseEntry) {
    const exerciseTable = document.querySelector("body > div.centered-container > div > table > tbody")

    let tableRow = document.createElement("tr")

    tableRow.appendChild(createElementWithText("td", exerciseEntry.name));
    tableRow.appendChild(createElementWithText("td", exerciseEntry.setCount));
    tableRow.appendChild(createElementWithText("td", exerciseEntry.repCount));
    tableRow.appendChild(createElementWithText("td", exerciseEntry.weight));

    tableRow.value = exerciseEntry.id;

    tableRow.addEventListener("click", () => {
        showExerciseDetails(exerciseEntry)
    })

    exerciseTable.appendChild(tableRow);
}


const exerciseDetailName = document.querySelector("#exercise-view")
const exerciseDetailSet = document.querySelector("#set-view")
const exerciseDetailRep = document.querySelector("#rep-view")
const exerciseDetailWeight = document.querySelector("#weight-view")
const exerciseDetailTotalRep = document.querySelector("#total-rep-view")
const exerciseDetailVolume = document.querySelector("#volume-view")
function showExerciseDetails(entry){
    let exerciseDetailView = document.querySelector("#exercise-view-container")
    exerciseDetailView.classList.remove("hidden")

    selectedExercise = entry;

    exerciseDetailName.textContent = entry.name;
    exerciseDetailSet.textContent = entry.setCount;
    exerciseDetailRep.textContent = entry.repCount;
    exerciseDetailWeight.textContent = entry.weight  + "lbs";
    exerciseDetailTotalRep.textContent = entry.totalReps;
    exerciseDetailVolume.textContent = entry.volume + "lbs";
}

function createElementWithText(tag, text) {
    let element = document.createElement(tag);
    element.textContent = text;
    return element;
}

function deleteExerciseEntryById(exerciseId){
    exercises = exercises.filter(exercise => exercise.id !== exerciseId)

    localStorage.setItem(workoutId, JSON.stringify(exercises));

    resetWorkoutEntryTable();
}

function deleteWorkoutById(workoutId){
    if(confirm("Are you sure you want to delete this workout?")){
        workouts = workouts.filter(workout => workout.id !== workoutId)
        exercises = []

        localStorage.setItem(workoutId, JSON.stringify(exercises));
        localStorage.setItem("workouts", JSON.stringify(workouts));

        window.location.href = ".."
    }
}


