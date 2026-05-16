# Blassti
Blassti is a Vuetify-based event discovery and venue booking web application developed by a small group of Sophomore Software Engineering students at MedTech, Tunisia as part of an ISS project. It allows users to explore events, book venues and seats, and coordinate shared transportation through an integrated carpooling system.

## Live Demo

Public website:  
https://blassti.vercel.app

GitHub repository:  
https://github.com/OmarHassenPro/Blassti

---

## Demo Admin Account

Use the following demo account to explore the admin and moderation features:

Email: admin@blassti.tn
Password: admin

This account is provided only for demonstration and testing purposes.

---

## Main Features

- Event browsing and event details
- Ticket booking
- Seat selection system
- Venue browsing and venue reservation
- Event bundle creation
- Carpool system
- Notifications
- User reports and moderation tools
- Admin statistics dashboard
- Role-based navigation and permissions
- Responsive design for desktop, tablet, and mobile

---

## User Roles

### Visitor

Visitors can explore the platform, browse events and venues, and view general information without logging in.

### Event Goer

Event goers can book tickets, select seats, create bundles, join carpools, and receive notifications.

### Organizer / Artist

Organizers and artists can create and manage events, view event-related information, and be linked to specific events.

### Venue Seller

Venue sellers can add venues, manage venue information, and handle venue availability for reservations.

### Admin / Moderator

Admins and moderators can manage users, review reports, access statistics, moderate platform activity, and manage requests.

---

## Technologies Used

- Vue.js
- Vuetify
- JavaScript
- HTML
- CSS
- LocalStorage
- Git & GitHub
- Vercel

---

## Project Structure

src/  
├── assets/  
│   └── Images and visual resources  
│  
├── components/  
│   └── Reusable Vue components such as the navbar  
│  
├── dataModel/  
│   └── Local data models for users, events, venues, bundles, carpools, and notifications  
│  
├── imageUtil/  
│   └── Image helper utilities  
│  
└── pages/  
    └── Main Vuetify pages of the platform  

---

## How to Run Locally

1. Clone the repository:

   git clone https://github.com/OmarHassenPro/Blassti.git

2. Open the project folder:

   cd Blassti

3. Install dependencies:

   npm install

4. Run the development server:

   npm run dev

5. Open the local link shown in the terminal.

---

## Deployment

The public version of Blassti is deployed on Vercel:

https://blassti.vercel.app

This version is the non-AI frontend version of the platform. It uses LocalStorage for demonstration and testing purposes.

---

## AI Version Note

An upgraded AI version of Blassti also exists.

The AI version includes a Python backend for local execution. The deployed public version is the non-AI frontend version because the AI backend requires protected API keys and backend environment variables.

Blassti with Ai repo: https://github.com/OmarHassenPro/Blassti-with-AI
This separation keeps the public demo safe while allowing the AI-powered version to be tested locally without exposing private API keys.

---

## About the Project

Blassti was developed as a university software engineering project at MedTech.

The project focuses on building a complete event management ecosystem with multiple user roles, realistic platform workflows, responsive design, and moderation features.

---
