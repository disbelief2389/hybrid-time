import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';

let workInterval: number;
let breakInterval: number;
let isWorking = false;
let workStartTime: number;
let workDuration = 0;
let breakDuration = 0;
let resumeMode: "Manual Resume" | "Automatic Resume" = "Manual Resume"; // Default mode

export const startWork = () => {
  if (!isWorking) {
    workStartTime = Date.now() - workDuration;
    workInterval = BackgroundTimer.setInterval(() => {
      workDuration = Date.now() - workStartTime;
      updateDisplay(workDuration);
    }, 1000);
    isWorking = true;
  }
};

export const pauseWork = () => {
  if (isWorking) {
    BackgroundTimer.clearInterval(workInterval);
    isWorking = false;
  }
};

export const takeBreak = () => {
  if (isWorking) {
    BackgroundTimer.clearInterval(workInterval);
    isWorking = false;
    breakDuration = workDuration;
    workDuration = 0;
    let breakStart = Date.now();
    breakInterval = BackgroundTimer.setInterval(() => {
      let timeElapsed = Date.now() - breakStart;
      let timeRemaining = breakDuration - timeElapsed;
      if (timeRemaining <= 0) {
        BackgroundTimer.clearInterval(breakInterval);
        // Play sound in both modes
        const sound = document.getElementById('break-end-sound') as HTMLAudioElement;
        sound.play();
        if (resumeMode === "Automatic Resume") {
          startWork();
        }
      } else {
        updateDisplay(timeRemaining);
      }
    }, 1000);
  }
};

export const resetTimer = () => {
  BackgroundTimer.clearInterval(workInterval);
  BackgroundTimer.clearInterval(breakInterval);
  isWorking = false;
  workStartTime = 0;
  workDuration = 0;
  breakDuration = 0;
  updateDisplay(0);
  resumeMode = "Manual Resume";
};

const updateDisplay = (time: number) => {
  let minutes = Math.floor(time / 60000);
  let seconds = Math.floor((time % 60000) / 1000);
  document.getElementById('time-display')!.innerText =
    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
};

export const toggleResumeMode = () => {
  if (resumeMode === "Manual Resume") {
    resumeMode = "Automatic Resume";
    document.getElementById('toggle-resume-btn')!.innerText = "Automatic Resume";
    document.getElementById('mode-indicator')!.innerText = "Mode: Automatic Resume";
  } else {
    resumeMode = "Manual Resume";
    document.getElementById('toggle-resume-btn')!.innerText = "Manual Resume";
    document.getElementById('mode-indicator')!.innerText = "Mode: Manual Resume";
  }
};