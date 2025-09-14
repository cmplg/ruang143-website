# Ruang 143 Website

Welcome to the **Ruang 143 Website** repository. This project is a dynamic website designed for the Ruang 143 Creative Community. It is built using HTML, CSS, and JavaScript with a Node.js backend, and it includes multiple interactive pages and features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Pages](#pages)
- [Project Structure](#project-structure)
- [Setup & Running](#setup--running)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Ruang 143 Website serves as an online portal for a creative community. The website offers community information, event plans, articles, galleries, and member authentication. It is designed with a modern and responsive UI that adapts to different devices.

## Features

- **Responsive Design:** Optimized for desktops, tablets, and mobile devices.
- **Interactive Navigation:** Features a hamburger menu for mobile views and smooth transitions across pages.
- **Background Effects:** Full-background shadow effects using GIFs to enhance visual appeal.
- **User Authentication:** Login and registration functionalities with avatar support.
- **Dynamic Content Display:** Displays articles, events (referred to as ‘PLANS’), and gallery slideshows.
- **Admin Panel:** Includes dedicated admin pages for content management and user oversight.
- **Animations:** Smooth animations powered by JavaScript for an enhanced user experience.
- **Local Database:** Uses a JSON file (`db.json`) for storing data such as user details and other content.

## Pages

The website is composed of the following pages:

- **index.html:** Home page featuring dynamic hero section, background effects, and navigation.
- **about.html:** Provides information about the community and the website.
- **events.html (PLANS):** Showcases upcoming events and plans.
- **articles.html:** Displays articles relevant to the community.
- **gallery.html:** Features a gallery of community images with slideshow functionality.
- **feed.html:** A stream of member updates and community feed.
- **login.html:** Member login page with enhanced visuals (includes background shadow effects).
- **register.html:** Registration page with support for avatar input and preview.
- **admin.html & admin-login.html:** Admin interfaces for managing website content.
- **create-article.html & create-event.html:** Pages to create new articles and events respectively.
- **edit-profile.html & profile.html:** User profile management pages.
- **single-article.html:** Detailed view of a single article.

## Project Structure

```
ruang143-website/
├── about.html
├── admin-login.html
├── admin.html
├── album.html
├── articles.html
├── create-article.html
├── create-event.html
├── dashboard.html
├── db.json
├── edit-profile.html
├── events.html
├── feed.html
├── gallery.html
├── index.html
├── login.html
├── manage-gallery.html
├── profile.html
├── register.html
├── single-article.html
├── assets/
│   ├── about-image.png
│   ├── favicon.png
│   ├── logo-header.png
│   ├── logo-tengah.png
│   ├── noise-texture.png
│   └── user-icon.png
├── css/
│   └── style.css
├── js/
│   ├── admin.js
│   ├── animations.js
│   ├── articles.js
│   ├── auth.js
│   ├── events.js
│   ├── feed.js
│   ├── gallery-admin.js
│   ├── gallery.js
│   └── hamburger.js
├── package.json
├── README.md
└── server.js
```

## Setup & Running

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/cmplg/ruang143-website.git
   cd ruang143-website
   ```

2. **Install Dependencies:**
   Ensure you have [Node.js](https://nodejs.org/) installed, then run:
   ```sh
   npm install
   ```

3. **Run the Server:**
   Start the Node.js server by executing:
   ```sh
   node server.js
   ```
   The server should be running at [http://localhost:3000](http://localhost:3000).

4. **Development:**
   You can modify HTML, CSS, and JavaScript files as needed. Use your favorite code editor and reload the browser to see changes.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

1. Fork the project
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is open-source and available under the [MIT License](LICENSE).

---

*Ruang 143 Website © 2025*
