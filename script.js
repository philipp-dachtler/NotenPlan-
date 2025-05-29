// --- Datenmodell ---
// Struktur im LocalStorage:
// {
//   subjects: [
//     {
//       name: "Mathe",
//       notes: [
//         { label: "Klassenarbeit 1", grade: 2.0 },
//         { label: "Test", grade: 1.7 }
//       ]
//     }, ...
//   ]
// }

const subjectsContainer = document.getElementById("subjects-container");
const newSubjectInput = document.getElementById("new-subject");
const addSubjectBtn = document.getElementById("add-subject-btn");
const overallAverageValue = document.getElementById("overall-average-value");

let data = {
  subjects: []
};

function saveData() {
  localStorage.setItem("notenplan-data", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("notenplan-data");
  if (saved) {
    data = JSON.parse(saved);
  }
}

function calcAverage(grades) {
  if (!grades.length) return null;
  const sum = grades.reduce((acc, g) => acc + g, 0);
  return (sum / grades.length).toFixed(2);
}

function getGradeColor(grade) {
  if (grade <= 2.0) return "grade-good";
  if (grade <= 3.5) return "grade-mid";
  return "grade-bad";
}

function render() {
  subjectsContainer.innerHTML = "";

  data.subjects.forEach((subject, idx) => {
    const subjectEl = document.createElement("section");
    subjectEl.className = "subject";

    const subjectAverage = calcAverage(subject.notes.map(n => n.grade));

    subjectEl.innerHTML = `
      <h3>
        ${subject.name}
        <button aria-label="Fach löschen" class="delete-subject" data-idx="${idx}">&times;</button>
      </h3>
      <ul class="notes-list">
        ${subject.notes.map(note => `
          <li>
            <span class="note-label">${note.label}</span>
            <span class="grade ${getGradeColor(note.grade)}">${note.grade.toFixed(2)}</span>
          </li>
        `).join("")}
      </ul>

      <div class="add-note">
        <input type="text" placeholder="Name der Note (z. B. Klassenarbeit 1)" class="note-label-input" />
        <input type="number" step="0.1" min="1" max="6" placeholder="Note" class="note-grade-input" />
        <button class="add-note-btn">+</button>
      </div>

      <div class="subject-average">
        Durchschnitt: ${subjectAverage ? `<span class="${getGradeColor(subjectAverage)}">${subjectAverage}</span>` : "–"}
      </div>
    `;

    subjectsContainer.appendChild(subjectEl);
  });

  // Gesamtdurchschnitt berechnen
  const allGrades = data.subjects.flatMap(s => s.notes.map(n => n.grade));
  const overallAvg = calcAverage(allGrades);
  overallAverageValue.textContent = overallAvg ? overallAvg : "–";

  // Eventlistener hinzufügen
  document.querySelectorAll(".add-note-btn").forEach((btn, idx) => {
    btn.onclick = () => {
      const section = btn.closest(".subject");
      const labelInput = section.querySelector(".note-label-input");
      const gradeInput = section.querySelector(".note-grade-input");

      const label = labelInput.value.trim();
      const grade = parseFloat(gradeInput.value);

      if (!label || isNaN(grade) || grade < 1 || grade > 6) {
        alert("Bitte gültigen Namen und Note (1–6) eingeben.");
        return;
      }

      data.subjects[idx].notes.push({ label, grade });
      saveData();
      render();
    };
  });

  document.querySelectorAll(".delete-subject").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      if (confirm(`Fach "${data.subjects[idx].name}" wirklich löschen?`)) {
        data.subjects.splice(idx, 1);
        saveData();
        render();
      }
    };
  });
}

addSubjectBtn.onclick = () => {
  const newSubject = newSubjectInput.value.trim();
  if (!newSubject) {
    alert("Bitte einen Fachnamen eingeben.");
    return;
  }
  if (data.subjects.some(s => s.name.toLowerCase() === newSubject.toLowerCase())) {
    alert("Dieses Fach gibt es schon.");
    return;
  }
  data.subjects.push({ name: newSubject, notes: [] });
  saveData();
  render();
  newSubjectInput.value = "";
};

loadData();
render();
