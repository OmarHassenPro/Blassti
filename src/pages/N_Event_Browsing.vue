<template>
  <v-app>
    <AppNavbar />

    <v-main class="event-page-shell" :class="browserThemeClass">
      <div class="page-background-orb orb-1" />
      <div class="page-background-orb orb-2" />

      <v-container class="py-6 py-md-8 page-container">
        <v-card class="pa-5 pa-md-7 rounded-xl rounded-xxl mb-6 hero-card" elevation="0">
          <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-5">
            <div class="hero-copy">
              <div class="hero-badge mb-3">
                <v-icon size="18" class="me-2">mdi-ticket-confirmation-outline</v-icon>
                Discover live experiences
              </div>

              <div class="text-h4 text-md-h3 font-weight-bold mb-2 hero-title">
                Browse Events
              </div>

              <div class="text-body-1 text-medium-emphasis hero-subtitle">
                Explore upcoming events, filter by category, city, date, artist, and availability.
              </div>
            </div>

            <div class="hero-stats d-flex flex-wrap ga-3">
              <v-sheet class="hero-stat-chip" rounded="xl">
                <div class="text-caption text-medium-emphasis">Visible events</div>
                <div class="text-h6 font-weight-bold">{{ filteredEvents.length }}</div>
              </v-sheet>

              <v-sheet class="hero-stat-chip" rounded="xl">
                <div class="text-caption text-medium-emphasis">Categories</div>
                <div class="text-h6 font-weight-bold">{{ labels.length }}</div>
              </v-sheet>

              <v-sheet class="hero-stat-chip" rounded="xl">
                <div class="text-caption text-medium-emphasis">Cities</div>
                <div class="text-h6 font-weight-bold">{{ cities.length }}</div>
              </v-sheet>
            </div>
          </div>
        </v-card>

        <v-row class="ga-md-0">
          <v-col cols="12" md="3">
            <v-card class="pa-4 pa-md-5 rounded-xl rounded-xxl filter-card" elevation="0">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <div class="section-icon-wrap me-3">
                    <v-icon size="20">mdi-tune-variant</v-icon>
                  </div>
                  <div>
                    <div class="text-h6 font-weight-bold">Filters</div>
                    <div class="text-caption text-medium-emphasis">
                      Narrow down your results
                    </div>
                  </div>
                </div>

                <v-chip size="small" variant="tonal" class="filter-count-chip">
                  {{ filteredEvents.length }}
                </v-chip>
              </div>

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
                  Categories
                </div>

                <v-chip-group
                  v-model="selectedCategories"
                  multiple
                  column
                  class="filter-chip-group"
                >
                  <v-chip
                    v-for="label in labels"
                    :key="label"
                    :value="label"
                    filter
                    variant="outlined"
                    class="filter-chip"
                  >
                    {{ label }}
                  </v-chip>
                </v-chip-group>
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-calendar-range</v-icon>
                  Date range
                </div>

                <v-menu
                  v-model="fromMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="fromDateDisplay"
                      label="From"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      class="mb-3 enhanced-field"
                      prepend-inner-icon="mdi-calendar-month-outline"
                    />
                  </template>

                  <v-card class="date-picker-card">
                    <v-date-picker v-model="fromDate" />
                    <v-card-actions class="justify-end">
                      <v-btn variant="text" @click="fromMenu = false">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>

                <v-menu
                  v-model="toMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="toDateDisplay"
                      label="To"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      class="enhanced-field"
                      prepend-inner-icon="mdi-calendar-end-outline"
                    />
                  </template>

                  <v-card class="date-picker-card">
                    <v-date-picker v-model="toDate" />
                    <v-card-actions class="justify-end">
                      <v-btn variant="text" @click="toMenu = false">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                  City
                </div>
                <v-select
                  v-model="locationCity"
                  :items="cities"
                  label="Select city"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  class="enhanced-field"
                  prepend-inner-icon="mdi-city-variant-outline"
                />
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-seat-outline</v-icon>
                  Availability
                </div>
                <div class="checkbox-stack">
                  <v-checkbox
                    v-model="availability.available"
                    label="Available"
                    hide-details
                    density="comfortable"
                    color="success"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="availability.almostSold"
                    label="Almost sold out"
                    hide-details
                    density="comfortable"
                    color="warning"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="availability.soldOut"
                    label="Sold out"
                    hide-details
                    density="comfortable"
                    color="error"
                    class="enhanced-checkbox"
                  />
                </div>
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-account-music-outline</v-icon>
                  Artist
                </div>
                <v-select
                  v-model="artist"
                  :items="artistOptions"
                  item-title="label"
                  item-value="value"
                  label="Select artist"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  class="enhanced-field"
                  prepend-inner-icon="mdi-microphone-outline"
                />
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-badge-account-outline</v-icon>
                  Age restriction
                </div>
                <div class="checkbox-stack">
                  <v-checkbox
                    v-model="ageRestrictions.allAges"
                    label="All ages"
                    hide-details
                    density="comfortable"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="ageRestrictions.fifteenPlus"
                    label="15+"
                    hide-details
                    density="comfortable"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="ageRestrictions.eighteenPlus"
                    label="18+"
                    hide-details
                    density="comfortable"
                    class="enhanced-checkbox"
                  />
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="9">
            <v-card class="pa-4 pa-md-5 rounded-xl rounded-xxl results-card" elevation="0">
              <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-5 ga-4">
                <div>
                  <div class="d-flex align-center mb-1">
                    <div class="section-icon-wrap me-3">
                      <v-icon size="20">mdi-calendar-search-outline</v-icon>
                    </div>
                    <div class="text-h5 font-weight-bold">Upcoming Events</div>
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    {{ filteredEvents.length }} result<span v-if="filteredEvents.length !== 1">s</span>
                  </div>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip size="small" variant="tonal" class="summary-chip">
                    <v-icon start size="16">mdi-map-marker</v-icon>
                    {{ locationCity || "All cities" }}
                  </v-chip>

                  <v-chip size="small" variant="tonal" class="summary-chip">
                    <v-icon start size="16">mdi-shape-outline</v-icon>
                    {{ selectedCategories.length ? selectedCategories.length + " selected" : "All categories" }}
                  </v-chip>
                </div>
              </div>

              <v-row class="event-list-row">
                <v-col
                  v-for="event in filteredEvents"
                  :key="event.id"
                  cols="12"
                >
                  <v-card class="rounded-xl rounded-xxl pa-3 pa-md-4 event-card" elevation="0">
                    <v-row class="align-stretch">
                      <v-col cols="12" md="4">
                        <div class="event-image-wrap">
                          <v-img
                            :src="event.image"
                            height="240"
                            class="rounded-xl event-image"
                            cover
                          >
                            <template #placeholder>
                              <div class="w-100 h-100 d-flex align-center justify-center image-placeholder">
                                <v-icon size="50">mdi-image</v-icon>
                              </div>
                            </template>
                          </v-img>

                          <div class="image-overlay-glow" />
                        </div>
                      </v-col>

                      <v-col cols="12" md="8">
                        <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-2">
                          <div class="title-stack">
                            <div class="text-h5 font-weight-bold event-title">
                              {{ event.title }}
                            </div>

                            <div class="text-subtitle-2 text-medium-emphasis d-flex align-center flex-wrap ga-2 event-location-line">
                              <v-icon size="16">mdi-map-marker-outline</v-icon>
                              <span>{{ event.venue }} • {{ event.city }}</span>
                            </div>
                          </div>

                          <div class="d-flex ga-2 flex-wrap status-chip-group">
                            <v-chip
                              v-if="event.featured"
                              color="primary"
                              variant="outlined"
                              class="status-chip"
                            >
                              <v-icon start size="16">mdi-star-four-points-outline</v-icon>
                              Featured
                            </v-chip>

                            <v-chip
                              v-if="event.last_call"
                              color="warning"
                              variant="outlined"
                              class="status-chip"
                            >
                              <v-icon start size="16">mdi-timer-sand</v-icon>
                              Last Call
                            </v-chip>

                            <v-chip
                              :color="event.seats_left === 0 ? 'error' : event.seats_left <= 20 ? 'warning' : 'success'"
                              variant="tonal"
                              class="status-chip"
                            >
                              <v-icon start size="16">
                                {{
                                  event.seats_left === 0
                                    ? "mdi-close-circle-outline"
                                    : event.seats_left <= 20
                                      ? "mdi-alert-circle-outline"
                                      : "mdi-check-circle-outline"
                                }}
                              </v-icon>
                              {{
                                event.seats_left === 0
                                  ? "Sold out"
                                  : event.seats_left <= 20
                                    ? "Almost sold out"
                                    : "Available"
                              }}
                            </v-chip>
                          </div>
                        </div>

                        <div class="event-info-pills">
                          <div class="info-pill">
                            <v-icon size="17" class="me-2">mdi-calendar-blank-outline</v-icon>
                            <strong>Date:</strong>&nbsp;{{ event.date }}
                          </div>

                          <div class="info-pill">
                            <v-icon size="17" class="me-2">mdi-clock-time-four-outline</v-icon>
                            <strong>Time:</strong>&nbsp;{{ event.time }}
                          </div>

                          <div class="info-pill">
                            <v-icon size="17" class="me-2">mdi-seat-outline</v-icon>
                            <strong>Seats:</strong>&nbsp;{{ event.seats_left }}
                          </div>
                        </div>

                        <div class="event-description text-body-2 mt-4">
                          {{ event.description }}
                        </div>

                        <div
                          v-if="getArtistNames(event).length"
                          class="text-body-2 mt-3 text-medium-emphasis artist-line"
                        >
                          <v-icon size="16" class="me-1">mdi-account-music-outline</v-icon>
                          <strong>Artist:</strong>&nbsp;{{ getArtistNames(event).join(", ") }}
                        </div>

                        <v-row style="margin-top:16px" class="align-center">
                          <v-btn
                            size="small"
                            color="primary"
                            class="action-btn primary-action-btn"
                            @click="goToSeatSelection(event)"
                            @contextmenu.prevent.stop="openSeatSelectionContextMenu($event, event)"
                          >
                            <v-icon start size="18">mdi-ticket-outline</v-icon>
                            Buy Ticket
                          </v-btn>

                          <v-btn
                            size="small"
                            variant="outlined"
                            class="ml-2 action-btn"
                            @click="goToMoreInfo(event)"
                            @contextmenu.prevent.stop="openMoreInfoContextMenu($event, event)"
                          >
                            <v-icon start size="18">mdi-information-outline</v-icon>
                            More Info
                          </v-btn>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>

              <v-sheet
                v-if="filteredEvents.length === 0"
                class="d-flex align-center justify-center mt-4 empty-state-sheet"
                height="200"
              >
                <div class="text-center empty-state-content">
                  <div class="empty-state-icon mb-3">
                    <v-icon size="42">mdi-calendar-remove-outline</v-icon>
                  </div>
                  <div class="text-h6 mb-2 font-weight-bold">No matching events</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Try changing your filters to see more results.
                  </div>
                </div>
              </v-sheet>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>

  <!-- Link Context Menu -->
  <v-menu
    v-model="linkContextMenu.show"
    :target="[linkContextMenu.x, linkContextMenu.y]"
    location="top left"
    absolute
    :close-on-content-click="true"
    transition="scale-transition"
  >
    <v-list min-width="220" class="context-menu-list">
      <v-list-subheader>{{ linkContextMenu.label || "Open" }}</v-list-subheader>

      <v-list-item
        title="Open in new tab"
        prepend-icon="mdi-open-in-new"
        @click="openContextMenuTargetInNewTab"
      />
      <v-list-item
        title="Open in new window"
        prepend-icon="mdi-open-in-app"
        @click="openContextMenuTargetInNewWindow"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { get_All_Events } from "@/dataModel/event"
import { get_All_Artists, get_User_By_Id } from "@/dataModel/user"

const router = useRouter()
const events = get_All_Events()
const artists = get_All_Artists()

const labels = ref([...new Set(events.map(e => e.type))])

const selectedCategories = ref([])

const fromDate = ref(null)
const toDate = ref(null)
const fromMenu = ref(false)
const toMenu = ref(false)

const cities = [...new Set(events.map(e => e.city))]
const locationCity = ref(null)

const availability = ref({
  available: false,
  almostSold: false,
  soldOut: false
})

const artist = ref(null)

const linkContextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  href: "",
  label: "",
})

const isBrowserDark = ref(false)
let browserThemeMedia = null

function applyBrowserThemePreference() {
  if (typeof window === "undefined" || !window.matchMedia) return
  isBrowserDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
}

function handleBrowserThemeChange(event) {
  isBrowserDark.value = !!event.matches
}

onMounted(() => {
  if (typeof window === "undefined" || !window.matchMedia) return

  browserThemeMedia = window.matchMedia("(prefers-color-scheme: dark)")
  applyBrowserThemePreference()

  if (browserThemeMedia.addEventListener) {
    browserThemeMedia.addEventListener("change", handleBrowserThemeChange)
  } else if (browserThemeMedia.addListener) {
    browserThemeMedia.addListener(handleBrowserThemeChange)
  }
})

onBeforeUnmount(() => {
  if (!browserThemeMedia) return

  if (browserThemeMedia.removeEventListener) {
    browserThemeMedia.removeEventListener("change", handleBrowserThemeChange)
  } else if (browserThemeMedia.removeListener) {
    browserThemeMedia.removeListener(handleBrowserThemeChange)
  }
})

const browserThemeClass = computed(() => {
  return isBrowserDark.value ? "browser-dark" : "browser-light"
})

function getRouteHref(path, query = undefined) {
  return router.resolve({ path, query }).href
}

function openHrefInNewTab(href) {
  if (!href) return
  window.open(href, "_blank", "noopener,noreferrer")
}

function openHrefInNewWindow(href) {
  if (!href) return
  window.open(href, "_blank", "noopener,noreferrer,width=1280,height=850")
}

function openRouteContextMenu(event, path, label, query = undefined) {
  linkContextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    href: getRouteHref(path, query),
    label,
  }
}

function openMoreInfoContextMenu(domEvent, item) {
  openRouteContextMenu(domEvent, "/o_eventinfo", item?.title || "Event details", { id: item?.id })
}

function openSeatSelectionContextMenu(domEvent, item) {
  openRouteContextMenu(domEvent, "/seatSelection", item?.title || "Seat selection", { id: item?.id })
}

function openContextMenuTargetInNewTab() {
  if (!linkContextMenu.value.href) return
  openHrefInNewTab(linkContextMenu.value.href)
  linkContextMenu.value.show = false
}

function openContextMenuTargetInNewWindow() {
  if (!linkContextMenu.value.href) return
  openHrefInNewWindow(linkContextMenu.value.href)
  linkContextMenu.value.show = false
}

const ageRestrictions = ref({
  allAges: false,
  fifteenPlus: false,
  eighteenPlus: false
})

const artistOptions = computed(() => {
  return artists.map(artistUser => ({
    label: `${artistUser.first_name} ${artistUser.last_name}`.trim(),
    value: artistUser.id
  }))
})

const fromDateDisplay = computed(() => formatPickerDate(fromDate.value))
const toDateDisplay = computed(() => formatPickerDate(toDate.value))

function formatPickerDate(value) {
  if (!value) return ""
  const parsed = parsePickerDate(value)
  if (!parsed) return ""
  return parsed.toLocaleDateString("en-GB")
}

function parsePickerDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  if (typeof value === "string") {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
  }

  return null
}

function parseEventDate(dateString) {
  if (!dateString) return null

  const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  }

  const parts = String(dateString).trim().split(" ")
  if (parts.length !== 3) return null

  const day = Number(parts[0])
  const month = months[parts[1].slice(0, 3).toLowerCase()]
  const year = Number(parts[2])

  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null

  return new Date(year, month, day)
}

function getArtistNames(event) {
  if (!Array.isArray(event.featured_artist_ids)) return []

  return event.featured_artist_ids
    .map(id => get_User_By_Id(id))
    .filter(Boolean)
    .map(user => `${user.first_name} ${user.last_name}`.trim())
}

function goToMoreInfo(event) {
  router.push(`/o_eventinfo?id=${event.id}`)
}

function goToSeatSelection(event) {
  router.push(`/seatSelection?id=${event.id}`)
}

const filteredEvents = computed(() => {
  const from = parsePickerDate(fromDate.value)
  const to = parsePickerDate(toDate.value)

  return events.filter(event => {
    const seatsLeft = event.seats_left
    const eventDate = parseEventDate(event.date)

    const matchesCategory =
      selectedCategories.value.length === 0 ||
      selectedCategories.value.includes(event.type)

    let matchesDate = true
    if (from && eventDate) {
      matchesDate = eventDate >= from
    }
    if (matchesDate && to && eventDate) {
      matchesDate = eventDate <= to
    }
    if ((from || to) && !eventDate) {
      matchesDate = false
    }

    const matchesCity =
      !locationCity.value || event.city === locationCity.value

    let matchesAvailability = true
    if (
      availability.value.available ||
      availability.value.almostSold ||
      availability.value.soldOut
    ) {
      matchesAvailability =
        (availability.value.available && seatsLeft > 20) ||
        (availability.value.almostSold && seatsLeft > 0 && seatsLeft <= 20) ||
        (availability.value.soldOut && seatsLeft === 0)
    }

    const matchesArtist =
      !artist.value ||
      (Array.isArray(event.featured_artist_ids) &&
        event.featured_artist_ids.includes(artist.value))

    let matchesAge = true
    if (
      ageRestrictions.value.allAges ||
      ageRestrictions.value.fifteenPlus ||
      ageRestrictions.value.eighteenPlus
    ) {
      matchesAge =
        (ageRestrictions.value.allAges && event.age_restriction === "All ages") ||
        (ageRestrictions.value.fifteenPlus && event.age_restriction === "15+") ||
        (ageRestrictions.value.eighteenPlus && event.age_restriction === "18+")
    }

    return (
      matchesCategory &&
      matchesDate &&
      matchesCity &&
      matchesAvailability &&
      matchesArtist &&
      matchesAge
    )
  })
})
</script>

<style scoped>
.ml-2 {
  margin-left: 8px;
}

.event-page-shell {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.page-container {
  position: relative;
  z-index: 1;
}

.page-background-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.16;
  pointer-events: none;
  transition: opacity 0.35s ease, background 0.35s ease;
}

.orb-1 {
  width: 260px;
  height: 260px;
  top: 90px;
  left: -60px;
}

.orb-2 {
  width: 340px;
  height: 340px;
  right: -100px;
  top: 260px;
}

.browser-light {
  background:
    radial-gradient(circle at top left, rgba(76, 110, 245, 0.07), transparent 28%),
    radial-gradient(circle at right center, rgba(0, 188, 212, 0.06), transparent 24%),
    linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%);
  color: #162033;
}

.browser-light .orb-1 {
  background: #6f8cff;
}

.browser-light .orb-2 {
  background: #62d6ff;
}

.browser-dark {
  background:
    radial-gradient(circle at top left, rgba(94, 114, 228, 0.12), transparent 30%),
    radial-gradient(circle at right center, rgba(0, 188, 212, 0.1), transparent 26%),
    linear-gradient(180deg, #0b1220 0%, #121a29 100%);
  color: #ecf2ff;
}

.browser-dark .orb-1 {
  background: #5d7cff;
}

.browser-dark .orb-2 {
  background: #00bcd4;
}

.hero-card,
.filter-card,
.results-card,
.event-card {
  backdrop-filter: blur(12px);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    background 0.35s ease,
    border-color 0.35s ease;
}

.browser-light .hero-card,
.browser-light .filter-card,
.browser-light .results-card,
.browser-light .event-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(37, 59, 102, 0.08);
  box-shadow: 0 10px 30px rgba(20, 31, 56, 0.06);
}

.browser-dark .hero-card,
.browser-dark .filter-card,
.browser-dark .results-card,
.browser-dark .event-card {
  background: rgba(15, 23, 36, 0.82);
  border: 1px solid rgba(145, 170, 220, 0.12);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
}

.hero-card {
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent 42%),
    linear-gradient(315deg, rgba(6, 182, 212, 0.08), transparent 46%);
  pointer-events: none;
}

.hero-copy,
.hero-stats {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease;
}

.browser-light .hero-badge {
  background: rgba(93, 114, 255, 0.08);
  color: #3349b9;
  border: 1px solid rgba(93, 114, 255, 0.15);
}

.browser-dark .hero-badge {
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
  border: 1px solid rgba(129, 140, 248, 0.2);
}

.hero-title {
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 720px;
  font-size: 1rem;
}

.hero-stat-chip {
  min-width: 118px;
  padding: 14px 16px;
  border: 1px solid transparent;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.35s ease, border-color 0.35s ease;
}

.hero-stat-chip:hover {
  transform: translateY(-2px);
}

.browser-light .hero-stat-chip {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(37, 59, 102, 0.08);
  box-shadow: 0 8px 18px rgba(20, 31, 56, 0.05);
}

.browser-dark .hero-stat-chip {
  background: rgba(20, 30, 48, 0.78);
  border-color: rgba(145, 170, 220, 0.12);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22);
}

.filter-card {
  position: sticky;
  top: 88px;
}

.section-icon-wrap {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
}

.browser-light .section-icon-wrap {
  background: rgba(98, 108, 255, 0.08);
  color: #4757d8;
  border: 1px solid rgba(98, 108, 255, 0.12);
}

.browser-dark .section-icon-wrap {
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
  border: 1px solid rgba(129, 140, 248, 0.18);
}

.filter-count-chip,
.summary-chip {
  font-weight: 600;
}

.filter-group + .filter-group {
  margin-top: 2px;
}

.filter-label {
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: 0.01em;
}

.section-divider {
  opacity: 0.8;
}

.filter-chip-group {
  gap: 8px;
}

.filter-chip {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
}

.checkbox-stack {
  display: grid;
  gap: 6px;
}

.enhanced-field :deep(.v-field),
.enhanced-checkbox :deep(.v-selection-control) {
  transition: all 0.22s ease;
}

.browser-light .enhanced-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.76);
}

.browser-dark .enhanced-field :deep(.v-field) {
  background: rgba(15, 23, 36, 0.72);
}

.enhanced-field:hover :deep(.v-field),
.enhanced-checkbox:hover :deep(.v-selection-control) {
  transform: translateY(-1px);
}

.date-picker-card {
  overflow: hidden;
  border-radius: 18px;
}

.event-list-row {
  row-gap: 8px;
}

.event-card {
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-3px);
}

.browser-light .event-card:hover {
  box-shadow: 0 16px 34px rgba(20, 31, 56, 0.1);
}

.browser-dark .event-card:hover {
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.34);
}

.event-image-wrap {
  position: relative;
  height: 100%;
}

.event-image {
  transition: transform 0.35s ease;
}

.event-card:hover .event-image {
  transform: scale(1.02);
}

.image-overlay-glow {
  position: absolute;
  inset: auto 14px 14px 14px;
  height: 46px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.22));
  pointer-events: none;
}

.image-placeholder {
  border-radius: 16px;
}

.browser-light .image-placeholder {
  background: #e9eef7;
  color: #6b7a96;
}

.browser-dark .image-placeholder {
  background: #192335;
  color: #9cb1d8;
}

.title-stack {
  min-width: 0;
}

.event-title {
  line-height: 1.15;
  letter-spacing: -0.015em;
}

.event-location-line {
  margin-top: 6px;
}

.status-chip-group {
  max-width: 100%;
}

.status-chip {
  font-weight: 700;
}

.event-info-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  padding: 9px 12px;
  border-radius: 999px;
  font-size: 0.92rem;
  transition: background 0.35s ease, border-color 0.35s ease, transform 0.2s ease;
}

.info-pill:hover {
  transform: translateY(-1px);
}

.browser-light .info-pill {
  background: rgba(243, 246, 252, 0.95);
  border: 1px solid rgba(37, 59, 102, 0.08);
  color: #21304a;
}

.browser-dark .info-pill {
  background: rgba(23, 34, 52, 0.95);
  border: 1px solid rgba(145, 170, 220, 0.12);
  color: #dce7fb;
}

.event-description {
  line-height: 1.7;
}

.artist-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  min-height: 36px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.primary-action-btn {
  box-shadow: 0 10px 20px rgba(25, 118, 210, 0.18);
}

.empty-state-sheet {
  border-radius: 22px;
  border: 1px dashed transparent;
  transition: background 0.35s ease, border-color 0.35s ease;
}

.browser-light .empty-state-sheet {
  background: rgba(250, 252, 255, 0.88);
  border-color: rgba(37, 59, 102, 0.16);
}

.browser-dark .empty-state-sheet {
  background: rgba(14, 20, 30, 0.75);
  border-color: rgba(145, 170, 220, 0.18);
}

.empty-state-content {
  max-width: 360px;
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.browser-light .empty-state-icon {
  background: rgba(98, 108, 255, 0.08);
  color: #4d5de0;
}

.browser-dark .empty-state-icon {
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
}

.context-menu-list {
  border-radius: 18px;
  overflow: hidden;
}

.browser-light :deep(.v-list.context-menu-list) {
  background: rgba(255, 255, 255, 0.98);
}

.browser-dark :deep(.v-list.context-menu-list) {
  background: rgba(19, 28, 43, 0.98);
  color: #eef4ff;
}

.browser-dark :deep(.text-medium-emphasis) {
  color: rgba(226, 235, 255, 0.7) !important;
}

.browser-dark :deep(.v-label),
.browser-dark :deep(.v-field__input),
.browser-dark :deep(.v-field__prepend-inner),
.browser-dark :deep(.v-selection-control__label),
.browser-dark :deep(.v-chip),
.browser-dark :deep(.v-card),
.browser-dark :deep(.v-list-item-title),
.browser-dark :deep(.v-list-subheader) {
  color: #eef4ff;
}

.browser-dark :deep(.v-field) {
  color: #eef4ff;
}

.browser-dark :deep(.v-divider) {
  opacity: 0.18;
}

.rounded-xxl {
  border-radius: 24px !important;
}

@media (max-width: 959px) {
  .filter-card {
    position: static;
    top: auto;
  }

  .hero-stat-chip {
    min-width: 104px;
  }
}

@media (max-width: 600px) {
  .event-info-pills {
    gap: 8px;
  }

  .info-pill {
    width: 100%;
    justify-content: flex-start;
  }

  .hero-title {
    font-size: 2rem !important;
  }
}
</style>