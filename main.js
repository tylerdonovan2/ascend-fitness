document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.querySelector("#start-button")
    startButton.addEventListener("click", () => {
        console.log("CLICKED!")
        window.location.href = "lift"
    })
})