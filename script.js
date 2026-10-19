
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboardPage = document.getElementById("dashboardPage");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const notesForm = document.getElementById("notesForm");

const welcomeMessage = document.getElementById("welcomeMessage");
const notesList = document.getElementById("notesList");


// Show one page and hide the others
function showPage(page) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboardPage.classList.add("hidden");

    page.classList.remove("hidden");
}


// Reset password fields and their icons
function resetPasswordVisibility() {
    document.querySelectorAll(".toggle-password").forEach(button => {
        const input = document.getElementById(button.dataset.target);

        input.type = "password";
        button.innerHTML = '<i data-lucide="eye"></i>';
        button.setAttribute("aria-label", "Show password");
        button.setAttribute("aria-pressed", "false");
    });

    lucide.createIcons();
}


// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// Get registered users
function getUsers() {
    return JSON.parse(localStorage.getItem("students")) || [];
}


// Save registered users
function saveUsers(users) {
    localStorage.setItem("students", JSON.stringify(users));
}


// Get the current student's notes
function getNotesKey() {
    const email = sessionStorage.getItem("currentStudent");
    return `student_${email}_notes`;
}


function getNotes() {
    return JSON.parse(localStorage.getItem(getNotesKey())) || [];
}


function saveNotes(notes) {
    localStorage.setItem(getNotesKey(), JSON.stringify(notes));
}


// Navigate between login and registration
document.getElementById("showRegister").addEventListener("click", event => {
    event.preventDefault();
    registerForm.reset();
    resetPasswordVisibility();
    showPage(registerPage);
});


document.getElementById("showLogin").addEventListener("click", event => {
    event.preventDefault();
    loginForm.reset();
    resetPasswordVisibility();
    showPage(loginPage);
});


// Register a student
registerForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail")
        .value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name) {
        alert("Please enter your full name.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const users = getUsers();

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        alert("An account with this email already exists.");
        return;
    }

    users.push({
        name: name,
        email: email,
        password: password
    });

    saveUsers(users);

    alert("Registration successful! Please log in.");

    registerForm.reset();
    resetPasswordVisibility();
    showPage(loginPage);

    document.getElementById("loginEmail").value = email;
});


// Log in a student
loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const users = getUsers();

    const student = users.find(user =>
        user.email === email && user.password === password
    );

    if (!student) {
        alert("Invalid email or password.");
        return;
    }

    sessionStorage.setItem("currentStudent", student.email);

    welcomeMessage.textContent = `Welcome, ${student.name}!`;

    loginForm.reset();
    resetPasswordVisibility();
    showPage(dashboardPage);

    displayNotes();
});


// Save a new note
notesForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
        alert("Please enter both the note title and content.");
        return;
    }

    const notes = getNotes();

    notes.unshift({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        title: title,
        content: content,
        date: new Date().toLocaleString()
    });

    saveNotes(notes);
    notesForm.reset();
    displayNotes();

    alert("Note saved successfully!");
});


// Display saved notes
function displayNotes() {
    const notes = getNotes();

    notesList.innerHTML = "";

    if (notes.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "You haven't saved any notes yet.";

        notesList.appendChild(message);
        return;
    }

    notes.forEach(note => {
        const noteCard = document.createElement("article");
        noteCard.className = "note-card";

        const title = document.createElement("h3");
        title.textContent = note.title;

        const date = document.createElement("small");
        date.textContent = note.date || "";

        const content = document.createElement("p");
        content.textContent = note.content;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.innerHTML =
            '<i data-lucide="trash-2"></i> Delete';

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        noteCard.append(title, date, content, deleteButton);
        notesList.appendChild(noteCard);
    });

    lucide.createIcons();
}


// Delete a note
function deleteNote(noteId) {
    const confirmed = confirm("Are you sure you want to delete this note?");

    if (!confirmed) {
        return;
    }

    const updatedNotes = getNotes().filter(note => note.id !== noteId);

    saveNotes(updatedNotes);
    displayNotes();
}


// Log out
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("currentStudent");

    notesForm.reset();
    loginForm.reset();
    resetPasswordVisibility();

    showPage(loginPage);
});


// Show or hide password using Lucide icons
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        const isHidden = input.type === "password";

        input.type = isHidden ? "text" : "password";

        button.innerHTML = isHidden
            ? '<i data-lucide="eye-off"></i>'
            : '<i data-lucide="eye"></i>';

        button.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );

        button.setAttribute("aria-pressed", String(isHidden));

        lucide.createIcons();
    });
});


// Restore a session if the student refreshes the page
function restoreSession() {
    const currentEmail = sessionStorage.getItem("currentStudent");

    if (!currentEmail) {
        showPage(loginPage);
        return;
    }

    const student = getUsers().find(user => user.email === currentEmail);

    if (!student) {
        sessionStorage.removeItem("currentStudent");
        showPage(loginPage);
        return;
    }

    welcomeMessage.textContent = `Welcome, ${student.name}!`;
    showPage(dashboardPage);
    displayNotes();
}


// Initialize icons and page
lucide.createIcons();
restoreSession();
