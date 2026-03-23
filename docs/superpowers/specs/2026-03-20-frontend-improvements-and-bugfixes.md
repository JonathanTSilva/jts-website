
# Website Improvements and Bug Fixes

## Responsiveness

- Work on the responsiveness of the website, especially for mobile devices. Some elements are not displaying correctly or are misaligned on smaller screens.
- The button of the menu is buggy and does not work properly on mobile. It is appearing the 3 lines + the x at the same time. When I click on the menu button, it should toggle between the 3 lines and the x, and it should show/hide the menu accordingly.
- Toggle theme is not working on mobile
- The search box is not appearing on mobile, and it should be appearing in the navbar on mobile as well, with the same design as in desktop.

## Home

### Navbar

- Navbar Alignment: The navbar must be horizontally and verticallycentered with the page layout.

### Navbar left element

- On the left where is my name, add a Logo (to be provided) to the left of the name. The logo should be small and not overpower the text.
- The text shoulb have the same height as the logo, and both should be vertically aligned.

### NavLinks Behavior

- Hover effect should highlight the individual link, not show the whole effect from that that is selected (the frame).
- The “active/selected” state should move only when a link is clicked (not on hover).
- This is buggy in PT language. When selected PT, the active state frame is on Home, but the selected stay just highlighted, without the frame. This should be fixed, so when I select PT, the active state frame should be on Home, and the selected state should be on PT.

### Search Feature

- Replace the search icon (magnifying glass) with a search input field containing the placeholder text “Search” and the Magnifying Glass icon on the right of this field.

### Language Selector

- Improve the language switcher (EN/PT). It is ugly. Should be exactly the same as the theme switcher (dark/light mode) in terms of design and interaction.
- It should not be displayed in the header, just in the footer (see Footer section below).
- When I click on the language that I want, it leads me to the home page in that language, but it should lead me to the same page I am, but in the other language. For example, if I am in the portfolio page in English and I click on PT, it should lead me to the portfolio page in Portuguese, and not to the home page in Portuguese.

### Theme Toggle (Dark/Light)

- The light mode icon (sun) is correct.
- The dark mode icon (moon) is visually broken (cut off) and must be fixed.

### Navbar Items Alignment

- All navbar elements must be:
  - Vertically aligned
  - Horizontally spaced consistently

---

### Hero Section

- Hero section should fit the first viewport height (100vh) without any overflow or extra space.
- So then the scroll indicator/behavior should start immediately after the Hero section, not before or after it.
- The current implementation has the Navbar scrolling with the page until some point and later it disappears, which is not correct. The Navbar should be fixed at the top of the viewport at all times and in all pages. At least in this first version

#### Background Effect

- The animated line effect is not working properly.
- It should span continuously from the navbar through the entire Hero section. and ocuppy the full width of the page (just this background effect).
- Must work correctly in both light and dark modes.

#### Content

- Add a squared profile image on the right side of the Hero section (image to be provided).
- The image should be aligned with the text on the left and should not exceed the height of this text content.
- This text content includes the name, title, and description, but not the buttons.
- The butons should be placed below the text content and should not affect the height of the profile image.
  - Above the buttons View Portfolio, Read Blog, Check my notes, there should be a small text that says "Explore my work and insights" or something like that, to give more context to the user about what they will find in these sections.
  - Above this text, there should be a line with my contacts (email, LinkedIn, GitHub) with icons, and these icons should be clickable and lead to the respective contact pages. (the same links presented in the footer)
- Beside the image there should be my achievements and facts to be displayed as boxes 2 boxes per line.
  - I have these facts and achievements to display:
    - 6 + Years of Experience (this number should be uupdated as time goes by. Starting my experience in 2020, so it should be the year until today plus the Plus sign)
    - Coordinate 3 R&D projects
    - 30+ professional Projects
    - Highest GPA in graduation and master's degree
- The image should follow the same visual style of the bento grid used in the projects section and in the publications section (border, shadow, etc.).

---

### Projects Section

#### Layout (Bento Grid)

- Projects must be displayed using a Bento Grid layout.
- Current layout (stacked vertically with no spacing) is incorrect.
- Follow the same visual pattern used in the portfolio section (there is right. Should be the same but limited elements, because for more information the user must go to portfolio page).
- Fix the highlighted project. THe first one is highlighted by default, but it should be highlighted only when the user hovers over it.

---

### Publications Section

#### Visual Redesign

- The section needs a more polished and distinctive design.
- I have 5 technical publications between article, conference, and journal.
- Items should resemble styled cards, in a single row.
  - If someday I have more than 6 publications, the layout should fixed the number with 6, just getting the most recent ones, and the user should be able to click to see all publications in the portfolio page.
- Improve visual hierarchy and presentation of articles and book publications.

---

### Blog and Notes

#### Latest Blog Posts

- Do not use a saparator line between the blog posts.
- Should be a simple list, as it is with title and date, but without this line
- Should have the last 5 blog posts

#### Latest Notes

- The cards is okay, but should be limited to the last 3 notes (1 row)
- The not should display inside the card the date, title and the category of the note at the bottom of the card.

---

### Contact Section

#### Contact UI

- This section must not exists. It should be part of the footer section, as a contact area, with the same design as the footer, and not as a separate section in the home page.

---

### Footer

#### Footer Alignment

- Footer content is not centered and must be aligned with the page layout. With the same content width as the navbar

#### Footer Structure

- The footer should have 2 rows
  - row 1 (3 columns)
    - left column: The same icon and name of the navbar (logo + name)
    - center column: contact icons (LinkedIn, GitHub Email, RSS).
    - right column: language selector (EN/PT) with the same design as the theme switcher (dark/light mode) in the header, but only in the footer.
  - row 2 (2 columns):
    - left column: copyright message
    - right column: Privacy Policy and Terms of Service links (to be provided in the future. Now, just create the file with an alert that says "This page is under construction" when the user clicks on these links)

#### Language Selector (Footer)

- Language switcher in the footer must be redesigned.
- It should follow the same improved UI as the header.


## Portfolio Page

### Biography Section

#### About me

- The text should there on left, and on the right there should be a profile image (different of that used in the hero section).
- The image should be aligned with the text and should not exceed the height of this text content.

#### Projects

- Should follow the same bento grid layout as the projects section in the home page, but with more projects (all projects, not just the last ones).
- Fix the highlighted project. THe first one is highlighted by default, but it should be highlighted only when the user hovers over it.

#### Experience

- The line of timeline should be highlighting with the scroll, so the user can see where they are in the timeline.

#### Skills (new section)

- The skills should be built automatically based on the skills posted in each experience and project. So when I add a new experience or project with skills, these skills should be automatically added to the skills section
- Here, you must to create a beautiful and visual appealing way to display these skills with these requirements:
  - There should be a filter option to filter the skills by category (All, soft, hard, programming)
  - It should be a visual scheme with the weight of each skill, based on the number of times this skill is mentioned in the experience and projects. So the more times a skill is mentioned, the bigger it should be displayed in this section. (for example, if I have 10 experiences and projects, and a skill is mentioned in 5 of them, it should be bigger than a skill that is mentioned in only 1 experience or project).
  - The skills should be distributed in a way that it keeps all docked without leaving big empty spaces, and without overlapping each other, and always being justify to the content width of the page, and with a good spacing between them, so it looks like a cloud of skills, but with a good visual distribution. (for example, you can use a grid layout, but with different sizes for each skill based on the weight of each skill, and with a good spacing between them, so it looks like a cloud of skills, but with a good visual distribution).

#### Publications

- Should follow the same card layout as the publications section in the home page, but with all publications (not just the last ones).

## Blog Page

- Should not have divider lines between the blog posts. Just between the months with the width of the titles, and between the years with the width of the content.
- Like the Notes page, should have an option to filter the blog posts by category (All, Software Development, Data Science, etc.) and by tags (for example, if I click on the tag "Python", it should show me all blog posts with this tag).
- Should display for each blog post the title, following for the time of reading, and in the right aligned the date in the list of blog posts.

### Individual Blog Post

#### Layout Structure

- At the very top, above the title, there should be placed the button "Back to blog" with an arrow icon, to give the user the option to go back to the blog page.
- The metadata (category in a badge, date, reading time) below the title and subtitle
- The title here
- The subtitle below (if there is one)
- The keywords/tags below the subtitle, with a good spacing between them, and with a visual design that makes them look like tags (for example, with a background color and rounded corners - badge)
- The Author Block: A section with a circular image, name, and subtitle (e.g., 'Senior Software Engineer & Educator') right below the main title.
- Need to implement a TOC in the sidebar listing H2 and H3 headers that highlights the active section during scroll.
- Grid System: layout with two columns (1fr for main content and 280px for a sticky Sidebar/TOC).
- Components: A reading progress bar at the very top, a 'Back' button with an arrow icon, and a prominent CTA card at the end of the post.
- At the final of the post, there should be a section 
Share this post with social media icons (LinkedIn, Twitter, Facebook, WhatsApp, and Copy the Link) that are clickable and lead to the respective sharing pages for each platform.
- At the bottom of this page, there should be a related posts section with the last 3 blog posts related to the category of the current blog post, with the same card design as in the blog page, but with a smaller size.
- There should be a Back to top button at the bottom right of the visible page that will walk with the scroll until it gets the bottom of the page and stay fixed in the right bottom corner. And when the user clicks on this button, it should take them to the top of the page.

#### Responsiveness

- Hide the TOC sidebar on mobile.
- Ensure the Dock menu collapses or simplifies for smaller screens

## Notes Page

- Here in the notes, the cards colors should vary based on the category. Not the highlight color, but that color in the .note-card::before that is an accent color. Each category should have a different color, and this color should be consistent across the website (for example, if I have a category "Data Science" with a blue accent color, all notes with this category should have this blue accent color in the card, and also in the tag of the category in the blog posts and in the portfolio page).
- ← Back to notes button at the top of the page, like in the blog post page.

## Summary of Priorities

1. Shell fixes — bugs first (hamburger, theme toggle, search bar) + language switcher → footer + navbar alignment. Everything else builds on top of a working shell.
2. Home page — hero overhaul, projects/publications/blog/notes sections, footer restructure, remove contact section.
3. Portfolio page — about image, skills section, timeline highlight.
4. Blog page — list filters + reading time, individual post overhaul (the largest chunk).
5. Notes page — category color system.
