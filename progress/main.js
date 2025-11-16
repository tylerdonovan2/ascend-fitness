let dataKeys = JSON.parse(localStorage.getItem("progress")) || {
    "Bench": [],
    "Deadlift": [],
    "Squat": [],
    "Weight": [],
}

const chart = new Chart("progressChart", {
      type: "line",
      data: {
        datasets: [{
            label: "Bench",
            data: dataKeys["Bench"],
            fill: false,
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            }
          }
        }
      }
    });


document.addEventListener("DOMContentLoaded", function() {
    const bubbles = document.querySelectorAll(".bubble");
    const progressSelect = document.getElementById("progressInput");
    progressSelect.value = "Bench"

    bubbles.forEach(bubble => {
      bubble.addEventListener("click", () => {
        const selectedBubbles = Array.from(document.querySelectorAll(".bubble.selected"));
        if (bubble.classList.contains("selected") && selectedBubbles.length === 1) {
          return;
        }
        bubble.classList.toggle("selected");
        const selected = Array.from(document.querySelectorAll(".bubble.selected"))
          .map(b => b.dataset.value);
        progressSelect.value = selected.join(",");
        updateChart();
      });
    });

    const benchInput = document.querySelector("#bench-input")
    const deadliftInput = document.querySelector("#deadlift-input");
    const weightInput = document.querySelector("#bodyweight-input");
    const squatInput = document.querySelector("#squat-input");
    const logButton = document.querySelector("#update-button")
    const logView = document.querySelector("body > div.stat-entry-container.hidden")
    function resetInputs(){
        benchInput.value = dataKeys["Bench"][dataKeys["Bench"].length - 1].y;
        deadliftInput.value = dataKeys["Deadlift"][dataKeys["Deadlift"].length - 1].y;
        weightInput.value = dataKeys["Weight"][dataKeys["Weight"].length - 1].y;
        squatInput.value = dataKeys["Squat"][dataKeys["Squat"].length - 1].y;
    }

    logButton.addEventListener("click", () => {
        resetInputs();
        logView.classList.remove("hidden");

    });

    const updateButton = document.querySelector("#update-stat")
    updateButton.addEventListener("click", () => {
        logView.classList.add("hidden");

        if(benchInput.value != dataKeys["Bench"][dataKeys["Bench"].length - 1].y){
            updateData(benchInput.value, "Bench");
        }
        if(deadliftInput.value != dataKeys["Deadlift"][dataKeys["Deadlift"].length - 1].y){
            updateData(deadliftInput.value, "Deadlift");
        }
        if(weightInput.value != dataKeys["Weight"][dataKeys["Weight"].length - 1].y){
            updateData(weightInput.value, "Weight");
        }
        if(squatInput.value != dataKeys["Squat"][dataKeys["Squat"].length - 1].y){
            updateData(squatInput.value, "Squat");
        }
        updateChart();
    })

    function updateData(value, type){
        const today = new Date().toISOString().split('T')[0];
        dataKeys[type].push({x:today, y: value})
        saveData()
    }

    function updateChart(){
        let selected = progressSelect.value.split(",")
        let sets = []
        for (let i = 0; i < selected.length; i++) {
            let selection = selected[i];
            sets.push({
                label: selection,
                data: dataKeys[selection],
                fill: false,
            })
        }
        chart.data.datasets = sets;
        chart.update()
    }

    const exitUpdateView = document.querySelector("#exit-stat-entry-view")
    exitUpdateView.addEventListener("click", () => {
        resetInputs();
        logView.classList.add("hidden")
    })

})


function saveData(){
    localStorage.setItem("progress", JSON.stringify(dataKeys))
}

function popLast(type){
    dataKeys[type].pop()
    saveData()
}