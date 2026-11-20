// =========================================================
// ABES Student Portal - Dashboard Controller
// =========================================================

const API_BASE = "http://127.0.0.1:8000";

let currentStudent = null;
let token = localStorage.getItem("abes_token");


// =========================================================
// 1. INITIALIZATION
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {

    initTheme();


    // ---------------------------------------------
    // Authentication check
    // ---------------------------------------------

    token = localStorage.getItem("abes_token");

    if (!token) {

        window.location.replace("login.html");

        return;
    }


    // ---------------------------------------------
    // Chat input
    // ---------------------------------------------

    const userInput = document.getElementById("userInput");

    if (userInput) {

        userInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter" && !event.shiftKey) {

                event.preventDefault();

                handleSendClick();
            }

        });

    }


    // ---------------------------------------------
    // Load dashboard data
    // ---------------------------------------------

    try {

        await loadStudentProfile();

        if (!currentStudent) {
            return;
        }

        await loadQuickStats();

        await loadChatHistory();

    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

    }

});


// =========================================================
// 2. API HELPER
// =========================================================

async function apiFetch(url, options = {}) {

    const headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };


    const response = await fetch(url, {
        ...options,
        headers
    });


    if (response.status === 401) {

        handleLogout();

        throw new Error("Session expired.");

    }


    if (response.status === 403) {

        throw new Error("Access denied.");

    }


    return response;
}


// =========================================================
// 3. THEME
// =========================================================

function initTheme() {

    const savedTheme =
        localStorage.getItem("abes_theme") ||
        "theme-light";


    document.body.className = savedTheme;

    updateThemeIcon(savedTheme);
}


function toggleTheme() {

    const isDark =
        document.body.classList.contains("theme-dark");


    const newTheme =
        isDark
            ? "theme-light"
            : "theme-dark";


    document.body.className = newTheme;


    localStorage.setItem(
        "abes_theme",
        newTheme
    );


    updateThemeIcon(newTheme);
}


function updateThemeIcon(theme) {

    const icon =
        document.getElementById("themeIcon");


    if (!icon) return;


    icon.textContent =
        theme === "theme-dark"
            ? "☀️"
            : "🌙";
}


// =========================================================
// 4. LOAD STUDENT PROFILE
// =========================================================

async function loadStudentProfile() {

    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/profile`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load student profile."
            );

        }


        currentStudent =
            await response.json();


        updateStudentUI();

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        throw error;
    }
}


// =========================================================
// UPDATE STUDENT UI
// =========================================================

function updateStudentUI() {

    if (!currentStudent) return;


    const heading =
        document.getElementById("welcomeHeading");


    if (heading) {

        heading.textContent =
            `👋 Welcome back, ${currentStudent.name}!`;

    }


    const metaStudentId =
        document.getElementById("metaStudentId");


    if (metaStudentId) {

        metaStudentId.textContent =
            `ID: ${currentStudent.student_id}`;

    }


    const metaCourse =
        document.getElementById("metaCourse");


    if (metaCourse) {

        metaCourse.textContent =
            `Course: ${currentStudent.course}`;

    }


    const metaBranch =
        document.getElementById("metaBranch");


    if (metaBranch) {

        metaBranch.textContent =
            `Branch: ${currentStudent.branch}`;

    }


    const metaSemester =
        document.getElementById("metaSemester");


    if (metaSemester) {

        metaSemester.textContent =
            `Sem: ${currentStudent.semester}`;

    }


    const metaSection =
        document.getElementById("metaSection");


    if (metaSection) {

        metaSection.textContent =
            `Sec: ${currentStudent.section}`;

    }

}


// =========================================================
// 5. QUICK STATS
// =========================================================

async function loadQuickStats() {

    await loadAttendanceStat();

    await loadSubjectsStat();

    await loadExamsStat();

    await loadNoticesStat();

}


// =========================================================
// ATTENDANCE STAT
// =========================================================

async function loadAttendanceStat() {

    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/attendance`
            );


        if (!response.ok) return;


        const data =
            await response.json();


        const percentage =
            Number(data.overall_percentage || 0);


        const metric =
            document.getElementById(
                "cardAttendanceMetric"
            );


        if (metric) {

            metric.textContent =
                `${percentage}%`;

        }


        const fill =
            document.getElementById(
                "cardAttendanceFill"
            );


        if (fill) {

            fill.style.width =
                `${Math.min(percentage, 100)}%`;

        }


        const statusText =
            document.getElementById(
                "cardAttendanceStatus"
            );


        if (statusText) {

            if (data.total_classes > 0) {

                const status =
                    percentage >= 75
                        ? "Above 75%"
                        : "Below 75%";


                statusText.textContent =
                    `${data.total_attended || 0}/${data.total_classes || 0} classes • ${status}`;

            } else {

                statusText.textContent =
                    "Attendance data not available";

            }

        }

    } catch (error) {

        console.warn(
            "Attendance stat error:",
            error
        );

    }

}


// =========================================================
// SUBJECT STAT
// =========================================================

async function loadSubjectsStat() {

    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/subjects`
            );


        if (!response.ok) return;


        const data =
            await response.json();


        const count =
            Array.isArray(data.subjects)
                ? data.subjects.length
                : 0;


        const metric =
            document.getElementById(
                "cardSubjectsMetric"
            );


        if (metric) {

            metric.textContent =
                `${count} Subjects`;

        }


        const statusText =
            document.getElementById(
                "cardSubjectsStatus"
            );


        if (statusText) {

            statusText.textContent =
                currentStudent
                    ? `Semester ${currentStudent.semester}`
                    : "Registered subjects";

        }

    } catch (error) {

        console.warn(
            "Subjects stat error:",
            error
        );

    }

}


// =========================================================
// EXAM STAT
// =========================================================

async function loadExamsStat() {

    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/exams`
            );


        if (!response.ok) return;


        const data =
            await response.json();


        const metric =
            document.getElementById(
                "cardExamsMetric"
            );


        const statusText =
            document.getElementById(
                "cardExamsStatus"
            );


        if (
            Array.isArray(data.exams) &&
            data.exams.length > 0
        ) {

            const nextExam =
                data.exams[0];


            if (metric) {

                metric.textContent =
                    `Next: ${nextExam.subject_code}`;

            }


            if (statusText) {

                const days =
                    Number(nextExam.days_left || 0);


                const countdown =
                    days > 0
                        ? `in ${days} days`
                        : days === 0
                            ? "today"
                            : "scheduled";


                statusText.textContent =
                    `${nextExam.exam_date} • ${countdown}`;

            }

        } else {

            if (metric) {

                metric.textContent =
                    "None";

            }


            if (statusText) {

                statusText.textContent =
                    "No upcoming exams";

            }

        }

    } catch (error) {

        console.warn(
            "Exam stat error:",
            error
        );

    }

}


// =========================================================
// NOTICE STAT
// =========================================================

async function loadNoticesStat() {

    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/notices`
            );


        if (!response.ok) return;


        const data =
            await response.json();


        const count =
            Array.isArray(data.notices)
                ? data.notices.length
                : 0;


        const metric =
            document.getElementById(
                "cardNoticesMetric"
            );


        if (metric) {

            metric.textContent =
                `${count} Updates`;

        }


        const statusText =
            document.getElementById(
                "cardNoticesStatus"
            );


        if (statusText) {

            statusText.textContent =
                "Latest college notices";

        }

    } catch (error) {

        console.warn(
            "Notice stat error:",
            error
        );

    }

}


// =========================================================
// 6. CHAT HISTORY
// =========================================================

async function loadChatHistory() {

    try {

        const response =
            await apiFetch(
                `${API_BASE}/chat/history`
            );


        if (!response.ok) return;


        const data =
            await response.json();


        if (
            !Array.isArray(data.history) ||
            data.history.length === 0
        ) {

            return;

        }


        const chatBox =
            document.getElementById("chatBox");


        if (!chatBox) return;


        chatBox.innerHTML = "";


        data.history.forEach(item => {

            appendMessage(
                item.question,
                "user"
            );


            appendMessage(
                item.answer,
                "bot",
                item.source,
                ""
            );

        });

    } catch (error) {

        console.warn(
            "Chat history error:",
            error
        );

    }

}


// =========================================================
// 7. MESSAGE RENDERING
// =========================================================

function appendMessage(
    messageText,
    sender,
    source = "",
    sourceUrl = ""
) {

    const chatBox =
        document.getElementById("chatBox");


    if (!chatBox) return;


    const message =
        document.createElement("div");


    message.className =
        `message ${sender}-message`;


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    // ---------------------------------------------
    // Bot header
    // ---------------------------------------------

    if (sender === "bot") {

        const header =
            document.createElement("div");


        header.className =
            "message-header";


        header.textContent =
            "🤖 Campus Buddy";


        bubble.appendChild(header);

    }


    // ---------------------------------------------
    // Message text
    // ---------------------------------------------

    const textDiv =
        document.createElement("div");


    textDiv.className =
        "message-text";


    const safeText =
        escapeHtml(String(messageText || ""));


    const formattedText =
        safeText
            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )
            .replace(
                /\n/g,
                "<br>"
            );


    textDiv.innerHTML =
        formattedText;


    bubble.appendChild(textDiv);


    // ---------------------------------------------
    // Source
    // ---------------------------------------------

    if (sender === "bot" && source) {

        const sourceBadge =
            document.createElement("div");


        sourceBadge.className =
            "source-badge";


        if (sourceUrl) {

            const link =
                document.createElement("a");


            link.href =
                sourceUrl;


            link.target =
                "_blank";


            link.rel =
                "noopener noreferrer";


            link.textContent =
                `${source} ↗`;


            sourceBadge.appendChild(
                document.createTextNode("🏛️ Source: ")
            );


            sourceBadge.appendChild(link);

        } else {

            sourceBadge.textContent =
                `🏛️ Source: ${source}`;

        }


        bubble.appendChild(
            sourceBadge
        );

    }


    message.appendChild(bubble);

    chatBox.appendChild(message);


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// 8. TYPING INDICATOR
// =========================================================

function showTypingIndicator() {

    const chatBox =
        document.getElementById("chatBox");


    if (!chatBox) return;


    removeTypingIndicator();


    const typing =
        document.createElement("div");


    typing.className =
        "message bot-message";


    typing.id =
        "typingIndicator";


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    const dots =
        document.createElement("div");


    dots.className =
        "typing-dots";


    dots.innerHTML =
        `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        `;


    bubble.appendChild(dots);

    typing.appendChild(bubble);

    chatBox.appendChild(typing);


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


function removeTypingIndicator() {

    const indicator =
        document.getElementById(
            "typingIndicator"
        );


    if (indicator) {

        indicator.remove();

    }

}


// =========================================================
// 9. SEND QUESTION
// =========================================================

async function handleSendClick() {

    const input =
        document.getElementById(
            "userInput"
        );


    if (!input) return;


    const question =
        input.value.trim();


    if (!question) return;


    input.value = "";


    await sendQuestion(question);

}


function sendQuickQuestion(question) {

    sendQuestion(question);

}


async function sendQuestion(question) {

    appendMessage(
        question,
        "user"
    );


    showTypingIndicator();


    const sendButton =
        document.getElementById(
            "sendBtn"
        );


    if (sendButton) {

        sendButton.disabled = true;

    }


    try {

        const response =
            await apiFetch(
                `${API_BASE}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question
                    })
                }
            );


        removeTypingIndicator();


        if (!response.ok) {

            appendMessage(
                "I couldn't process that request right now. Please try again.",
                "bot"
            );

            return;
        }


        const data =
            await response.json();


        appendMessage(
            data.answer || "No response received.",
            "bot",
            data.source || "",
            data.source_url || ""
        );


    } catch (error) {

        removeTypingIndicator();


        console.error(
            "Chat error:",
            error
        );


        appendMessage(
            "Unable to reach the student assistant. Please check whether the FastAPI server is running.",
            "bot"
        );


    } finally {

        if (sendButton) {

            sendButton.disabled = false;

        }


        if (input) {

            input.focus();

        }

    }

}


// =========================================================
// 10. CLEAR CHAT
// =========================================================

async function clearConversation() {

    const chatBox =
        document.getElementById(
            "chatBox"
        );


    if (chatBox) {

        chatBox.innerHTML = `

            <div class="message bot-message">

                <div class="message-bubble">

                    <div class="message-header">
                        🤖 Campus Buddy
                    </div>

                    <div class="message-text">

                        Chat history cleared! 👋

                        <br><br>

                        How can I help you?

                    </div>

                </div>

            </div>

        `;

    }


    const button =
        document.getElementById(
            "clearChatBtn"
        );


    const originalText =
        button
            ? button.innerHTML
            : "";


    if (button) {

        button.innerHTML =
            "✓ Cleared";

        button.disabled = true;

    }


    try {

        await apiFetch(
            `${API_BASE}/chat/history`,
            {
                method: "DELETE"
            }
        );

    } catch (error) {

        console.warn(
            "Could not clear server chat history:",
            error
        );

    } finally {

        if (button) {

            setTimeout(() => {

                button.innerHTML =
                    originalText;

                button.disabled = false;

            }, 1200);

        }

    }

}


// =========================================================
// 11. LOGOUT
// =========================================================

function handleLogout() {

    const button =
        document.getElementById(
            "logoutBtn"
        );


    if (button) {

        button.disabled = true;

        button.innerHTML =
            "<span>⏳ Logging out...</span>";

    }


    try {

        // Tell backend
        fetch(
            `${API_BASE}/logout`,
            {
                method: "POST",
                headers: token
                    ? {
                        "Authorization":
                            `Bearer ${token}`
                    }
                    : {}
            }
        ).catch(() => {});


        // Clear local authentication
        localStorage.removeItem(
            "abes_token"
        );

        localStorage.removeItem(
            "abes_role"
        );

        localStorage.removeItem(
            "abes_user"
        );


        sessionStorage.clear();


    } catch (error) {

        console.warn(
            "Logout cleanup warning:",
            error
        );

    }


    window.location.replace(
        "login.html"
    );

}


// =========================================================
// 12. MODALS
// =========================================================

async function openModal(modalId) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) return;


    modal.classList.add("active");


    if (modalId === "attendanceModal") {

        await renderAttendanceModal();

    }

    else if (modalId === "subjectsModal") {

        await renderSubjectsModal();

    }

    else if (modalId === "examsModal") {

        await renderExamsModal();

    }

    else if (modalId === "noticesModal") {

        await renderNoticesModal();

    }

    else if (modalId === "profileModal") {

        renderProfileModal();

    }

}


function closeModal(modalId) {

    const modal =
        document.getElementById(
            modalId
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


function closeOnBackdrop(
    event,
    modalId
) {

    if (
        event.target &&
        event.target.id === modalId
    ) {

        closeModal(modalId);

    }

}


// =========================================================
// 13. ATTENDANCE MODAL
// =========================================================

async function renderAttendanceModal() {

    const body =
        document.getElementById(
            "attendanceModalBody"
        );


    if (!body) return;


    body.innerHTML =
        '<div class="modal-spinner">Loading attendance...</div>';


    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/attendance`
            );


        const data =
            await response.json();


        if (
            !Array.isArray(data.records) ||
            data.records.length === 0
        ) {

            body.innerHTML =
                `<p>${escapeHtml(
                    data.message ||
                    "Attendance data is not available yet."
                )}</p>`;

            return;
        }


        const percentage =
            Number(
                data.overall_percentage || 0
            );


        const isGood =
            percentage >= 75;


        let html = `

            <div class="att-meter-box">

                <div>

                    <div
                        style="
                            font-size:12px;
                            color:var(--text-muted);
                            margin-bottom:2px;
                        "
                    >
                        Overall Attendance
                    </div>

                    <div class="att-meter-score">
                        ${percentage}%
                    </div>

                    <div
                        style="
                            font-size:12px;
                            color:var(--text-secondary);
                        "
                    >
                        ${data.total_attended || 0}
                        of
                        ${data.total_classes || 0}
                        classes attended
                    </div>

                </div>

                <div
                    class="att-meter-pill"
                    style="
                        background:${isGood
                            ? "var(--success-soft)"
                            : "var(--warning-soft)"};

                        color:${isGood
                            ? "var(--success)"
                            : "var(--warning)"};

                        border:1px solid currentColor;
                    "
                >
                    ${isGood
                        ? "✅ Above 75%"
                        : "⚠️ Below 75%"}
                </div>

            </div>

            <h4
                style="
                    margin-bottom:12px;
                    font-size:13px;
                    text-transform:uppercase;
                    color:var(--text-muted);
                "
            >
                Subject-wise Attendance
            </h4>

        `;


        data.records.forEach(record => {

            const pct =
                Number(
                    record.attendance_percentage || 0
                );


            const safePct =
                Math.min(
                    Math.max(pct, 0),
                    100
                );


            const good =
                pct >= 75;


            html += `

                <div class="att-sub-item">

                    <div class="att-sub-header">

                        <span>

                            ${escapeHtml(
                                record.subject_name
                            )}

                            <small
                                style="
                                    color:var(--text-muted);
                                "
                            >
                                (${escapeHtml(
                                    record.subject_code
                                )})
                            </small>

                        </span>


                        <span
                            style="
                                color:${good
                                    ? "var(--success)"
                                    : "var(--warning)"};
                            "
                        >
                            ${pct}%
                        </span>

                    </div>


                    <div
                        class="card-progress-bar"
                        style="height:7px;"
                    >

                        <div
                            class="card-progress-fill"
                            style="
                                width:${safePct}%;
                                background:${good
                                    ? "var(--success)"
                                    : "var(--warning)"};
                            "
                        ></div>

                    </div>


                    <div
                        style="
                            font-size:11px;
                            color:var(--text-muted);
                            margin-top:4px;
                        "
                    >
                        Attended
                        ${record.attended_classes || 0}
                        of
                        ${record.total_classes || 0}
                        lectures
                    </div>

                </div>

            `;

        });


        body.innerHTML = html;


    } catch (error) {

        console.error(
            "Attendance modal error:",
            error
        );


        body.innerHTML =
            '<p style="color:#dc2626;">Error loading attendance records.</p>';

    }

}


// =========================================================
// 14. SUBJECTS MODAL
// =========================================================

async function renderSubjectsModal() {

    const body =
        document.getElementById(
            "subjectsModalBody"
        );


    if (!body) return;


    body.innerHTML =
        '<div class="modal-spinner">Loading subjects...</div>';


    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/subjects`
            );


        const data =
            await response.json();


        if (
            !Array.isArray(data.subjects) ||
            data.subjects.length === 0
        ) {

            body.innerHTML =
                "<p>No enrolled subjects found.</p>";

            return;
        }


        let html =
            '<div style="display:flex;flex-direction:column;gap:10px;">';


        data.subjects.forEach(subject => {

            html += `

                <div class="att-sub-item">

                    <div
                        style="
                            font-weight:600;
                            font-size:14px;
                            color:var(--text-primary);
                        "
                    >
                        ${escapeHtml(
                            subject.subject_name
                        )}
                    </div>


                    <div
                        style="
                            font-size:12px;
                            color:var(--text-muted);
                            margin-top:4px;
                        "
                    >

                        Code:
                        <strong>
                            ${escapeHtml(
                                subject.subject_code
                            )}
                        </strong>

                        • Semester:
                        ${escapeHtml(
                            subject.semester
                        )}

                        • Branch:
                        ${escapeHtml(
                            subject.branch
                        )}

                    </div>

                </div>

            `;

        });


        html += "</div>";


        body.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Subjects modal error:",
            error
        );


        body.innerHTML =
            '<p style="color:#dc2626;">Error loading subjects.</p>';

    }

}


// =========================================================
// 15. EXAMS MODAL
// =========================================================

async function renderExamsModal() {

    const body =
        document.getElementById(
            "examsModalBody"
        );


    if (!body) return;


    body.innerHTML =
        '<div class="modal-spinner">Loading examination timetable...</div>';


    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/exams`
            );


        const data =
            await response.json();


        if (
            !Array.isArray(data.exams) ||
            data.exams.length === 0
        ) {

            body.innerHTML =
                `<p>${escapeHtml(
                    data.message ||
                    "No upcoming examination data is available."
                )}</p>`;

            return;
        }


        let html = "";


        data.exams.forEach(exam => {

            const days =
                Number(
                    exam.days_left || 0
                );


            const dayText =
                days > 0
                    ? `in ${days} days`
                    : days === 0
                        ? "today"
                        : "scheduled";


            html += `

                <div class="exam-item-card">

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:10px;
                            margin-bottom:6px;
                        "
                    >

                        <h4
                            style="
                                font-size:14px;
                                font-weight:700;
                                color:var(--text-primary);
                            "
                        >
                            ${escapeHtml(
                                exam.subject_name
                            )}

                            (${escapeHtml(
                                exam.subject_code
                            )})
                        </h4>


                        <span class="notice-cat-badge">
                            ${escapeHtml(
                                exam.exam_type
                            )}
                        </span>

                    </div>


                    <div
                        style="
                            font-size:13px;
                            color:var(--text-secondary);
                            margin-bottom:4px;
                        "
                    >

                        📅 Date:
                        <strong>
                            ${escapeHtml(
                                exam.exam_date
                            )}
                        </strong>

                        (${dayText})

                    </div>


                    <div
                        style="
                            font-size:12px;
                            color:var(--text-muted);
                        "
                    >

                        ⏰ Time:
                        ${escapeHtml(
                            exam.start_time
                        )}
                        -
                        ${escapeHtml(
                            exam.end_time
                        )}

                        • 🏛️ Room:
                        <strong>
                            ${escapeHtml(
                                exam.room
                            )}
                        </strong>

                    </div>

                </div>

            `;

        });


        body.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Exams modal error:",
            error
        );


        body.innerHTML =
            '<p style="color:#dc2626;">Error loading exam schedule.</p>';

    }

}


// =========================================================
// 16. NOTICES MODAL
// =========================================================

async function renderNoticesModal() {

    const body =
        document.getElementById(
            "noticesModalBody"
        );


    if (!body) return;


    body.innerHTML =
        '<div class="modal-spinner">Loading notices...</div>';


    try {

        const response =
            await apiFetch(
                `${API_BASE}/student/notices`
            );


        const data =
            await response.json();


        if (
            !Array.isArray(data.notices) ||
            data.notices.length === 0
        ) {

            body.innerHTML =
                "<p>No circulars available at this moment.</p>";

            return;
        }


        let html = "";


        data.notices.forEach(notice => {

            html += `

                <div class="notice-item-card">

                    <span class="notice-cat-badge">

                        ${escapeHtml(
                            notice.category
                        )}

                    </span>


                    <h4
                        style="
                            font-size:14px;
                            font-weight:700;
                            color:var(--text-primary);
                            margin-bottom:4px;
                        "
                    >
                        ${escapeHtml(
                            notice.title
                        )}
                    </h4>


                    <p
                        style="
                            font-size:12px;
                            color:var(--text-muted);
                            margin-bottom:8px;
                        "
                    >
                        Date:
                        ${escapeHtml(
                            notice.notice_date
                        )}
                    </p>


                    <p
                        style="
                            font-size:13px;
                            color:var(--text-secondary);
                            line-height:1.5;
                            margin-bottom:10px;
                        "
                    >
                        ${escapeHtml(
                            notice.description
                        )}
                    </p>


                    ${
                        notice.source_url
                            ? `
                                <a
                                    href="${escapeHtml(
                                        notice.source_url
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style="
                                        font-size:12px;
                                        color:var(--primary);
                                        font-weight:600;
                                        text-decoration:none;
                                    "
                                >
                                    View Official Notice ↗
                                </a>
                            `
                            : ""
                    }

                </div>

            `;

        });


        body.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Notices modal error:",
            error
        );


        body.innerHTML =
            '<p style="color:#dc2626;">Error loading notices.</p>';

    }

}


// =========================================================
// 17. PROFILE MODAL
// =========================================================

function renderProfileModal() {

    const body =
        document.getElementById(
            "profileModalBody"
        );


    if (!body) return;


    if (!currentStudent) {

        body.innerHTML =
            "<p>Profile data unavailable.</p>";

        return;
    }


    body.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:14px;
            "
        >

            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Full Name
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.name
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Student ID / Roll No
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.student_id
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Official Email
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.email
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Degree & Course
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.course
                    )}
                </strong>

            </div>


            <div
                class="att-sub-item"
                style="grid-column:span 2;"
            >

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Department / Branch
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.branch
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Semester
                </small>

                <strong>
                    Semester
                    ${escapeHtml(
                        currentStudent.semester
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Section
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.section
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Enrollment Year
                </small>

                <strong>
                    ${escapeHtml(
                        currentStudent.enrollment_year
                    )}
                </strong>

            </div>


            <div class="att-sub-item">

                <small
                    style="
                        color:var(--text-muted);
                        display:block;
                    "
                >
                    Academic Affiliation
                </small>

                <strong>
                    AKTU, Lucknow
                </strong>

            </div>

        </div>

    `;

}


// =========================================================
// 18. SCROLL
// =========================================================

function scrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =========================================================
// 19. GLOBAL FUNCTIONS
// =========================================================

window.handleLogout =
    handleLogout;

window.clearConversation =
    clearConversation;

window.toggleTheme =
    toggleTheme;

window.openModal =
    openModal;

window.closeModal =
    closeModal;

window.closeOnBackdrop =
    closeOnBackdrop;

window.sendQuickQuestion =
    sendQuickQuestion;

window.handleSendClick =
    handleSendClick;

window.scrollToTop =
    scrollToTop;