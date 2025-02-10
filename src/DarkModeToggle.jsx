import React from "react";

function DarkModeToggle() {
    // The application is always in dark mode, so no state or toggle function is needed.
    React.useEffect(() => {
        document.body.classList.add("darkMode");
    }, []);  // Ensures dark mode is applied on component mount

    return null;  // No UI is needed for this component
}

export default DarkModeToggle;
