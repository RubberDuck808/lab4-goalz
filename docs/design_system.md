# Goalz Design System

> Single source of truth for all visual decisions in the React Native / Expo mobile app.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows & Elevation](#shadows--elevation)
6. [Components](#components)
   - [AppText](#apptext)
   - [GameButtons](#gamebuttons)
   - [TextInput](#textinput)
   - [Logo](#logo)
   - [PageHeader](#pageheader)
   - [BottomNavBar](#bottomnavbar)
   - [StatisticsCard](#statisticscard)
   - [UserRow](#userrow)
   - [FriendsTab](#friendstab)
   - [PlayerSearch](#playersearch)
7. [Page Layouts](#page-layouts)
   - [Hero Pattern](#hero-pattern)
   - [Login / SignUp](#login--signup)
   - [Home](#home)
   - [Profile](#profile)
   - [Leaderboard](#leaderboard)
   - [Settings](#settings)
8. [Avatars](#avatars)
9. [Accessibility](#accessibility)

---

## Color Palette

### Brand

| Token | Hex | Usage |
|---|---|---|
| Primary Blue | `#1CB0F6` | Hero backgrounds, buttons, links, active states, AccentStat fill |
| White | `#ffffff` | Page/card backgrounds |

### Text

| Token | Hex | Usage |
|---|---|---|
| Text Primary | `#27272a` | Main body text, headings |
| Text Secondary | `#71717a` | Subtitles, labels, hint text |
| Text Tertiary | `#a1a1aa` | Rank numbers, placeholder-level text |
| Input Text | `#333` | Text inside TextInput |
| Input Placeholder | `#888` | Placeholder text |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| Accept / Success | `#58CC02` | Accept button bg |
| Accept Dark | `#5DA700` | Accept button bottom border |
| Decline / Error | `#FF4B4B` | Decline / Cancel button bg |
| Decline Dark | `#CC2525` | Decline button bottom border |
| Party / Warning | `#FFC107` | Party button bg |
| Party Dark | `#CC8F00` | Party button bottom border |
| Error Text | `#ef4444` | Inline error messages |
| Success Text | `#16a34a` | Inline success messages |

### Surface & Border

| Token | Hex | Usage |
|---|---|---|
| Surface Light | `#f4f4f5` | Stat card background, row separators, search input bg |
| Border Default | `#e4e4e7` | Card borders, BottomNavBar top |
| Input Background | `#D9D9D9` | TextInput fill |
| Input Border | `#777` | TextInput outline |
| Disabled | `#d4d4d8` | Radio unselected, avatar bg |
| Avatar Background | `#d4d4d8` | Image loading placeholder |

### Interactive States

| Token | Hex | Usage |
|---|---|---|
| Nav Active Fill | `#DDF4FF` | BottomNavBar active button bg |
| Nav Active Border | `#63C9F9` | BottomNavBar active button side border |
| Nav Active Bottom | `#3aaedc` | BottomNavBar active button bottom border |
| Row Highlight | `#eff6ff` | Current user in leaderboard |
| Button Sent | `#f4f4f5` | Friend request sent state |

### Podium Tints

| Rank | Hex |
|---|---|
| 🥇 Gold | `#fffbeb` |
| 🥈 Silver | `#f8fafc` |
| 🥉 Bronze | `#fff7ed` |

### Transparency

| Value | Usage |
|---|---|
| `rgba(255,255,255,0.88)` | Hero tagline text |
| `rgba(255,255,255,0.85)` | Stat accent label |
| `rgba(255,255,255,0.82)` | Home subtitle |
| `rgba(255,255,255,0.78)` | Profile joined date |

---

## Typography

All text renders through `AppText`, which multiplies `fontSize` by the current `fontScale` from `AccessibilityContext`.

### Scale

| Size | Weight | Usage |
|---|---|---|
| 32px bold | uppercase | Form headings (Login, SignUp) |
| 28px bold | — | Home greeting "Hey, username!" |
| 26px bold | — | Profile username |
| 24px bold | uppercase | PageHeader title |
| 22px bold | — | StatisticsCard value |
| 20px bold | — | Profile / Home section title |
| 18px bold | — | Profile hero title, Settings section title (font 13 + transform) |
| 16px 600 | — | Nav labels, Settings rows |
| 15px | — | Button text, main UI body |
| 14px | — | Stat labels, EditProfile field labels |
| 13px bold | uppercase | Settings section title, Leaderboard rank |
| 13px | — | Error text, link text, "See all", badge text, FriendsTab hints |
| 12px | — | Search hint |

### Text Transform

- `uppercase` — GameButtons text, form headings, PageHeader title, Settings section labels
- Normal case — all other text

### Letter Spacing

- `1` — PageHeader title, Profile hero title
- `0.5` — Settings section title
- Default — all other text

---

## Spacing

The app uses a loose 4px base grid. Common values:

| Value | Typical use |
|---|---|
| 4px | Text gaps (joined/badges in profile) |
| 6px | Podium row gaps |
| 8px | Card padding, section margins |
| 10px | Stat grid gap |
| 12px | Form field gap, list row padding-vertical |
| 14px | Stat box padding, nav row padding-vertical |
| 16px | Standard horizontal padding (cards, rows) |
| 20px | Content section padding-top |
| 24px | Hero/page horizontal padding, form group margin-top |
| 28px | Profile infoRow horizontal padding |
| 32px | Form padding-top inside card, section gaps |
| 40px | Hero padding-bottom (Profile) |
| 48px | Hero padding-bottom (Login/SignUp), form padding-bottom |

### Overlap Effect

White content cards overlap the blue hero section using:
```
marginTop: -16
borderTopLeftRadius: 28
borderTopRightRadius: 28
```
This is used on **Home**, **Login**, **SignUp**, and **Profile**.

---

## Border Radius

| Value | Used on |
|---|---|
| 28px | Page-level white content cards (hero overlap) |
| 20px | GameButton variant="square" |
| 19px | UserRow avatar |
| 17px | PlayerSearch result avatar |
| 16px | Profile hero avatar, EditProfile avatar grid item |
| 13px | GameButton (default, accept, decline, party) |
| 12px | StatisticsCard boxes, Settings card, Leaderboard podium row, BottomNavBar active tab |
| 11px | Radio button |
| 8px | TextInput, Search input |

---

## Shadows & Elevation

Only `StatisticsCard` stat boxes carry a shadow:

```js
shadowColor: '#000',
shadowOpacity: 0.06,
shadowRadius: 4,
shadowOffset: { width: 0, height: 2 },
elevation: 2,
```

All other surfaces use border lines (`#e4e4e7` / `#f4f4f5`) instead of shadows.

---

## Components

### AppText

**File:** `components/AppText.jsx`

Thin wrapper around `<Text>`. Reads `fontScale` from `AccessibilityContext` and multiplies every `fontSize` in the passed `style` prop by that factor.

- Passes all props through transparently.
- **Always use AppText** instead of bare `<Text>` to honour the accessibility setting.

---

### GameButtons

**File:** `components/GameButtons.jsx`

Duolingo-style "3D" button with a raised bottom border that flattens on press.

**Sizes:**

| Prop | Width | Height |
|---|---|---|
| default | `alignSelf: stretch`, maxWidth 328 | 48px |
| `size="half"` | 156px fixed | 48px |
| `variant="square"` | `alignSelf: stretch`, maxWidth 328 | 280px |

**Variants:**

| Variant | Background | Bottom Border | Text Color |
|---|---|---|---|
| `task` | `#1CB0F6` | `#1899D6` | `#fff` |
| `accept` | `#58CC02` | `#5DA700` | `#fff` |
| `decline` | `#FF4B4B` | `#CC2525` | `#fff` |
| `party` | `#FFC107` | `#CC8F00` | `#fff` |

- Border radius: `13px` (default), `20px` (square)
- Bottom border width: `4px`
- Press: `borderBottomWidth` collapses to `0`, `marginTop` increases by `4px` to maintain height
- Disabled: `opacity: 0.5`
- Active opacity: `0.85`

---

### TextInput

**File:** `components/TextInput.jsx`

```
Width:         325px
Height:        48px
Border radius: 8px
Border:        2px solid #777
Background:    #D9D9D9
Font size:     15px
Text color:    #333
Padding H:     16px
```

All standard RN TextInput props are forwarded.

---

### Logo

**File:** `components/Logo.jsx`

Horizontal lockup: app icon SVG (55×55) + "GOALZ" wordmark.

```
Container:  flexDirection row, gap 10, height 79
Font:       bold, uppercase, fontSize 40, letterSpacing 1, color #27272a
```

---

### PageHeader

**File:** `components/PageHeader.jsx`

White bar at the top of non-hero pages.

```
Height:        82px
Background:    #fff
Title:         fontSize 24, bold, uppercase, color #27272a, centered
Back button:   LessThanIcon SVG, absolute left 24
Cancel button: Ionicons "close" in red pill (69×47, bg #FF4B4B, border-bottom #CC2525)
```

**Props:** `title`, `onBack`, `variant` (`'back'` | `'cancel'`)

Used on: Settings, EditProfile, CreateParty, PartyMode, RouteMode, Camera, and other non-hero pages.

---

### BottomNavBar

**File:** `components/BottomNavBar.jsx`

Three-tab navigation bar fixed at the bottom.

```
Background:    #fff
Top border:    1px #e4e4e7
Padding H:     32px
Padding V:     16px

Tab button:    44×44, borderRadius 12
Active bg:     #DDF4FF
Active border: 2px #63C9F9 (sides), 5px #3aaedc (bottom)
Inactive:      transparent, no border
Active opacity: 0.75
```

**Tabs (in order):**

| Icon | Label | Screen |
|---|---|---|
| Award.svg (22×22) | Goals | leaderboard |
| Navigation.svg (22×22) | Explore | home |
| User.svg (22×25) | Profile | profile |

---

### StatisticsCard

**File:** `components/StatisticsCard.jsx`

Grid of stat boxes. Accepts `{ stats, loading, collapsed }`.

```
Grid:        flexDirection row, flexWrap wrap, gap 10
Stat box:    width 47%, bg #f4f4f5, borderRadius 12, padding 14px
             shadow: opacity 0.06, radius 4, offset {0,2}, elevation 2
Value text:  fontSize 22, bold, color #27272a
Label text:  fontSize 13, color #71717a, marginTop 2
```

**Accent box (Total Points):**
```
Width:        100%
Background:   #1CB0F6
Value color:  #fff
Label color:  rgba(255,255,255,0.85)
```

**`collapsed={true}`** — renders only the accent Total Points box.
**`collapsed={false}` (default)** — renders all 5 stats: Checkpoints, Pictures, Parties, Games played, Total points.

---

### UserRow

**File:** `components/UserRow.jsx`

Single user entry: rank + avatar + username + score/badge.

```
Row:           flexDirection row, alignItems center, paddingV 12, gap 12
Rank:          width 20, fontSize 13, bold, color #a1a1aa, centered
Avatar:        38×38, borderRadius 19, bg #d4d4d8
Username:      flex 1, fontSize 16, fontWeight 600, color #27272a
Score:         fontSize 14, bold, color #1CB0F6
Badge:         fontSize 13, bold, color #1CB0F6
```

Wraps in `TouchableOpacity` when `onPress` is provided (`activeOpacity: 0.75`).

---

### FriendsTab

**File:** `components/FriendsTab.jsx`

Scrollable list of friends / pending requests, used inside ProfilePage.

```
Container:  alignSelf stretch, borderRadius 16, border 1px #e4e4e7, bg #fff, overflow hidden
Row:        flexDirection row, alignItems center, padding 12, gap 12
Avatar:     38×38, borderRadius 19
Name:       flex 1, fontSize 15, fontWeight 600, color #27272a
Pending:    fontSize 13, color #71717a
Action btn: 70×32 (accept green / decline red) or 100×32 (remove / sent)
Divider:    1px #f4f4f5
Empty:      minHeight 120, centered, text fontSize 14, color #71717a
```

**States per row:** `accept/decline` (incoming), `remove` (friend), `sent` (outgoing pending).

---

### PlayerSearch

**File:** `components/PlayerSearch.jsx`

Search-as-you-type player lookup, rendered above FriendsTab on own Profile.

```
Container:        gap 8
Input row:        flexDirection row, bg #f4f4f5, borderRadius 8, padding H 14, V 10
Input:            flex 1, fontSize 15, color #27272a
Search icon:      Ionicons "search" 18, color #a1a1aa
Results list:     bg #fff, borderRadius 12, border 1px #e4e4e7, maxHeight 200
Result row:       flexDirection row, alignItems center, padding 12, gap 10
Result avatar:    34×34, borderRadius 17
Result name:      flex 1, fontSize 15, fontWeight 600, color #27272a
Add button:       Ionicons "person-add" 20, color #1CB0F6
Loading spinner:  size small, color #a1a1aa
```

---

## Page Layouts

### Hero Pattern

Reused on Home, Login, SignUp, Profile.

```
SafeAreaView  ← backgroundColor: '#1CB0F6', edges={['top']}
  View hero   ← blue background content (logo / greeting / user info)
  Card        ← backgroundColor: '#fff', borderTopRadius: 28, marginTop: -16
    ScrollView
      content
```

The `marginTop: -16` creates the overlap so the white card appears to "float" over the blue hero.

---

### Login / SignUp

```
Hero:
  Logo (centered)
  Tagline text (rgba white)

Card (KAV wraps ScrollView):
  "LOGIN" / "SIGN UP" heading (32px bold uppercase)
  TextInput fields (gap 12)
  Error message
  GameButton variant="task"
  Navigation link (underline, #1CB0F6)
```

---

### Home

```
Hero:
  Greeting "Hey, {username}!" (28px bold white)
  Subtitle "Ready to explore?" (rgba white)
  Mascot image loggy_happy.png (120×120, right-aligned)

White card (ScrollView):
  "Your Stats" section title
  StatisticsCard (all 5 stats)
  GameButton "Start Route" variant="accept"

BottomNavBar (activeScreen="home")
```

---

### Profile

```
Hero:
  heroNav row:
    ← back (Ionicons chevron-back, isOther only)
    "PROFILE" title (18px bold white, centered)
    ⚙ settings (Ionicons settings-outline, own profile only)
  infoRow:
    textBlock (username 26px white, joined rgba-white, badges rgba-white)
    avatar 120×120
  btnRow (isOther):
    accept/decline or remove friend buttons, marginBottom -20

White card (KAV + ScrollView, marginTop -16):
  Statistics section + collapse toggle
  StatisticsCard (collapsed by default)
  Friends section title
  PlayerSearch (own profile only)
  FriendsTab

BottomNavBar (activeScreen="profile")
```

---

### Leaderboard

```
PageHeader "Leaderboard"

FlatList with ListHeaderComponent:
  Podium rows (rank 1–3):
    Medal emoji (fontSize 22, width 36)  +  UserRow in flex:1 View
    Tinted background per rank
  Divider
  Remaining entries (rank 4+) as standard UserRow

BottomNavBar (activeScreen="leaderboard")
```

---

### Settings

```
PageHeader "Settings"

ScrollView:
  Section: Account
    Card (borderRadius 12, border #e4e4e7):
      "Edit Profile" nav row → EditProfile screen

  Section: Text Size
    Card:
      Radio option rows (Default / Large / Extra Large)
      Radio: 22×22, borderRadius 11, selected = #1CB0F6 fill

  Logout button (GameButton variant="decline")
```

---

## Avatars

7 pre-set PNG avatars stored in `assets/`:

| ID | File |
|---|---|
| 1 | UserAvatar_1.png |
| 2 | UserAvatar_2.png |
| 3 | UserAvatar_3.png |
| 4 | UserAvatar_4.png |
| 5 | UserAvatar_5.png |
| 6 | UserAvatar_6.png |
| 7 | UserAvatar_7.png |

Default fallback: ID 1. Utility: `getAvatar(id)` in `utils/avatars.js`.

Sizes used:
- `120×120` — Profile hero
- `64×64` — EditProfile avatar picker grid
- `38×38` — UserRow, FriendsTab row
- `34×34` — PlayerSearch result row

---

## Accessibility

`AccessibilityContext` (`context/AccessibilityContext.jsx`) exposes `fontScale` and `setFontScale`.

| Label | Value |
|---|---|
| Default | `1.0` |
| Large | `1.2` |
| Extra Large | `1.5` |

`AppText` reads `fontScale` and multiplies every `fontSize` in the passed style before rendering. All text in the app goes through `AppText` — bare `<Text>` is never used directly.

Users change the setting in **Settings → Text Size**.
