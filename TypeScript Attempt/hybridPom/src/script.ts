import { startWork as importedStartWork, pauseWork as importedPauseWork, takeBreak as importedTakeBreak, resetTimer as importedResetTimer, toggleResumeMode as importedToggleResumeMode } from './timer';

let workInterval: NodeJS.Timeout;
let breakInterval: NodeJS.Timeout;
let isWorking = false;
let workStartTime: number;
let workDuration = 0;
let breakDuration = 0;
let resumeMode: "Manual Resume" | "Automatic Resume" = "Manual Resume"; // Default mode

const sound = document.getElementById('break-end-sound') as HTMLAudioElement;

function localStartWork() {
    if (!isWorking) {
        workStartTime = Date.now() - workDuration;
        workInterval = setInterval(() => {
            workDuration = Date.now() - workStartTime;
            updateDisplay(workDuration);
        }, 1000);
        isWorking = true;
    }
}

function pauseWork() {
    if (isWorking) {
        clearInterval(workInterval);
        isWorking = false;
    }
}

function takeBreak() {
    if (isWorking) {
        clearInterval(workInterval);
        isWorking = false;
        breakDuration = workDuration;
        workDuration = 0;
        let breakStart = Date.now();
        breakInterval = setInterval(() => {
            let timeElapsed = Date.now() - breakStart;
            let timeRemaining = breakDuration - timeElapsed;
            if (timeRemaining <= 0) {
                clearInterval(breakInterval);
                sound.play(); // Play sound in both modes
                if (resumeMode === "Automatic Resume") {
                    localStartWork();
                }
            } else {
                updateDisplay(timeRemaining);
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(workInterval);
    clearInterval(breakInterval);
    isWorking = false;
    workStartTime = 0;
    workDuration = 0;
    breakDuration = 0;
    updateDisplay(0);
    // Reset mode to default
    resumeMode = "Manual Resume";
    (document.getElementById('toggle-resume-btn') as HTMLButtonElement).innerText = "Toggle Resume Mode";
    document.getElementById('mode-indicator')!.innerText = "Mode: Manual Resume";
}

function updateDisplay(time: number) {
    let minutes = Math.floor(time / 60000);
    let seconds = Math.floor((time % 60000) / 1000);
    document.getElementById('time-display')!.innerText = 
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function toggleResumeMode() {
    if (resumeMode === "Manual Resume") {
        resumeMode = "Automatic Resume";
        (document.getElementById('toggle-resume-btn') as HTMLButtonElement).innerText = "Automatic Resume";
        document.getElementById('mode-indicator')!.innerText = "Mode: Automatic Resume";
    } else {
        resumeMode = "Manual Resume";
        (document.getElementById('toggle-resume-btn') as HTMLButtonElement).innerText = "Manual Resume";
        document.getElementById('mode-indicator')!.innerText = "Mode: Manual Resume";
    }
}

// Event listeners
document.getElementById('start-btn')!.addEventListener('click', importedStartWork);
document.getElementById('pause-btn')!.addEventListener('click', importedPauseWork);
document.getElementById('break-btn')!.addEventListener('click', importedTakeBreak);
document.getElementById('reset-btn')!.addEventListener('click', importedResetTimer);
document.getElementById('toggle-resume-btn')!.addEventListener('click', importedToggleResumeMode);