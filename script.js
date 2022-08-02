// Global variables defined here
const departmentIds = [];
const root = document.getElementById("root");
const loading = document.getElementById("loading");
const jobFilter = document.getElementById("filter");
const errorWrapper = document.getElementById("errwrapper");
const errorText = document.getElementById("errtext");

// Filtering function for select element
jobFilter.onchange = function () {
  let selectedSection = this.value;
  if (selectedSection == "all") {
    let filtered = document.querySelectorAll(".department-section");
    filtered.forEach((filtered) => {
      filtered.style.display = "block";
    });
  } else {
    let filtered = document.querySelectorAll(".department-section");
    filtered.forEach((filtered) => {
      filtered.style.display = "none";
    });
    document.getElementById(selectedSection).style.display = "block";
  }
};

// Triggers when the DOM is ready
window.addEventListener("DOMContentLoaded", (event) => {
  const handleError = (response) => {
    if (!response.ok) {
      throw Error(` ${response.status} ${response.statusText}`);
    } else {
      return response.json();
    }
  };
  fetch(
    "https://boards-api.greenhouse.io/v1/boards/" + ghSlug + "/departments/"
  )
    .then(handleError)
    .then((data) => {
      data.departments.forEach((department) => {
        if (department.jobs.length !== 0) {
          departmentIds.push(department.id);
          let sectionWrapper = document.getElementById("section");
          let sectionClone = sectionWrapper.cloneNode(true);
          sectionClone.id = department.id;
          root.appendChild(sectionClone);
          let option = document.createElement("option");
          option.text = department.name;
          option.value = department.id;
          jobFilter.add(option);
        } else {
          null;
        }
      });
    })
    .catch(function writeError(err) {
      console.error(err);
    })
    .finally(() => {
      writeJobs();
    });
});
// Triggered in finally above
function writeJobs() {
  departmentIds.forEach((departmentId) => {
    const handleError = (response) => {
      if (!response.ok) {
        throw Error(` ${response.status} ${response.statusText}`);
      } else {
        return response.json();
      }
    };
    fetch(
      "https://boards-api.greenhouse.io/v1/boards/" +
        ghSlug +
        "/departments/" +
        departmentId
    )
      .then(handleError)
      .then((data) => {
        let parent = document.getElementById(data.id);
        let parentContainer = parent.getElementsByClassName("container")[0];
        let sectionHeading = document.getElementById("dname");
        let sectionTitle = sectionHeading.cloneNode(true);
        sectionTitle.innerText = data.name;
        parentContainer.appendChild(sectionTitle);
        data.jobs.forEach((job) => {
          let listing = document.getElementById("listing");
          let ghListing = listing.cloneNode(true);
          ghListing.id = job.id;
          let jobTitle = ghListing.getElementsByClassName("job-title")[0];
          jobTitle.innerText = job.title;
          jobTitle.setAttribute("href", job.absolute_url);
          let jobLocation = ghListing.getElementsByClassName("job-location")[0];
          jobLocation.innerText = job.location.name;
          parentContainer.appendChild(ghListing);
        });
      })
      .catch(function writeError(err) {
        console.error(err);
      })
      .finally(() => {
        loading.classList.add("invisible");
        loading.remove();
        root.classList.add("visible");
      });
  });
}
