# greenhouse-jobs

Use JavaScript, Webflow, and the Greenhouse jobs API to list open positions on your site

Clone an example site from Made in Webflow:

https://webflow.com/made-in-webflow/website/greenhouse-jobs-attr

A common tool that Webflow users work with is Greenhouse Jobs. Greenhouse is an applicant tracking system and job board with many powerful features.

# Using fetch api to write jobs on page load

In Webflow, it can be challenging to use fetch since there’s no way to hide a secret key. The good news is that Greenhouse doesn’t require any keys to fetch job listings. First, in the project on the page where we’re calling our jobs we set a variable that is a string of our slug where our jobs are found in Greenhouse.

## Implementing this on your own site

To implement this on your own site, you need to ensure you have the proper setup and structure on your Webflow site. You can see a visual of this on the [How it works page of our cloneable](https://greenhouse-jobs-attr.webflow.io/how-it-works).

You'll need the following structure:

- A form element with a select field
  - it should have an custom attribute of `data-gh="filter"`
  - it should have one option for All teams with a value of all
- A section with a loading animation
  - it should have an atrribute of `data-gh="loading"`
  - this div should have a combo class of `hidden` which sets the opacity to `0`
  - our code will remove this combo class when the page loads
- A div with an attribute of `data-gh="root"`
  - this should be a sibling of the loading element
  - this is where all of our department sections will be added
  - this div should have a combo class of `hidden` which sets the opacity to `0`
  - our code will remove this combo class when the page loads
- A template section we'll use to clone for each department
  - it should have an attribute of `data-gh="section-wrapper"`
  - inside the section should be a heading with an attribute of `data-gh="section-heading"`
  - inside the section should be an unordered list with an attribute of `data-gh="container"`
  - inside the list should be a list item with an attribute of `gh-data="listing"`
  - inside the list item should be two elements
    - a text link or link element with an attribute of `data-gh="job-title"`
      - this element also has an attribute of `data-label="role"`
    - a text element with an attribute of `data-gh="location"`
      - this element also has an attribute of `data-label="location"`

In our example, the extra attributes are used to add labels for mobile using some custom CSS and `::before`.

```html
<style>
  @media screen and (max-width: 767px) {
    [data-label="role"]::before {
      content: attr(data-label) ": ";
      font-weight: 700;
      text-transform: uppercase;
    }
    [data-label="location"]::before {
      content: attr(data-label) ": ";
      font-weight: 700;
      text-transform: uppercase;
    }
  }
</style>
```

Once you have the structure complete you just need to add the JavaScript to the before `</body>` custom code section in your page settings.

```html
<script>
  const ghSlugh = "webflow"; //replace with your own orgs slug
</script>
<script
  src="https://cdn.jsdelivr.net/gh/webflow-examples/greenhouse-jobs@greenhouse-webflow/script.js"
  type="text/javascript"
></script>
```

Or for the minified version you can use

```html
<script>
  const ghSlugh = "webflow"; //replace with your own orgs slug
</script>
<script
  src="https://cdn.jsdelivr.net/gh/webflow-examples/greenhouse-jobs@greenhouse-webflow/script.min.js"
  type="text/javascript"
></script>
```

## Code walkthrough

In Webflow, there's a script in the before body with one variable: `ghSlug`. Just change this to the slug for your company in Greenhouse.

First, we’re setting global variables in an object. Below you can see we also create an empty array to hold Department ID’s. We’ll use the items in the array later to make API calls and get listings.

```js
const domElements = {
  root: document.querySelector('[data-gh="root"]'),
  loading: document.querySelector('[data-gh="loading"]'),
  jobFilter: document.querySelector('[data-gh="filter"]'),
  placeHolder: document.querySelector('[data-gh="placeholder"]'),
  sectionWrapper: document.querySelector('[data-gh="section-wrapper"]'),
  sectionHeading: document.querySelector('[data-gh="section-heading"]'),
};

const departmentIds = [];
```

The global variables are:

- root - an element in Webflow where we’ll add our listings
- loading - an element in Webflow that holds our loading animation
- jobFilter - a select element in Webflow we’ll use to filter departments
- placeHolder - an element that holds the section for each department that we'll clone
- sectionWrapper - the section we'll clone for each department

Next, let’s tackle our page load function. When the page is loaded, we’ll make an API call to Greenhouse. This is a call to get all the departments. Then for each department we add the id to our global id array. Then we clone a section that’s built in Webflow and add it to the root and give it an id that matches the Department ID. We also pass in the title of our department to our section heading in this section. In our [example site](https://webflow.com/made-in-webflow/website/greenhouse-jobs-attr), you can see this section is in a div with a class of `placeholder` which is set to `display: none;`.

```js
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
          sectionClone
            .querySelector('[data-gh="container"]')
            .setAttribute("aria-label", department.name);
          domElements.root.appendChild(sectionClone);
          let option = new Option(department.name, department.id);
          domElements.jobFilter.add(option);
        }
      });
    })
    .catch(console.error)
    .finally(writeJobs);
});
```

‍
Then for each Department, we also add it as an option to our select field we’ll be using as a filter.

If a department doesn’t have any job listings, we just ignore it.

Next we call another function, `writeJobs`. Here, we use the ID’s we added to the array and make an API call to Greenhouse for each department. Then for each job listing, we clone an element in that department's section and pass through the job name and a link to the listing and add it to the DOM. We’re using Department ID to match the listing to the right section. In our example, you'll see we're using semantic lists.

```js
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
```

Finally, we remove a class to the job listings to make them visible, and we add a class to fade out the loading element and then remove it from the DOM.

The upside of using cloneNode means that we can build the elements and style them in Webflow and then just hide them from view. It’s what we’re doing in our [example](https://webflow.com/made-in-webflow/website/greenhouse-jobs-attr).

The pros of this approach is that the listings are always current. Again, it empowers your people and recruiting team to quickly update the listings and make changes without having access to your Webflow site.

The one downside of this approach is since the content is being added on page load with JavaScript. Most search engines run JavaScript before indexing so your listings should be ok. But sometimes, folks see writing to the DOM on page load as less than ideal.

**NOTE**: if you have a large amount of listings or departments you may want to optimize this code.

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
