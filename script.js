document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("https://cdn.mux8.com/projects.json");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const projects = await response.json();
        loadProjects(projects);
    } catch (error) {
        console.error("Error fetching the projects:", error);
    }
});

function loadProjects(projects) {
    const container = document.getElementById("projects-container");
    container.innerHTML = "";

    projects.forEach(project => {
        const card = document.createElement("div");
        card.classList.add("project-card");

        let categories = Array.isArray(project.project_category)
            ? project.project_category
            : [project.project_category];

        let collaboratorsHTML = "";
        if (project.collaborators && project.collaborators_url) {
            const collaboratorsList = Array.isArray(project.collaborators)
                ? project.collaborators.map((name, i) => `<a href="${project.collaborators_url[i]}" target="_blank">${name}</a>`).join(", ")
                : `<a href="${project.collaborators_url}" target="_blank">${project.collaborators}</a>`;

            collaboratorsHTML = `<p class="collaboration-note">In collaboration with ${collaboratorsList}</p>`;
        }

        card.innerHTML = `
            <div class="project-banner" style="background-image: url('${project.project_header}');">
                <span class="project-date">${project.project_date}</span>
            </div>
            <img src="${project.project_icon}" alt="${project.project_name}" class="project-icon">
            <h3>${project.project_name}</h3>
            <div class="project-info">
                <p>${project.project_info}</p>
                <div>
                    ${categories.map(category => `<span class="project-category">${category}</span>`).join('')}
                </div>
            </div>
            <a href="${project.project_url}" target="_blank">View Project</a>
            ${collaboratorsHTML}
        `;

        container.appendChild(card);
    });
}
