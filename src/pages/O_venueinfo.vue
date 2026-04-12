<template>
  <v-app>
    <AppNavbar />

    <v-main>
      <div class="venue-page-shell" :class="browserThemeClass">
        <v-container class="py-4 py-sm-5 py-md-8 venue-page-container" style="max-width: 1240px;">
          <div v-if="venue">
            <div class="page-top-meta mb-3">
              <div class="text-caption text-medium-emphasis breadcrumb-line">
                Venue Details
                <v-icon size="14" class="mx-1 text-medium-emphasis">mdi-chevron-right</v-icon>
                {{ venue.title }}
              </div>
            </div>

            <v-card
              rounded="xl"
              variant="flat"
              class="hero-card mb-4 mb-md-6"
            >
              <div class="hero-card__glow"></div>

              <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-4 hero-layout">
                <div class="hero-copy">
                  <div class="hero-badge mb-3">
                    <v-icon size="16" class="me-2">mdi-map-marker-radius</v-icon>
                    Venue showcase
                  </div>

                  <div class="text-h5 text-md-h4 font-weight-bold mb-2 hero-title">
                    {{ venue.title }}
                  </div>

                  <div class="text-body-1 text-medium-emphasis hero-subtitle mb-4">
                    {{ venue.location }}
                  </div>

                  <div class="d-flex flex-wrap ga-2 hero-chip-wrap">
                    <v-chip size="small" variant="tonal" color="primary" rounded="pill">
                      <v-icon start size="16">mdi-shape-outline</v-icon>
                      {{ venue.category }}
                    </v-chip>

                    <v-chip size="small" variant="tonal" color="secondary" rounded="pill">
                      <v-icon start size="16">mdi-domain</v-icon>
                      {{ venue.type }}
                    </v-chip>

                    <v-chip
                      size="small"
                      rounded="pill"
                      variant="flat"
                      :color="venue.availability ? 'success' : 'error'"
                    >
                      <v-icon start size="16">
                        {{ venue.availability ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}
                      </v-icon>
                      {{ venue.availability ? "Available" : "Unavailable" }}
                    </v-chip>

                    <v-chip
                      size="small"
                      rounded="pill"
                      variant="outlined"
                      :color="venue.status === 'Active' ? 'primary' : 'grey'"
                    >
                      <v-icon start size="16">mdi-shield-check-outline</v-icon>
                      {{ venue.status }}
                    </v-chip>
                  </div>
                </div>

                <div class="hero-side-stats">
                  <v-card rounded="xl" variant="outlined" class="hero-stat-card">
                    <div class="hero-stat-grid">
                      <div class="hero-stat-box">
                        <div class="hero-stat-label">Capacity</div>
                        <div class="hero-stat-value">{{ formattedCapacity }}</div>
                      </div>

                      <div class="hero-stat-box">
                        <div class="hero-stat-label">Per hour</div>
                        <div class="hero-stat-value">{{ venue.price_per_hour }} TND</div>
                      </div>

                      <div class="hero-stat-box">
                        <div class="hero-stat-label">Per day</div>
                        <div class="hero-stat-value">{{ venue.price_per_day }} TND</div>
                      </div>

                      <div class="hero-stat-box">
                        <div class="hero-stat-label">Rating</div>
                        <div class="hero-stat-value">{{ venue.review_rating }}/5</div>
                      </div>
                    </div>
                  </v-card>
                </div>
              </div>
            </v-card>

            <v-card
              v-if="isMobile"
              rounded="xl"
              variant="outlined"
              class="mb-6 pa-4 surface-card mobile-booking-card"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div class="min-width-0">
                  <div class="section-kicker mb-1">Mobile booking</div>
                  <div class="text-subtitle-1 font-weight-bold">Reserve this venue faster</div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Jump straight to reservations with this venue preselected.
                  </div>
                </div>

                <v-btn
                  color="primary"
                  rounded="xl"
                  size="large"
                  class="mobile-booking-btn"
                  :disabled="!venue || !venue.id || !venue.availability"
                  @click="bookVenue"
                  @contextmenu.prevent="openNavigationMenu($event, getReservationNavigationUrl(), 'reservation')"
                  @touchstart.passive="startLongPress($event, getReservationNavigationUrl(), 'reservation')"
                  @touchend="cancelLongPress"
                  @touchmove="cancelLongPress"
                  @touchcancel="cancelLongPress"
                >
                  <v-icon start>mdi-calendar-check-outline</v-icon>
                  Book now
                </v-btn>
              </div>
            </v-card>

            <div class="d-flex align-start venue-layout" :class="{ 'venue-layout--tablet': isTablet, 'venue-layout--mobile': isMobile }">
              <!-- LEFT -->
              <div class="venue-left">
                <v-card variant="outlined" rounded="xl" class="pa-4 pa-md-5 media-card surface-card">
                  <div class="section-headline mb-4">
                    <div>
                      <div class="section-kicker mb-1">Gallery</div>
                      <div class="text-subtitle-1 font-weight-bold">Venue photos</div>
                    </div>

                    <v-chip
                      size="small"
                      rounded="pill"
                      variant="tonal"
                      color="primary"
                    >
                      <v-icon start size="16">mdi-image-multiple-outline</v-icon>
                      {{ venue.all_images?.length || 0 }} images
                    </v-chip>
                  </div>

                  <div class="d-flex align-center main-gallery-row">
                    <v-btn
                      icon
                      variant="text"
                      class="gallery-nav-btn"
                      @click="previousImage"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>

                    <v-sheet
                      height="360"
                      class="flex-grow-1 rounded-xl overflow-hidden gallery-stage"
                    >
                      <v-img
                        :src="currentImage"
                        height="360"
                        cover
                        class="gallery-main-image"
                      >
                        <div class="gallery-overlay">
                          <div class="gallery-overlay-badge">
                            <v-icon size="16" class="me-1">mdi-image-filter-hdr</v-icon>
                            Preview {{ currentImageIndex + 1 }} / {{ venue.all_images?.length || 1 }}
                          </div>
                        </div>

                        <template #placeholder>
                          <div class="d-flex align-center justify-center fill-height gallery-placeholder">
                            <v-icon size="60" class="text-medium-emphasis">
                              mdi-image-outline
                            </v-icon>
                          </div>
                        </template>
                      </v-img>
                    </v-sheet>

                    <v-btn
                      icon
                      variant="text"
                      class="gallery-nav-btn"
                      @click="nextImage"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>

                  <div class="mt-4 d-flex align-center thumbnail-toolbar">
                    <v-btn
                      icon
                      variant="text"
                      class="gallery-nav-btn gallery-nav-btn--small"
                      @click="previousImage"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>

                    <div class="flex-grow-1 d-flex thumbnail-row">
                      <v-card
                        v-for="(img, index) in venue.all_images"
                        :key="index"
                        variant="outlined"
                        rounded="lg"
                        height="78"
                        class="flex-grow-1 thumbnail-card"
                        @click="currentImageIndex = index"
                        :class="{
                          'thumbnail-card--active': currentImageIndex === index
                        }"
                        style="cursor: pointer;"
                      >
                        <v-img :src="img" height="78" cover />
                        <div
                          v-if="currentImageIndex === index"
                          class="thumbnail-active-indicator"
                        >
                          <v-icon size="16">mdi-check-circle</v-icon>
                        </div>
                      </v-card>
                    </div>

                    <v-btn
                      icon
                      variant="text"
                      class="gallery-nav-btn gallery-nav-btn--small"
                      @click="nextImage"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                </v-card>

                <v-card variant="outlined" rounded="xl" class="pa-5 pa-md-6 mt-6 info-card surface-card">
                  <div class="section-headline mb-5">
                    <div>
                      <div class="section-kicker mb-1">Overview</div>
                      <div class="text-subtitle-1 font-weight-bold">Venue information</div>
                    </div>

                    <v-chip size="small" rounded="pill" variant="tonal" color="primary">
                      <v-icon start size="16">mdi-information-outline</v-icon>
                      Verified details
                    </v-chip>
                  </div>

                  <div class="info-grid">
                    <div class="info-row">
                      <div class="detail-label text-body-2 font-weight-medium">Category</div>
                      <div class="text-body-2 info-value">{{ venue.category }}</div>
                    </div>

                    <div class="info-row">
                      <div class="detail-label text-body-2 font-weight-medium">Type</div>
                      <div class="text-body-2 info-value">{{ venue.type }}</div>
                    </div>

                    <div class="info-row">
                      <div class="detail-label text-body-2 font-weight-medium">Address</div>
                      <div class="text-body-2 info-value">
                        {{ venue.exact_address || venue.contact_info?.address || "-" }}
                      </div>
                    </div>

                    <div class="info-row">
                      <div class="detail-label text-body-2 font-weight-medium">Capacity</div>
                      <div class="text-body-2 info-value">{{ formattedCapacity }}</div>
                    </div>

                    <div class="info-row">
                      <div class="detail-label text-body-2 font-weight-medium">Price per hour</div>
                      <div class="text-body-2 info-value">{{ venue.price_per_hour }} TND</div>
                    </div>

                    <div class="info-row">
                      <div class="detail-label text-body-2 font-weight-medium">Price per day</div>
                      <div class="text-body-2 info-value">{{ venue.price_per_day }} TND</div>
                    </div>

                    <div class="info-row align-center-row">
                      <div class="detail-label text-body-2 font-weight-medium">Availability</div>
                      <div class="info-value">
                        <v-chip
                          size="small"
                          :color="venue.availability ? 'success' : 'error'"
                          variant="flat"
                          rounded="pill"
                        >
                          <v-icon start size="16">
                            {{ venue.availability ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}
                          </v-icon>
                          {{ venue.availability ? "Available" : "Unavailable" }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="info-row align-center-row">
                      <div class="detail-label text-body-2 font-weight-medium">Status</div>
                      <div class="info-value">
                        <v-chip
                          size="small"
                          :color="venue.status === 'Active' ? 'primary' : 'grey'"
                          variant="outlined"
                          rounded="pill"
                        >
                          <v-icon start size="16">mdi-shield-check-outline</v-icon>
                          {{ venue.status }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="info-row align-start-row">
                      <div class="detail-label text-body-2 font-weight-medium">Reviews</div>
                      <div class="d-flex align-center flex-wrap ga-2 info-value">
                        <v-rating
                          :model-value="venue.review_rating"
                          length="5"
                          half-increments
                          density="compact"
                          readonly
                        />
                        <span class="text-caption text-medium-emphasis">
                          {{ venue.review_rating }}/5
                        </span>
                      </div>
                    </div>

                    <div class="info-row" v-if="venue.contact_info?.phone">
                      <div class="detail-label text-body-2 font-weight-medium">Phone</div>
                      <div class="text-body-2 info-value">{{ venue.contact_info.phone }}</div>
                    </div>

                    <div class="info-row" v-if="venue.contact_info?.email">
                      <div class="detail-label text-body-2 font-weight-medium">Email</div>
                      <div class="text-body-2 info-value">{{ venue.contact_info.email }}</div>
                    </div>

                    <div class="info-row" v-if="venue.contact_info?.website">
                      <div class="detail-label text-body-2 font-weight-medium">Website</div>
                      <div class="info-value">
                        <a
                          :href="venue.contact_info.website"
                          target="_blank"
                          class="text-body-2 text-decoration-none info-link"
                        >
                          Visit website
                          <v-icon size="15" class="ms-1">mdi-open-in-new</v-icon>
                        </a>
                      </div>
                    </div>
                  </div>

                  <v-alert
                    v-if="isOwnerViewing && hasPrivateBankInfo"
                    type="info"
                    variant="tonal"
                    rounded="xl"
                    class="mt-5 mb-5 private-info-alert"
                  >
                    <div class="d-flex align-center mb-3">
                      <v-icon class="me-2">mdi-bank-outline</v-icon>
                      <div class="font-weight-bold">Private payout info</div>
                    </div>

                    <div class="private-payout-grid">
                      <div class="text-body-2 mb-1">
                        <strong>Account holder:</strong>
                        {{ venue.bank_account_info?.account_holder_name || '-' }}
                      </div>
                      <div class="text-body-2 mb-1">
                        <strong>Bank:</strong>
                        {{ venue.bank_account_info?.bank_name || '-' }}
                      </div>
                      <div class="text-body-2 mb-1">
                        <strong>Account number:</strong>
                        {{ maskedOwnerAccountNumber }}
                      </div>
                      <div class="text-body-2" v-if="venue.bank_account_info?.rib">
                        <strong>RIB:</strong>
                        {{ venue.bank_account_info.rib }}
                      </div>
                      <div class="text-body-2" v-if="venue.bank_account_info?.iban">
                        <strong>IBAN:</strong>
                        {{ venue.bank_account_info.iban }}
                      </div>
                      <div class="text-body-2" v-if="venue.bank_account_info?.swift">
                        <strong>SWIFT / BIC:</strong>
                        {{ venue.bank_account_info.swift }}
                      </div>
                    </div>
                  </v-alert>

                  <div class="mt-6">
                    <div class="section-headline mb-4">
                      <div>
                        <div class="section-kicker mb-1">Schedule</div>
                        <div class="text-subtitle-2 font-weight-bold">
                          Upcoming events in this venue
                        </div>
                      </div>

                      <v-chip size="small" rounded="pill" variant="tonal" color="secondary">
                        <v-icon start size="16">mdi-calendar-month-outline</v-icon>
                        {{ upcomingEvents.length }} upcoming
                      </v-chip>
                    </div>

                    <div v-if="upcomingEvents.length" class="d-flex flex-column upcoming-list">
                      <v-card
                        v-for="evt in upcomingEvents"
                        :key="evt.id"
                        variant="outlined"
                        rounded="xl"
                        class="pa-3 pa-md-4 upcoming-event-card"
                        @click="goToEvent(evt.id)"
                        @contextmenu.prevent="openNavigationMenu($event, getEventNavigationUrl(evt.id), 'event')"
                        @touchstart.passive="startLongPress($event, getEventNavigationUrl(evt.id), 'event')"
                        @touchend="cancelLongPress"
                        @touchmove="cancelLongPress"
                        @touchcancel="cancelLongPress"
                        style="cursor: pointer;"
                      >
                        <div class="upcoming-event-accent"></div>

                        <div class="d-flex justify-space-between align-start upcoming-event-content" style="gap: 16px;">
                          <div class="min-width-0">
                            <div class="text-subtitle-2 font-weight-bold mb-1 upcoming-event-title">
                              {{ evt.title }}
                            </div>

                            <div class="text-body-2 text-medium-emphasis">
                              <v-icon size="16" class="me-1">mdi-calendar-clock</v-icon>
                              {{ evt.date }} • {{ evt.time }} - {{ evt.end_time }}
                            </div>

                            <div class="text-body-2 mt-2 d-flex align-center flex-wrap ga-2">
                              <v-chip size="x-small" variant="tonal" rounded="pill" color="primary">
                                {{ evt.type }}
                              </v-chip>
                              <v-chip size="x-small" variant="tonal" rounded="pill" color="secondary">
                                <v-icon start size="14">mdi-map-marker</v-icon>
                                {{ evt.city }}
                              </v-chip>
                            </div>
                          </div>

                          <div class="d-flex flex-column align-end upcoming-right-side" style="gap: 8px;">
                            <v-chip
                              v-if="evt.seats_left === 0"
                              color="error"
                              size="small"
                              variant="flat"
                              rounded="pill"
                            >
                              <v-icon start size="16">mdi-alert-circle-outline</v-icon>
                              Sold out
                            </v-chip>

                            <v-chip
                              v-else-if="evt.last_call"
                              color="warning"
                              size="small"
                              variant="flat"
                              rounded="pill"
                            >
                              <v-icon start size="16">mdi-timer-sand</v-icon>
                              Last call
                            </v-chip>

                            <v-chip
                              v-else
                              color="success"
                              size="small"
                              variant="flat"
                              rounded="pill"
                            >
                              <v-icon start size="16">mdi-check-circle-outline</v-icon>
                              Available
                            </v-chip>

                            <v-btn
                              variant="text"
                              size="small"
                              class="px-0 text-decoration-underline event-view-btn"
                              @click.stop="goToEvent(evt.id)"
                              @contextmenu.prevent.stop="openNavigationMenu($event, getEventNavigationUrl(evt.id), 'event')"
                              @touchstart.passive.stop="startLongPress($event, getEventNavigationUrl(evt.id), 'event')"
                              @touchend.stop="cancelLongPress"
                              @touchmove.stop="cancelLongPress"
                              @touchcancel.stop="cancelLongPress"
                            >
                              <v-icon start size="16">mdi-open-in-new</v-icon>
                              View event
                            </v-btn>
                          </div>
                        </div>
                      </v-card>
                    </div>

                    <v-sheet
                      v-else
                      rounded="xl"
                      class="empty-upcoming-state"
                    >
                      <v-icon size="28" class="mb-2 text-medium-emphasis">mdi-calendar-remove-outline</v-icon>
                      <div class="text-body-2 text-medium-emphasis">
                        No upcoming events scheduled for this venue yet.
                      </div>
                    </v-sheet>
                  </div>
                </v-card>
              </div>

              <!-- RIGHT -->
              <div class="venue-right">
                <v-card variant="outlined" rounded="xl" class="pa-5 pa-md-6 sticky-side-card surface-card side-card-elevated">
                  <div class="section-kicker mb-1">Summary</div>
                  <div class="text-subtitle-1 font-weight-bold mb-2">Description</div>
                  <v-divider class="mb-4" />

                  <div class="text-body-2 text-medium-emphasis mb-6 description-text">
                    {{ venue.description }}
                  </div>

                  <v-card rounded="xl" variant="tonal" class="pa-4 side-highlight-card mb-5">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="me-2">mdi-lightning-bolt-outline</v-icon>
                      <div class="font-weight-bold">Quick booking</div>
                    </div>

                    <div class="text-body-2 text-medium-emphasis">
                      Reserve this venue directly and continue on the reservation page with this venue already selected.
                    </div>
                  </v-card>

                  <v-btn
                    color="primary"
                    size="large"
                    block
                    rounded="xl"
                    class="mb-3 book-btn"
                    :disabled="!venue || !venue.id || !venue.availability"
                    @click="bookVenue"
                    @contextmenu.prevent="openNavigationMenu($event, getReservationNavigationUrl(), 'reservation')"
                    @touchstart.passive="startLongPress($event, getReservationNavigationUrl(), 'reservation')"
                    @touchend="cancelLongPress"
                    @touchmove="cancelLongPress"
                    @touchcancel="cancelLongPress"
                  >
                    <v-icon start>mdi-calendar-check-outline</v-icon>
                    Book venue now
                  </v-btn>

                  <div class="text-caption text-medium-emphasis booking-note">
                    You will be taken to the reservation page for this specific venue.
                  </div>

                  <div class="right-click-tip mt-4">
                    <v-icon size="15" class="me-1">mdi-mouse-right-click-outline</v-icon>
                    {{ isMobile ? "Long-press navigation buttons or cards to open quick link actions." : "Right-click navigation buttons or cards to open in a new tab or window." }}
                  </div>
                </v-card>
              </div>
            </div>
          </div>

          <div v-else>
            <v-sheet
              class="d-flex flex-column align-center justify-center text-center not-found-sheet"
              height="260"
              rounded="xl"
            >
              <v-icon size="42" class="mb-3 text-medium-emphasis">mdi-map-marker-off-outline</v-icon>
              <div class="text-subtitle-1 font-weight-bold mb-1">Venue not found</div>
              <div class="text-body-2 text-medium-emphasis">
                The requested venue could not be loaded.
              </div>
            </v-sheet>
          </div>
        </v-container>

        <v-menu
          v-model="navigationMenu.open"
          :location="'top start'"
          :close-on-content-click="true"
          content-class="navigation-context-menu"
          :class="`theme-${currentTheme}`"
        >
          <template #activator="{ props }">
            <div
              v-bind="props"
              class="context-menu-anchor"
              :style="navigationAnchorStyle"
            ></div>
          </template>

          <v-card rounded="xl" min-width="240" class="pa-2 context-menu-card" :class="`theme-${currentTheme}`">
            <v-list density="comfortable" nav>
              <v-list-subheader class="text-caption">
                Navigation options
              </v-list-subheader>

              <v-list-item
                prepend-icon="mdi-open-in-new"
                title="Open in new tab"
                @click="openInNewTab"
              />

              <v-list-item
                prepend-icon="mdi-monitor-shimmer"
                title="Open in new window"
                @click="openInNewWindow"
              />

              <v-list-item
                prepend-icon="mdi-content-copy"
                title="Copy link"
                @click="copyNavigationLink"
              />
            </v-list>
          </v-card>
        </v-menu>

        <v-snackbar
          v-model="linkCopiedSnackbar"
          timeout="2200"
          rounded="pill"
          location="bottom right"
          :class="`theme-${currentTheme}`"
        >
          Link copied successfully
        </v-snackbar>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_Venue_By_Id, maskBankAccountNumber } from "@/dataModel/venue"
import { get_All_Events } from "@/dataModel/event"
import { get_Current_User } from "@/dataModel/user"

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const display = useDisplay()
const currentUser = ref(get_Current_User())
const linkCopiedSnackbar = ref(false)

const THEME_STORAGE_KEY = "blassti-theme"
const LONG_PRESS_DURATION = 520

const navigationMenu = ref({
  open: false,
  x: 0,
  y: 0,
  url: "",
  type: ""
})

let longPressTimer = null

const venue = computed(() => {
  const venueId = String(route.query.id ?? "")
  if (!venueId) return null
  return get_Venue_By_Id(venueId)
})

const currentImageIndex = ref(0)

const isMobile = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)

const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})

watch(
  () => route.query.id,
  () => {
    currentImageIndex.value = 0
  }
)

const currentImage = computed(() => {
  if (!venue.value || !venue.value.all_images?.length) return ""
  return venue.value.all_images[currentImageIndex.value] || venue.value.all_images[0] || ""
})

const formattedCapacity = computed(() => {
  if (!venue.value?.capacity && venue.value?.capacity !== 0) return "-"
  return Number(venue.value.capacity).toLocaleString()
})

const isOwnerViewing = computed(() => {
  return Boolean(currentUser.value?.id && venue.value?.owner_user_id === currentUser.value.id)
})

const hasPrivateBankInfo = computed(() => {
  return Boolean(
    venue.value?.bank_account_info?.account_holder_name ||
    venue.value?.bank_account_info?.bank_name ||
    venue.value?.bank_account_info?.account_number ||
    venue.value?.bank_account_info?.rib ||
    venue.value?.bank_account_info?.iban ||
    venue.value?.bank_account_info?.swift
  )
})

const maskedOwnerAccountNumber = computed(() => {
  return maskBankAccountNumber(venue.value?.bank_account_info?.account_number)
})

const upcomingEvents = computed(() => {
  if (!venue.value) return []

  return get_All_Events()
    .filter(evt => evt.venue === venue.value.title)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA - dateB
    })
})

const browserThemeClass = computed(() => {
  return currentTheme.value === "dark" ? "browser-theme-dark" : "browser-theme-light"
})

const navigationAnchorStyle = computed(() => {
  return {
    position: "fixed",
    left: `${navigationMenu.value.x}px`,
    top: `${navigationMenu.value.y}px`,
    width: "1px",
    height: "1px",
    pointerEvents: "none",
    opacity: "0"
  }
})

function previousImage() {
  if (!venue.value || !venue.value.all_images?.length) return
  currentImageIndex.value =
    (currentImageIndex.value - 1 + venue.value.all_images.length) %
    venue.value.all_images.length
}

function nextImage() {
  if (!venue.value || !venue.value.all_images?.length) return
  currentImageIndex.value =
    (currentImageIndex.value + 1) % venue.value.all_images.length
}

function getEventNavigationUrl(eventId) {
  return `/o_eventinfo?id=${encodeURIComponent(eventId)}`
}

function getReservationNavigationUrl() {
  if (!venue.value?.id) return ""
  return `/reservations?id=${encodeURIComponent(venue.value.id)}`
}

function goToEvent(eventId) {
  router.push({
    path: "/o_eventinfo",
    query: { id: eventId }
  })
}

function bookVenue() {
  if (!venue.value?.id) return
  window.location.href = `/reservations?id=${encodeURIComponent(venue.value.id)}`
}

function openNavigationMenu(event, url, type = "") {
  if (!url) return

  navigationMenu.value = {
    open: false,
    x: event.clientX,
    y: event.clientY,
    url,
    type
  }

  requestAnimationFrame(() => {
    navigationMenu.value.open = true
  })
}

function openInNewTab() {
  if (!navigationMenu.value.url) return
  window.open(navigationMenu.value.url, "_blank", "noopener,noreferrer")
  navigationMenu.value.open = false
}

function openInNewWindow() {
  if (!navigationMenu.value.url) return
  window.open(
    navigationMenu.value.url,
    "_blank",
    "noopener,noreferrer,width=1280,height=900,resizable=yes,scrollbars=yes"
  )
  navigationMenu.value.open = false
}

async function copyNavigationLink() {
  if (!navigationMenu.value.url) return

  const absoluteUrl = new URL(navigationMenu.value.url, window.location.origin).href

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(absoluteUrl)
    } else {
      const textarea = document.createElement("textarea")
      textarea.value = absoluteUrl
      textarea.setAttribute("readonly", "")
      textarea.style.position = "absolute"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    linkCopiedSnackbar.value = true
  } catch (error) {
    console.error("Failed to copy link:", error)
  }

  navigationMenu.value.open = false
}

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
  }
}

function loadSavedTheme() {
  if (typeof window === "undefined") return
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === "light" || savedTheme === "dark") {
      applyThemeChoice(savedTheme)
    }
  }
}

function openNavigationMenuFromTarget(targetElement, url, type = "") {
  if (!targetElement || !url) return

  const rect = targetElement.getBoundingClientRect()

  openNavigationMenu(
    {
      clientX: rect.left + Math.min(rect.width / 2, 40),
      clientY: rect.top + Math.min(rect.height / 2, 40)
    },
    url,
    type
  )
}

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function startLongPress(event, url, type = "") {
  if (!isMobile.value || !url) return

  clearLongPressTimer()

  const targetElement = event.currentTarget
  longPressTimer = window.setTimeout(() => {
    openNavigationMenuFromTarget(targetElement, url, type)
    longPressTimer = null
  }, LONG_PRESS_DURATION)
}

function cancelLongPress() {
  clearLongPressTimer()
}

onMounted(() => {
  loadSavedTheme()
  window.addEventListener("storage", handleWindowStorage)
})

onBeforeUnmount(() => {
  clearLongPressTimer()
  window.removeEventListener("storage", handleWindowStorage)
})
</script>

<style scoped>
.venue-page-shell {
  min-height: 100%;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.browser-theme-light {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(var(--v-theme-secondary), 0.06), transparent 24%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.015), rgba(0, 0, 0, 0));
}

.browser-theme-dark {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.14), transparent 28%),
    radial-gradient(circle at top right, rgba(var(--v-theme-secondary), 0.1), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0));
}

.page-top-meta {
  animation: fadeSlideDown 0.45s ease;
}

.venue-page-container {
  position: relative;
}

.hero-layout {
  gap: 20px;
}

.mobile-booking-card {
  border-color: rgba(var(--v-theme-primary), 0.14);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-secondary), 0.03)),
    rgba(var(--v-theme-surface), 0.95);
}

.mobile-booking-btn {
  min-height: 46px;
  font-weight: 800;
  min-width: 150px;
}


.breadcrumb-line {
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.02em;
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 24px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-secondary), 0.03)),
    rgba(var(--v-theme-surface), 0.94);
  backdrop-filter: blur(8px);
  animation: fadeSlideUp 0.5s ease;
}

.hero-card__glow {
  position: absolute;
  inset: auto -60px -80px auto;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.18), transparent 70%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.hero-title {
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
}

.hero-chip-wrap {
  align-items: center;
}

.hero-side-stats {
  width: 100%;
  max-width: 380px;
  position: relative;
  z-index: 1;
}

.hero-stat-card {
  border-color: rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface), 0.74);
  backdrop-filter: blur(8px);
}

.hero-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hero-stat-box {
  padding: 16px;
}

.hero-stat-box:nth-child(1),
.hero-stat-box:nth-child(2) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.hero-stat-box:nth-child(1),
.hero-stat-box:nth-child(3) {
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

.hero-stat-label {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 6px;
  font-weight: 700;
}

.hero-stat-value {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
}

.venue-layout {
  gap: 24px;
  flex-wrap: nowrap;
  align-items: flex-start;
}

.venue-left {
  flex: 0 0 68%;
  min-width: 0;
  animation: fadeSlideUp 0.6s ease;
}

.venue-right {
  flex: 0 0 32%;
  min-width: 0;
  animation: fadeSlideUp 0.7s ease;
}

.surface-card {
  border-color: rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface), 0.96);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.02);
}

.venue-layout--tablet {
  gap: 20px;
}

.venue-layout--mobile {
  gap: 18px;
}

.hero-stat-card,
.info-card,
.media-card,
.sticky-side-card,
.mobile-booking-card {
  border-width: 1px;
}

.gallery-stage {
  border-radius: 22px;
}

.gallery-stage :deep(.v-responsive__content) {
  height: 100%;
}

.thumbnail-row {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
}

.thumbnail-row::-webkit-scrollbar,
.upcoming-list::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-row::-webkit-scrollbar-thumb,
.upcoming-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 999px;
}

.thumbnail-card {
  min-width: 88px;
  flex: 0 0 88px !important;
  scroll-snap-align: start;
}

.upcoming-event-card {
  scroll-snap-align: start;
}

.side-highlight-card {
  border-radius: 22px;
}


.section-headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-kicker {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.media-card {
  position: relative;
  overflow: hidden;
}

.main-gallery-row {
  gap: 12px;
}

.gallery-stage {
  position: relative;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface-variant), 0.25);
}

.gallery-main-image {
  transition: transform 0.28s ease;
}

.gallery-main-image:hover {
  transform: scale(1.01);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.28) 100%);
}

.gallery-overlay-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
}

.gallery-placeholder {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.06), rgba(var(--v-theme-secondary), 0.03));
}

.gallery-nav-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(var(--v-theme-surface), 0.88);
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.gallery-nav-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.gallery-nav-btn--small {
  width: 38px;
  height: 38px;
}

.thumbnail-toolbar {
  gap: 8px;
}

.thumbnail-row {
  gap: 12px;
}

.thumbnail-card {
  position: relative;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.thumbnail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}

.thumbnail-card--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.25);
}

.thumbnail-active-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-primary));
  color: white;
  box-shadow: 0 8px 18px rgba(var(--v-theme-primary), 0.28);
}

.info-card {
  position: relative;
  overflow: hidden;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.18);
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.align-center-row {
  align-items: center;
}

.align-start-row {
  align-items: flex-start;
}

.detail-label {
  width: 170px;
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.info-value {
  min-width: 0;
  flex: 1;
}

.info-link {
  display: inline-flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.info-link:hover {
  text-decoration: underline !important;
}

.private-info-alert {
  border: 1px solid rgba(var(--v-theme-info), 0.14);
}

.private-payout-grid {
  display: grid;
  gap: 6px;
}

.upcoming-list {
  gap: 14px;
}

.upcoming-event-card {
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.upcoming-event-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 26px rgba(0, 0, 0, 0.06),
    0 6px 14px rgba(0, 0, 0, 0.04);
  border-color: rgba(var(--v-theme-primary), 0.22);
}

.upcoming-event-accent {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-secondary), 0.9));
}

.upcoming-event-content {
  padding-left: 6px;
}

.upcoming-event-title {
  line-height: 1.3;
}

.upcoming-right-side {
  flex-shrink: 0;
}

.event-view-btn {
  font-weight: 700;
}

.empty-upcoming-state {
  border: 1px dashed rgba(var(--v-border-color), 0.18);
  padding: 28px 20px;
  text-align: center;
  background: rgba(var(--v-theme-surface-variant), 0.14);
}

.description-text {
  line-height: 1.85;
  white-space: pre-line;
}

.sticky-side-card {
  position: sticky;
  top: 96px;
}

.side-card-elevated {
  overflow: hidden;
}

.side-highlight-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-secondary), 0.05));
}

.book-btn {
  min-height: 52px;
  font-weight: 800;
  letter-spacing: 0.01em;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.book-btn:hover:not(.v-btn--disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(var(--v-theme-primary), 0.22);
}

.booking-note {
  line-height: 1.6;
}

.right-click-tip {
  display: inline-flex;
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.78rem;
  line-height: 1.5;
}

.not-found-sheet {
  border: 1px dashed rgba(var(--v-border-color), 0.22);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.02));
}

.context-menu-anchor {
  position: fixed;
  z-index: 9999;
}

.context-menu-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface), 0.96);
  backdrop-filter: blur(10px);
}

.theme-light :deep(.v-overlay__content .context-menu-card),
.theme-dark :deep(.v-overlay__content .context-menu-card) {
  transition:
    background-color 0.22s ease,
    color 0.22s ease,
    border-color 0.22s ease;
}

.min-width-0 {
  min-width: 0;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


@media (max-width: 1260px) {
  .hero-side-stats {
    max-width: 330px;
  }

  .venue-left {
    flex-basis: 64%;
  }

  .venue-right {
    flex-basis: 36%;
  }
}

@media (max-width: 1100px) {
  .hero-card {
    padding: 22px;
  }

  .hero-side-stats {
    max-width: 100%;
  }

  .detail-label {
    width: 150px;
  }
}

@media (max-width: 960px) {
  .venue-layout {
    flex-wrap: wrap;
  }

  .venue-left,
  .venue-right {
    flex: 0 0 100%;
  }

  .venue-right {
    order: -1;
  }

  .sticky-side-card {
    position: static;
    top: auto;
  }

  .hero-layout {
    gap: 18px;
  }

  .hero-side-stats {
    max-width: 100%;
  }

  .detail-label {
    width: 135px;
  }

  .info-grid {
    gap: 12px;
  }

  .main-gallery-row {
    gap: 0;
    position: relative;
  }

  .main-gallery-row > .gallery-nav-btn {
    position: absolute;
    z-index: 3;
    top: 50%;
    transform: translateY(-50%);
    backdrop-filter: blur(8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
  }

  .main-gallery-row > .gallery-nav-btn:first-child {
    left: 12px;
  }

  .main-gallery-row > .gallery-nav-btn:last-child {
    right: 12px;
  }

  .gallery-stage,
  .gallery-main-image :deep(img) {
    border-radius: 18px;
  }

  .thumbnail-card {
    min-width: 100px;
    flex-basis: 100px !important;
  }
}

@media (max-width: 700px) {
  .venue-page-container {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  .page-top-meta {
    margin-bottom: 10px !important;
  }

  .hero-card {
    padding: 18px;
    border-radius: 24px !important;
  }

  .hero-title {
    font-size: 1.7rem !important;
  }

  .hero-subtitle {
    margin-bottom: 14px !important;
  }

  .hero-chip-wrap {
    gap: 8px !important;
  }

  .hero-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-stat-box:nth-child(1),
  .hero-stat-box:nth-child(2) {
    border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .hero-stat-box:nth-child(1),
  .hero-stat-box:nth-child(3) {
    border-right: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .media-card,
  .info-card,
  .sticky-side-card,
  .mobile-booking-card {
    border-radius: 24px !important;
  }

  .section-headline {
    gap: 12px;
  }

  .main-gallery-row > .gallery-nav-btn {
    width: 38px;
    height: 38px;
  }

  .main-gallery-row > .gallery-nav-btn:first-child {
    left: 10px;
  }

  .main-gallery-row > .gallery-nav-btn:last-child {
    right: 10px;
  }

  .gallery-stage,
  .gallery-main-image {
    height: 280px !important;
  }

  .gallery-overlay {
    padding: 12px;
  }

  .gallery-overlay-badge {
    font-size: 0.74rem;
    max-width: calc(100% - 12px);
  }

  .thumbnail-toolbar {
    gap: 10px;
    align-items: stretch !important;
  }

  .thumbnail-row {
    gap: 10px;
  }

  .thumbnail-card {
    min-width: 86px;
    flex-basis: 86px !important;
    height: 72px !important;
  }

  .thumbnail-card :deep(.v-responsive),
  .thumbnail-card :deep(.v-img) {
    height: 72px !important;
  }

  .info-row {
    flex-direction: column;
    gap: 6px;
    padding: 12px;
  }

  .detail-label {
    width: 100%;
  }

  .upcoming-list {
    display: grid !important;
    grid-auto-flow: column;
    grid-auto-columns: minmax(280px, 84vw);
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 6px;
    scroll-snap-type: x proximity;
  }

  .upcoming-event-card {
    min-height: 100%;
  }

  .upcoming-event-content {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .upcoming-right-side {
    width: 100%;
    align-items: flex-start !important;
  }

  .event-view-btn {
    padding-inline: 0 !important;
  }

  .mobile-booking-card {
    position: relative;
    overflow: hidden;
  }

  .mobile-booking-card::after {
    content: "";
    position: absolute;
    inset: auto -40px -50px auto;
    width: 140px;
    height: 140px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.14), transparent 68%);
    pointer-events: none;
  }
}

@media (max-width: 520px) {
  .hero-card {
    padding: 16px;
  }

  .hero-title {
    font-size: 1.5rem !important;
  }

  .hero-stat-grid {
    grid-template-columns: 1fr;
  }

  .hero-stat-box:nth-child(1),
  .hero-stat-box:nth-child(2),
  .hero-stat-box:nth-child(3),
  .hero-stat-box:nth-child(4) {
    border-right: 0;
  }

  .hero-stat-box:not(:last-child) {
    border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .gallery-stage,
  .gallery-main-image {
    height: 240px !important;
  }

  .thumbnail-toolbar > .gallery-nav-btn {
    display: none !important;
  }

  .thumbnail-row {
    width: 100%;
  }

  .thumbnail-card {
    min-width: 82px;
    flex-basis: 82px !important;
  }

  .upcoming-list {
    grid-auto-columns: minmax(260px, 88vw);
  }

  .mobile-booking-btn {
    width: 100%;
  }
}

</style>
