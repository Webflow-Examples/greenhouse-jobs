# greenhouse-jobs

Use JavaScript, Webflow, and the Greenhouse jobs API to list open positions on your site

Clone an example site from Made in Webflow:

https://webflow.com/made-in-webflow/website/greenhouse-job-board-with-js

A common tool that Webflow users work with is Greenhouse Jobs. Greenhouse is an applicant tracking system and job board with many powerful features.

# Using fetch api to write jobs on page load

In Webflow, it can be challenging to use fetch since there’s no way to hide a secret key. The good news is that Greenhouse doesn’t require any keys to fetch job listings. First, in the project on the page where we’re calling our jobs we set a variable that is a string of our slug where our jobs are found in Webflow.

## Code walkthrough

In Webflow, there's a script in the before body with one variable: `ghSlug`. Just change this to the slug for your company in Greenhouse.

First, we’re setting global variables. Below you can see we create an empty array to hold Department ID’s. We’ll use the items in the array later to make API calls and get listings.

```js
const departmentIds = [];
const root = document.getElementById("root");
const loading = document.getElementById("loading");
const jobFilter = document.getElementById("filter");
const errorWrapper = document.getElementById("errwrapper");
const errorText = document.getElementById("errtext");
```

We also have:

- root - an element in Webflow where we’ll add our listings
- loading - an element in Webflow that holds our loading animation
- jobFilter - a select element in Webflow we’ll use to filter departments
- errorWrapper - an element in Webflow that will wrap any error messages
- errorText - a text element in Webflow where our error messages will show

Next, let’s tackle our page load function. When the page is loaded, we’ll make an API call to Greenhouse. This is a call to get all the departments. Then for each department we add the id to our global id array. Then we clone a section that’s built in Webflow and add it to the root and give it an id that matches the Department ID. In our [example site](https://webflow.com/made-in-webflow/website/greenhouse-job-board-with-js), you can see these classes are set to `display: none` and have a class of `Hidden`.

```js
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
          jobIds.push(department.id);
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
```

We also clone a heading element in Webflow, add it to the section and pass the name of the department through.
‍
Then for each Department, we also add it as an option to our select field we’ll be using as a filter.

If a department doesn’t have any job listings, we just ignore it.

Next we call another function,` writeJobs`. Here, we use the ID’s we added to the array and make an API call to Greenhouse for each department. Then for each job listing, we clone an element in Webflow and pass through the job name and a link to the listing and add it to the corresponding section. We’re using Department ID to match the listing to the right section.

```js
function writeJobs() {
  jobIds.forEach((jobId) => {
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
        jobId
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
```

Finally, we add a class to the job listings to make them visible, and we do the same to fade out the loading element and then remove it from the DOM.

The upside of using cloneNode means that we can build the elements and style them in Webflow and then just hide them from view. It’s what we’re doing in our [example](https://webflow.com/made-in-webflow/website/greenhouse-job-board-with-js).

The pros of this approach is that the listings are always current. Again, it empowers your people and recruiting team to quickly update the listings and make changes without having access to your Webflow site.

The one downside of this approach is since the content is being added on page load with JavaScript, it's not available for SEO.

# Additional methods

## Third-party tools

You can use third-party tools like Parabola and Make to sync the items from Greenhouse to the Webflow CMS, and then you can just design your content and build as you normally would.

The updside to this approach is that you don't have to deal with any custom code and your listings are on the page which will help from an SEO perspective.

The downside is that you're relying on a third-party tool that:

- needs to be vetted
- will sync when a webhook fires or on a schedule
- when someone from the team adds a new position it may not be immediately available on the site

## iframes

The most common way to integrate Greenhouse is to embed an iframe of your board in Webflow.

This is easy to implement in Webflow and it empowers your people and recruiting team to quickly update the listings and make changes without having access to your Webflow site.

‍But, the downside to this approach is that your job board may not match the look and feel of your brand and you lose some design and creative control.
