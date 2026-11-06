const dateInput = document.getElementById("activityDate");
const activityForm = document.getElementById("activityForm");
const activityList = document.getElementById("activityList");
const message = document.getElementById("message");
const emptyMessage = document.getElementById("emptyMessage");

const totalSteps = document.getElementById("totalSteps");
const totalCalories = document.getElementById("totalCalories");
const totalMinutes = document.getElementById("totalMinutes");

const stepsProgress = document.getElementById("stepsProgress");
const caloriesProgress = document.getElementById("caloriesProgress");
const workoutProgress = document.getElementById("workoutProgress");

const clearBtn = document.getElementById("clearBtn");

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.value = localToday;

let activities = [];

try {
    const saved = JSON.parse(
        localStorage.getItem("fitTrackActivities") || "[]"
    );

    if (Array.isArray(saved)) {
        activities = saved.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.date === "string" &&
            typeof item.type === "string" &&
            Number.isFinite(item.steps) &&
            Number.isFinite(item.minutes) &&
            Number.isFinite(item.calories)
        );
    }
} catch (error) {
    activities = [];
}

function saveActivities() {
    try {
        localStorage.setItem(
            "fitTrackActivities",
            JSON.stringify(activities)
        );
        return true;
    } catch (error) {
        message.textContent =
            "Could not save data in this browser.";
        return false;
    }
}

function getDayActivities() {
    return activities.filter(item => item.date === dateInput.value);
}

function setProgress(element, value, goal) {
    const percent = Math.min((value / goal) * 100, 100);
    element.style.width = percent + "%";
}

function renderDashboard() {
    const dailyActivities = getDayActivities();

    const steps = dailyActivities.reduce(
        (sum, item) => sum + item.steps, 0
    );

    const calories = dailyActivities.reduce(
        (sum, item) => sum + item.calories, 0
    );

    const minutes = dailyActivities.reduce(
        (sum, item) => sum + item.minutes, 0
    );

    totalSteps.textContent = steps.toLocaleString();
    totalCalories.textContent = calories.toLocaleString();
    totalMinutes.textContent = minutes.toLocaleString();

    setProgress(stepsProgress, steps, 10000);
    setProgress(caloriesProgress, calories, 500);
    setProgress(workoutProgress, minutes, 60);

    activityList.replaceChildren();

    dailyActivities.forEach(item => {
        const row = document.createElement("tr");

        [
            item.type,
            item.steps.toLocaleString(),
            item.minutes.toLocaleString(),
            item.calories.toLocaleString()
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            const previous = [...activities];
            activities = activities.filter(
                activity => activity.id !== item.id
            );

            if (!saveActivities()) {
                activities = previous;
                renderDashboard();
                return;
            }

            message.textContent = "Activity deleted.";
            renderDashboard();
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        activityList.appendChild(row);
    });

    emptyMessage.hidden = dailyActivities.length > 0;
}

activityForm.addEventListener("submit", event => {
    event.preventDefault();
    message.textContent = "";

    const steps = Number(document.getElementById("stepsInput").value);
    const minutes = Number(document.getElementById("minutesInput").value);
    const calories = Number(document.getElementById("caloriesInput").value);
    const type = document.getElementById("activityType").value;

    if (
        !dateInput.value ||
        !Number.isInteger(steps) || steps < 0 || steps > 100000 ||
        !Number.isInteger(minutes) || minutes < 1 || minutes > 1440 ||
        !Number.isInteger(calories) || calories < 0 || calories > 20000
    ) {
        message.textContent = "Please enter valid activity details.";
        return;
    }

    const activity = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        date: dateInput.value,
        type,
        steps,
        minutes,
        calories
    };

    activities.push(activity);

    if (!saveActivities()) {
        activities.pop();
        return;
    }

    activityForm.reset();
    document.getElementById("activityType").value = "Walking";
    message.textContent = "Activity saved successfully!";

    renderDashboard();
});

dateInput.addEventListener("change", () => {
    message.textContent = "";
    renderDashboard();
});

clearBtn.addEventListener("click", () => {
    const dailyActivities = getDayActivities();

    if (dailyActivities.length === 0) {
        message.textContent = "There are no activities to clear.";
        return;
    }

    if (!confirm("Delete all activities for this date?")) {
        return;
    }

    const previous = [...activities];

    activities = activities.filter(
        item => item.date !== dateInput.value
    );

    if (!saveActivities()) {
        activities = previous;
        renderDashboard();
        return;
    }

    message.textContent = "Activities cleared for this date.";
    renderDashboard();
});

renderDashboard();