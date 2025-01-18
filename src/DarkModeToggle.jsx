//Dark mode toggle functionality for people who prefer/need it
import React, { useState } from "react"

function DarkModeToggle() {
    //isChecked is a variable, setIsChecked is a function. the argument in useState is the starting value of isChecked
    const [isChecked, setIsChecked] = useState(false)

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked)
        // document.body.classList.toggle("darkMode")

        if (isChecked == false){
            document.body.classList.add("darkMode")
        } else{
            document.body.classList.remove("darkMode")
        }
    }
    
    return <>
        <label>
            <input type="checkbox" name="darkModeButton" checked ={isChecked} onChange={handleCheckboxChange}/>
            <label for="darkModeButton">Dark Mode</label>
            <p>Dark mode is: {isChecked ? "ON" : "OFF"}!</p>
        </label>
    </>

}


export default DarkModeToggle;