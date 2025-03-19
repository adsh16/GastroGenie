document.addEventListener('DOMContentLoaded', () => {
    const chips = document.querySelectorAll('.suggestion-chip');

    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            const query = this.textContent;
            const inputField = document.getElementById("query");
            if (inputField.value !== query) {
                inputField.value = query;
                sendMessage();
            }
        });
    });
});

function toggleTheme() {
    const body = document.body;
    const switchInput = document.getElementById('switch');
    const isDark = body.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        switchInput.checked = false;
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        switchInput.checked = true;
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle svg');
    
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
    } else {
        body.removeAttribute('data-theme');
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const switchInput = document.getElementById('switch');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        switchInput.checked = true;
    } else {
        switchInput.checked = false;
    }
});

function sendMessage() {
    const query = document.getElementById("query").value;
    const chatbox = document.getElementById("chatbox");

    if (!query.trim()) return;

    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) welcomeMessage.remove();

    chatbox.innerHTML += `
        <div class="message user-message">
            <p>${query}</p>
        </div>
    `;

    document.getElementById("query").value = "";

    const lastUserMessage = document.querySelector(".user-message:last-of-type");
    if (lastUserMessage) {
        lastUserMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    chatbox.innerHTML += `
        <div class="message bot-message typing">
            <div class="typing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;

    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        document.querySelectorAll('.typing').forEach(el => el.remove());

        data.forEach(recipe => {
            const imgTag = recipe.img_url ? 
                `<img src="${recipe.img_url}" alt="${recipe.title}" class="recipe-image">` : '';
            
            const nutritionInfo = `
                <div class="nutrition-facts">
                    ${recipe.Time ? `<div class="fact-item">⏱ ${recipe.Time}</div>` : ''}
                    ${recipe.Calories ? `<div class="fact-item">🔥 ${recipe.Calories} Calories</div>` : ''}
                    ${recipe.Protein ? `<div class="fact-item">💪 ${recipe.Protein}g Protein</div>` : ''}
                </div>
            `;

            const youtubeButton = recipe.youtube_video ? `
                <a href="${recipe.youtube_video}" class="youtube-link" target="_blank">
                    ▶️ Watch Tutorial
                </a>
            ` : '';

            chatbox.innerHTML += `
                <div class="message bot-message">
                    <div class="recipe-card">
                        <h3>${recipe.title}</h3>
                        ${imgTag}
                        ${nutritionInfo}
                        <p>${recipe.description}</p>
                        <div class="action-buttons">
                            <a href="${recipe.url}" class="view-recipe" target="_blank">
                                📖 View Full Recipe
                            </a>
                            ${youtubeButton}
                        </div>
                    </div>
                </div>
            `;
        });
        const lastUserMessage = document.querySelector(".user-message:last-of-type");
        if (lastUserMessage) {
            lastUserMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    })

    .catch(error => {
        console.error('Error:', error);
        document.querySelectorAll('.typing').forEach(el => el.remove());
        chatbox.innerHTML += `
            <div class="message bot-message">
                <div class="recipe-card">
                    <p>⚠️ Error fetching recipes. Please try again later.</p>
                </div>
            </div>
        `;
        const lastUserMessage = document.querySelector(".user-message:last-of-type");
        if (lastUserMessage) {
            lastUserMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    });
}