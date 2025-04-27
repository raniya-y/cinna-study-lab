const apiKey = " "; // Enter your API key here
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

const generateBtn = document.getElementById("generateBtn");
const inputText = document.getElementById("inputText");
const outputType = document.getElementById("outputType");
const outputContent = document.getElementById("outputContent");
const loader = document.getElementById("loader");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const infoBtn = document.getElementById("infoBtn");
const infoModal = document.getElementById("infoModal");
const closeBtn = document.querySelector(".close");
const addNotebookBtn = document.getElementById("addNotebookBtn");
const newNotebookContainer = document.getElementById("newNotebookContainer");
const newNotebookInput = document.getElementById("newNotebookInput");
const saveNotebookBtn = document.getElementById("saveNotebookBtn");
const notebookList = document.getElementById("notebookList");

const motivationalQuotes = [
  "You’re doing great! 🌟", "Believe in yourself! 💖", "Small steps every day! 🐾",
  "You’re smarter than you think! 📚", "Keep going, future genius! ✨",
  "Progress, not perfection! 🌼", "One page at a time! 📚"
];

const mascots = [
  "cinnamoroll-flower-head-piece.png", "cinna-cup.png", "cinna-flower.png",
  "cinna-happy.png", "donut.png", "plane.png", "skateboard.png"
];

const notebooks = {};
let currentNotebook = null;

// Generate Content
generateBtn.addEventListener("click", async () => {
  const userInput = inputText.value.trim();
  const type = outputType.value;

  if (!userInput) {
    outputContent.innerText = "⚠️ Please enter some text first.";
    return;
  }

  loader.style.display = "block";
  outputContent.innerHTML = "";

  const prompt = generatePrompt(userInput, type);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await res.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    outputContent.innerHTML = formatOutput(result);

    if (currentNotebook) {
      if (!notebooks[currentNotebook]) notebooks[currentNotebook] = [];
      notebooks[currentNotebook].push(result);
    }

  } catch (error) {
    console.error("Error:", error);
    outputContent.innerText = "❌ Something went wrong while fetching the response.";
  } finally {
    loader.style.display = "none";
  }
});

// Generate Prompt
function generatePrompt(input, type) {
  switch (type) {
    case "summary":
      return `Summarize the following content into concise bullet points:\n\n${input}`;
    case "quiz":
      return `Generate 3 quiz questions with answers based on the following content:\n\n${input}`;
    case "mnemonics":
      return `Create memory aids (mnemonics) to help remember this content. Use rhymes, acronyms, or vivid visual imagery if possible:\n\n${input}`;
    default:
      return input;
  }
}

function formatOutput(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  const lines = text.split("\n");
  let formatted = "", inList = false;

  lines.forEach(line => {
    if (line.trim().startsWith("*")) {
      if (!inList) {
        formatted += "<ul>";
        inList = true;
      }
      formatted += `<li>${line.replace(/^\*\s*/, "")}</li>`;
    } else {
      if (inList) {
        formatted += "</ul>";
        inList = false;
      }
      if (line.trim()) {
        formatted += `<p>${line}</p>`;
      }
    }
  });

  if (inList) formatted += "</ul>";
  return formatted;
}

// Copy to Clipboard
copyBtn.addEventListener("click", () => {
  const temp = document.createElement("textarea");
  temp.value = outputContent.innerText;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  copyBtn.innerText = "✨ Copied! ✨";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1500);
});

// Download 
downloadBtn.addEventListener("click", () => {
  const blob = new Blob([outputContent.innerText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study-output.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Info Modal Handling
infoBtn.addEventListener("click", () => {
  infoModal.style.display = "block";
});
closeBtn.addEventListener("click", () => {
  infoModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === infoModal) {
    infoModal.style.display = "none";
  }
});

// Mascot Updates
function updateMascot() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  const speechBubble = document.getElementById("speechBubble");
  const mascotImage = document.getElementById("mascotImage");

  speechBubble.innerText = motivationalQuotes[randomIndex];
  mascotImage.src = mascots[randomIndex];

  speechBubble.style.animation = 'none';
  void speechBubble.offsetWidth;
  speechBubble.style.animation = 'popIn 0.5s ease';
}
setInterval(updateMascot, 5000);

// Add New Notebook
addNotebookBtn.addEventListener("click", () => {
  newNotebookContainer.style.display = "flex";
  newNotebookInput.focus();
});

saveNotebookBtn.addEventListener("click", () => {
  const notebookName = newNotebookInput.value.trim();
  if (notebookName && !notebooks[notebookName]) {
    notebooks[notebookName] = [];

    const li = document.createElement("li");
    li.textContent = notebookName;
    li.classList.add("notebook-item");
    li.dataset.name = notebookName;

    li.addEventListener("click", () => {
      selectNotebook(notebookName);
    });

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "📖 View Notes";
    viewBtn.classList.add("view-notes-btn");
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      viewNotes(notebookName);
    });

    li.appendChild(viewBtn);
    notebookList.appendChild(li);

    newNotebookInput.value = "";
    newNotebookContainer.style.display = "none";
  }
});

// Select Notebook
function selectNotebook(name) {
  currentNotebook = name;
  highlightSelectedNotebook(name);
}

function highlightSelectedNotebook(selectedName) {
  document.querySelectorAll(".notebook-item").forEach(item => {
    if (item.dataset.name === selectedName) {
      item.classList.add("active-notebook");
    } else {
      item.classList.remove("active-notebook");
    }
  });
}

function viewNotes(name) {
  const notes = notebooks[name];
  if (!notes || notes.length === 0) {
    outputContent.innerHTML = `<p>📭 This notebook is empty!</p>`;
    return;
  }

  outputContent.innerHTML = `<h2>📓 ${name} Notes:</h2><ul>` +
    notes.map(note => `<li>${note}</li>`).join("") +
    `</ul>`;
}
