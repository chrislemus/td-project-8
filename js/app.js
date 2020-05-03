const lightbox = document.querySelector('.lightbox')
const lightboxContainer = document.querySelector('.lightbox-container')
const directory = document.getElementById('directory');
const searchbar = document.getElementById('directory-search');
let lastEmployee;
let firstEmployee;

// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------
function checkStatus(response) {
    if (response.ok) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(response.statusText));
    }
}

function fetchData(url) {
    return fetch(url)
             .then(checkStatus)  
             .then(res => res.json())
             .catch(error => console.log('😞Looks like there was a problem!', error))
  }

fetchData('https://randomuser.me/api/?results=12&nat=us&inc=picture,name,email,location,cell,dob')
    .then(data => {
        employees = data.results;
        makeEmployeeCard(employees);
})
    
// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------

//Creates employee card
function makeEmployeeCard(data) {
    const employeeCard = data.map(employee => `
    <div class="employee-card" id="${employee.email}">
        <img src="${employee.picture.large}" alt="profile-pic">
        <div class="employee-info">
            <h2>${employee.name.first} ${employee.name.last}</h2>
            <p class="email">${employee.email}</p>
            <p>${employee.location.city}</p>
        </div>
    </div>
    `).join("")
    directory.innerHTML = employeeCard;
}

//changes date format received from API, to a more readible date formate.
function convertDate(date) {
        var date = new Date(date);
        if (!isNaN(date.getTime())) {
            // Months use 0 index.
            return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
        }
}
//gets extra employee info for lightbox
function getSecondaryInfo(employee) {
    const employeeEmail = employee.querySelector('.email').innerText
    const moreInfo = employees.filter(employee => employee.email == employeeEmail);
    const dob = convertDate(moreInfo[0].dob.date);
    return `<div class="employee-contact lightbox-element">
                            <p>${moreInfo[0].cell}</p>
                            <p>${moreInfo[0].location.street.number} ${moreInfo[0].location.street.name}, ${moreInfo[0].location.state} ${moreInfo[0].location.postcode}</p>
                            <p>Birthday: ${dob}</p>
                        </div>`
}
//returns entire employee card container. Even if user clicks on a childNode
function getEmployeeCard(selection) {
    const ChildParent = selection.parentNode;
    const lastChildParent = selection.parentNode.parentNode;
    if (selection.classList.contains('employee-card') ) {
        return selection;
    } else if (ChildParent.classList.contains('employee-card')) {
        return ChildParent;
    } else if (lastChildParent.classList.contains('employee-card')) {
        return lastChildParent;
    }
}
//displays lightbox
function createLightbox(employee) {
    let employeeSecondaryInfo = getSecondaryInfo(employee)
    let innerContent = `<div class="employee-card">`;
    innerContent += employee.innerHTML;
    innerContent += employeeSecondaryInfo;
    innerContent += '</div>';
    lightboxContainer.innerHTML += innerContent;
    lightbox.style.display = "block";
}
//clears lightbox content(removes employee info from lightbox)
function clearLightboxContent() {
    let employeeCard = lightboxContainer.querySelector('.employee-card');
    employeeCard.remove()
}

// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------

lightboxContainer.addEventListener('click', (e) => {
    //closes lightbox
    const closeLightboxBtn = e.target.classList.contains('close-btn')
    if (closeLightboxBtn) {
        clearLightboxContent();
        lightbox.style.display = 'none';
    }
    //lightbox displays different employee info based on which nav arrow user click
    if (e.target.classList.contains('nav-arrow')) {
        lastEmployee = directory.lastElementChild.id; 
        firstEmployee = directory.firstElementChild.id;
        const nextArrow = e.target.id == "right-arrow";
        const previousArrow = e.target.id == "left-arrow";
        const userEmail = lightboxContainer.querySelector('.email').innerText;
        const currentEmployee = document.getElementById(userEmail);
        //displays next employee, if user clicks right arrow
        if (nextArrow && userEmail != lastEmployee) {
            const nextEmployee = currentEmployee.nextElementSibling; 
            clearLightboxContent();
            createLightbox(nextEmployee)
        //displays previous employee, if user clicks left arrow
        } else if (previousArrow && userEmail != firstEmployee) {
            const previousEmployee = currentEmployee.previousElementSibling; 
            clearLightboxContent();
            createLightbox(previousEmployee)
        }
    }
})
//listens for when user clicks on a employee card
directory.addEventListener('click', (e) => {
    const employeeCardSelected = e.target !== e.currentTarget;

    if (employeeCardSelected ) {  
        let employeeCard = getEmployeeCard(e.target)
        createLightbox(employeeCard);
    }    
})
//displays search results based on user input
searchbar.addEventListener('keyup', () => {
    let search = searchbar.value.toLowerCase();
    let results = employees.filter(employee => employee.name.first.toLowerCase().startsWith(search))
    makeEmployeeCard(results);
})
