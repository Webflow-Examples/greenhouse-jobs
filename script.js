// Global object to store DOM elements
const domElements = {
  root: document.querySelector('[data-gh="root"]'),
  loading: document.querySelector('[data-gh="loading"]'),
  jobFilter: document.querySelector('[data-gh="filter"]'),
  placeHolder: document.querySelector('[data-gh="placeholder"]'),
  sectionWrapper: document.querySelector('[data-gh="section-wrapper"]'),
  sectionHeading: document.querySelector('[data-gh="section-heading"]'),
};

const departmentIds = [];

// Fetch function we'll use to get data from the Greenhouse endpoints
const fetchData = (url) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw Error(` ${response.status} ${response.statusText}`);
    }
    return response.json();
  });

// Filtering function for select element
domElements.jobFilter.onchange = () => {
  const selectedSection = domElements.jobFilter.value;
  const sections = document.querySelectorAll('[data-gh="section-wrapper"]');
  sections.forEach((section) => {
    section.style.display =
      selectedSection === "all" || section.id === selectedSection
        ? "block"
        : "none";
  });
};

// When the DOM is ready, fetch the data and write it to the page
// Start by showing the loader and getting the department data
window.addEventListener("DOMContentLoaded", () => {
  domElements.loading.classList.remove("hidden");
  fetchData(`https://boards-api.greenhouse.io/v1/boards/${ghSlug}/departments/`)
    .then((data) => {
      data.departments.forEach((department) => {
        if (department.jobs.length > 0) {
          departmentIds.push(department.id);
          let sectionClone = domElements.sectionWrapper.cloneNode(true);
          sectionClone.id = department.id;
          sectionClone.querySelector('[data-gh="section-heading"]').innerText =
            department.name;
          domElements.root.appendChild(sectionClone);
          let option = new Option(department.name, department.id);
          domElements.jobFilter.add(option);
        }
      });
    })
    .catch(console.error)
    .finally(writeJobs);
});

// Triggered in finally above
// Writes all the jobs to the page
function writeJobs() {
  departmentIds.forEach((departmentId) => {
    fetchData(
      `https://boards-api.greenhouse.io/v1/boards/${ghSlug}/departments/${departmentId}`
    )
      .then((data) => {
        let parent = document.getElementById(data.id);
        let parentContainer = parent.querySelector('[data-gh="container"]');
        data.jobs.forEach((job) => {
          let ghListing = parentContainer
            .querySelector('[data-gh="listing"]')
            .cloneNode(true);
          ghListing.id = job.id;
          let jobTitle = ghListing.querySelector('[data-gh="job-title"]');
          jobTitle.innerText = job.title;
          jobTitle.setAttribute("href", job.absolute_url);
          ghListing.querySelector('[data-gh="job-location"]').innerText =
            job.location.name;
          parentContainer.appendChild(ghListing);
        });
        parentContainer.querySelector('[data-gh="listing"]').remove();
      })
      .catch(console.error)
      .finally(() => {
        domElements.loading.classList.add("hidden");
        domElements.loading.remove();
        domElements.placeHolder.remove();
        domElements.root.classList.remove("hidden");
      });
  });
}
