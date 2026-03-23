
# Website Improvements and Bug Fixes

## All pages

- When the page do not have scrollbar, the content layout, I mean, the measurements is not the same as when the page have scrollbar. So I want to make sure that the layout is the same in both cases, with or without scrollbar, so it does not affect the design and the user experience.
- The content width, as well as the footer and the navbar, should be a little bit bigger to fill more the screen, but just a little bit, not too much. It can be 0.2 (20%) first column in the grid layout, and the second column with 0.8 (80%) of the width that is the website content, and the remaining 0.2.

## Responsiveness

- The toggle mode in the sandwich menu is left align. Change to be right align.
- In the home screen, the column in the right side of the hero section, when in mobile, is the first row above the name, etc. The column in the left should be the first row, and the column in the right should be the second row, so it keeps the same order of the desktop version, but in a single column layout.
- In mobile, the search box should be a search icon only, without the text "Search". And should be placed in the right side of the navbar, just before the sandwich menu icon. When the user clicks on the search icon, it should open a search input field with the same design as in the desktop version, but in a dropdown or modal style, so it does not take too much space in the mobile view.
- The projects in the home is not responsive in the bento grid. It is keeping the bento grid while it should be changing to a single column layout, with the same design of the cards, but just in a single column, and with a good spacing between them. The projects section in the portfolio is right.

## Home

### Hero Section Background

- The background effect is not working. Change it to the description below:
  - Central Processing Node: A dominant “CPU” acts as the system’s hub — everything connects to or from it.
    - It must be placed in the space between the navbar and the hero beginning, and it should be medium size. Not big, but not too small, just enough to be the main element of the hero backgroun
  - Structured Connection Network: Paths form a grid-like circuit, suggesting engineered data routing (not randomness). Stating paths from the whole visible area of the start view (hero)
  - Guided Flow of Data: Motion is constrained along paths, reinforcing the idea of controlled pipelines.
  - Data as Light/Energy: Glowing pulses represent information moving through the system.
  - Parallel Activity: Multiple colored paths imply simultaneous processes (parallelism).
  - Lifecycle Visualization: Lines appear (initialization) → pulses move continuously (runtime activity).
  - Controlled Complexity: Balanced between order and chaos to feel both precise and advanced.
  - Abstract but Meaningful: Not literal hardware, but clearly evokes computing, networks, and AI systems.
  - Eye Guidance Loop: Visual flow directs attention from edges → paths → CPU → back outward.
  - Implicit Messaging:Conveys: activity, intelligence, and system power without text.

### Footer

- Privacy Policy and Terms of Service, when selected PT language show a 404 page. Should present the same as english but in portugues.

---

## Blog

- Do not use a saparator line between the blog posts, just use them between the months and between the years, with the width of the titles and the content, to separate them visually, but not between each blog post, to keep a cleaner look. So it should be like a list.


## Portfolio Page

#### Skills 

- The skills should be built automatically based on the skills posted in each experience and project. So when I add a new experience or project with skills, these skills should be automatically added to the skills section
- Here, you must to create a beautiful and visual appealing way to display these skills with these requirements:
  - There should be a filter option to filter the skills by category (All, soft, hard, programming)
    - This filter is just Buttons Texts centered, without border, just to highlight with a bottom lighting shader and change the foreground 
  - It should be a visual scheme with the weight of each skill, based on the number of times this skill is mentioned in the experience and projects. So the more times a skill is mentioned, the bigger it should be displayed in this section. (for example, if I have 10 experiences and projects, and a skill is mentioned in 5 of them, it should be bigger than a skill that is mentioned in only 1 experience or project).
  - The skills should be distributed in a way that it keeps all docked without leaving big empty spaces, and without overlapping each other, and always being justify to the content width of the page, and with a good spacing between them, so it looks like a cloud of skills, but with a good visual distribution. (for example, you can use a grid layout, but with different sizes for each skill based on the weight of each skill, and with a good spacing between them, so it looks like a cloud of skills, but with a good visual distribution).

#### Publications

## Blog Page

- The options of filtering the blog posts by category should be restricted to the categories. So it needs:
  - Add the category of a blog post into the metadata of the blog post template. Each blog post should have, as the notes cards, a category and tags.
  - The filter option of blog posts should be different from the notes, because the blog posts should be filterable only by category, and the notes should be filterable by category and by tags. So in the blog page, it should be just the categories as filter options, and in the notes page, it should be both categories and tags as filter options.
  - The filter box should have the same design as the notes filter box, but with the options of categories only, and with the same functionality as the notes filter box, but just for the blog posts. So when I click on a category, it should show me all blog posts with this category, and when I click on "All", it should show me all blog posts.
  - For both, the categories should display the number of publications or notes in each category.
  - The tags in the notes page should not display the number of notes in each tag, it is just for categories.
    - This number of publications or notes should be placed in a small badge in the category badge, like a number of notifications an app have in an Android. Should be a small circle with the accent color, and the number inside with a white color, and with a good typography to be readable, and it should be placed in the top right corner of the category badge, like a notification badge.

### Individual Blog Post

#### Layout Structure

- Follow this structure for a blog post page:
  - At the very top, above the title, there should be placed the button "Back to blog" with an arrow icon, to give the user the option to go back to the blog page.
  - The category
  - The title here
  - The subtitle below (if there is one)
  - The other metadata (date, reading time) below the title and subtitle
  - The keywords/tags below the subtitle, with a good spacing between them, and with a visual design that makes them look like tags (for example, with a background color and rounded corners - badge)
  - The Author Block: A section with a circular image, name, and subtitle (e.g., 'Senior Software Engineer & Educator') right below the main title.
  - The TOC column should start aligned with the beggining of the content, not with the title. So it should have all the above information, a line separating this preamble and the content, and then the content and TOC columns
    - This TOC columns should have the same background color of the other website elements, like the cards of projects or notes background and border.
  - Components: A reading progress bar at the very top, a 'Back' button with an arrow icon, and a prominent CTA card at the end of the post.
  - At the final of the post, there should be a section with "Share this post" with social media icons (LinkedIn, Twitter, Facebook, WhatsApp, and Copy the Link) that are clickable and lead to the respective sharing pages for each platform.
- At the bottom of this page, there should be a related posts section with the last 3 blog posts related to the category of the current blog post, with the same card design as in the blog page, but with a smaller size.
  - On the left, older posts, and on the right, newer posts.
- There should be a Back to top button at the bottom right of the visible page that will walk with the scroll until it gets the bottom of the page and stay fixed in the right bottom corner. And when the user clicks on this button, it should take them to the top of the page.

## Notes Page

- The note page should follow the layout below (very similar to the blog post page, but with some differences)::
  - At the very top, above the title, there should be placed the button "Back to notes" with an arrow icon, to give the user the option to go back to the blog page.
  - The category
  - The title here
  - The subtitle below (if there is one)
  - The other metadata (date) below the title and subtitle
  - The keywords/tags below the date, with a good spacing between them, and with a visual design that makes them look like tags - the same as in blog post page,.
  - There is no TOC for the notes page
  - There is no progress bar for the notes page, and no CTA card at the end of the note.
  - At the final of the post, there should be a section with "Share this note" with social media icons (LinkedIn, Twitter, Facebook, WhatsApp, and Copy the Link) that are clickable and lead to the respective sharing pages for each platform.
- At the bottom of this page, there should be a related posts section with the last 3 blog posts related to the category of the current blog post, with the same card design as in the blog page, but with a smaller size.
  - On the left, older posts, and on the right, newer posts.
- There should be a Back to top button at the bottom right of the visible page that will walk with the scroll until it gets the bottom of the page and stay fixed in the right bottom corner. And when the user clicks on this button, it should take them to the top of the page.

## Share this post/note

- This should send the page with a pre-filled message to share in each platform, with the title of the post/note and the link to the post/note. For example, for LinkedIn, it should open a new window with the LinkedIn sharing page, and the message should be "Check out this blog post: [title of the post] [link to the post]". For Twitter, it should open a new window with the Twitter sharing page, and the message should be "Check out this blog post: [title of the post] [link to the post]". For Facebook, it should open a new window with the Facebook sharing page, and the message should be "Check out this blog post: [title of the post] [link to the post]". For WhatsApp, it should open a new window with the WhatsApp sharing page, and the message should be "Check out this blog post: [title of the post] [link to the post]". For Copy the Link, it should copy to the clipboard the message "Check out this blog post: [title of the post] [link to the post]", and show a tooltip with "Link copied!" for 2 seconds.
  - There should have a tumbnail image in the message to be shared, so it looks more attractive when shared in social media. This thumbnail image should be the same as the one used in the blog post page and in the notes page, that is the image with the title of the post/note and the author (that is my site solo and signature), etc. So when I share a post/note, it should generate this thumbnail image with the title of the post/note and the category, etc., and use this image in the message to be shared in social media.
