// 1. Grab every form on the website that has the "validated-form" class
const forms = document.querySelectorAll(".validated-form");

// 2. Loop through each form individually
forms.forEach((form) => {
  // 3. Find inputs and textareas specific only to THIS form instance
  const allFields = form.querySelectorAll("input, textarea");

  // 4. Attach the listener to this specific form
  form.addEventListener("submit", function (e) {
    let isFormValid = true;

    allFields.forEach((field) => {
      // 👇 ONE-LINE FIX: Skip hidden radio buttons so they don't disappear
      if (field.type === "radio") return;

      // Find the error paragraph right next to this field
      const errorMsg = field.nextElementSibling;

      // Clean up previous validation styles
      field.classList.remove("outline-red-500", "bg-red-50");
      if (errorMsg) errorMsg.classList.add("invisible");

      // Automated Validation Check using HTML5 Validation API
      if (!field.checkValidity() || (field.hasAttribute("required") && field.value.trim() === "")) {
        // Apply Tailwind classes dynamically
        field.classList.add("outline-red-500", "bg-red-50");
        if (errorMsg) errorMsg.classList.remove("invisible");

        isFormValid = false; // Block form submission
      }
    });

    // Stop traditional form submission if any automated check failed
    if (!isFormValid) {
      e.preventDefault();
    }
  });

  // Automatically clear errors dynamically while the user types!
  allFields.forEach((field) => {
    // 👇 ONE-LINE FIX: Skip hidden radio buttons here too
    if (field.type === "radio") return;

    field.addEventListener("input", function () {
      const errorMsg = field.nextElementSibling;

      // If the user fixed the field, remove the error styling immediately
      if (field.checkValidity() && field.value.trim() !== "") {
        field.classList.remove("outline-red-500", "bg-red-50");
        if (errorMsg) errorMsg.classList.add("invisible");
      }
    });
  });
});
