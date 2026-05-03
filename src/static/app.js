document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <p><strong>Participants:</strong></p>
            <ul>
              ${details.participants.map(p => `<li>${p} <span class="delete-icon" data-email="${p}" data-activity="${name}">×</span></li>`).join('')}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add event listeners to delete icons
        const deleteIcons = activityCard.querySelectorAll('.delete-icon');
        deleteIcons.forEach(icon => {
          icon.addEventListener('click', async () => {
            const email = icon.dataset.email;
            const activity = icon.dataset.activity;
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
                method: 'POST',
              });
              if (response.ok) {
                fetchActivities(); // Refresh the activities
              } else {
                const error = await response.json();
                messageDiv.textContent = error.detail || 'Failed to unregister';
                messageDiv.style.color = 'red';
              }
            } catch (error) {
              messageDiv.textContent = 'Failed to unregister. Please try again.';
              messageDiv.style.color = 'red';
              console.error('Error unregistering:', error);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh the activities list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
