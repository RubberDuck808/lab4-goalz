# Goalz — End-User Guide

Goalz is an interactive sustainability game played at the Humber Arboretum. Players explore the grounds, interact with IoT sensors, photograph nature elements, and answer quiz questions to earn points. This guide covers two audiences: **Players** using the Loggin mobile app and **Staff** using the admin dashboard.

---

## Part A: Players (Loggin Mobile App)

### The Story

Loggy the squirrel hid his nuts in locked boxes across the forest. Each box is secured with quiz questions whose answers are written on paper fragments — but Hoot the owl stole the papers and scattered them everywhere. Your mission: find the fragments, photograph elements that reveal where the boxes are hidden, answer the quiz together, and help Loggy retrieve his nuts.

---

### Device Requirements

| Requirement | Details |
|---|---|
| Device | iOS or Android smartphone |
| App | Expo Go (development) or the native Loggin build |
| Network | Wi-Fi or mobile data — must be able to reach the Goalz API |
| Permissions | Location, Camera, Bluetooth (prompted on first use) |

> On iOS, allow "Always" location access so GPS navigation works while the app is backgrounded.

---

### Getting Started

#### Sign Up
1. Open **Loggin** on your device.
2. Tap **Sign Up** and enter your name, email, and a password.
3. You are taken to the lobby.

#### Log In (returning users)
1. Open **Loggin** and tap **Log In**.
2. Enter your email and password.

#### Add Friends
1. Navigate to **Friends** from the lobby.
2. Search by username and send a friend request.
3. Accepted friends appear highlighted in the leaderboard.

---

### Creating or Joining a Party

Any user can create a party and become the **Party Owner**.

#### Create a Party
1. Tap **Create Party** in the lobby.
2. Give the party a name (e.g. "Biology Class — Arboretum Visit").
3. A **party code** and **invite link** are generated automatically.
4. Share the code or link with your group.
5. Watch the live list as participants join.
6. When everyone is in, tap **Start Session**.

#### Join a Party
1. Tap **Join Party** in the lobby.
2. Enter the party code or open the invite link.
3. Wait in the lobby until the Party Owner starts the session.

---

### Playing the Game

The game is divided into **sections** (areas of the arboretum). All groups follow the same route through sections, but progress independently at their own pace.

#### Phase 0 — Authentication
Everyone opens Loggin, signs up or logs in, and waits in the lobby.

#### Phase 1 — Party Creation
A user creates the party and shares the code. Participants join. The Party Owner starts the session.

#### Phase 2 — Group & Role Assignment
The system automatically divides players into groups and assigns each person one of two roles:

| Role | Your Task |
|---|---|
| **Scout** (1–2 per group) | Find hidden sensors scattered across the section and collect hint fragments for the quiz |
| **Trailblazer** (1–2 per group) | Navigate to preset locations and photograph the specified nature elements |

You will see your group and role on screen before the section starts.

#### Phase 3 — Section Start
- The section map is displayed.
- **Scouts** see the number of sensor checkpoints to find.
- **Trailblazers** see the preset photo locations.
- The box location is hidden at this point — your team must earn it.

#### Phase 4A — Scout Flow
1. Search the section for physical sensors hidden in the environment.
2. Interact with a sensor (via QR code, NFC, or Bluetooth proximity).
3. A **hint fragment** appears on screen briefly — memorise it. It disappears after viewing.
4. The app marks the sensor as found and updates group progress (e.g. "2 of 4 fragments found").
5. Repeat until all sensors in the section are collected.

> Hints are like torn pieces of paper — they fade away. Scouts must remember what they read.

#### Phase 4B — Trailblazer Flow
1. Navigate to your assigned location using the map.
2. Photograph the target nature element (a particular tree, rock, plant, etc.).
3. The photo is verified automatically by AI.
4. Once all assigned photos pass verification, the **box appears on the map** for your whole group.

> If Scouts haven't finished yet, the box is shown as **locked** with a status message.

#### Phase 5 — Convergence at the Box
1. The box appears on the map as soon as Trailblazers complete their photos.
2. Navigate to the box — your group can head there before Scouts finish.
3. Once Scouts complete their task and the full group arrives, the **quiz automatically appears**.

#### Phase 6 — Quiz
1. Multiple-choice questions appear, drawn from the hint fragments the Scouts collected.
2. Decide as a group who answers each question, or let the system assign randomly.
3. Select your answer — hint fragments are no longer visible at this point.

**Scoring:**
- Correct answer: points awarded, scaled by speed
- Incorrect answer: no points, streak resets immediately
- Consecutive correct answers build a **streak** that multiplies points per question
- Once all questions are answered, the **box unlocks**

#### Phase 7 — Box Opens & Section Complete
1. The box plays an opening animation — Loggy retrieves his nuts.
2. The section is marked complete and scores are recorded.
3. The group moves on to the next section. The flow repeats from Phase 3.

#### Phase 8 — Session End
The session ends when all groups complete all sections, the time limit is reached, or the Party Owner force-stops the party.

- A **leaderboard** displays all group scores.
- Scoring factors: correctness, speed, and streak multipliers.
- The winning group is announced.
- Loggy distributes nuts to all groups proportionally — no one leaves empty-handed.

---

### Scoring & Streaks

| Action | Effect |
|---|---|
| Correct answer | Points awarded (amount scales with speed) |
| Incorrect answer | Zero points, streak resets to 0 |
| Consecutive correct answers | Streak multiplier applied to each correct answer |

---

### Profile & Badges

Access your profile from the main screen at any time:

- **Avatar** — choose from a set of preset avatars
- **Friends** — see friend rankings in the leaderboard
- **Nuts** — your total nut count across all sessions

**Example badges:**

| Badge | Criteria |
|---|---|
| First Steps | Complete your first section |
| Full House | Complete all sections in a session |
| On Fire | Reach a streak of 5 in a single quiz |
| Speedy Squirrel | Answer a question correctly in under 10 seconds |
| Top of the Tree | Finish 1st in a session |
| Dedicated | Participate in sessions across 4 different weeks |

---

### Leaderboard

The global leaderboard is accessible from the main screen at any time.

| Filter | Shows |
|---|---|
| This Week | Nuts earned in the current week |
| This Month | Nuts earned in the current month |
| All Time | Total nuts since account creation |

Friends are highlighted in the leaderboard. A friends-only view is also available.

---

## Part B: Staff (Admin Dashboard)

The admin dashboard is a web application used by staff to manage zones, sensors, elements, and game sessions.

### Dashboard Roles

There are two roles in the dashboard. Both can log in and access all standard pages. The difference is account management:

| Role | Can use dashboard | Can create/manage accounts |
|---|---|---|
| **Staff** | Yes | No |
| **Admin** | Yes | Yes |

There is no public sign-up. All dashboard accounts are created by an Admin.

---

### Requirements

| Requirement | Details |
|---|---|
| Browser | Chrome or Firefox (recommended) |
| Credentials | Account created by an Admin (email + password) |
| Local URL | `http://localhost:3001` |
| Production URL | `https://goalz-dashboard-237169763190.europe-west1.run.app` |

---

### Logging In

1. Open the dashboard URL in your browser.
2. Enter your email and password.
3. You are taken to the Overview page.

> Dashboard login is separate from player login — player accounts cannot access the dashboard.

---

### Overview Page

Displays a summary of active sensors and elements in the arboretum. Use this page to monitor the current state of the game setup.

---

### Map Page — Zone Management

The map page lets you draw, edit, and delete zone boundaries over the Humber Arboretum. All zone data is stored in the database and used by the game to define section areas.

#### Zone Types

| Type | Appearance | Purpose |
|---|---|---|
| `boundary` | Outline only (dark green) | The outer boundary of the entire arboretum |
| `area` | 15% fill (green) | A game section / playable area |
| `path` | Outline only (brown) | A trail or path through the arboretum |

#### Drawing a New Zone
1. Click **Draw Zone** in the map panel.
2. Click points on the map to define the polygon vertices.
3. Close the shape by clicking the first point again.
4. Enter a name, select the zone type and colour in the panel.
5. Click **Save** to persist the zone.

> Drawing is constrained to the arboretum boundary — clicks outside the boundary are automatically rejected.

#### Editing an Existing Zone
1. Click any zone on the map — it highlights in yellow.
2. Edit the name, type, or colour in the panel and click **Save Changes**.
3. To adjust the shape, click **Edit Points**, drag the vertex handles, then click **Done** → **Save Changes**.
4. To delete, click **Delete** and confirm the prompt.

> Press **Esc** at any time to cancel the active operation.

#### Layer Toggles
Use the layer sidebar on the left of the map to show or hide:
- **Boundary** — the arboretum boundary zone
- **Zones** — all area and path zones
- **Sensors** — sensor markers
- **Elements** — element markers

#### Importing from OpenStreetMap
The dashboard can import zone shapes from OpenStreetMap for the Humber Arboretum bounding box. Contact your developer to enable the OSM import button if it is not visible.

---

### Import Dataset Page

The Import Dataset page lets staff load sensor and landscape data into the database from a CSV file.

#### Importing Data
1. Click **Download Template** to get the expected CSV format.
2. Fill in your data following the template structure (semicolon-delimited).
3. Click the upload area and select your `.csv` file.
4. A preview table appears showing the parsed rows — review for any errors before committing.
5. Click **Import** to store the data in the database. A confirmation toast appears on success.

> Only `.csv` files are accepted. The first row of the CSV is treated as the header.

---

### Reports Page

The Reports page generates downloadable reports on landscape elements, sensor readings, and analysis metrics for a given date range.

#### Generating a Report
1. Set the **From** and **To** dates (defaults to the last 30 days).
2. Select what to include using the checkboxes:
   - **Landscape elements** — Trees, Bushes, Water, Species
   - **Sensor data** — Sensor Data, Light, Temperature, Humidity
   - **Analysis** — Green vs non-green, Native vs non-native, Biodiversity, Net zero-goal indicator
   - **Visualizations** — Line chart, Bar chart, Pie chart, Arboretum map
3. Choose the output format: **CSV**, **PDF**, or **Plain text**.
4. Click **Generate Report**. The file downloads automatically.

---

### Settings Page — User Management (Admin only)

The Settings page is only accessible to **Admin** accounts. Staff accounts see an access restriction message.

#### Creating a New Account
1. Navigate to **Settings**.
2. Fill in the new user's full name, email, and password in the **Create Staff User** form.
3. Click **Create User**. The account is created immediately.

#### Managing Existing Accounts
The **User Management** table lists all dashboard accounts. Admins can:
- **Change role** — toggle a user between Staff and Admin
- **Delete** — permanently remove an account (you cannot delete your own account)

---

### Tips for Staff

- Always draw the **boundary** zone first — it constrains all subsequent zone drawing.
- Zone names must be unique.
- The game uses zone boundaries to determine which section a player is in (GPS-based).
- Sensor and element data shown on the map updates from the live database.
- If you need a new dashboard account created, contact an Admin — Staff accounts cannot create users.
