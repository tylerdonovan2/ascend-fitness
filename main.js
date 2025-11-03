document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.querySelector("body > div > button")
    startButton.addEventListener("click", () => {
        window.location.href = "lift"
    })
}