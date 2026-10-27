"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Select HTML elements
    const form = document.getElementById("regform");
    const successMsg = document.getElementById("successMsg");
    const memberList = document.getElementById("memberList");
    const count = document.getElementById("count");
    const themeBtn = document.getElementById("theme");
    const cancelEdit = document.getElementById("cancelEdit");

    if (!form) {
        console.error('Form with id="regform" was not found.');
        return;
    }

    const fields = {
        name: form.querySelector("#name"),
        email: form.querySelector("#email"),
        password: form.querySelector("#password"),
        confirmPassword: form.querySelector("#confirm-password"),
        gender: form.querySelector("#gender"),
        dob: form.querySelector("#dob"),
        country: form.querySelector("#country"),
        phone: form.querySelector("#phone"),
        bio: form.querySelector("#bio")
    };

    const errors = {
        name: document.getElementById("nameError"),
        email: document.getElementById("emailError"),
        password: document.getElementById("passwordError"),
        confirmPassword: document.getElementById("confirmError"),
        gender: document.getElementById("genderError"),
        dob: document.getElementById("dobError"),
        country: document.getElementById("countryError"),
        phone: document.getElementById("phoneError"),
        bio: document.getElementById("bioError")
    };

    const submitBtn = form.querySelector('[type="submit"]');

    // 2. Store members in memory
    let members = [];
    let nextMemberId = 1;
    let editingMemberId = null;

    // 3. Show validation messages
    function showError(key, message = "") {
        const field = fields[key];
        const errorElement = errors[key];

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (field) {
            field.classList.toggle("invalid", Boolean(message));
            field.setAttribute(
                "aria-invalid",
                message ? "true" : "false"
            );
        }

        return message === "";
    }

    // 4. Validate individual fields
    function validateField(key) {
        const field = fields[key];

        if (!field) {
            return true;
        }

        const value = field.value.trim();
        let message = "";

        switch (key) {
            case "name":
                if (!value) {
                    message = "Please enter your name.";
                } else if (value.length < 2) {
                    message = "Name must contain at least 2 characters.";
                }
                break;

            case "email":
                if (!value) {
                    message = "Please enter your email.";
                } else if (!field.validity.valid) {
                    message = "Please enter a valid email address.";
                }
                break;

            case "password":
                if (!value && editingMemberId !== null) {
                    message = "";
                } else if (!value) {
                    message = "Please enter a password.";
                } else if (value.length < 8) {
                    message = "Password must contain at least 8 characters.";
                }
                break;

            case "confirmPassword":
                if (
                    editingMemberId !== null &&
                    !fields.password.value &&
                    !value
                ) {
                    message = "";
                } else if (!value) {
                    message = "Please confirm your password.";
                } else if (value !== fields.password.value) {
                    message = "Passwords do not match.";
                }
                break;

            case "gender":
                if (!value) {
                    message = "Please select your gender.";
                }
                break;

            case "dob":
                if (!value) {
                    message = "Please select your date of birth.";
                } else {
                    const selectedDate = new Date(value + "T00:00:00");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (
                        Number.isNaN(selectedDate.getTime()) ||
                        selectedDate > today
                    ) {
                        message = "Date of birth cannot be in the future.";
                    }
                }
                break;

            case "country":
                if (!value) {
                    message = "Please select your country.";
                }
                break;

            case "phone": {
                const digits = value.replace(/\D/g, "");

                if (!value) {
                    message = "Please enter your phone number.";
                } else if (
                    !/^[+\d\s().-]+$/.test(value) ||
                    digits.length < 7 ||
                    digits.length > 15
                ) {
                    message = "Enter a valid phone number (7–15 digits).";
                }
                break;
            }

            case "bio":
                if (!value) {
                    message = "Please enter a short biography.";
                } else if (value.length < 10) {
                    message = "Biography must contain at least 10 characters.";
                }
                break;
        }

        return showError(key, message);
    }

    // 5. Validate the entire form
    function validateForm() {
        return Object.keys(fields).every(validateField);
    }

    // 6. Update registered member count
    function updateMemberCount() {
        if (count) {
            count.textContent = members.length;
        }
    }

    // 7. Collect form information
    function getFormData() {
        return {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            gender: fields.gender.value,
            dob: fields.dob.value,
            country: fields.country.value,
            phone: fields.phone.value.trim(),
            bio: fields.bio.value.trim()
        };
    }

    // 8. Create and display member cards
    function renderMembers() {
        if (!memberList) {
            updateMemberCount();
            return;
        }

        memberList.replaceChildren();

        if (members.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "No members registered yet.";
            memberList.appendChild(emptyMessage);

            updateMemberCount();
            return;
        }

        members.forEach((member) => {
            const item = document.createElement("li");
            item.className = "member-item";

            // Member name
            const heading = document.createElement("h3");
            heading.className = "member-name";
            heading.textContent = member.name;

            // Short summary
            const summary = document.createElement("p");
            summary.className = "member-summary";
            summary.textContent =
                `${member.email} · ${member.gender} · ${member.country}`;

            // Expandable details
            const details = document.createElement("details");
            details.className = "member-details";

            const detailsTitle = document.createElement("summary");
            detailsTitle.textContent = "View details";

            const detailList = document.createElement("dl");
            detailList.className = "member-detail-list";

            const detailItems = [
                ["Full Name", member.name],
                ["Email", member.email],
                ["Gender", member.gender],
                ["Date of Birth", member.dob],
                ["Country", member.country],
                ["Phone Number", member.phone],
                ["Bio", member.bio]
            ];

            detailItems.forEach(([label, value]) => {
                const row = document.createElement("div");
                row.className = "member-detail-row";

                const term = document.createElement("dt");
                term.textContent = label;

                const description = document.createElement("dd");
                description.textContent = value || "Not provided";

                row.append(term, description);
                detailList.appendChild(row);
            });

            details.append(detailsTitle, detailList);

            // Update and Remove buttons
            const buttons = document.createElement("div");
            buttons.className = "member-actions";

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.textContent = "Update";
            editBtn.dataset.action = "edit";
            editBtn.dataset.id = member.id;

            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.textContent = "Remove";
            removeBtn.dataset.action = "remove";
            removeBtn.dataset.id = member.id;

            buttons.append(editBtn, removeBtn);

            // Assemble the complete card
            item.append(heading, summary, details, buttons);
            memberList.appendChild(item);
        });

        updateMemberCount();
    }

    // 9. Clear all validation errors
    function clearFieldErrors() {
        Object.keys(fields).forEach((key) => {
            showError(key, "");
        });
    }

    // 10. Reset the form
    function stopEditing(hideMessage = true) {
        form.reset();
        editingMemberId = null;
        clearFieldErrors();

        if (submitBtn) {
            submitBtn.textContent = "Register";
        }

        if (cancelEdit) {
            cancelEdit.classList.add("hidden");
        }

        if (fields.password) {
            fields.password.placeholder = "Enter password";
        }

        if (fields.confirmPassword) {
            fields.confirmPassword.placeholder = "Confirm password";
        }

        if (successMsg && hideMessage) {
            successMsg.textContent = "";
            successMsg.classList.add("hidden");
        }
    }

    // 11. Register a member or save changes
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateForm()) {
            const firstInvalid = form.querySelector(".invalid");

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        const data = getFormData();

        if (editingMemberId !== null) {
            const member = members.find(
                (item) => item.id === editingMemberId
            );

            if (!member) {
                stopEditing();
                return;
            }

            Object.assign(member, data);

            // Keep the existing password unless a new one is entered.
            if (fields.password.value) {
                member.password = fields.password.value;
            }

            if (successMsg) {
                successMsg.textContent = "Member updated successfully!";
            }
        } else {
            members.push({
                id: nextMemberId++,
                ...data,
                password: fields.password.value
            });

            if (successMsg) {
                successMsg.textContent = "Registration successful!";
            }
        }

        renderMembers();

        if (successMsg) {
            successMsg.classList.remove("hidden");
        }

        stopEditing(false);
    });

    // 12. Validate as the user types
    Object.keys(fields).forEach((key) => {
        const field = fields[key];

        if (!field) {
            return;
        }

        const eventName =
            field.tagName === "SELECT" || field.type === "date"
                ? "change"
                : "input";

        field.addEventListener(eventName, () => {
            validateField(key);

            if (key === "password" || key === "confirmPassword") {
                validateField("confirmPassword");
            }

            if (successMsg) {
                successMsg.textContent = "";
                successMsg.classList.add("hidden");
            }
        });
    });

    // 13. Handle Update and Remove clicks
    if (memberList) {
        memberList.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");

            if (!button) {
                return;
            }

            const memberId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (!Number.isInteger(memberId)) {
                return;
            }

            if (action === "edit") {
                const member = members.find(
                    (item) => item.id === memberId
                );

                if (!member) {
                    return;
                }

                editingMemberId = memberId;

                fields.name.value = member.name;
                fields.email.value = member.email;
                fields.gender.value = member.gender;
                fields.dob.value = member.dob;
                fields.country.value = member.country;
                fields.phone.value = member.phone;
                fields.bio.value = member.bio;

                // Do not show the saved password in the form.
                fields.password.value = "";
                fields.confirmPassword.value = "";

                fields.password.placeholder =
                    "Leave blank to keep current password";

                fields.confirmPassword.placeholder =
                    "Only required if changing password";

                clearFieldErrors();

                if (submitBtn) {
                    submitBtn.textContent = "Update Member";
                }

                if (cancelEdit) {
                    cancelEdit.classList.remove("hidden");
                }

                if (successMsg) {
                    successMsg.textContent = "";
                    successMsg.classList.add("hidden");
                }

                form.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            if (action === "remove") {
                members = members.filter(
                    (item) => item.id !== memberId
                );

                if (editingMemberId === memberId) {
                    stopEditing();
                }

                renderMembers();
            }
        });
    }

    // 14. Cancel editing
    if (cancelEdit) {
        cancelEdit.addEventListener("click", () => {
            stopEditing();
        });
    }

    // 15. Toggle dark mode
    if (themeBtn) {
        themeBtn.setAttribute("aria-pressed", "false");

        themeBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark");

            themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
            themeBtn.setAttribute("aria-pressed", String(isDark));
        });
    }

    // 16. Initial setup
    renderMembers();
    stopEditing();
});