<template>
  <AppNavbar />

  <div class="reservation-page-shell" :class="browserThemeClass" :data-theme="browserTheme">
    <v-container fluid class="py-8 reservation-page">
      <v-row justify="center">
        <v-col cols="12" xl="11">
          <v-card rounded="xl" class="pa-4 pa-md-6 reservation-main-card">
            <div class="page-hero d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4 mb-6">
              <div class="hero-copy">
                <div class="hero-badge mb-3">
                  <v-icon size="18" class="me-2">mdi-calendar-clock-outline</v-icon>
                  Venue booking workspace
                </div>
                <div class="text-h4 font-weight-bold hero-title">Reserve venue</div>
                <div class="text-medium-emphasis hero-subtitle">
                  Pick a free time slot, review venue details, then pay to lock the reservation.
                </div>
              </div>

              <div class="d-flex ga-2 flex-wrap hero-chip-group" v-if="venue">
                <v-chip color="primary" variant="tonal" class="hero-chip">
                  <v-icon start size="16">mdi-map-marker-radius</v-icon>
                  {{ venue.title }}
                </v-chip>
                <v-chip color="success" variant="tonal" class="hero-chip">
                  <v-icon start size="16">mdi-clock-outline</v-icon>
                  {{ hourlyPrice.toFixed(2) }} TND / hour
                </v-chip>
                <v-chip color="secondary" variant="tonal" class="hero-chip">
                  <v-icon start size="16">mdi-calendar-month-outline</v-icon>
                  {{ dailyPrice.toFixed(2) }} TND / day
                </v-chip>
              </div>
            </div>

            <v-stepper v-model="step" alt-labels flat class="bg-transparent clean-stepper mb-6">
              <v-stepper-header>
                <v-stepper-item :value="1" title="Pick time" />
                <v-divider />
                <v-stepper-item :value="2" title="Review & pay" />
              </v-stepper-header>
            </v-stepper>

            <div v-if="!venue" class="py-12 text-center text-medium-emphasis empty-state-wrap">
              <v-icon size="44" class="mb-3 empty-state-icon">mdi-domain-off</v-icon>
              <div class="text-h6 font-weight-bold mb-2">No venue selected</div>
              <div>
                Open this page with a venue id, like <strong>/reservations?id=venue-1</strong>.
              </div>
            </div>

            <template v-else>
              <div v-show="step === 1">
                <v-row>
                  <v-col cols="12" lg="9">
                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 clean-section-card mb-4 timeline-section-card">
                      <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4">
                        <div>
                          <div class="text-h6 font-weight-bold section-title">Availability timeline</div>
                          <div class="text-body-2 text-medium-emphasis">
                            Scroll horizontally to view the next 16 weeks. Click any free starting slot.
                          </div>
                        </div>

                        <div class="d-flex ga-2 flex-wrap">
                          <v-btn
                            variant="outlined"
                            rounded="lg"
                            prepend-icon="mdi-arrow-left"
                            class="action-btn"
                            @click="scrollTimeline(-1200)"
                          >
                            Previous days
                          </v-btn>
                          <v-btn
                            color="primary"
                            rounded="lg"
                            append-icon="mdi-arrow-right"
                            class="action-btn"
                            @click="scrollTimeline(1200)"
                          >
                            Next days
                          </v-btn>
                        </div>
                      </div>

                      <v-row class="mb-4">
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="jumpToDate"
                            type="date"
                            label="Go to exact date"
                            variant="outlined"
                            rounded="lg"
                            hide-details
                            density="comfortable"
                            class="enhanced-field"
                          />
                        </v-col>
                        <v-col cols="12" md="6" class="d-flex align-center flex-wrap ga-2">
                          <v-btn
                            color="primary"
                            rounded="lg"
                            class="action-btn"
                            prepend-icon="mdi-crosshairs-gps"
                            @click="scrollToExactDate"
                          >
                            Go to date
                          </v-btn>
                          <v-btn
                            variant="outlined"
                            rounded="lg"
                            class="action-btn"
                            prepend-icon="mdi-close-circle-outline"
                            @click="jumpToDate = ''"
                          >
                            Clear
                          </v-btn>
                        </v-col>
                      </v-row>

                      <div ref="timelineScroller" class="timeline-scroller custom-scrollbar">
                        <div class="timeline-grid" :style="timelineGridStyle">
                          <div class="timeline-corner sticky-corner"></div>

                          <div
                            v-for="(day, dayIndex) in days"
                            :key="day.key + '-header'"
                            class="day-header"
                            :data-day-index="dayIndex"
                          >
                            <div class="font-weight-bold">{{ day.label }}</div>
                            <div class="text-caption text-medium-emphasis">{{ day.sub }}</div>
                          </div>

                          <template v-for="slot in timeSlots" :key="slot.label">
                            <div class="time-label">{{ slot.label }}</div>

                            <button
                              v-for="day in days"
                              :key="day.key + '-' + slot.hour"
                              type="button"
                              class="slot-cell"
                              :class="slotClass(day.date, slot.hour)"
                              :disabled="!canSelectSlot(day.date, slot.hour)"
                              @click="selectSlot(day.date, slot.hour)"
                            >
                              <span v-if="isSelectedSlot(day.date, slot.hour)">Start</span>
                              <span v-else-if="isEventSlot(day.date, slot.hour)">Event</span>
                              <span v-else-if="isAdministrationSlot(day.date, slot.hour)">Administration</span>
                              <span v-else-if="isBookedSlot(day.date, slot.hour)">Booked</span>
                              <span v-else>Free</span>
                            </button>
                          </template>
                        </div>
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="3">
                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 clean-section-card sticky-panel mb-4 side-setup-card">
                      <div class="d-flex align-center justify-space-between ga-3 mb-4">
                        <div class="text-h6 font-weight-bold section-title">Reservation setup</div>
                        <v-avatar size="34" class="setup-avatar">
                          <v-icon size="18">mdi-tune-variant</v-icon>
                        </v-avatar>
                      </div>

                      <v-text-field
                        :model-value="selectedStartLabel"
                        label="Selected start"
                        variant="outlined"
                        rounded="lg"
                        readonly
                        density="comfortable"
                        class="mb-3 enhanced-field"
                      />

                      <v-radio-group v-model="durationUnit" inline class="mb-2 custom-radio-group">
                        <v-radio label="Hours" value="hours" />
                        <v-radio label="Days" value="days" />
                      </v-radio-group>

                      <v-text-field
                        v-model.number="durationValue"
                        :label="durationUnit === 'hours' ? 'Duration (hours)' : 'Duration (days)'"
                        type="number"
                        min="1"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        class="mb-3 enhanced-field"
                      />

                      <v-text-field
                        :model-value="selectedEndLabel"
                        label="Reservation ends"
                        variant="outlined"
                        rounded="lg"
                        readonly
                        density="comfortable"
                        class="mb-3 enhanced-field"
                      />

                      <v-alert
                        v-if="durationConflictMessage"
                        type="warning"
                        variant="tonal"
                        rounded="lg"
                        class="mb-3 polished-alert"
                      >
                        {{ durationConflictMessage }}
                      </v-alert>

                      <div class="mini-summary-card mb-4">
                        <div class="mini-summary-row">
                          <span class="text-medium-emphasis">Current mode</span>
                          <strong>{{ durationUnit === 'days' ? 'Daily' : 'Hourly' }}</strong>
                        </div>
                        <div class="mini-summary-row">
                          <span class="text-medium-emphasis">Selected duration</span>
                          <strong>{{ durationText }}</strong>
                        </div>
                        <div class="mini-summary-row">
                          <span class="text-medium-emphasis">Estimated total</span>
                          <strong>{{ grandTotal.toFixed(2) }} TND</strong>
                        </div>
                      </div>

                      <div class="text-subtitle-2 font-weight-bold mb-2">Pricing mode</div>
                      <v-alert type="info" variant="tonal" rounded="lg" class="mb-3 polished-alert">
                        <div v-if="durationUnit === 'hours'">
                          Hourly booking uses <strong>{{ hourlyPrice.toFixed(2) }} TND / hour</strong>.
                        </div>
                        <div v-else>
                          Daily booking uses <strong>{{ dailyPrice.toFixed(2) }} TND / day</strong>.
                        </div>
                      </v-alert>

                      <div class="text-subtitle-2 font-weight-bold mb-2">Legend</div>
                      <div class="legend-list">
                        <div class="legend-item"><span class="legend-dot free"></span> Free slot</div>
                        <div class="legend-item"><span class="legend-dot selected"></span> Your start slot</div>
                        <div class="legend-item"><span class="legend-dot admin"></span> Administration</div>
                        <div class="legend-item"><span class="legend-dot booked"></span> Venue reservation</div>
                        <div class="legend-item"><span class="legend-dot event"></span> Existing event</div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div v-show="step === 2">
                <v-row>
                  <v-col cols="12" lg="8">
                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 clean-section-card h-100 review-card">
                      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
                        <div class="text-h6 font-weight-bold section-title">Venue details</div>
                        <v-chip color="primary" variant="tonal" class="hero-chip">
                          <v-icon start size="16">mdi-check-decagram-outline</v-icon>
                          Ready for payment
                        </v-chip>
                      </div>

                      <v-row>
                        <v-col cols="12" md="5">
                          <div class="review-image-wrap">
                            <v-img
                              :src="venue.image || fallbackImage"
                              height="260"
                              cover
                              class="rounded-xl review-image"
                            />
                            <div class="review-image-overlay">
                              <v-chip color="black" variant="flat" size="small" class="overlay-chip">
                                {{ venue.category || 'Venue' }}
                              </v-chip>
                            </div>
                          </div>
                        </v-col>

                        <v-col cols="12" md="7">
                          <div class="text-h5 font-weight-bold mb-2">{{ venue.title }}</div>
                          <div class="text-body-2 text-medium-emphasis mb-4">
                            {{ venue.location }} · {{ venue.exact_address || venue.contact_info?.address || 'No exact address' }}
                          </div>

                          <div class="d-flex ga-2 flex-wrap mb-4">
                            <v-chip color="primary" variant="tonal" class="hero-chip">{{ venue.category || 'Venue' }}</v-chip>
                            <v-chip variant="outlined" class="hero-chip">{{ venue.type || 'Indoor' }}</v-chip>
                            <v-chip color="success" variant="tonal" class="hero-chip">{{ hourlyPrice.toFixed(2) }} TND / hour</v-chip>
                            <v-chip color="secondary" variant="tonal" class="hero-chip">{{ dailyPrice.toFixed(2) }} TND / day</v-chip>
                          </div>

                          <div class="text-body-2 mb-4 venue-description">{{ venue.description || 'No description available.' }}</div>

                          <v-list lines="two" class="bg-transparent pa-0 details-list">
                            <v-list-item title="Selected start" :subtitle="selectedStartLabel">
                              <template #prepend>
                                <v-avatar size="34" class="detail-avatar">
                                  <v-icon size="18">mdi-clock-start</v-icon>
                                </v-avatar>
                              </template>
                            </v-list-item>
                            <v-list-item title="Selected end" :subtitle="selectedEndLabel">
                              <template #prepend>
                                <v-avatar size="34" class="detail-avatar">
                                  <v-icon size="18">mdi-clock-end</v-icon>
                                </v-avatar>
                              </template>
                            </v-list-item>
                            <v-list-item title="Duration" :subtitle="durationText">
                              <template #prepend>
                                <v-avatar size="34" class="detail-avatar">
                                  <v-icon size="18">mdi-timer-outline</v-icon>
                                </v-avatar>
                              </template>
                            </v-list-item>
                            <v-list-item title="Seat overview" :subtitle="seatSummary">
                              <template #prepend>
                                <v-avatar size="34" class="detail-avatar">
                                  <v-icon size="18">mdi-seat-outline</v-icon>
                                </v-avatar>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="4">
                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 clean-section-card sticky-panel bill-card">
                      <div class="d-flex align-center justify-space-between ga-3 mb-4">
                        <div class="text-h6 font-weight-bold section-title">Bill</div>
                        <v-avatar size="36" class="bill-avatar">
                          <v-icon size="18">mdi-receipt-text-check-outline</v-icon>
                        </v-avatar>
                      </div>

                      <div class="bill-row">
                        <span>{{ durationUnit === 'days' ? 'Venue day rate' : 'Venue hourly rate' }}</span>
                        <strong>{{ venueSubtotal.toFixed(2) }} TND</strong>
                      </div>

                      <div class="bill-row text-medium-emphasis">
                        <span>Blassti fee (2%)</span>
                        <strong>{{ blasstiFee.toFixed(2) }} TND</strong>
                      </div>

                      <v-divider class="my-4" />

                      <div class="bill-row total-row mb-4">
                        <span>Total</span>
                        <strong>{{ grandTotal.toFixed(2) }} TND</strong>
                      </div>

                      <div class="payment-glow-line mb-4"></div>

                      <v-alert type="info" variant="tonal" rounded="lg" class="mb-4 polished-alert">
                        Paying now locks the venue immediately for your selected time range.
                      </v-alert>

                      <v-btn
                        block
                        color="primary"
                        size="x-large"
                        rounded="lg"
                        prepend-icon="mdi-credit-card-check-outline"
                        :disabled="!canProceedToPayment"
                        class="pay-btn"
                        @click="paymentDialog = true"
                      >
                        Pay now to reserve venue
                      </v-btn>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-6" />

              <div class="d-flex justify-space-between ga-3 flex-wrap page-footer-actions">
                <v-btn
                  variant="outlined"
                  rounded="lg"
                  prepend-icon="mdi-arrow-left"
                  :disabled="step === 1"
                  class="action-btn"
                  @click="step--"
                >
                  Previous
                </v-btn>

                <v-btn
                  v-if="step === 1"
                  color="primary"
                  rounded="lg"
                  append-icon="mdi-arrow-right"
                  :disabled="!canContinueFromStep1"
                  class="action-btn"
                  @click="step = 2"
                >
                  Continue
                </v-btn>
              </div>
            </template>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="paymentDialog" max-width="560" :scrim="browserTheme === 'dark' ? 'rgba(5, 8, 16, 0.72)' : 'rgba(15, 23, 42, 0.22)'">
        <v-card rounded="xl" class="dialog-card">
          <v-card-title class="text-h6 font-weight-bold dialog-title">
            <v-icon class="me-2" size="20">mdi-credit-card-outline</v-icon>
            Fake payment system
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="paymentForm.cardType"
              :items="cardTypes"
              label="Card type"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-4 enhanced-field"
            />

            <v-text-field
              v-model="paymentForm.name"
              label="Card holder name"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-4 enhanced-field"
            />

            <v-text-field
              v-model="paymentForm.number"
              label="Card number"
              variant="outlined"
              rounded="lg"
              maxlength="19"
              density="comfortable"
              class="mb-4 enhanced-field"
            />

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="paymentForm.expiry"
                  label="Expiry (MM/YY)"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  class="enhanced-field"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="paymentForm.cvv"
                  label="CVV"
                  type="password"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  class="enhanced-field"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end pa-4 pt-0">
            <v-btn variant="text" rounded="lg" @click="paymentDialog = false">Cancel</v-btn>
            <v-btn color="primary" rounded="lg" class="action-btn" @click="completePayment">Confirm payment</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="successDialog" max-width="520" :scrim="browserTheme === 'dark' ? 'rgba(5, 8, 16, 0.72)' : 'rgba(15, 23, 42, 0.22)'">
        <v-card rounded="xl" class="dialog-card success-card">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center success-title">
            <v-avatar size="40" class="success-avatar me-3">
              <v-icon size="22">mdi-check-bold</v-icon>
            </v-avatar>
            Payment successful 🎉
          </v-card-title>

          <v-card-text>
            <div class="mb-3">
              Your venue has been reserved successfully and saved to <strong>My venues</strong>.
            </div>

            <div class="success-hint">
              Tip: you can right-click on desktop or long-press on mobile to open <strong>My venues</strong> in a new tab or a new window.
            </div>
          </v-card-text>

          <v-card-actions class="justify-end flex-wrap ga-2 pa-4 pt-0">
            <v-btn variant="text" rounded="lg" @click="successDialog = false">Stay here</v-btn>

            <v-btn
              color="primary"
              rounded="lg"
              class="action-btn mobile-context-trigger"
              @click="goToMyVenues"
              @contextmenu.prevent="handleNavButtonContextMenu($event, '/reserved_venues')"
              @touchstart.passive="triggerLongPressContextMenu($event, '/reserved_venues')"
              @touchend="cancelLongPressContextMenu"
              @touchmove="cancelLongPressContextMenu"
              @touchcancel="cancelLongPressContextMenu"
            >
              Open My venues
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-menu
        v-model="navigationMenu.show"
        :style="{ left: `${navigationMenu.x}px`, top: `${navigationMenu.y}px` }"
        location="top start"
        absolute
        :close-on-content-click="true"
      >
        <v-list rounded="xl" class="context-menu-list">
          <v-list-item @click="openContextRouteHere">
            <template #prepend>
              <v-icon size="18">mdi-open-in-app</v-icon>
            </template>
            <v-list-item-title>Open here</v-list-item-title>
          </v-list-item>

          <v-list-item @click="openContextRouteInNewTab">
            <template #prepend>
              <v-icon size="18">mdi-open-in-new</v-icon>
            </template>
            <v-list-item-title>Open in new tab</v-list-item-title>
          </v-list-item>

          <v-list-item @click="openContextRouteInNewWindow">
            <template #prepend>
              <v-icon size="18">mdi-monitor-dashboard</v-icon>
            </template>
            <v-list-item-title>Open in new window</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill" location="bottom right" timeout="2600">
        {{ snackbar.text }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useTheme } from "vuetify"
import { useRoute, useRouter } from "vue-router"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_Current_User } from "@/dataModel/user"
import {
  get_Venue_Administration_Blocks_For_Range,
  get_Venue_By_Id,
} from "@/dataModel/venue"
import {
  does_Venue_Have_Conflict,
  get_Reservations_By_Venue_Id,
  create_Venue_Reservation_For_User,
} from "@/dataModel/venue_reservation"
import { get_All_Events } from "@/dataModel/event"

const router = useRouter()
const route = useRoute()
const theme = useTheme()

const THEME_STORAGE_KEY = "blassti-theme"
const LONG_PRESS_DURATION = 550

const step = ref(1)
const paymentDialog = ref(false)
const successDialog = ref(false)
const timelineScroller = ref(null)
const currentUser = ref(get_Current_User())

const fallbackImage = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
const cardTypes = ["Visa", "Mastercard", "American Express"]

const BLASSTI_FEE_RATE = 0.02
const VENUE_RESERVATION_FEES_STORAGE_KEY = "venue_reservation_fees"

const snackbar = reactive({
  show: false,
  text: "",
  color: "primary",
})

const paymentForm = reactive({
  cardType: "Visa",
  name: "",
  number: "",
  expiry: "",
  cvv: "",
})

const durationUnit = ref("hours")
const durationValue = ref(2)
const selectedStart = ref(null)
const jumpToDate = ref("")

const browserTheme = ref("dark")
const mediaQuery = ref(null)
const isMobileViewport = ref(false)
const longPressTimer = ref(null)

const navigationMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  route: "",
})

const browserThemeClass = computed(() =>
  browserTheme.value === "dark" ? "reservation-page--dark" : "reservation-page--light"
)

const selectedVenueId = computed(() => {
  return String(route.query.id || route.query.venueId || "").trim()
})

const venue = computed(() => {
  if (!selectedVenueId.value) return null
  return get_Venue_By_Id(selectedVenueId.value)
})

const venueReservations = computed(() => {
  if (!venue.value?.id) return []
  return get_Reservations_By_Venue_Id(venue.value.id)
})

const administrationBlocks = computed(() => {
  if (!venue.value?.id) return []

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 113)
  end.setHours(23, 59, 59, 999)

  return get_Venue_Administration_Blocks_For_Range(venue.value.id, start.toISOString(), end.toISOString())
})

const venueEvents = computed(() => {
  if (!venue.value) return []

  return get_All_Events().filter(eventItem => {
    const venueIdMatch = String(eventItem.venue_id || "") === String(venue.value.id || "")
    const venueTitleMatch =
      String(eventItem.venue || "").trim().toLowerCase() ===
      String(venue.value.title || "").trim().toLowerCase()

    return venueIdMatch || venueTitleMatch
  })
})

const hourlyPrice = computed(() => Number(venue.value?.price_per_hour ?? 0))
const dailyPrice = computed(() => Number(venue.value?.price_per_day ?? 0))

const days = computed(() => {
  const out = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < 112; i += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    out.push({
      date: day,
      key: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString([], { weekday: "long" }),
      sub: day.toLocaleDateString([], { day: "2-digit", month: "short" }),
    })
  }

  return out
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour += 1) {
    slots.push({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
    })
  }
  return slots
})

const timelineGridStyle = computed(() => ({
  gridTemplateColumns: `110px repeat(${days.value.length}, 210px)`,
}))

const selectedEnd = computed(() => {
  if (!selectedStart.value) return null
  const end = new Date(selectedStart.value)

  if (durationUnit.value === "days") {
    end.setDate(end.getDate() + Number(durationValue.value || 1))
  } else {
    end.setHours(end.getHours() + Number(durationValue.value || 1))
  }

  return end
})

const selectedStartLabel = computed(() =>
  selectedStart.value ? new Date(selectedStart.value).toLocaleString() : "No slot selected"
)

const selectedEndLabel = computed(() =>
  selectedEnd.value ? new Date(selectedEnd.value).toLocaleString() : "No end time yet"
)

const durationText = computed(() => {
  const value = Number(durationValue.value || 1)
  return durationUnit.value === "days"
    ? `${value} day${value > 1 ? "s" : ""}`
    : `${value} hour${value > 1 ? "s" : ""}`
})

const durationInHours = computed(() => {
  const value = Math.max(1, Number(durationValue.value || 1))
  return durationUnit.value === "days" ? value * 24 : value
})

const durationInDays = computed(() => {
  const value = Math.max(1, Number(durationValue.value || 1))
  return durationUnit.value === "days" ? value : Math.max(1, Math.ceil(durationInHours.value / 24))
})

const venueSubtotal = computed(() => {
  if (durationUnit.value === "days") {
    return durationInDays.value * dailyPrice.value
  }
  return durationInHours.value * hourlyPrice.value
})

const blasstiFee = computed(() => venueSubtotal.value * BLASSTI_FEE_RATE)
const grandTotal = computed(() => venueSubtotal.value + blasstiFee.value)

const seatCounts = computed(() => {
  const seats = venue.value?.design?.seats ?? []
  const counts = { Regular: 0, Special: 0, VIP: 0 }

  seats.forEach(seat => {
    const seatClass = seat?.seat_class || "Regular"
    if (!counts[seatClass]) counts[seatClass] = 0
    counts[seatClass] += 1
  })

  return counts
})

const seatSummary = computed(() => {
  const totalDesignedSeats = Object.values(seatCounts.value).reduce((sum, v) => sum + Number(v || 0), 0)
  if (!totalDesignedSeats) {
    return `${Number(venue.value?.capacity ?? 0)} total seats`
  }

  const parts = []
  if (seatCounts.value.Regular) parts.push(`${seatCounts.value.Regular} Regular`)
  if (seatCounts.value.Special) parts.push(`${seatCounts.value.Special} Special`)
  if (seatCounts.value.VIP) parts.push(`${seatCounts.value.VIP} VIP`)
  return parts.join(" · ")
})

const durationConflictMessage = computed(() => {
  if (!selectedStart.value || !selectedEnd.value || !venue.value?.id) return ""

  return hasAnyConflict(venue.value.id, selectedStart.value, selectedEnd.value)
    ? "This duration overlaps with an existing reservation, administration block, or scheduled event. Choose another start or duration."
    : ""
})

const canContinueFromStep1 = computed(() => Boolean(selectedStart.value) && !durationConflictMessage.value)
const canProceedToPayment = computed(() => canContinueFromStep1.value && Boolean(currentUser.value?.id))

watch(
  () => theme?.global?.name?.value,
  (newTheme) => {
    if (!newTheme) return
    syncBrowserThemeFromVuetify(newTheme)
  },
  { immediate: true }
)

function notify(text, color = "primary") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function getStoredTheme() {
  if (typeof window === "undefined") return "dark"
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return savedTheme === "light" ? "light" : "dark"
}

function applyStoredTheme() {
  const savedTheme = getStoredTheme()
  browserTheme.value = savedTheme

  if (theme?.global?.name) {
    theme.global.name.value = savedTheme
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", savedTheme)
    document.documentElement.style.colorScheme = savedTheme
    document.body?.setAttribute?.("data-app-theme", savedTheme)
  }
}

function syncBrowserThemeFromVuetify(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  browserTheme.value = normalizedTheme

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
    document.body?.setAttribute?.("data-app-theme", normalizedTheme)
  }
}

function updateViewportState() {
  if (typeof window === "undefined") return
  isMobileViewport.value = window.innerWidth <= 960
}

function updateBrowserTheme() {
  applyStoredTheme()
  updateViewportState()
}

function handleBrowserThemeChange() {
  applyStoredTheme()
}

function clearLongPressTimer() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

function triggerLongPressContextMenu(event, targetRoute) {
  if (!isMobileViewport.value) return
  clearLongPressTimer()

  const touch = event.touches?.[0] || event.changedTouches?.[0]
  if (!touch) return

  longPressTimer.value = window.setTimeout(() => {
    handleContextMenuOpen({
      clientX: touch.clientX,
      clientY: touch.clientY,
    }, targetRoute)
  }, LONG_PRESS_DURATION)
}

function cancelLongPressContextMenu() {
  clearLongPressTimer()
}

function closeContextMenu() {
  navigationMenu.show = false
}

function resolveRouteHref(targetRoute) {
  const resolved = router.resolve(targetRoute)
  return resolved.href
}

function openRouteInNewTab(targetRoute) {
  const href = resolveRouteHref(targetRoute)
  window.open(href, "_blank", "noopener,noreferrer")
}

function openRouteInNewWindow(targetRoute) {
  const href = resolveRouteHref(targetRoute)
  window.open(href, "_blank", "noopener,noreferrer,width=1280,height=900")
}

function handleContextMenuOpen(event, targetRoute) {
  navigationMenu.x = event.clientX
  navigationMenu.y = event.clientY
  navigationMenu.route = targetRoute
  navigationMenu.show = true
}

function handleNavButtonContextMenu(event, targetRoute) {
  handleContextMenuOpen(event, targetRoute)
}

function openContextRouteHere() {
  if (!navigationMenu.route) return
  router.push(navigationMenu.route)
  closeContextMenu()
}

function openContextRouteInNewTab() {
  if (!navigationMenu.route) return
  openRouteInNewTab(navigationMenu.route)
  closeContextMenu()
}

function openContextRouteInNewWindow() {
  if (!navigationMenu.route) return
  openRouteInNewWindow(navigationMenu.route)
  closeContextMenu()
}

function scrollTimeline(amount) {
  timelineScroller.value?.scrollBy({ left: amount, behavior: "smooth" })
}

function buildDate(dayDate, hour) {
  const d = new Date(dayDate)
  d.setHours(hour, 0, 0, 0)
  return d
}

function parseEventDateTime(eventItem) {
  const start = new Date(`${eventItem.date} ${eventItem.time}`)
  const end = new Date(`${eventItem.date} ${eventItem.end_time || eventItem.time}`)

  if (eventItem.end_time && end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1)
  }

  return { start, end }
}

function isEventSlot(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return venueEvents.value.some(eventItem => {
    const eventRange = parseEventDateTime(eventItem)
    return start < eventRange.end && end > eventRange.start
  })
}

function isAdministrationSlot(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return administrationBlocks.value.some(block => {
    const blockStart = new Date(block.occurrence_start || block.start_datetime)
    const blockEnd = new Date(block.occurrence_end || block.end_datetime)
    return start < blockEnd && end > blockStart
  })
}

function isBookedSlot(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return venueReservations.value.some(reservation => {
    const existingStart = new Date(reservation.start_datetime || reservation.start_date)
    const existingEnd = new Date(reservation.end_datetime || reservation.end_date)
    return start < existingEnd && end > existingStart
  })
}

function hasEventConflict(startDateTime, endDateTime) {
  const start = new Date(startDateTime)
  const end = new Date(endDateTime)

  return venueEvents.value.some(eventItem => {
    const eventRange = parseEventDateTime(eventItem)
    return start < eventRange.end && end > eventRange.start
  })
}

function hasAnyConflict(venueId, startDateTime, endDateTime) {
  return (
    does_Venue_Have_Conflict(venueId, startDateTime, endDateTime) ||
    hasEventConflict(startDateTime, endDateTime)
  )
}

function isSelectedSlot(dayDate, hour) {
  if (!selectedStart.value) return false
  const candidate = buildDate(dayDate, hour)
  return candidate.getTime() === new Date(selectedStart.value).getTime()
}

function canSelectSlot(dayDate, hour) {
  const candidate = buildDate(dayDate, hour)
  return !isAdministrationSlot(dayDate, hour) && !isBookedSlot(dayDate, hour) && !isEventSlot(dayDate, hour) && candidate.getTime() >= Date.now()
}

function slotClass(dayDate, hour) {
  return {
    "slot-cell--admin": isAdministrationSlot(dayDate, hour),
    "slot-cell--booked": isBookedSlot(dayDate, hour),
    "slot-cell--event": isEventSlot(dayDate, hour),
    "slot-cell--selected": isSelectedSlot(dayDate, hour),
    "slot-cell--free": !isAdministrationSlot(dayDate, hour) && !isBookedSlot(dayDate, hour) && !isEventSlot(dayDate, hour),
  }
}

function selectSlot(dayDate, hour) {
  if (!canSelectSlot(dayDate, hour)) return
  selectedStart.value = buildDate(dayDate, hour).toISOString()
}

function scrollToExactDate() {
  if (!jumpToDate.value || !timelineScroller.value) {
    notify("Pick a date first.", "error")
    return
  }

  const targetIndex = days.value.findIndex(day => day.key === jumpToDate.value)

  if (targetIndex === -1) {
    notify("That date is outside the 16-week timeline.", "error")
    return
  }

  const leftOffset = 110 + (targetIndex * 210)
  timelineScroller.value.scrollTo({
    left: leftOffset,
    behavior: "smooth",
  })
}

function getSavedVenueReservationFees() {
  try {
    const raw = localStorage.getItem(VENUE_RESERVATION_FEES_STORAGE_KEY)
    const parsed = JSON.parse(raw || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Failed to parse venue reservation fees from localStorage.", error)
    return []
  }
}

function saveVenueReservationFeeRecord({ reservationResult }) {
  const existingFees = getSavedVenueReservationFees()

  const feeRecord = {
    id: crypto.randomUUID(),
    reservation_id:
      reservationResult?.reservation?.id ??
      reservationResult?.reservationId ??
      reservationResult?.id ??
      null,
    venue_id: venue.value?.id ?? null,
    venue_title: venue.value?.title ?? "",
    user_id: currentUser.value?.id ?? null,
    user_name: currentUser.value
      ? `${currentUser.value.first_name || ""} ${currentUser.value.last_name || ""}`.trim()
      : "",
    start_datetime: selectedStart.value,
    end_datetime: selectedEnd.value?.toISOString?.() ?? null,
    duration: Number(durationValue.value || 1),
    duration_unit: durationUnit.value,
    venue_subtotal: Number(venueSubtotal.value.toFixed(2)),
    fee_rate: BLASSTI_FEE_RATE,
    fee_amount: Number(blasstiFee.value.toFixed(2)),
    grand_total: Number(grandTotal.value.toFixed(2)),
    payment_method: paymentForm.cardType,
    card_last4: paymentForm.number.trim().slice(-4),
    created_at: new Date().toISOString(),
  }

  existingFees.unshift(feeRecord)
  localStorage.setItem(VENUE_RESERVATION_FEES_STORAGE_KEY, JSON.stringify(existingFees))

  return feeRecord
}

function completePayment() {
  if (!currentUser.value?.id) {
    notify("Please log in first.", "error")
    return
  }

  if (!paymentForm.cardType || !paymentForm.name.trim() || !paymentForm.number.trim() || !paymentForm.expiry.trim() || !paymentForm.cvv.trim()) {
    notify("Please complete all payment fields.", "error")
    return
  }

  if (!venue.value?.id || !selectedStart.value || !selectedEnd.value) {
    notify("Please select a valid reservation first.", "error")
    return
  }

  if (hasAnyConflict(venue.value.id, selectedStart.value, selectedEnd.value.toISOString())) {
    notify("This slot is no longer available.", "error")
    return
  }

  const result = create_Venue_Reservation_For_User({
    venueId: venue.value.id,
    userId: currentUser.value.id,
    startDateTime: selectedStart.value,
    endDateTime: selectedEnd.value.toISOString(),
    duration: Number(durationValue.value || 1),
    durationUnit: durationUnit.value,
    paymentMethod: paymentForm.cardType,
    cardLast4: paymentForm.number.trim().slice(-4),
  })

  if (!result.success) {
    notify(result.message || "Could not reserve this venue.", "error")
    return
  }

  saveVenueReservationFeeRecord({
    reservationResult: result,
  })

  paymentDialog.value = false
  successDialog.value = true
  notify("Venue reserved successfully.", "success")
}

function goToMyVenues() {
  successDialog.value = false
  router.push("/reserved_venues")
}

onMounted(() => {
  updateBrowserTheme()

  if (typeof window !== "undefined") {
    mediaQuery.value = window.matchMedia(`(max-width: 960px)`)

    if (typeof mediaQuery.value.addEventListener === "function") {
      mediaQuery.value.addEventListener("change", updateViewportState)
    } else if (typeof mediaQuery.value.addListener === "function") {
      mediaQuery.value.addListener(updateViewportState)
    }

    window.addEventListener("storage", handleBrowserThemeChange)
    window.addEventListener("focus", updateBrowserTheme)
    window.addEventListener("resize", updateViewportState)
    document.addEventListener("visibilitychange", updateBrowserTheme)
    window.addEventListener("click", closeContextMenu)
    window.addEventListener("scroll", closeContextMenu, true)
  }
})

onBeforeUnmount(() => {
  clearLongPressTimer()

  if (mediaQuery.value) {
    if (typeof mediaQuery.value.removeEventListener === "function") {
      mediaQuery.value.removeEventListener("change", updateViewportState)
    } else if (typeof mediaQuery.value.removeListener === "function") {
      mediaQuery.value.removeListener(updateViewportState)
    }
  }

  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleBrowserThemeChange)
    window.removeEventListener("focus", updateBrowserTheme)
    window.removeEventListener("resize", updateViewportState)
    document.removeEventListener("visibilitychange", updateBrowserTheme)
    window.removeEventListener("click", closeContextMenu)
    window.removeEventListener("scroll", closeContextMenu, true)
  }
})
</script>

<style scoped>
.reservation-page-shell {
  min-height: 100vh;
  transition: background 0.35s ease, color 0.35s ease;
}

.reservation-page--dark {
  background:
    radial-gradient(circle at top right, rgba(76, 102, 255, 0.14), transparent 28%),
    radial-gradient(circle at top left, rgba(0, 188, 212, 0.08), transparent 25%),
    linear-gradient(180deg, #090b11 0%, #0d1018 50%, #0b0d14 100%);
  color: rgba(255, 255, 255, 0.96);
}

.reservation-page--light {
  background:
    radial-gradient(circle at top right, rgba(63, 81, 181, 0.08), transparent 30%),
    radial-gradient(circle at top left, rgba(33, 150, 243, 0.06), transparent 24%),
    linear-gradient(180deg, #f5f8ff 0%, #eef3fb 55%, #f8fbff 100%);
  color: #152033;
}


.reservation-page {
  position: relative;
  z-index: 1;
}

.reservation-page--dark :deep(.v-card),
.reservation-page--dark :deep(.v-sheet),
.reservation-page--dark :deep(.v-stepper),
.reservation-page--dark :deep(.v-list),
.reservation-page--dark :deep(.v-table),
.reservation-page--dark :deep(.v-field),
.reservation-page--dark :deep(.v-input__control),
.reservation-page--dark :deep(.v-window),
.reservation-page--dark :deep(.v-navigation-drawer) {
  color: rgba(255, 255, 255, 0.96);
}

.reservation-page--light :deep(.v-card),
.reservation-page--light :deep(.v-sheet),
.reservation-page--light :deep(.v-stepper),
.reservation-page--light :deep(.v-list),
.reservation-page--light :deep(.v-table),
.reservation-page--light :deep(.v-field),
.reservation-page--light :deep(.v-input__control),
.reservation-page--light :deep(.v-window),
.reservation-page--light :deep(.v-navigation-drawer) {
  color: #152033;
}

.reservation-page--dark :deep(.v-field) {
  background: rgba(255, 255, 255, 0.03);
}

.reservation-page--light :deep(.v-field) {
  background: rgba(255, 255, 255, 0.94);
}

.reservation-page--dark :deep(.text-medium-emphasis) {
  color: rgba(226, 232, 240, 0.72) !important;
}

.reservation-page--light :deep(.text-medium-emphasis) {
  color: rgba(21, 32, 51, 0.72) !important;
}

.reservation-main-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.reservation-page--dark .reservation-main-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 0.98), rgba(14, 16, 24, 0.98)) !important;
}

.reservation-page--light .reservation-main-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(245, 249, 255, 0.96)) !important;
  border-color: rgba(22, 33, 55, 0.08);
  box-shadow: 0 20px 50px rgba(38, 51, 77, 0.08);
}

.page-hero {
  position: relative;
}

.hero-copy {
  max-width: 760px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.25px;
}

.reservation-page--dark .hero-badge {
  color: #dbe7ff;
  background: rgba(91, 122, 255, 0.14);
  border: 1px solid rgba(106, 135, 255, 0.18);
}

.reservation-page--light .hero-badge {
  color: #294a8d;
  background: rgba(63, 81, 181, 0.08);
  border: 1px solid rgba(63, 81, 181, 0.12);
}

.hero-title {
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 720px;
  line-height: 1.7;
  font-size: 0.98rem;
}

.hero-chip-group {
  align-items: center;
}

.hero-chip {
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.clean-section-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.reservation-page--dark .clean-section-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.07) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.reservation-page--light .clean-section-card {
  background: rgba(255, 255, 255, 0.82) !important;
  border-color: rgba(21, 32, 51, 0.08) !important;
  box-shadow: 0 10px 30px rgba(31, 45, 73, 0.05);
}

.section-title {
  letter-spacing: -0.01em;
}

.empty-state-wrap {
  border-radius: 24px;
}

.empty-state-icon {
  opacity: 0.8;
}

.action-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.enhanced-field :deep(.v-field) {
  transition: box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.reservation-page--dark .enhanced-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.025);
}

.reservation-page--light .enhanced-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.92);
}

.enhanced-field :deep(.v-field:hover) {
  box-shadow: 0 0 0 1px rgba(100, 120, 255, 0.12);
}

.custom-radio-group {
  margin-top: -4px;
}

.setup-avatar,
.bill-avatar,
.detail-avatar,
.success-avatar {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reservation-page--dark .setup-avatar,
.reservation-page--dark .bill-avatar,
.reservation-page--dark .detail-avatar,
.reservation-page--dark .success-avatar {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.reservation-page--light .setup-avatar,
.reservation-page--light .bill-avatar,
.reservation-page--light .detail-avatar,
.reservation-page--light .success-avatar {
  background: rgba(63, 81, 181, 0.08);
  color: #27407b;
}

.mini-summary-card {
  border-radius: 18px;
  padding: 14px 14px 10px;
}

.reservation-page--dark .mini-summary-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.reservation-page--light .mini-summary-card {
  background: linear-gradient(180deg, rgba(63, 81, 181, 0.05), rgba(255, 255, 255, 0.7));
  border: 1px solid rgba(63, 81, 181, 0.08);
}

.mini-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 8px;
}

.polished-alert {
  border: 1px solid transparent;
}

.timeline-section-card {
  overflow: hidden;
}

.timeline-scroller {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 70vh;
  border-radius: 20px;
}

.reservation-page--dark .timeline-scroller {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.015);
}

.reservation-page--light .timeline-scroller {
  border: 1px solid rgba(21, 32, 51, 0.08);
  background: rgba(248, 250, 255, 0.88);
}

.custom-scrollbar::-webkit-scrollbar {
  height: 11px;
  width: 11px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 999px;
}

.reservation-page--dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(164, 181, 255, 0.24);
}

.reservation-page--light .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(63, 81, 181, 0.24);
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-grid {
  display: grid;
  min-width: max-content;
}

.reservation-page--dark .timeline-grid {
  background: rgba(255, 255, 255, 0.02);
}

.reservation-page--light .timeline-grid {
  background: rgba(255, 255, 255, 0.7);
}

.timeline-corner,
.day-header,
.time-label,
.slot-cell {
  min-height: 58px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.reservation-page--dark .timeline-corner,
.reservation-page--dark .day-header,
.reservation-page--dark .time-label,
.reservation-page--dark .slot-cell {
  border-right-color: rgba(255, 255, 255, 0.06);
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.reservation-page--light .timeline-corner,
.reservation-page--light .day-header,
.reservation-page--light .time-label,
.reservation-page--light .slot-cell {
  border-right-color: rgba(21, 32, 51, 0.08);
  border-bottom-color: rgba(21, 32, 51, 0.08);
}

.sticky-corner {
  position: sticky;
  left: 0;
  z-index: 4;
}

.reservation-page--dark .sticky-corner {
  background: rgba(12, 14, 20, 0.98);
}

.reservation-page--light .sticky-corner {
  background: rgba(247, 250, 255, 0.98);
}

.day-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 210px;
  padding: 10px 14px;
  position: sticky;
  top: 0;
  z-index: 3;
  text-align: center;
  backdrop-filter: blur(12px);
}

.reservation-page--dark .day-header {
  background: rgba(17, 19, 28, 0.98);
}

.reservation-page--light .day-header {
  background: rgba(242, 246, 255, 0.98);
}

.time-label {
  position: sticky;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  padding: 10px;
  backdrop-filter: blur(10px);
}

.reservation-page--dark .time-label {
  background: rgba(12, 14, 20, 0.98);
}

.reservation-page--light .time-label {
  background: rgba(247, 250, 255, 0.98);
}

.slot-cell {
  min-width: 210px;
  padding: 10px 8px;
  border: none;
  font-weight: 700;
  letter-spacing: 0.2px;
  transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.reservation-page--dark .slot-cell {
  color: white;
}

.reservation-page--light .slot-cell {
  color: #16233d;
}

.slot-cell:hover:not(:disabled) {
  transform: scale(0.99);
  filter: brightness(1.04);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  display: inline-block;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.02);
}

.legend-dot.free { background: rgba(46, 125, 50, 0.9); }
.legend-dot.selected { background: rgba(30, 136, 229, 0.95); }
.legend-dot.admin { background: rgba(211, 47, 47, 0.95); }
.legend-dot.booked { background: rgba(198, 40, 40, 0.9); }
.legend-dot.event { background: rgba(255, 152, 0, 0.9); }

.review-card,
.bill-card,
.side-setup-card {
  overflow: hidden;
}

.review-image-wrap {
  position: relative;
}

.review-image {
  transition: transform 0.28s ease;
}

.review-image-wrap:hover .review-image {
  transform: scale(1.02);
}

.review-image-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
}

.overlay-chip {
  color: white !important;
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(10px);
}

.venue-description {
  line-height: 1.72;
}

.details-list :deep(.v-list-item) {
  border-radius: 16px;
  margin-bottom: 8px;
  padding-inline: 8px;
}

.reservation-page--dark .details-list :deep(.v-list-item) {
  background: rgba(255, 255, 255, 0.02);
}

.reservation-page--light .details-list :deep(.v-list-item) {
  background: rgba(63, 81, 181, 0.035);
}

.bill-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.total-row {
  font-size: 1.1rem;
}

.payment-glow-line {
  height: 1px;
  border-radius: 999px;
  opacity: 0.95;
}

.reservation-page--dark .payment-glow-line {
  background: linear-gradient(90deg, transparent, rgba(104, 130, 255, 0.9), transparent);
  box-shadow: 0 0 18px rgba(104, 130, 255, 0.35);
}

.reservation-page--light .payment-glow-line {
  background: linear-gradient(90deg, transparent, rgba(63, 81, 181, 0.8), transparent);
  box-shadow: 0 0 18px rgba(63, 81, 181, 0.16);
}

.pay-btn {
  min-height: 52px;
  font-weight: 700;
  letter-spacing: 0.2px;
  box-shadow: 0 16px 30px rgba(45, 84, 255, 0.18);
}

.sticky-panel {
  position: sticky;
  top: 90px;
}

.slot-cell--free {
  background: rgba(46, 125, 50, 0.14);
}

.slot-cell--selected {
  background: rgba(30, 136, 229, 0.35);
}

.slot-cell--admin {
  background: rgba(211, 47, 47, 0.35);
  cursor: not-allowed;
}

.slot-cell--booked {
  background: rgba(198, 40, 40, 0.22);
  cursor: not-allowed;
}

.slot-cell--event {
  background: rgba(255, 152, 0, 0.24);
  cursor: not-allowed;
}

.slot-cell:disabled {
  opacity: 0.95;
}

.dialog-card {
  overflow: hidden;
  backdrop-filter: blur(14px);
}

.reservation-page--dark .dialog-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 0.99), rgba(14, 16, 24, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.reservation-page--light .dialog-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(246, 249, 255, 0.99)) !important;
  border: 1px solid rgba(21, 32, 51, 0.08);
}

.dialog-title {
  padding-bottom: 6px;
}

.success-card {
  position: relative;
}

.success-title {
  padding-bottom: 6px;
}

.success-hint {
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 0.94rem;
  line-height: 1.6;
}

.reservation-page--dark .success-hint {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.reservation-page--light .success-hint {
  background: rgba(63, 81, 181, 0.04);
  border: 1px solid rgba(63, 81, 181, 0.08);
}

.context-menu-list {
  min-width: 220px;
  backdrop-filter: blur(14px);
}

.reservation-page--dark .context-menu-list {
  background: rgba(19, 21, 31, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.reservation-page--light .context-menu-list {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(21, 32, 51, 0.08);
}

.page-footer-actions {
  align-items: center;
}

@media (max-width: 1280px) {
  .sticky-panel {
    position: static;
    top: auto;
  }
}

@media (max-width: 960px) {
  .hero-title {
    font-size: 1.85rem !important;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .timeline-corner,
  .day-header,
  .time-label,
  .slot-cell {
    min-height: 54px;
  }
}

@media (max-width: 600px) {
  .reservation-main-card {
    border-radius: 22px !important;
  }

  .hero-badge {
    font-size: 0.8rem;
  }

  .hero-title {
    font-size: 1.6rem !important;
  }

  .page-footer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .page-footer-actions .v-btn {
    width: 100%;
  }
}

.mobile-context-trigger {
  touch-action: manipulation;
  -webkit-touch-callout: none;
}

@media (max-width: 1280px) {
  .reservation-page {
    padding-inline: 10px;
  }

  .hero-chip-group {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .reservation-page {
    padding-top: 20px !important;
    padding-bottom: 28px !important;
  }

  .reservation-main-card {
    padding: 18px !important;
  }

  .page-hero {
    align-items: flex-start !important;
    margin-bottom: 22px !important;
  }

  .hero-copy,
  .hero-chip-group {
    width: 100%;
  }

  .hero-chip-group :deep(.v-chip) {
    max-width: 100%;
  }

  .clean-stepper {
    overflow-x: auto;
  }

  .timeline-scroller {
    max-height: 62vh;
    border-radius: 18px;
  }

  .timeline-grid {
    min-width: max-content;
  }

  .day-header,
  .slot-cell {
    min-width: 166px;
  }

  .time-label,
  .timeline-corner {
    min-width: 84px;
  }

  .slot-cell {
    font-size: 0.84rem;
    padding: 12px 6px;
  }

  .bill-row {
    font-size: 0.95rem;
  }

  .pay-btn,
  .action-btn,
  .page-footer-actions .v-btn {
    min-height: 48px;
  }

  .context-menu-list {
    min-width: 200px;
  }
}

@media (max-width: 600px) {
  .reservation-page {
    padding-inline: 6px;
  }

  .reservation-main-card {
    padding: 14px !important;
  }

  .page-hero {
    gap: 14px !important;
  }

  .hero-subtitle {
    line-height: 1.6;
  }

  .hero-chip-group {
    gap: 8px !important;
  }

  .hero-chip-group :deep(.v-chip) {
    width: 100%;
    justify-content: flex-start;
  }

  .clean-section-card {
    padding: 14px !important;
    border-radius: 20px !important;
  }

  .timeline-scroller {
    max-height: 58vh;
  }

  .day-header,
  .slot-cell {
    min-width: 136px;
  }

  .time-label,
  .timeline-corner {
    min-width: 74px;
  }

  .day-header {
    padding: 8px 10px;
  }

  .slot-cell {
    min-height: 52px;
    font-size: 0.78rem;
    line-height: 1.25;
    word-break: break-word;
  }

  .mini-summary-row,
  .bill-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .details-list :deep(.v-list-item) {
    padding-inline: 4px;
  }

  .context-menu-list {
    min-width: 188px;
  }
}

</style>