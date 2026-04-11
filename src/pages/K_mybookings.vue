<template>
  <v-app :class="pageThemeClass">
    <AppNavbar />

    <v-main>
      <div
        class="my-bookings-page"
        :class="[pageThemeClass, `bookings-theme-${currentTheme}`]"
      >
        <v-container class="py-6 py-sm-7 py-md-10 bookings-container">
          <v-row class="mb-5 mb-md-8">
            <v-col cols="12">
              <v-card
                class="hero-card overflow-hidden"
                rounded="xl"
                elevation="0"
              >
                <div class="hero-glow hero-glow-1" />
                <div class="hero-glow hero-glow-2" />

                <v-card-text class="pa-4 pa-sm-5 pa-md-8 position-relative">
                  <div class="d-flex flex-column flex-lg-row justify-space-between align-start ga-5 ga-md-6 hero-layout">
                    <div class="hero-copy">
                      <div class="hero-badge mb-4">
                        <v-icon size="18" class="me-2">mdi-ticket-confirmation-outline</v-icon>
                        Booking workspace
                      </div>

                      <div class="text-h4 text-sm-h4 text-md-h3 font-weight-bold mb-2 hero-title">
                        My Bookings
                      </div>

                      <div class="text-body-1 text-medium-emphasis hero-subtitle">
                        Manage, review, and track your purchased tickets in one clean place.
                      </div>

                      <div class="d-flex flex-wrap ga-2 mt-5 hero-actions">
                        <v-btn
                          class="status-pill-btn"
                          :class="{ 'status-pill-btn--active': selectedStatus === 'Upcoming' }"
                          variant="outlined"
                          rounded="xl"
                          prepend-icon="mdi-calendar-clock-outline"
                          :size="isMobile ? 'default' : 'default'"
                          @click="selectedStatus = 'Upcoming'"
                        >
                          Upcoming
                        </v-btn>

                        <v-btn
                          class="status-pill-btn"
                          :class="{ 'status-pill-btn--active': selectedStatus === 'Past' }"
                          variant="outlined"
                          rounded="xl"
                          prepend-icon="mdi-history"
                          :size="isMobile ? 'default' : 'default'"
                          @click="selectedStatus = 'Past'"
                        >
                          Past
                        </v-btn>

                        <v-btn
                          class="status-pill-btn"
                          :class="{ 'status-pill-btn--active': selectedStatus === 'Cancelled' }"
                          variant="outlined"
                          rounded="xl"
                          prepend-icon="mdi-cancel"
                          :size="isMobile ? 'default' : 'default'"
                          @click="selectedStatus = 'Cancelled'"
                        >
                          Cancelled
                        </v-btn>

                        <v-btn
                          class="status-pill-btn"
                          :class="{ 'status-pill-btn--active': selectedStatus === 'All statuses' }"
                          variant="outlined"
                          rounded="xl"
                          prepend-icon="mdi-filter-variant-remove"
                          :size="isMobile ? 'default' : 'default'"
                          @click="selectedStatus = 'All statuses'"
                        >
                          All
                        </v-btn>
                      </div>
                    </div>

                    <div class="hero-stats d-flex flex-wrap ga-3 w-100 w-lg-auto">
                      <v-sheet
                        class="hero-mini-stat"
                        rounded="xl"
                        border
                      >
                        <div class="text-caption text-medium-emphasis mb-1">
                          Active filter
                        </div>
                        <div class="text-subtitle-1 font-weight-bold text-truncate">
                          {{ selectedStatus }}
                        </div>
                      </v-sheet>

                      <v-sheet
                        class="hero-mini-stat"
                        rounded="xl"
                        border
                      >
                        <div class="text-caption text-medium-emphasis mb-1">
                          Visible bookings
                        </div>
                        <div class="text-subtitle-1 font-weight-bold">
                          {{ filteredBookings.length }}
                        </div>
                      </v-sheet>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="ga-md-0 bookings-main-row">
            <!-- LEFT FILTERS COLUMN -->
            <v-col cols="12" md="4" lg="3">
              <v-card
                class="filters-card sticky-filters"
                variant="outlined"
                rounded="xl"
                elevation="0"
              >
                <v-card-text class="pa-4 pa-md-5">
                  <div class="d-flex align-center justify-space-between mb-4 filters-header">
                    <div class="d-flex align-center min-w-0">
                      <v-avatar size="34" class="filters-avatar me-3">
                        <v-icon size="18">mdi-tune-variant</v-icon>
                      </v-avatar>
                      <div class="min-w-0">
                        <div class="font-weight-bold text-subtitle-1 text-truncate">
                          Filters
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Narrow your bookings
                        </div>
                      </div>
                    </div>

                    <v-btn
                      variant="text"
                      size="small"
                      class="text-none"
                      @click="resetFilters"
                    >
                      Reset
                    </v-btn>
                  </div>

                  <div class="d-flex flex-wrap ga-2 mb-4 mobile-friendly-filter-pills">
                    <v-chip
                      class="filter-chip"
                      rounded="xl"
                      :variant="selectedStatus === 'All statuses' ? 'flat' : 'outlined'"
                      :color="selectedStatus === 'All statuses' ? 'primary' : undefined"
                      prepend-icon="mdi-filter-variant-remove"
                      @click="selectedStatus = 'All statuses'"
                    >
                      All
                    </v-chip>

                    <v-chip
                      class="filter-chip"
                      rounded="xl"
                      :variant="selectedStatus === 'Upcoming' ? 'flat' : 'outlined'"
                      :color="selectedStatus === 'Upcoming' ? 'primary' : undefined"
                      prepend-icon="mdi-calendar-clock-outline"
                      @click="selectedStatus = 'Upcoming'"
                    >
                      Upcoming
                    </v-chip>

                    <v-chip
                      class="filter-chip"
                      rounded="xl"
                      :variant="selectedStatus === 'Past' ? 'flat' : 'outlined'"
                      :color="selectedStatus === 'Past' ? 'primary' : undefined"
                      prepend-icon="mdi-history"
                      @click="selectedStatus = 'Past'"
                    >
                      Past
                    </v-chip>

                    <v-chip
                      class="filter-chip"
                      rounded="xl"
                      :variant="selectedStatus === 'Cancelled' ? 'flat' : 'outlined'"
                      :color="selectedStatus === 'Cancelled' ? 'error' : undefined"
                      prepend-icon="mdi-cancel"
                      @click="selectedStatus = 'Cancelled'"
                    >
                      Cancelled
                    </v-chip>
                  </div>

                  <v-select
                    v-model="selectedStatus"
                    label="Status"
                    :items="['All statuses', 'Upcoming', 'Past', 'Cancelled']"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    class="mb-4"
                    prepend-inner-icon="mdi-filter-outline"
                    hide-details="auto"
                  />

                  <v-text-field
                    v-model="chosenDate"
                    label="Choose Date"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    class="mb-4"
                    prepend-inner-icon="mdi-calendar-outline"
                    hide-details="auto"
                    placeholder="Search by event date"
                  />

                  <v-text-field
                    v-model="search"
                    label="Search booking..."
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-magnify"
                    hide-details="auto"
                    placeholder="Event, venue, city, or seat"
                  />

                  <v-divider class="my-5" />

                  <div class="quick-status-list">
                    <div class="text-caption text-medium-emphasis mb-3">
                      Quick overview
                    </div>

                    <v-sheet
                      class="quick-status-item mb-2"
                      rounded="lg"
                      border
                      role="button"
                      tabindex="0"
                      @click="selectedStatus = 'Upcoming'"
                      @keydown.enter="selectedStatus = 'Upcoming'"
                    >
                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon size="18" class="me-2 status-icon status-icon-upcoming">mdi-calendar-clock-outline</v-icon>
                          <span class="text-body-2">Upcoming</span>
                        </div>
                        <span class="font-weight-bold">{{ upcomingCount }}</span>
                      </div>
                    </v-sheet>

                    <v-sheet
                      class="quick-status-item mb-2"
                      rounded="lg"
                      border
                      role="button"
                      tabindex="0"
                      @click="selectedStatus = 'Past'"
                      @keydown.enter="selectedStatus = 'Past'"
                    >
                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon size="18" class="me-2 status-icon status-icon-past">mdi-history</v-icon>
                          <span class="text-body-2">Past</span>
                        </div>
                        <span class="font-weight-bold">{{ pastCount }}</span>
                      </div>
                    </v-sheet>

                    <v-sheet
                      class="quick-status-item"
                      rounded="lg"
                      border
                      role="button"
                      tabindex="0"
                      @click="selectedStatus = 'Cancelled'"
                      @keydown.enter="selectedStatus = 'Cancelled'"
                    >
                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon size="18" class="me-2 status-icon status-icon-cancelled">mdi-cancel</v-icon>
                          <span class="text-body-2">Cancelled</span>
                        </div>
                        <span class="font-weight-bold">{{ cancelledCount }}</span>
                      </div>
                    </v-sheet>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- RIGHT COLUMN -->
            <v-col cols="12" md="8" lg="9">
              <v-card
                class="content-card"
                variant="outlined"
                rounded="xl"
                elevation="0"
              >
                <v-card-text class="pa-4 pa-md-5 pa-lg-6">
                  <!-- Not logged in -->
                  <v-sheet
                    v-if="!currentUser"
                    class="mt-2 d-flex flex-column align-center justify-center text-center not-logged-sheet"
                    rounded="xl"
                    height="320"
                  >
                    <v-avatar size="68" class="mb-4 not-logged-avatar">
                      <v-icon size="34">mdi-account-lock-outline</v-icon>
                    </v-avatar>
                    <div class="text-h6 mb-2 font-weight-bold">You are not logged in</div>
                    <div class="text-body-2 text-medium-emphasis mb-5">
                      Log in to see and manage all of your bookings.
                    </div>
                    <v-btn
                      color="primary"
                      variant="flat"
                      rounded="xl"
                      size="large"
                      prepend-icon="mdi-login"
                      @click="goToLogin"
                    >
                      Go to Login
                    </v-btn>
                  </v-sheet>

                  <template v-else>
                    <!-- Summary boxes -->
                    <v-row class="mb-2">
                      <v-col cols="12" md="4">
                        <v-sheet
                          class="summary-card summary-card-upcoming"
                          rounded="xl"
                          border
                        >
                          <div class="d-flex justify-space-between align-center">
                            <div>
                              <div class="text-caption text-medium-emphasis mb-1">
                                Upcoming Events
                              </div>
                              <div class="text-h5 font-weight-bold">
                                {{ upcomingCount }}
                              </div>
                            </div>

                            <v-avatar size="46" class="summary-icon">
                              <v-icon size="24">mdi-calendar-clock-outline</v-icon>
                            </v-avatar>
                          </div>
                        </v-sheet>
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-sheet
                          class="summary-card summary-card-past"
                          rounded="xl"
                          border
                        >
                          <div class="d-flex justify-space-between align-center">
                            <div>
                              <div class="text-caption text-medium-emphasis mb-1">
                                Past Events
                              </div>
                              <div class="text-h5 font-weight-bold">
                                {{ pastCount }}
                              </div>
                            </div>

                            <v-avatar size="46" class="summary-icon">
                              <v-icon size="24">mdi-history</v-icon>
                            </v-avatar>
                          </div>
                        </v-sheet>
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-sheet
                          class="summary-card summary-card-cancelled"
                          rounded="xl"
                          border
                        >
                          <div class="d-flex justify-space-between align-center">
                            <div>
                              <div class="text-caption text-medium-emphasis mb-1">
                                Cancelled Events
                              </div>
                              <div class="text-h5 font-weight-bold">
                                {{ cancelledCount }}
                              </div>
                            </div>

                            <v-avatar size="46" class="summary-icon">
                              <v-icon size="24">mdi-cancel</v-icon>
                            </v-avatar>
                          </div>
                        </v-sheet>
                      </v-col>
                    </v-row>

                    <v-row class="mb-4">
                      <v-col cols="12">
                        <v-text-field
                          v-model="search"
                          label="Search tickets"
                          variant="outlined"
                          density="comfortable"
                          rounded="xl"
                          prepend-inner-icon="mdi-magnify"
                          hide-details="auto"
                          class="search-field"
                          placeholder="Search by event name, venue, city, or seat label"
                        />
                      </v-col>
                    </v-row>

                    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4 list-toolbar">
                      <div>
                        <div class="text-subtitle-1 font-weight-bold">
                          Booking list
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          {{ filteredBookings.length }} booking<span v-if="filteredBookings.length !== 1">s</span> found
                        </div>
                      </div>

                      <v-chip
                        color="primary"
                        variant="tonal"
                        rounded="xl"
                        prepend-icon="mdi-filter-check-outline"
                        class="current-filter-chip"
                      >
                        {{ selectedStatus }}
                      </v-chip>
                    </div>

                    <transition-group name="booking-list" tag="div">
                      <v-sheet
                        v-for="booking in filteredBookings"
                        :key="booking.id"
                        class="booking-card mb-4"
                        :class="`booking-card--${String(booking.status || '').toLowerCase()}`"
                        rounded="xl"
                        border
                      >
                        <div class="booking-card-inner d-flex flex-column flex-md-row align-start align-md-center">
                          <v-sheet
                            class="booking-image-shell d-flex align-center justify-center me-md-4 mb-4 mb-md-0"
                            rounded="lg"
                          >
                            <v-img
                              v-if="booking.event.image"
                              :src="booking.event.image"
                              cover
                              height="92"
                              width="112"
                              class="rounded-lg booking-image"
                            />
                            <v-icon v-else size="30">mdi-image-outline</v-icon>
                          </v-sheet>

                          <div class="flex-grow-1 w-100 booking-main-content">
                            <div class="d-flex flex-column flex-lg-row justify-space-between align-start ga-3 mb-2">
                              <div class="booking-headline">
                                <div class="text-subtitle-1 text-md-h6 font-weight-bold mb-1 booking-title">
                                  {{ booking.event.title }}
                                </div>

                                <div class="d-flex flex-wrap ga-2 booking-info-chips">
                                  <v-chip
                                    size="small"
                                    variant="tonal"
                                    rounded="xl"
                                    prepend-icon="mdi-calendar"
                                  >
                                    {{ booking.event.date }}
                                  </v-chip>

                                  <v-chip
                                    size="small"
                                    variant="tonal"
                                    rounded="xl"
                                    prepend-icon="mdi-clock-outline"
                                  >
                                    {{ booking.event.time }}
                                  </v-chip>

                                  <v-chip
                                    size="small"
                                    variant="tonal"
                                    rounded="xl"
                                    prepend-icon="mdi-map-marker-outline"
                                  >
                                    {{ booking.event.city }}
                                  </v-chip>
                                </div>
                              </div>

                              <v-chip
                                :color="getStatusColor(booking.status)"
                                variant="tonal"
                                rounded="xl"
                                class="status-chip"
                              >
                                {{ booking.status }}
                              </v-chip>
                            </div>

                            <v-row dense class="booking-meta-row">
                              <v-col cols="12" sm="6" lg="4">
                                <div class="booking-meta-item">
                                  <div class="booking-meta-label">Venue</div>
                                  <div class="booking-meta-value">
                                    {{ booking.event.venue }}, {{ booking.event.city }}
                                  </div>
                                </div>
                              </v-col>

                              <v-col cols="12" sm="6" lg="3">
                                <div class="booking-meta-item">
                                  <div class="booking-meta-label">Tickets</div>
                                  <div class="booking-meta-value">
                                    {{ booking.ticket_count }} Tickets
                                  </div>
                                </div>
                              </v-col>

                              <v-col cols="12" sm="6" lg="3">
                                <div class="booking-meta-item">
                                  <div class="booking-meta-label">Total paid</div>
                                  <div class="booking-meta-value">
                                    {{ formatPrice(booking.total_price) }}
                                  </div>
                                </div>
                              </v-col>

                              <v-col cols="12" sm="6" lg="2">
                                <div class="booking-meta-item">
                                  <div class="booking-meta-label">Booking</div>
                                  <div class="booking-meta-value">
                                    #{{ booking.id }}
                                  </div>
                                </div>
                              </v-col>
                            </v-row>

                            <div class="booking-seats mt-3">
                              <div class="booking-meta-label mb-1">Seats</div>
                              <div class="text-body-2 text-medium-emphasis">
                                {{ booking.selected_seats?.length ? booking.selected_seats.map(seat => seat.label).join(", ") : "Class-based tickets" }}
                              </div>
                            </div>
                          </div>

                          <div class="d-flex flex-column ga-2 ms-md-4 mt-4 mt-md-0 booking-actions">
                            <v-btn
                              variant="flat"
                              color="primary"
                              rounded="xl"
                              class="text-none"
                              style="min-width: 150px;"
                              prepend-icon="mdi-ticket-outline"
                              @click="openTicketDialog(booking)"
                            >
                              View Ticket
                            </v-btn>

                            <v-btn
                              v-if="booking.status !== 'Cancelled'"
                              variant="outlined"
                              rounded="xl"
                              class="text-none"
                              style="min-width: 150px;"
                              prepend-icon="mdi-cash-refund"
                              disabled
                            >
                              Request Refund
                            </v-btn>
                          </div>
                        </div>
                      </v-sheet>
                    </transition-group>

                    <v-sheet
                      v-if="filteredBookings.length === 0"
                      class="mt-4 d-flex flex-column align-center justify-center text-center empty-state-sheet"
                      rounded="xl"
                      height="300"
                    >
                      <v-avatar size="68" class="mb-4 empty-state-avatar">
                        <v-icon size="34">mdi-ticket-outline</v-icon>
                      </v-avatar>
                      <div class="text-h6 font-weight-bold mb-2">🎟️No bookings found</div>
                      <div class="text-body-2 text-medium-emphasis mb-4">
                        Time to plan something unforgettable ✨
                      </div>
                      <v-btn
                        color="primary"
                        variant="flat"
                        rounded="xl"
                        prepend-icon="mdi-compass"
                        class="px-6"
                        @click="$router.push({ name: '/N_Event_Browsing' })"
                      >
                        Browse events
                      </v-btn>
                    </v-sheet>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-dialog
          v-model="ticketDialog"
          :fullscreen="isMobile"
          :max-width="isMobile ? undefined : 760"
          transition="dialog-bottom-transition"
        >
          <v-card rounded="xl" class="ticket-dialog-card">
            <v-card-title class="d-flex align-center justify-space-between py-4 px-4 px-md-5 ticket-dialog-title">
              <div class="d-flex align-center min-w-0">
                <v-avatar size="38" class="dialog-title-avatar me-3">
                  <v-icon size="20">mdi-ticket-confirmation-outline</v-icon>
                </v-avatar>
                <div class="min-w-0">
                  <div class="text-h6 font-weight-bold text-truncate">Ticket details</div>
                  <div class="text-caption text-medium-emphasis">
                    Booking summary and seat information
                  </div>
                </div>
              </div>

              <v-btn icon variant="text" @click="ticketDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text v-if="selectedBooking" class="pa-4 pa-sm-5 pa-md-6">
              <v-row class="align-center">
                <v-col cols="12" md="5">
                  <v-img
                    :src="selectedBooking.event.image"
                    height="240"
                    cover
                    class="rounded-xl ticket-dialog-image"
                  />
                </v-col>

                <v-col cols="12" md="7">
                  <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
                    <div class="text-h6 font-weight-bold">
                      {{ selectedBooking.event.title }}
                    </div>

                    <v-chip
                      :color="getStatusColor(selectedBooking.status)"
                      variant="tonal"
                      rounded="xl"
                    >
                      {{ selectedBooking.status }}
                    </v-chip>
                  </div>

                  <div class="ticket-info-grid">
                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Date</div>
                      <div class="ticket-info-value">{{ selectedBooking.event.date }}</div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Time</div>
                      <div class="ticket-info-value">{{ selectedBooking.event.time }}</div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Venue</div>
                      <div class="ticket-info-value">{{ selectedBooking.event.venue }}</div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">City</div>
                      <div class="ticket-info-value">{{ selectedBooking.event.city }}</div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Tickets</div>
                      <div class="ticket-info-value">{{ selectedBooking.ticket_count }}</div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Total paid</div>
                      <div class="ticket-info-value">{{ formatPrice(selectedBooking.total_price) }}</div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Payment</div>
                      <div class="ticket-info-value">
                        {{ selectedBooking.payment_brand || selectedBooking.payment_method || "Card" }}
                        <span v-if="selectedBooking.card_last4">
                          •••• {{ selectedBooking.card_last4 }}
                        </span>
                      </div>
                    </div>

                    <div class="ticket-info-item">
                      <div class="ticket-info-label">Booked at</div>
                      <div class="ticket-info-value">{{ formatDateTime(selectedBooking.created_at) }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-5" />

              <div class="d-flex align-center mb-3">
                <v-avatar size="34" class="dialog-section-avatar me-3">
                  <v-icon size="18">mdi-seat-outline</v-icon>
                </v-avatar>
                <div class="text-subtitle-1 font-weight-bold">
                  Seats
                </div>
              </div>

              <div
                v-if="selectedBooking.selected_seats?.length"
                class="d-flex flex-wrap ga-2"
              >
                <v-chip
                  v-for="seat in selectedBooking.selected_seats"
                  :key="seat.key || seat.id"
                  variant="outlined"
                  color="primary"
                  rounded="xl"
                  class="seat-chip"
                >
                  {{ seat.label }} · {{ seat.seat_class }}
                </v-chip>
              </div>

              <div v-else class="text-body-2 text-medium-emphasis">
                No exact seat labels were stored for this ticket.
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import { get_All_Reservations } from "@/dataModel/reservation"
import { get_Event_By_Id } from "@/dataModel/event"
import { get_Current_User } from "@/dataModel/user"

const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"

const selectedStatus = ref("All statuses")
const chosenDate = ref("")
const search = ref("")
const ticketDialog = ref(false)
const selectedBooking = ref(null)

const currentUser = computed(() => get_Current_User())
const reservations = get_All_Reservations()

const isMobile = computed(() => display.smAndDown.value)

const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})

const pageThemeClass = computed(() =>
  currentTheme.value === "dark" ? "bookings-theme-dark" : "bookings-theme-light"
)

const currentUserReservations = computed(() => {
  if (!currentUser.value) return []

  return reservations.filter(reservation =>
    reservation.user_id === currentUser.value.id
  )
})

const bookingsWithEvent = computed(() => {
  return currentUserReservations.value
    .map(reservation => ({
      ...reservation,
      event: get_Event_By_Id(reservation.event_id)
    }))
    .filter(booking => booking.event)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const upcomingCount = computed(() =>
  bookingsWithEvent.value.filter(b => b.status === "Upcoming").length
)

const pastCount = computed(() =>
  bookingsWithEvent.value.filter(b => b.status === "Past").length
)

const cancelledCount = computed(() =>
  bookingsWithEvent.value.filter(b => b.status === "Cancelled").length
)

const filteredBookings = computed(() => {
  return bookingsWithEvent.value.filter((booking) => {
    const matchesStatus =
      selectedStatus.value === "All statuses" ||
      booking.status === selectedStatus.value

    const searchValue = search.value.toLowerCase()

    const matchesSearch =
      !searchValue ||
      booking.event.title.toLowerCase().includes(searchValue) ||
      booking.event.venue.toLowerCase().includes(searchValue) ||
      booking.event.city.toLowerCase().includes(searchValue) ||
      (booking.selected_seats || []).some(seat =>
        String(seat.label || "").toLowerCase().includes(searchValue)
      )

    const matchesDate =
      !chosenDate.value ||
      booking.event.date.toLowerCase().includes(chosenDate.value.toLowerCase())

    return matchesStatus && matchesSearch && matchesDate
  })
})

function applyThemeChoice(themeName) {
  if (typeof window === "undefined") return

  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)
  document.documentElement.setAttribute("data-app-theme", normalizedTheme)
  document.documentElement.style.colorScheme = normalizedTheme
}

function loadSavedTheme() {
  if (typeof window === "undefined") return

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === "light" || savedTheme === "dark") {
      theme.global.name.value = savedTheme
      document.documentElement.setAttribute("data-app-theme", savedTheme)
      document.documentElement.style.colorScheme = savedTheme
    }
  }
}

function resetFilters() {
  selectedStatus.value = "All statuses"
  chosenDate.value = ""
  search.value = ""
}

function goToLogin() {
  router.push("/O_login")
}

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2)} DT`
}

function formatDateTime(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function openTicketDialog(booking) {
  selectedBooking.value = booking
  ticketDialog.value = true
}

function getStatusColor(status) {
  if (status === "Upcoming") return "primary"
  if (status === "Past") return "grey"
  if (status === "Cancelled") return "error"
  return "primary"
}

onMounted(() => {
  if (typeof window === "undefined") return
  loadSavedTheme()
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", loadSavedTheme)
})

onBeforeUnmount(() => {
  if (typeof window === "undefined") return
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", loadSavedTheme)
})
</script>

<style scoped>
.my-bookings-page {
  min-height: 100%;
  transition: background 0.35s ease, color 0.35s ease;
}

.bookings-container {
  position: relative;
  z-index: 1;
}

.bookings-theme-light {
  background:
    radial-gradient(circle at top right, rgba(33, 150, 243, 0.08), transparent 22%),
    radial-gradient(circle at top left, rgba(76, 175, 80, 0.06), transparent 18%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
}

.bookings-theme-dark {
  background:
    radial-gradient(circle at top right, rgba(100, 181, 246, 0.12), transparent 20%),
    radial-gradient(circle at top left, rgba(144, 202, 249, 0.08), transparent 18%),
    linear-gradient(180deg, #0c111b 0%, #111827 100%);
}

.hero-card,
.filters-card,
.content-card,
.ticket-dialog-card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.bookings-theme-light .hero-card,
.bookings-theme-light .filters-card,
.bookings-theme-light .content-card,
.bookings-theme-light .ticket-dialog-card {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
}

.bookings-theme-dark .hero-card,
.bookings-theme-dark .filters-card,
.bookings-theme-dark .content-card,
.bookings-theme-dark .ticket-dialog-card {
  background: rgba(17, 24, 39, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.34);
}

.hero-card {
  position: relative;
  overflow: hidden;
}

.hero-layout,
.filters-header,
.list-toolbar,
.booking-card-inner,
.ticket-dialog-title {
  min-width: 0;
}

.hero-copy,
.booking-main-content,
.booking-headline {
  min-width: 0;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(30px);
  pointer-events: none;
}

.hero-glow-1 {
  top: -20px;
  right: -30px;
  width: 220px;
  height: 220px;
  background: rgba(33, 150, 243, 0.18);
}

.hero-glow-2 {
  bottom: -40px;
  left: -20px;
  width: 180px;
  height: 180px;
  background: rgba(76, 175, 80, 0.12);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.bookings-theme-light .hero-badge {
  background: rgba(33, 150, 243, 0.1);
  color: rgb(22, 101, 192);
}

.bookings-theme-dark .hero-badge {
  background: rgba(144, 202, 249, 0.12);
  color: rgb(191, 219, 254);
}

.hero-title {
  line-height: 1.1;
}

.hero-subtitle {
  max-width: 680px;
}

.hero-stats {
  justify-content: flex-end;
}

.hero-mini-stat {
  min-width: 170px;
  padding: 16px 18px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hero-mini-stat:hover {
  transform: translateY(-2px);
}

.bookings-theme-light .hero-mini-stat {
  background: rgba(255, 255, 255, 0.68);
}

.bookings-theme-dark .hero-mini-stat {
  background: rgba(255, 255, 255, 0.04);
}

.status-pill-btn {
  transition: all 0.25s ease;
  text-transform: none;
  letter-spacing: 0;
  min-height: 42px;
}

.status-pill-btn:hover {
  transform: translateY(-1px);
}

.status-pill-btn--active {
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.08);
}

.filters-avatar,
.not-logged-avatar,
.empty-state-avatar,
.dialog-title-avatar,
.dialog-section-avatar,
.summary-icon {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.sticky-filters {
  position: sticky;
  top: 94px;
}

.mobile-friendly-filter-pills {
  row-gap: 10px;
}

.filter-chip {
  cursor: pointer;
  min-height: 36px;
}

.quick-status-item {
  padding: 12px 14px;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.quick-status-item:hover {
  transform: translateY(-1px);
}

.quick-status-item:active {
  transform: scale(0.99);
}

.status-icon-upcoming {
  color: rgb(var(--v-theme-primary));
}

.status-icon-past {
  color: rgb(120, 120, 120);
}

.status-icon-cancelled {
  color: rgb(var(--v-theme-error));
}

.not-logged-sheet,
.empty-state-sheet {
  border: 1px dashed rgba(var(--v-border-color, 128, 128, 128), 0.4);
}

.bookings-theme-light .not-logged-sheet,
.bookings-theme-light .empty-state-sheet {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(245, 248, 252, 0.95));
}

.bookings-theme-dark .not-logged-sheet,
.bookings-theme-dark .empty-state-sheet {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05));
}

.summary-card {
  padding: 18px 20px;
  height: 100%;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
}

.bookings-theme-light .summary-card {
  background: rgba(255, 255, 255, 0.74);
}

.bookings-theme-dark .summary-card {
  background: rgba(255, 255, 255, 0.04);
}

.summary-card-upcoming {
  border-color: rgba(var(--v-theme-primary), 0.22) !important;
}

.summary-card-past {
  border-color: rgba(120, 120, 120, 0.22) !important;
}

.summary-card-cancelled {
  border-color: rgba(var(--v-theme-error), 0.22) !important;
}

.search-field :deep(.v-field),
.filters-card :deep(.v-field) {
  transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
}

.search-field :deep(.v-field:hover),
.filters-card :deep(.v-field:hover) {
  transform: translateY(-1px);
}

.current-filter-chip {
  max-width: 100%;
}

.booking-card {
  overflow: hidden;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.booking-card:hover {
  transform: translateY(-2px);
}

.bookings-theme-light .booking-card {
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.bookings-theme-dark .booking-card {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}

.booking-card--upcoming {
  border-color: rgba(var(--v-theme-primary), 0.18) !important;
}

.booking-card--cancelled {
  border-color: rgba(var(--v-theme-error), 0.18) !important;
}

.booking-card-inner {
  padding: 18px;
  gap: 0;
}

.booking-image-shell {
  width: 112px;
  min-width: 112px;
  height: 92px;
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  overflow: hidden;
}

.booking-image {
  transition: transform 0.3s ease;
}

.booking-card:hover .booking-image {
  transform: scale(1.04);
}

.booking-title {
  line-height: 1.2;
  word-break: break-word;
}

.booking-info-chips :deep(.v-chip) {
  max-width: 100%;
}

.booking-meta-row {
  margin-top: 6px;
}

.booking-meta-item {
  padding: 10px 12px;
  border-radius: 14px;
  height: 100%;
  overflow-wrap: anywhere;
}

.bookings-theme-light .booking-meta-item {
  background: rgba(15, 23, 42, 0.03);
}

.bookings-theme-dark .booking-meta-item {
  background: rgba(255, 255, 255, 0.04);
}

.booking-meta-label,
.ticket-info-label {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.68;
  margin-bottom: 4px;
}

.booking-meta-value,
.ticket-info-value {
  font-size: 0.95rem;
  font-weight: 600;
}

.booking-seats {
  padding-top: 2px;
  overflow-wrap: anywhere;
}

.booking-actions {
  align-self: stretch;
}

.booking-actions .v-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 42px;
}

.booking-actions .v-btn:hover {
  transform: translateY(-1px);
}

.status-chip {
  font-weight: 600;
}

.ticket-dialog-image {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.ticket-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ticket-info-item {
  padding: 12px 14px;
  border-radius: 14px;
  overflow-wrap: anywhere;
}

.bookings-theme-light .ticket-info-item {
  background: rgba(15, 23, 42, 0.035);
}

.bookings-theme-dark .ticket-info-item {
  background: rgba(255, 255, 255, 0.04);
}

.seat-chip {
  transition: transform 0.2s ease;
}

.seat-chip:hover {
  transform: translateY(-1px);
}

.booking-list-enter-active,
.booking-list-leave-active {
  transition: all 0.28s ease;
}

.booking-list-enter-from,
.booking-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1279px) {
  .hero-stats {
    justify-content: flex-start;
  }
}

@media (max-width: 959px) {
  .sticky-filters {
    position: static;
    top: auto;
  }

  .hero-mini-stat {
    min-width: 150px;
  }

  .bookings-main-row {
    row-gap: 16px;
  }
}

@media (max-width: 700px) {
  .bookings-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions .v-btn {
    flex: 1 1 calc(50% - 8px);
    min-width: 0;
  }

  .hero-stats {
    width: 100%;
  }

  .hero-mini-stat {
    flex: 1 1 100%;
    min-width: 0;
  }

  .filters-header {
    align-items: flex-start;
    gap: 10px;
  }

  .booking-card-inner {
    padding: 16px;
  }

  .booking-image-shell {
    width: 100%;
    min-width: 100%;
    height: 180px;
    margin-right: 0 !important;
  }

  .booking-image-shell :deep(.v-img) {
    width: 100% !important;
    height: 100% !important;
  }

  .booking-headline,
  .booking-headline > div:first-child,
  .status-chip,
  .current-filter-chip {
    width: 100%;
  }

  .booking-actions {
    width: 100%;
  }

  .booking-actions .v-btn {
    width: 100%;
  }

  .ticket-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 460px) {
  .hero-actions .v-btn {
    flex: 1 1 100%;
  }

  .mobile-friendly-filter-pills .v-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
