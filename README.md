# Aluth Camp

A campground listing web app where users can browse campgrounds on a map, add their own with photos, and leave reviews.

**Live demo:** https://aluth-camp.vercel.app/

It is a customized version of **YelpCamp**, the final project from [The Web Developer Bootcamp](https://www.udemy.com/course/the-web-developer-bootcamp/) by Colt Steele. The core idea follows the course, but several parts of the stack were replaced or removed (see [What I changed from the course](#what-i-changed-from-the-course)).

## Features

- Create, edit and delete campgrounds, with multiple image uploads
- Reviews with ratings on each campground
- User login and logout
- Admin-only registration: only the admin account can create new users
- Authorization: only the author can edit or delete their campground or review
- Cluster map of all campgrounds and a location map on each campground page
- Server-side and client-side form validation
- Flash messages and a custom error page
- Sessions stored in MongoDB

## Tech stack

| Area           | Tech                                                         |
| -------------- | ------------------------------------------------------------ |
| Runtime        | Node.js                                                      |
| Server         | Express 5                                                    |
| Database       | MongoDB with Mongoose                                        |
| Templating     | EJS with ejs-mate layouts                                    |
| Styling        | Tailwind CSS v4                                              |
| UI components  | Custom CSS-only image carousel and star rating               |
| Authentication | Passport, passport-local, passport-local-mongoose            |
| Sessions       | express-session, connect-mongo, connect-flash                |
| Image uploads  | Multer (memory storage) and the Cloudinary SDK               |
| Maps           | MapTiler SDK and `@maptiler/client` for geocoding            |
| Validation     | Joi, sanitize-html                                           |
| Security       | Helmet (with a content security policy), express-mongo-sanitize |
| Tooling        | Nodemon, Concurrently, Prettier                              |
| Hosting        | Vercel                                                       |

## What I changed from the course

| Course version            | This project                          | Why                                                        |
| ------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| Bootstrap                 | **Tailwind CSS**                      | Styling was rewritten with Tailwind utility classes        |
| Bootstrap carousel        | **[carousel-tailwind](https://github.com/itsmzdev/carousel-tailwind)**: my own CSS-only carousel | Built from scratch in a separate repo, then added here |
| Starability star rating   | **[star-rating-tailwind](https://github.com/itsmzdev/star-rating-tailwind)**: my own CSS-only star rating | Built from scratch in a separate repo, then added here |
| multer-storage-cloudinary | **Removed**: Multer + Cloudinary SDK  | The package was dropped because of a security vulnerability |
| Open registration         | **Admin-only registration**           | Only the admin can create accounts, so the live demo is not open to public sign-ups |

### Admin-only registration

In the course anyone can sign up. Here only the admin account can register new users:

- The `isAdmin` middleware in `middleware.js` guards `POST /register`. Anyone else is redirected to `/campgrounds` with a "You are not authorized to do that" flash message.
- The Register link in `views/partials/navbar.ejs` is shown only to the admin.

The admin is identified by a user ID that is hard-coded in both of those files. Roles on the user model are planned to replace it.

### Carousel and star rating built from scratch

The course uses Bootstrap's carousel for campground images and the Starability library for review stars. I built both myself with CSS only, with no JavaScript and no package, in separate repos first and then brought them into this app.

- **Carousel:** [itsmzdev/carousel-tailwind](https://github.com/itsmzdev/carousel-tailwind). In this app it lives in `public/css/input.css` as Tailwind utilities and is used in `views/campgrounds/show.ejs`.
- **Star rating:** [itsmzdev/star-rating-tailwind](https://github.com/itsmzdev/star-rating-tailwind). In this app it is the hidden radio inputs with styled labels in `views/campgrounds/show.ejs`.

### How uploads work without multer-storage-cloudinary

Multer keeps the uploaded files in memory, and each file buffer is streamed to Cloudinary with `cloudinary.uploader.upload_stream`. Uploads are limited to 5MB per file and to JPG, JPEG, PNG and WEBP images. The code is in `cloudinary/index.js` and `helper/imageUpload.js`.

## Getting started

### Prerequisites

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)
- A [Cloudinary](https://cloudinary.com/) account
- A [MapTiler](https://www.maptiler.com/) API key

### Install

```bash
git clone https://github.com/itsmzdev/aluth-camp.git
cd aluth-camp
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret
MAPTILER_API_KEY=your_maptiler_api_key
```

`PORT` is optional and defaults to `3000`.

### Run

```bash
npm run dev
```

This starts the Tailwind CSS watcher and the server (with Nodemon) together. The app runs at `http://localhost:3000`.

| Script                 | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Runs the CSS watcher and the server together  |
| `npm run watch-css`    | Rebuilds `public/css/output.css` on changes   |
| `npm run watch-server` | Runs `app.js` with Nodemon                    |

### Create the admin user

Registration is admin-only, so a fresh database has no way to sign up. To create your first account:

1. Temporarily remove `isAdmin` from the `/register` route in `routes/users.js`.
2. Open `http://localhost:3000/register` and register your admin account.
3. Copy that user's `_id` from MongoDB and replace the hard-coded admin ID in `middleware.js` (`isAdmin`) and `views/partials/navbar.ejs`.
4. Put `isAdmin` back on the route.

### Seed the database (optional)

```bash
node seeds/index.js
```

This **deletes all existing campgrounds** and inserts sample ones. Before running it, replace the `author` ID in `seeds/index.js` with the ID of a user from your own database.

## Project structure

```
app.js          Express app setup, middleware and error handling
routes/         Route definitions
controllers/    Route handlers
models/         Mongoose models (Campground, Review, User)
views/          EJS templates, layouts and partials
public/         Static CSS and client-side JS
cloudinary/     Cloudinary config and Multer setup
helper/         Image upload helper
utils/          ExpressError and the Express 5 Mongo sanitizer wrapper
seeds/          Database seed script and data
schemas.js      Joi validation schemas
middleware.js   Auth, authorization and validation middleware
vercel.json     Vercel deployment config
```

## Deployment

The app is set up for Vercel through `vercel.json`, which serves `app.js` with `@vercel/node`. Add the environment variables above in the Vercel project settings.

## Credits

Based on YelpCamp from [The Web Developer Bootcamp](https://www.udemy.com/course/the-web-developer-bootcamp/) by Colt Steele.
