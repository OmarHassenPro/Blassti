<template>
  <v-app>
    <AppNavbar />

    <v-main>
      <div class="event-info-shell" :class="browserThemeClass">
        <v-container class="py-6 py-md-8 px-4 px-md-6 event-info-container">
          <div v-if="event" class="event-page-content">
            <div class="breadcrumb-row mb-3">
              <v-chip
                size="small"
                variant="tonal"
                rounded="pill"
                class="breadcrumb-chip"
              >
                <v-icon start size="16">mdi-star-four-points-outline</v-icon>
                Recommended Details
              </v-chip>

              <v-icon size="14" class="mx-2 text-medium-emphasis">mdi-chevron-right</v-icon>

              <span class="text-caption text-medium-emphasis">{{ event.title }}</span>
            </div>

            <v-card
              rounded="xl"
              class="hero-card mb-6 mb-md-8 overflow-hidden page-entrance-card"
              elevation="0"
              variant="flat"
            >
              <div class="hero-glow" />

              <div class="pa-4 pa-md-6">
                <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4 hero-card-layout">
                  <div class="hero-copy">
                    <div class="d-flex flex-wrap align-center ga-2 mb-3 hero-meta-chip-row">
                      <v-chip size="small" color="primary" variant="tonal" rounded="pill">
                        <v-icon start size="16">mdi-ticket-confirmation-outline</v-icon>
                        Event Details
                      </v-chip>

                      <v-chip size="small" variant="outlined" rounded="pill">
                        <v-icon start size="16">mdi-calendar-blank-outline</v-icon>
                        {{ event.date }}
                      </v-chip>

                      <v-chip size="small" variant="outlined" rounded="pill">
                        <v-icon start size="16">mdi-clock-time-four-outline</v-icon>
                        {{ event.time }} - {{ event.end_time }}
                      </v-chip>
                    </div>

                    <div class="text-h4 text-md-h3 font-weight-bold hero-title mb-2">
                      {{ event.title }}
                    </div>

                    <div class="text-body-1 text-medium-emphasis hero-subtitle">
                      Explore the event, preview its venue, check the experience details, and book your ticket with confidence.
                    </div>
                  </div>

                  <div class="d-flex flex-wrap ga-3 hero-stat-group" :class="{ 'hero-stat-group-mobile': isPhone }">
                    <v-sheet
                      rounded="xl"
                      class="hero-stat-card px-4 py-3"
                      border
                    >
                      <div class="text-caption text-medium-emphasis mb-1">Category</div>
                      <div class="text-subtitle-2 font-weight-bold">{{ event.type }}</div>
                    </v-sheet>

                    <v-sheet
                      rounded="xl"
                      class="hero-stat-card px-4 py-3"
                      border
                    >
                      <div class="text-caption text-medium-emphasis mb-1">Seats left</div>
                      <div class="text-subtitle-2 font-weight-bold">{{ event.seats_left }}</div>
                    </v-sheet>

                    <v-sheet
                      rounded="xl"
                      class="hero-stat-card px-4 py-3"
                      border
                    >
                      <div class="text-caption text-medium-emphasis mb-1">Age</div>
                      <div class="text-subtitle-2 font-weight-bold">{{ event.age_restriction }}</div>
                    </v-sheet>
                  </div>
                </div>
              </div>
            </v-card>

            <div class="mobile-quick-action-bar" v-if="isPhone">
              <v-card
                variant="flat"
                rounded="xl"
                class="mobile-quick-action-card pa-3 page-entrance-card page-entrance-card-delay-1"
                elevation="0"
              >
                <div class="d-flex align-center justify-space-between ga-3">
                  <div class="mobile-quick-action-copy">
                    <div class="text-caption text-medium-emphasis mb-1">Booking status</div>
                    <div class="text-subtitle-2 font-weight-bold">{{ bookingHeadline }}</div>
                    <div class="text-caption text-medium-emphasis mobile-quick-action-text">
                      {{ bookingStateText }} · {{ event.venue }}
                    </div>
                  </div>

                  <v-btn
                    :color="bookingButtonColor"
                    rounded="pill"
                    class="text-none mobile-quick-action-btn"
                    :disabled="!canBuyTicket"
                    @click="goToSeatSelection"
                  >
                    <v-icon start>{{ bookingButtonIcon }}</v-icon>
                    Book now
                  </v-btn>
                </div>
              </v-card>
            </div>

            <div class="content-grid" :class="{ 'content-grid-tablet': isTablet, 'content-grid-phone': isPhone }">
              <!-- LEFT -->
              <div class="left-column">
                <v-card
                  variant="flat"
                  rounded="xl"
                  class="gallery-card pa-3 pa-md-4 page-entrance-card page-entrance-card-delay-1"
                  elevation="0"
                >
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div>
                      <div class="text-subtitle-1 font-weight-bold">Event gallery</div>
                      <div class="text-body-2 text-medium-emphasis">
                        Browse event visuals and preview the experience.
                      </div>
                    </div>

                    <v-chip size="small" variant="tonal" rounded="pill">
                      <v-icon start size="16">mdi-image-multiple-outline</v-icon>
                      {{ event.images?.length || 0 }} image<span v-if="(event.images?.length || 0) !== 1">s</span>
                    </v-chip>
                  </div>

                  <div class="gallery-main-wrapper mb-4">
                    <v-btn
                      icon
                      variant="flat"
                      class="gallery-nav-btn gallery-nav-btn-left"
                      @click="previousImage"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>

                    <v-sheet
                      :height="isMobile ? 260 : isTabletOrDown ? 300 : 360"
                      class="gallery-main-sheet rounded-xl overflow-hidden"
                    >
                      <v-img
                        :src="currentImage"
                        :height="isMobile ? 260 : isTabletOrDown ? 300 : 360"
                        cover
                        class="gallery-main-image"
                      >
                        <template #placeholder>
                          <div class="d-flex align-center justify-center fill-height gallery-placeholder">
                            <div class="text-center">
                              <v-icon size="60" class="text-medium-emphasis mb-2">mdi-image-outline</v-icon>
                              <div class="text-body-2 text-medium-emphasis">Loading preview...</div>
                            </div>
                          </div>
                        </template>

                        <div class="image-overlay" />

                        <div class="image-counter">
                          <v-chip size="small" color="surface" variant="flat" rounded="pill">
                            <v-icon start size="14">mdi-camera-outline</v-icon>
                            {{ currentImageIndex + 1 }} / {{ event.images?.length || 0 }}
                          </v-chip>
                        </div>
                      </v-img>
                    </v-sheet>

                    <v-btn
                      icon
                      variant="flat"
                      class="gallery-nav-btn gallery-nav-btn-right"
                      @click="nextImage"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>

                  <div class="thumbnail-row">
                    <v-btn
                      icon
                      variant="text"
                      class="thumbnail-arrow"
                      @click="previousImage"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>

                    <div class="thumbnail-strip">
                      <v-card
                        v-for="(img, index) in event.images"
                        :key="index"
                        variant="flat"
                        rounded="lg"
                        height="82"
                        class="thumbnail-card"
                        :class="{ 'thumbnail-card-active': currentImageIndex === index }"
                        @click="currentImageIndex = index"
                      >
                        <v-img :src="img" height="82" cover />
                        <div class="thumbnail-overlay" />
                      </v-card>
                    </div>

                    <v-btn
                      icon
                      variant="text"
                      class="thumbnail-arrow"
                      @click="nextImage"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                </v-card>

                <v-card
                  variant="flat"
                  rounded="xl"
                  class="details-card pa-5 pa-md-6 mt-6 page-entrance-card page-entrance-card-delay-2"
                  elevation="0"
                >
                  <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3 mb-5">
                    <div>
                      <div class="text-h6 font-weight-bold">More details</div>
                      <div class="text-body-2 text-medium-emphasis">
                        Everything important about this event, in one place.
                      </div>
                    </div>

                    <v-chip size="small" variant="outlined" rounded="pill">
                      <v-icon start size="16">mdi-information-outline</v-icon>
                      Event information
                    </v-chip>
                  </div>

                  <div class="details-list">
                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-map-marker-outline</v-icon>
                        <span>Location</span>
                      </div>
                      <div class="detail-value">{{ event.city }}</div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-office-building-marker-outline</v-icon>
                        <span>Venue</span>
                      </div>

                      <div class="detail-value">
                        <div class="d-flex flex-wrap align-center ga-2">
                          <span>{{ event.venue }}</span>

                          <v-btn
                            v-if="matchedVenue"
                            variant="text"
                            density="compact"
                            class="px-0 detail-inline-link"
                            @click="goToVenue"
                          >
                            <v-icon start size="16">mdi-open-in-new</v-icon>
                            view venue
                          </v-btn>

                          <v-chip
                            v-if="event.accessible_seats"
                            size="x-small"
                            color="success"
                            variant="tonal"
                            rounded="pill"
                          >
                            <v-icon start size="14">mdi-wheelchair-accessibility</v-icon>
                            Accessible seats available
                          </v-chip>
                        </div>
                      </div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-calendar-outline</v-icon>
                        <span>Date</span>
                      </div>
                      <div class="detail-value">{{ event.date }}</div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-clock-outline</v-icon>
                        <span>Time</span>
                      </div>
                      <div class="detail-value">{{ event.time }} - {{ event.end_time }}</div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-shape-outline</v-icon>
                        <span>Category</span>
                      </div>
                      <div class="detail-value">{{ event.type }}</div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-account-alert-outline</v-icon>
                        <span>Age restriction</span>
                      </div>
                      <div class="detail-value">{{ event.age_restriction }}</div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-star-outline</v-icon>
                        <span>Reviews</span>
                      </div>

                      <div class="detail-value d-flex align-center flex-wrap ga-2">
                        <v-rating
                          :model-value="event.review_rating"
                          length="5"
                          half-increments
                          density="compact"
                          readonly
                          color="amber"
                          active-color="amber"
                        />
                        <span class="text-body-2 text-medium-emphasis">
                          {{ event.review_rating }}/5
                        </span>
                      </div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-sofa-outline</v-icon>
                        <span>Seat classes</span>
                      </div>
                      <div class="detail-value">
                        <div class="d-flex flex-wrap ga-2">
                          <v-chip
                            v-for="seatClass in event.seat_classes"
                            :key="seatClass"
                            size="small"
                            variant="tonal"
                            rounded="pill"
                          >
                            {{ seatClass }}
                          </v-chip>
                        </div>
                      </div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-seat-outline</v-icon>
                        <span>Seats left</span>
                      </div>
                      <div class="detail-value">
                        <v-chip size="small" :color="bookingStateColor" variant="tonal" rounded="pill">
                          {{ bookingStateText }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-label">
                        <v-icon size="18">mdi-speaker-wireless</v-icon>
                        <span>Sound quality</span>
                      </div>

                      <div class="detail-value">
                        <div class="sound-quality-wrap">
                          <v-sheet
                            v-for="n in 3"
                            :key="n"
                            width="40"
                            height="12"
                            class="rounded-pill sound-bar"
                            :class="n <= event.sound_quality ? 'sound-bar-active' : 'sound-bar-inactive'"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="detail-row detail-row-last">
                      <div class="detail-label">
                        <v-icon size="18">mdi-microphone-variant</v-icon>
                        <span>Featured artist(s)</span>
                      </div>

                      <div class="detail-value">
                        <div class="d-flex flex-wrap ga-2">
                          <template v-if="featuredArtists.length">
                            <v-btn
                              v-for="artist in featuredArtists"
                              :key="artist.id"
                              variant="tonal"
                              rounded="pill"
                              class="artist-pill"
                              @click="goToArtist(artist.id)"
                            >
                              <v-icon start size="16">mdi-account-music-outline</v-icon>
                              {{ artist.full_name }}
                            </v-btn>
                          </template>

                          <span v-else class="text-medium-emphasis">None</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>

              <!-- RIGHT -->
              <div class="right-column" :class="{ 'right-column-tablet': isTablet, 'right-column-phone': isPhone }">
                <v-card
                  variant="flat"
                  rounded="xl"
                  class="booking-card pa-5 pa-md-6 page-entrance-card page-entrance-card-delay-1"
                  elevation="0"
                >
                  <div class="booking-card-glow" />

                  <div class="position-relative">
                    <div class="d-flex align-center justify-space-between ga-3 mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold">Description</div>
                        <div class="text-body-2 text-medium-emphasis">
                          A quick overview before you reserve your seat.
                        </div>
                      </div>

                      <v-avatar size="42" class="booking-avatar">
                        <v-icon size="22">mdi-text-box-search-outline</v-icon>
                      </v-avatar>
                    </div>

                    <v-divider class="mb-4 booking-divider" />

                    <v-sheet rounded="xl" class="description-panel pa-4 mb-5">
                      <div class="text-body-2 text-medium-emphasis description-text">
                        {{ event.description }}
                      </div>
                    </v-sheet>

                    <div class="booking-highlight mb-5" :class="bookingHighlightClass">
                      <div class="d-flex align-center ga-2 mb-2">
                        <v-icon size="18" :color="bookingStateColor">{{ bookingStateIcon }}</v-icon>
                        <span class="text-subtitle-2 font-weight-bold">{{ bookingHeadline }}</span>
                      </div>

                      <div class="text-body-2 text-medium-emphasis">
                        {{ bookingMessage }}
                      </div>
                    </div>

                    <v-btn
                      :color="bookingButtonColor"
                      size="large"
                      block
                      rounded="lg"
                      class="book-btn text-none"
                      :disabled="!canBuyTicket"
                      @click="goToSeatSelection"
                    >
                      <v-icon start>{{ bookingButtonIcon }}</v-icon>
                      {{ bookingButtonText }}
                    </v-btn>
                  </div>
                </v-card>

                
              </div>
            </div>
          </div>

          <div v-else>
            <v-card
              rounded="xl"
              class="empty-state-card py-12 px-6 page-entrance-card"
              elevation="0"
              variant="flat"
            >
              <div class="text-center">
                <v-avatar size="72" class="mb-4 empty-avatar">
                  <v-icon size="36">mdi-calendar-remove-outline</v-icon>
                </v-avatar>

                <div class="text-h6 font-weight-bold mb-2">Event not found</div>
                <div class="text-body-2 text-medium-emphasis">
                  The event you are trying to open does not exist or is no longer available.
                </div>
              </div>
            </v-card>
          </div>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import { can_Buy_Event_Tickets, get_Event_By_Id, is_Event_Past } from "@/dataModel/event"
import { get_User_By_Id } from "@/dataModel/user"
import { get_All_Venues } from "@/dataModel/venue"

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"

const event = computed(() => get_Event_By_Id(route.query.id))

const currentImageIndex = ref(0)
const isMobile = computed(() => display.smAndDown.value)
const isTabletOrDown = computed(() => display.mdAndDown.value)
const isPhone = computed(() => display.xs.value)
const isTablet = computed(() => display.sm.value || display.md.value)

watch(
  () => route.query.id,
  () => {
    currentImageIndex.value = 0
  }
)

watch(
  () => theme.global.name.value,
  (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      document.documentElement.setAttribute("data-app-theme", newTheme)
      document.documentElement.style.colorScheme = newTheme
    }
  },
  { immediate: true }
)

const currentImage = computed(() => {
  if (!event.value || !event.value.images.length) return ""
  return event.value.images[currentImageIndex.value]
})

const featuredArtists = computed(() => {
  if (!event.value) return []
  return event.value.featured_artist_ids
    .map(id => get_User_By_Id(id))
    .filter(Boolean)
})

const venues = get_All_Venues()

const matchedVenue = computed(() => {
  if (!event.value) return null
  return venues.find(venue => venue.title === event.value.venue) || null
})

const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})

const browserThemeClass = computed(() => {
  return currentTheme.value === "dark" ? "browser-dark" : "browser-light"
})
const canBuyTicket = computed(() => {
  return can_Buy_Event_Tickets(event.value)
})

const isPastEvent = computed(() => {
  return is_Event_Past(event.value)
})

const bookingStateText = computed(() => {
  if (!event.value) return "Unavailable"
  if (isPastEvent.value) return "Event ended"
  if (event.value.seats_left <= 0) return "Sold out"
  return `${event.value.seats_left} remaining`
})

const bookingStateColor = computed(() => {
  if (isPastEvent.value) return "grey-darken-1"
  if (!event.value) return "grey"
  if (event.value.seats_left <= 0) return "error"
  if (event.value.seats_left <= 20) return "warning"
  return "primary"
})

const bookingStateIcon = computed(() => {
  if (isPastEvent.value) return "mdi-calendar-remove-outline"
  if (!event.value) return "mdi-alert-circle-outline"
  if (event.value.seats_left <= 0) return "mdi-close-circle-outline"
  return "mdi-check-decagram-outline"
})

const bookingHeadline = computed(() => {
  if (!event.value) return "Booking unavailable"
  if (isPastEvent.value) return "This event is over"
  if (event.value.seats_left <= 0) return "This event is sold out"
  return "Ready to reserve?"
})

const bookingMessage = computed(() => {
  if (!event.value) return "This event is no longer available."
  if (isPastEvent.value) return "Ticket sales are closed because this event has already ended."
  if (event.value.seats_left <= 0) return "All tickets for this event have already been purchased."
  return "Pick your preferred seat and continue to booking in a smoother, guided flow."
})

const bookingButtonText = computed(() => {
  if (!event.value) return "Unavailable"
  if (isPastEvent.value) return "Event Ended"
  if (event.value.seats_left <= 0) return "Sold Out"
  return "Book your ticket now!"
})

const bookingButtonIcon = computed(() => {
  if (!event.value) return "mdi-alert-circle-outline"
  if (isPastEvent.value) return "mdi-calendar-remove-outline"
  if (event.value.seats_left <= 0) return "mdi-close-circle-outline"
  return "mdi-ticket-outline"
})

const bookingButtonColor = computed(() => {
  if (!event.value) return "grey"
  if (isPastEvent.value) return "grey-darken-1"
  if (event.value.seats_left <= 0) return "error"
  return "primary"
})

const bookingHighlightClass = computed(() => {
  if (isPastEvent.value) return "booking-highlight-disabled"
  if (event.value?.seats_left <= 0) return "booking-highlight-soldout"
  return ""
})


function applyThemeChoice(themeName) {
  if (typeof window === "undefined") return
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme
  document.documentElement.setAttribute("data-app-theme", normalizedTheme)
  document.documentElement.style.colorScheme = normalizedTheme
}

function loadSavedTheme() {
  if (typeof window === "undefined") return
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function handleWindowStorage(event) {
  if (typeof window === "undefined") return
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === "light" || savedTheme === "dark") {
      applyThemeChoice(savedTheme)
    }
  }
}

function handleWindowFocus() {
  loadSavedTheme()
}

function previousImage() {
  if (!event.value || !event.value.images.length) return
  currentImageIndex.value =
    (currentImageIndex.value - 1 + event.value.images.length) % event.value.images.length
}

function nextImage() {
  if (!event.value || !event.value.images.length) return
  currentImageIndex.value =
    (currentImageIndex.value + 1) % event.value.images.length
}

function goToArtist(artistId) {
  router.push({
    path: "/f_details",
    query: { id: artistId }
  })
}

function goToVenue() {
  if (!matchedVenue.value) return

  router.push({
    path: "/o_venueinfo",
    query: { id: matchedVenue.value.id }
  })
}

function goToSeatSelection() {
  if (!event.value || !canBuyTicket.value) return

  router.push({
    path: "/seatselection",
    query: { id: event.value.id }
  })
}

onMounted(() => {
  loadSavedTheme()

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleWindowStorage)
    window.addEventListener("focus", handleWindowFocus)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleWindowStorage)
    window.removeEventListener("focus", handleWindowFocus)
  }
})
</script>

<style scoped>
.event-info-shell {
  min-height: 100%;
  transition: background 0.35s ease, color 0.35s ease;
}

.event-info-container {
  position: relative;
  z-index: 1;
}

.browser-light {
  background:
    radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.09), transparent 22%),
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.05), transparent 20%),
    linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(244, 247, 251, 1) 100%);
}

.browser-dark {
  background:
    radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.16), transparent 24%),
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.04), transparent 18%),
    linear-gradient(180deg, rgba(13, 17, 23, 1) 0%, rgba(16, 20, 28, 1) 100%);
}

.breadcrumb-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.breadcrumb-chip {
  backdrop-filter: blur(8px);
}

.hero-card,
.gallery-card,
.details-card,
.booking-card,
.mini-info-card,
.empty-state-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.35s ease;
}

.browser-light .hero-card,
.browser-light .gallery-card,
.browser-light .details-card,
.browser-light .booking-card,
.browser-light .mini-info-card,
.browser-light .empty-state-card {
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
}

.browser-dark .hero-card,
.browser-dark .gallery-card,
.browser-dark .details-card,
.browser-dark .booking-card,
.browser-dark .mini-info-card,
.browser-dark .empty-state-card {
  background: rgba(20, 25, 34, 0.86);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
}

.hero-card:hover,
.gallery-card:hover,
.details-card:hover,
.booking-card:hover,
.mini-info-card:hover {
  transform: translateY(-2px);
}

.hero-glow {
  position: absolute;
  inset: auto -80px -80px auto;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.12);
  filter: blur(28px);
  pointer-events: none;
}

.event-page-content {
  position: relative;
}

.hero-title {
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero-subtitle {
  max-width: 760px;
  line-height: 1.75;
}

.hero-card-layout {
  position: relative;
  z-index: 1;
}

.hero-copy {
  min-width: 0;
}

.hero-meta-chip-row {
  row-gap: 10px !important;
}

.mobile-quick-action-bar {
  display: none;
}

.hero-stat-group {
  justify-content: flex-end;
}

.hero-stat-card {
  min-width: 128px;
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.hero-stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.05fr) minmax(300px, 0.95fr);
  gap: 24px;
  align-items: start;
}

.content-grid-tablet,
.content-grid-phone {
  gap: 18px;
}

.left-column,
.right-column {
  min-width: 0;
}

.right-column-tablet {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(220px, 0.85fr);
  gap: 16px;
  align-items: start;
}

.right-column-tablet .mini-info-card {
  margin-top: 0 !important;
  height: 100%;
}

.right-column-phone {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.right-column-phone .mini-info-card {
  margin-top: 0 !important;
}

.gallery-main-wrapper {
  position: relative;
}

.gallery-main-sheet {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.gallery-main-image {
  transition: transform 0.3s ease;
}

.gallery-main-sheet:hover .gallery-main-image {
  transform: scale(1.01);
}

.gallery-placeholder {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), transparent),
    rgba(var(--v-theme-surface-variant), 0.25);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.18), transparent 40%);
  pointer-events: none;
}

.image-counter {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 2;
}

.gallery-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.browser-light .gallery-nav-btn {
  background: rgba(255, 255, 255, 0.88);
}

.browser-dark .gallery-nav-btn {
  background: rgba(29, 35, 46, 0.88);
}

.gallery-nav-btn-left {
  left: 12px;
}

.gallery-nav-btn-right {
  right: 12px;
}

.thumbnail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thumbnail-strip {
  flex: 1;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.thumbnail-card {
  flex: 1 1 0;
  min-width: 0;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.thumbnail-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.45);
}

.thumbnail-card-active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.14);
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.18), transparent 50%);
  pointer-events: none;
}

.thumbnail-arrow {
  flex-shrink: 0;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-row {
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.detail-row-last {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 600;
}

.detail-value {
  min-width: 0;
  line-height: 1.7;
}

.detail-inline-link {
  min-width: 0;
  text-transform: none;
}

.sound-quality-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 3px;
}

.sound-bar {
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

.sound-bar-active {
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.16);
}

.sound-bar-inactive {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border: 1px solid rgba(var(--v-border-color), 0.2);
}

.artist-pill {
  text-transform: none;
  letter-spacing: 0;
}

.booking-card {
  position: sticky;
  top: 92px;
}

.booking-card-glow {
  position: absolute;
  top: -36px;
  right: -36px;
  width: 130px;
  height: 130px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.14);
  filter: blur(24px);
  pointer-events: none;
}

.booking-avatar,
.mini-info-avatar,
.empty-avatar {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.booking-divider {
  opacity: 0.8;
}

.description-panel {
  border: 1px solid rgba(var(--v-border-color), 0.14);
}

.browser-light .description-panel {
  background: rgba(248, 250, 252, 0.9);
}

.browser-dark .description-panel {
  background: rgba(255, 255, 255, 0.03);
}

.description-text {
  line-height: 1.85;
}

.booking-highlight {
  border-radius: 18px;
  padding: 16px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.35);
  background: rgba(var(--v-theme-primary), 0.04);
}

.booking-highlight-disabled {
  border-color: rgba(var(--v-theme-on-surface), 0.18);
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.booking-highlight-soldout {
  border-color: rgba(var(--v-theme-error), 0.28);
  background: rgba(var(--v-theme-error), 0.06);
}

.book-btn {
  font-weight: 700;
  letter-spacing: 0;
  box-shadow: 0 14px 28px rgba(var(--v-theme-primary), 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(var(--v-theme-primary), 0.28);
}

.empty-state-card {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-entrance-card {
  animation: pageFadeLift 0.32s ease-out both;
}

.page-entrance-card-delay-1 {
  animation-delay: 0.04s;
}

.page-entrance-card-delay-2 {
  animation-delay: 0.08s;
}

@keyframes pageFadeLift {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    order: -1;
  }

  .booking-card {
    position: relative;
    top: 0;
  }
}

@media (min-width: 701px) and (max-width: 1180px) {
  .hero-stat-group {
    width: 100%;
    justify-content: flex-start;
  }

  .hero-stat-card {
    flex: 1 1 calc(33.333% - 10px);
    min-width: 160px;
  }

  .gallery-card,
  .details-card,
  .booking-card,
  .mini-info-card {
    border-radius: 24px !important;
  }
}

@media (max-width: 960px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 0;
  }

  .hero-stat-group {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .event-info-container {
    padding-left: 14px !important;
    padding-right: 14px !important;
    padding-bottom: 88px !important;
  }

  .mobile-quick-action-bar {
    display: block;
    margin-bottom: 16px;
  }

  .mobile-quick-action-card {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    position: relative;
    overflow: hidden;
  }

  .browser-light .mobile-quick-action-card {
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  }

  .browser-dark .mobile-quick-action-card {
    background: rgba(20, 25, 34, 0.88);
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.26);
  }

  .mobile-quick-action-copy {
    min-width: 0;
    flex: 1 1 auto;
  }

  .mobile-quick-action-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-quick-action-btn {
    flex-shrink: 0;
  }

  .hero-card,
  .gallery-card,
  .details-card,
  .booking-card,
  .mini-info-card,
  .empty-state-card {
    border-radius: 22px !important;
  }

  .hero-card {
    margin-bottom: 18px !important;
  }

  .hero-card-layout {
    gap: 18px !important;
  }

  .hero-title {
    font-size: 2rem !important;
  }

  .hero-subtitle {
    line-height: 1.65;
    font-size: 0.98rem;
  }

  .hero-meta-chip-row {
    flex-wrap: nowrap !important;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .hero-meta-chip-row::-webkit-scrollbar {
    display: none;
  }

  .hero-stat-group {
    width: 100%;
    gap: 10px !important;
  }

  .hero-stat-group-mobile {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .hero-stat-card {
    flex: 1 1 calc(50% - 8px);
    min-width: calc(50% - 8px);
  }

  .gallery-card,
  .details-card {
    margin-top: 0 !important;
  }

  .gallery-main-sheet,
  .gallery-main-image :deep(img) {
    max-height: 300px;
  }

  .thumbnail-row {
    gap: 6px;
  }

  .thumbnail-strip {
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
    scroll-snap-type: x proximity;
  }

  .thumbnail-card {
    min-width: 84px;
    height: 72px !important;
    flex: 0 0 84px;
    scroll-snap-align: start;
  }

  .thumbnail-arrow {
    width: 40px !important;
    height: 40px !important;
  }

  .booking-card {
    margin-bottom: 0 !important;
  }
}

@media (max-width: 600px) {
  .breadcrumb-row {
    gap: 4px;
  }

  .breadcrumb-chip {
    max-width: 100%;
  }

  .gallery-nav-btn {
    width: 42px !important;
    height: 42px !important;
  }

  .gallery-nav-btn-left {
    left: 8px;
  }

  .gallery-nav-btn-right {
    right: 8px;
  }

  .image-counter {
    right: 10px;
    bottom: 10px;
  }

  .hero-stat-card {
    min-width: 100%;
    width: 100%;
  }

  .hero-stat-group-mobile {
    grid-template-columns: 1fr;
  }

  .booking-highlight {
    padding: 14px;
  }

  .book-btn {
    min-height: 48px;
  }

  .description-text {
    line-height: 1.75;
  }
}

@media (hover: none) {
  .hero-card:hover,
  .gallery-card:hover,
  .details-card:hover,
  .booking-card:hover,
  .mini-info-card:hover,
  .hero-stat-card:hover,
  .thumbnail-card:hover,
  .book-btn:hover {
    transform: none;
  }

  .gallery-main-sheet:hover .gallery-main-image {
    transform: none;
  }
}
</style>