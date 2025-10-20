// kalkylera äggkokningstid
const sizeTimes = { S: 3, M: 5, L: 7 };
const tempMultipliers = { soft: 0.9, medium: 1.0, hard: 1.2 };

// Hämta justering från localStorage
function getCookingAdjustment(size, temp) {
  const key = `adjustment_${size}_${temp}`;
  const val = localStorage.getItem(key);
  const num = val !== null ? parseInt(val, 10) : NaN;
  return isNaN(num) ? 0 : num;
}

// Spara justering i localStorage
function setCookingAdjustment(size, temp, adjustment) {
  const key = `adjustment_${size}_${temp}`;
  localStorage.setItem(key, String(adjustment));
}

// Uppdatera visad koktid baserat på val och justering
function updateCookingTime() {
  const selectedSizeBtn = document.querySelector(
    "#buttonsSize .cookingButton.selected"
  );
  const selectedTempBtn = document.querySelector(
    "#buttonsTemp .cookingButton.selected"
  );

  if (!selectedSizeBtn || !selectedTempBtn) return;

  const size = selectedSizeBtn.textContent.trim();
  const temp = selectedTempBtn.textContent.trim();
  const baseTime = sizeTimes[size];
  const multiplier = tempMultipliers[temp];
  if (baseTime === undefined || multiplier === undefined) return;

  let totalTime = baseTime * multiplier;
  const adjustment = getCookingAdjustment(size, temp);
  totalTime = totalTime * 60 + adjustment;
  if (totalTime < 0) totalTime = 0;

  const minutes = Math.floor(totalTime / 60);
  const seconds = Math.round(totalTime % 60);
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  document.getElementById("countdownText").textContent = formattedTime;
}

// Ställ in klickhantering för en knappgrupp (storlek eller temperatur)
function setupButtonGroup(containerId) {
  const buttons = document.querySelectorAll(`#${containerId} .cookingButton`);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      updateCookingTime();
    });
  });
}

// Initiera knappgrupper
setupButtonGroup("buttonsSize");
setupButtonGroup("buttonsTemp");

const startButton = document.getElementById("startButton");
let countdownInterval = null;
let totalSeconds = 0;

// Visa eller göm storlek- och temperaturknappar
function showSizeTempButtons(show) {
  const sizeButtons = document.querySelectorAll("#buttonsSize .cookingButton");
  const tempButtons = document.querySelectorAll("#buttonsTemp .cookingButton");
  sizeButtons.forEach((btn) => (btn.style.display = show ? "" : "none"));
  tempButtons.forEach((btn) => (btn.style.display = show ? "" : "none"));
}

// Återställ gränssnittet till startläge
function resetToInitialState() {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  updateCookingTime();

  const buttonsAction = document.getElementById("buttonsAction");

  // Ta bort eventuella extra knappar och element
  ["continueButton", "stopButton", "pauseButton", "completeButton"].forEach(
    (id) => {
      const btn = document.getElementById(id);
      if (btn && btn.parentNode === buttonsAction) {
        buttonsAction.removeChild(btn);
      }
    }
  );

  const alarmDiv = document.getElementById("alarmEmoji");
  if (alarmDiv) alarmDiv.remove();

  const feedbackPopup = document.getElementById("feedbackPopup");
  if (feedbackPopup) feedbackPopup.remove();

  // Lägg tillbaka startknappen
  if (!buttonsAction.contains(startButton)) {
    buttonsAction.appendChild(startButton);
  }
  startButton.id = "startButton";
  startButton.className = "";
  startButton.textContent = "start";

  showSizeTempButtons(true);

  document.getElementById("eggImage").classList.remove("egg-blur");
}

// Startknappens klickhantering
startButton.addEventListener("click", () => {
  const selectedSizeBtn = document.querySelector(
    "#buttonsSize .cookingButton.selected"
  );
  const selectedTempBtn = document.querySelector(
    "#buttonsTemp .cookingButton.selected"
  );
  if (!selectedSizeBtn || !selectedTempBtn) return;

  const timeStr = document.getElementById("countdownText").textContent.trim();
  const [minStr, secStr] = timeStr.split(":");
  if (!minStr || !secStr) return;

  const minutes = parseInt(minStr, 10);
  const seconds = parseInt(secStr, 10);
  if (isNaN(minutes) || isNaN(seconds)) return;

  totalSeconds = minutes * 60 + seconds;
  if (totalSeconds <= 0) return;

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
  }

  const buttonsAction = document.getElementById("buttonsAction");
  buttonsAction.removeChild(startButton);

  const pauseButton = document.createElement("button");
  pauseButton.id = "pauseButton";
  pauseButton.className = "pauseButton";
  pauseButton.textContent = "Pause";
  buttonsAction.appendChild(pauseButton);

  showSizeTempButtons(false);
  document.getElementById("eggImage").classList.remove("egg-blur");

  function handleTimerComplete() {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const countdownText = document.getElementById("countdownText");
    countdownText.textContent = "00:00";

    ["pauseButton", "continueButton", "stopButton"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn && buttonsAction.contains(btn)) {
        buttonsAction.removeChild(btn);
      }
    });

    let alarmDiv = document.getElementById("alarmEmoji");
    if (!alarmDiv) {
      alarmDiv = document.createElement("div");
      alarmDiv.id = "alarmEmoji";
      alarmDiv.style.fontSize = "48px";
      alarmDiv.style.textAlign = "center";
      alarmDiv.style.marginBottom = "14px";
      alarmDiv.textContent = "⏰";
      buttonsAction.insertBefore(alarmDiv, buttonsAction.firstChild);
    }
    alarmDiv.classList.add("shake");

    const completeButton = document.createElement("button");
    completeButton.id = "completeButton";
    completeButton.className = "completeButton";
    completeButton.textContent = "Done!";
    buttonsAction.appendChild(completeButton);

    setTimeout(showFeedbackPopup, 200);

    completeButton.addEventListener("click", () => {
      resetToInitialState();
    });
  }

  // Visa popup för feedback efter kokning
  function showFeedbackPopup() {
    if (document.getElementById("feedbackPopup")) return;

    const popup = document.createElement("div");
    popup.id = "feedbackPopup";
    popup.innerHTML = `
      <div class="feedback-content">
        <p style="font-size: 1.2em; margin-bottom: 18px; color:#222; text-align:center;">Hur blev ditt ägg?</p>
        <div class="feedback-buttons">
          <div class="feedback-btn-col">
            <button class="feedback-btn" data-feedback="soft">För mjukt</button>
            <div class="feedback-btn-desc" data-for="soft">+ några sekunder</div>
          </div>
          <div class="feedback-btn-col">
            <button class="feedback-btn" data-feedback="perfect">Perfekt</button>
            <div class="feedback-btn-desc" data-for="perfect"></div>
          </div>
          <div class="feedback-btn-col">
            <button class="feedback-btn" data-feedback="hard">För hårt</button>
            <div class="feedback-btn-desc" data-for="hard">- några sekunder</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // Styla popup och innehåll
    Object.assign(popup.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      background: "#00000024",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "1000",
    });

    const content = popup.querySelector(".feedback-content");
    Object.assign(content.style, {
      background: "#f7f7f2",
      borderRadius: "18px",
      boxShadow: "0 3px 24px #00000021",
      padding: "34px 40px 28px 40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    });

    const btnCols = popup.querySelectorAll(".feedback-btn-col");
    btnCols.forEach((col) => {
      Object.assign(col.style, {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      });
    });

    const btns = popup.querySelectorAll(".feedback-btn");
    btns.forEach((btn) => {
      Object.assign(btn.style, {
        backgroundColor: "#d4d79f",
        width: "120px",
        height: "44px",
        margin: "0 10px 0 10px",
        borderRadius: "10px",
        border: "1px solid #33333385",
        fontSize: "18px",
        cursor: "pointer",
        transition: "all 0.3s",
        userSelect: "none",
        display: "block",
      });
    });

    const descs = popup.querySelectorAll(".feedback-btn-desc");
    descs.forEach((desc) => {
      Object.assign(desc.style, {
        fontSize: "13px",
        color: "#666666",
        marginTop: "7px",
        height: "18px",
        textAlign: "center",
        minHeight: "16px",
        lineHeight: "16px",
      });
    });

    const perfectDesc = popup.querySelector(
      '.feedback-btn-desc[data-for="perfect"]'
    );
    if (perfectDesc) perfectDesc.textContent = "";

    const btnContainer = popup.querySelector(".feedback-buttons");
    Object.assign(btnContainer.style, {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
    });

    // Hantera klick på feedback-knappar
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectedSizeBtn = document.querySelector(
          "#buttonsSize .cookingButton.selected"
        );
        const selectedTempBtn = document.querySelector(
          "#buttonsTemp .cookingButton.selected"
        );
        if (selectedSizeBtn && selectedTempBtn) {
          const size = selectedSizeBtn.textContent.trim();
          const temp = selectedTempBtn.textContent.trim();
          const feedback = btn.dataset.feedback;
          let delta = 0;
          if (feedback === "soft") delta = 5;
          else if (feedback === "hard") delta = -5;

          const prev = getCookingAdjustment(size, temp);
          setCookingAdjustment(size, temp, prev + delta);
        }
        if (popup.parentNode) popup.parentNode.removeChild(popup);
        resetToInitialState();
      });
    });
  }

  // Starta nedräkning
  countdownInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      handleTimerComplete();
      return;
    }
    totalSeconds--;

    const displayMinutes = Math.floor(totalSeconds / 60);
    const displaySeconds = totalSeconds % 60;

    document.getElementById("countdownText").textContent = `${String(
      displayMinutes
    ).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;
  }, 1000);

  // Hantera pausknapp
  pauseButton.addEventListener("click", () => {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    document.getElementById("eggImage").classList.add("egg-blur");

    buttonsAction.removeChild(pauseButton);

    const continueButton = document.createElement("button");
    continueButton.id = "continueButton";
    continueButton.className = "pauseButton";
    continueButton.textContent = "Continue";

    const stopButton = document.createElement("button");
    stopButton.id = "stopButton";
    stopButton.className = "pauseButton";
    stopButton.textContent = "Stop";
    stopButton.style.marginTop = "10px";

    buttonsAction.appendChild(continueButton);
    buttonsAction.appendChild(stopButton);

    // Fortsättknapp återupptar nedräkning och visar pausknapp
    continueButton.addEventListener("click", () => {
      if (countdownInterval !== null) {
        clearInterval(countdownInterval);
      }
      countdownInterval = setInterval(() => {
        if (totalSeconds <= 0) {
          handleTimerComplete();
          return;
        }
        totalSeconds--;

        const displayMinutes = Math.floor(totalSeconds / 60);
        const displaySeconds = totalSeconds % 60;

        document.getElementById("countdownText").textContent = `${String(
          displayMinutes
        ).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;
      }, 1000);

      document.getElementById("eggImage").classList.remove("egg-blur");

      buttonsAction.removeChild(continueButton);
      buttonsAction.removeChild(stopButton);

      buttonsAction.appendChild(pauseButton);
    });

    // Stopknapp avbryter och återställer
    stopButton.addEventListener("click", () => {
      resetToInitialState();
    });
  });
});
