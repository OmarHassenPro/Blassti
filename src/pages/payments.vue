<template>
  <AppNavbar />

  <div class="payments-page-shell" :class="browserThemeClass">
    <v-container fluid class="py-8 payments-page">
      <v-row justify="center">
        <v-col cols="12" xxl="11">
          <v-card rounded="xl" class="page-hero-card mb-6 overflow-hidden">
            <div class="hero-glow hero-glow--one" />
            <div class="hero-glow hero-glow--two" />

            <div class="d-flex flex-column flex-lg-row align-start align-lg-center justify-space-between ga-4 hero-content">
              <div class="hero-copy">
                <div class="hero-badge mb-3">
                  <v-icon size="18" class="me-2">mdi-cash-multiple</v-icon>
                  Payment management
                </div>

                <div class="text-h4 font-weight-bold hero-title">
                  Manage My Payments
                </div>

                <div class="text-body-1 text-medium-emphasis hero-subtitle">
                  See what you made from event tickets and venue reservations.
                </div>
              </div>

              <div class="d-flex ga-2 flex-wrap hero-chip-group">
                <v-chip color="primary" variant="tonal" size="large" class="hero-chip">
                  <v-icon start size="18">mdi-wallet-outline</v-icon>
                  Total: {{ formatMoney(totalIncome) }}
                </v-chip>

                <v-chip color="success" variant="tonal" size="large" class="hero-chip">
                  <v-icon start size="18">mdi-ticket-confirmation-outline</v-icon>
                  Event: {{ formatMoney(eventIncomeTotal) }}
                </v-chip>

                <v-chip color="info" variant="tonal" size="large" class="hero-chip">
                  <v-icon start size="18">mdi-office-building-outline</v-icon>
                  Venue: {{ formatMoney(venueIncomeTotal) }}
                </v-chip>
              </div>
            </div>
          </v-card>

          <template v-if="!currentUser">
            <v-card rounded="xl" class="pa-6 pa-md-8 login-required-card">
              <div class="empty-state-icon mb-4">
                <v-icon size="34">mdi-lock-outline</v-icon>
              </div>

              <div class="text-h6 font-weight-bold mb-2">Login required</div>

              <div class="text-medium-emphasis mb-5">
                You need to login first to view payments.
              </div>

              <v-btn
                color="primary"
                rounded="lg"
                size="large"
                elevation="0"
                class="action-btn"
                @click="router.push('/O_login')"
              >
                <v-icon start>mdi-login</v-icon>
                Go to login
              </v-btn>
            </v-card>
          </template>

          <template v-else>
            <v-row class="mb-6 stats-grid">
              <v-col cols="12" md="4">
                <v-card rounded="xl" class="pa-5 income-card income-card--total stat-card-lift">
                  <div class="d-flex align-start justify-space-between ga-3 mb-4">
                    <div>
                      <div class="text-overline mb-2 stat-label">Total income</div>
                      <div class="text-h4 font-weight-bold mb-1 stat-value">
                        {{ formatMoney(totalIncome) }}
                      </div>
                      <div class="text-medium-emphasis">
                        Combined event and venue income
                      </div>
                    </div>

                    <div class="metric-icon metric-icon--primary">
                      <v-icon size="24">mdi-wallet-outline</v-icon>
                    </div>
                  </div>

                  <div class="mini-progress-track">
                    <div class="mini-progress-fill mini-progress-fill--primary" :style="{ width: '100%' }" />
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="xl" class="pa-5 income-card income-card--event stat-card-lift">
                  <div class="d-flex align-start justify-space-between ga-3 mb-4">
                    <div>
                      <div class="text-overline mb-2 stat-label">Event income</div>
                      <div class="text-h4 font-weight-bold mb-1 stat-value">
                        {{ formatMoney(eventIncomeTotal) }}
                      </div>
                      <div class="text-medium-emphasis">
                        {{ eventTransactions.length }} ticket payment{{ eventTransactions.length === 1 ? '' : 's' }}
                      </div>
                    </div>

                    <div class="metric-icon metric-icon--success">
                      <v-icon size="24">mdi-ticket-percent-outline</v-icon>
                    </div>
                  </div>

                  <div class="mini-progress-track">
                    <div
                      class="mini-progress-fill mini-progress-fill--success"
                      :style="{ width: totalIncome > 0 ? `${(eventIncomeTotal / totalIncome) * 100}%` : '0%' }"
                    />
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="xl" class="pa-5 income-card income-card--venue stat-card-lift">
                  <div class="d-flex align-start justify-space-between ga-3 mb-4">
                    <div>
                      <div class="text-overline mb-2 stat-label">Venue income</div>
                      <div class="text-h4 font-weight-bold mb-1 stat-value">
                        {{ formatMoney(venueIncomeTotal) }}
                      </div>
                      <div class="text-medium-emphasis">
                        {{ venueTransactions.length }} venue reservation{{ venueTransactions.length === 1 ? '' : 's' }}
                      </div>
                    </div>

                    <div class="metric-icon metric-icon--info">
                      <v-icon size="24">mdi-home-city-outline</v-icon>
                    </div>
                  </div>

                  <div class="mini-progress-track">
                    <div
                      class="mini-progress-fill mini-progress-fill--info"
                      :style="{ width: totalIncome > 0 ? `${(venueIncomeTotal / totalIncome) * 100}%` : '0%' }"
                    />
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-card rounded="xl" class="pa-4 pa-md-6 content-main-card">
              <div class="d-flex flex-column flex-lg-row align-start align-lg-center justify-space-between ga-3 mb-5 section-topbar">
                <div>
                  <div class="text-h6 font-weight-bold">Income overview</div>
                  <div class="text-medium-emphasis">
                    Review all payments grouped by events and venues.
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap summary-pill-group">
                  <v-chip variant="outlined" rounded="lg" class="summary-chip">
                    <v-icon start size="16">mdi-format-list-bulleted-square</v-icon>
                    {{ eventGroups.length + venueGroups.length }} groups
                  </v-chip>

                  <v-chip variant="outlined" rounded="lg" class="summary-chip">
                    <v-icon start size="16">mdi-swap-horizontal</v-icon>
                    {{ eventTransactions.length + venueTransactions.length }} transactions
                  </v-chip>
                </div>
              </div>

              <v-tabs
                v-model="tab"
                color="primary"
                class="mb-6 payments-tabs"
                slider-size="3"
                grow
              >
                <v-tab value="events" rounded="lg" class="tab-pill">
                  <v-icon start size="18">mdi-ticket-confirmation-outline</v-icon>
                  Events
                </v-tab>

                <v-tab value="venues" rounded="lg" class="tab-pill">
                  <v-icon start size="18">mdi-office-building-outline</v-icon>
                  Venues
                </v-tab>
              </v-tabs>

              <v-window v-model="tab" class="payments-window">
                <v-window-item value="events">
                  <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3 mb-5">
                    <div>
                      <div class="text-h6 font-weight-bold">Event earnings</div>
                      <div class="text-medium-emphasis">
                        Ticket purchases paid to you.
                      </div>
                    </div>

                    <v-text-field
                      v-model="eventSearch"
                      prepend-inner-icon="mdi-magnify"
                      label="Search events"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                      max-width="340"
                      rounded="xl"
                      class="search-field"
                      clearable
                    />
                  </div>

                  <v-row v-if="filteredEventGroups.length">
                    <v-col
                      v-for="group in filteredEventGroups"
                      :key="group.id"
                      cols="12"
                      md="6"
                      xl="4"
                    >
                      <v-card rounded="xl" variant="outlined" class="pa-4 payment-group-card card-lift">
                        <div class="d-flex align-start justify-space-between ga-3 mb-3">
                          <div class="min-w-0">
                            <div class="d-flex align-center ga-2 mb-1">
                              <div class="card-badge card-badge--success">
                                <v-icon size="14">mdi-ticket-outline</v-icon>
                              </div>
                              <div class="text-subtitle-1 font-weight-bold text-truncate">
                                {{ group.title }}
                              </div>
                            </div>

                            <div class="text-caption text-medium-emphasis">
                              {{ group.city || 'Unknown city' }}
                            </div>
                          </div>

                          <v-chip color="success" variant="tonal" class="amount-chip">
                            {{ formatMoney(group.total) }}
                          </v-chip>
                        </div>

                        <div class="group-stat-row">
                          <span>Transactions</span>
                          <strong>{{ group.transactions.length }}</strong>
                        </div>

                        <div class="group-stat-row">
                          <span>Tickets sold here</span>
                          <strong>{{ group.ticketCount }}</strong>
                        </div>

                        <div class="group-stat-row">
                          <span>Latest payment</span>
                          <strong>{{ group.latestDateLabel }}</strong>
                        </div>

                        <v-btn
                          block
                          class="mt-4 action-btn"
                          color="primary"
                          variant="outlined"
                          rounded="lg"
                          size="large"
                          @click="openTransactionHistory('event', group)"
                        >
                          <v-icon start>mdi-history</v-icon>
                          View transaction history
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-card v-else rounded="xl" variant="outlined" class="pa-6 pa-md-8 text-center empty-card">
                    <div class="empty-state-icon empty-state-icon--success mb-4">
                      <v-icon size="34">mdi-ticket-off-outline</v-icon>
                    </div>

                    <div class="text-subtitle-1 font-weight-bold mb-2">No event income found</div>

                    <div class="text-medium-emphasis">
                      There are no event ticket payments matching your current view.
                    </div>
                  </v-card>
                </v-window-item>

                <v-window-item value="venues">
                  <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3 mb-5">
                    <div>
                      <div class="text-h6 font-weight-bold">Venue earnings</div>
                      <div class="text-medium-emphasis">
                        Payments from users reserving your venues.
                      </div>
                    </div>

                    <v-text-field
                      v-model="venueSearch"
                      prepend-inner-icon="mdi-magnify"
                      label="Search venues"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                      max-width="340"
                      rounded="xl"
                      class="search-field"
                      clearable
                    />
                  </div>

                  <v-row v-if="filteredVenueGroups.length">
                    <v-col
                      v-for="group in filteredVenueGroups"
                      :key="group.id"
                      cols="12"
                      md="6"
                      xl="4"
                    >
                      <v-card rounded="xl" variant="outlined" class="pa-4 payment-group-card card-lift">
                        <div class="d-flex align-start justify-space-between ga-3 mb-3">
                          <div class="min-w-0">
                            <div class="d-flex align-center ga-2 mb-1">
                              <div class="card-badge card-badge--info">
                                <v-icon size="14">mdi-home-city-outline</v-icon>
                              </div>
                              <div class="text-subtitle-1 font-weight-bold text-truncate">
                                {{ group.title }}
                              </div>
                            </div>

                            <div class="text-caption text-medium-emphasis">
                              {{ group.city || 'Unknown city' }}
                            </div>
                          </div>

                          <v-chip color="info" variant="tonal" class="amount-chip">
                            {{ formatMoney(group.total) }}
                          </v-chip>
                        </div>

                        <div class="group-stat-row">
                          <span>Transactions</span>
                          <strong>{{ group.transactions.length }}</strong>
                        </div>

                        <div class="group-stat-row">
                          <span>Reserved hours</span>
                          <strong>{{ group.totalHours }}</strong>
                        </div>

                        <div class="group-stat-row">
                          <span>Latest payment</span>
                          <strong>{{ group.latestDateLabel }}</strong>
                        </div>

                        <v-btn
                          block
                          class="mt-4 action-btn"
                          color="primary"
                          variant="outlined"
                          rounded="lg"
                          size="large"
                          @click="openTransactionHistory('venue', group)"
                        >
                          <v-icon start>mdi-history</v-icon>
                          View transaction history
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-card v-else rounded="xl" variant="outlined" class="pa-6 pa-md-8 text-center empty-card">
                    <div class="empty-state-icon empty-state-icon--info mb-4">
                      <v-icon size="34">mdi-home-remove-outline</v-icon>
                    </div>

                    <div class="text-subtitle-1 font-weight-bold mb-2">No venue income found</div>

                    <div class="text-medium-emphasis">
                      There are no venue reservation payments matching your current view.
                    </div>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-card>
          </template>
        </v-col>
      </v-row>

      <v-dialog v-model="historyDialog.show" max-width="860" transition="dialog-bottom-transition">
        <v-card rounded="xl" class="history-dialog-card">
          <v-card-title class="d-flex align-center justify-space-between ga-3 dialog-header">
            <div class="min-w-0">
              <div class="text-h6 font-weight-bold text-truncate">
                {{ historyDialog.title }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ historyDialog.subtitle }}
              </div>
            </div>

            <v-btn icon variant="text" class="close-btn" @click="historyDialog.show = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4 pa-md-6">
            <div v-if="historyDialog.transactions.length" class="history-list">
              <v-card
                v-for="item in historyDialog.transactions"
                :key="item.id"
                rounded="xl"
                variant="outlined"
                class="pa-4 history-item-card"
              >
                <div class="d-flex flex-column flex-md-row justify-space-between align-start ga-3">
                  <div class="min-w-0">
                    <div class="d-flex align-center ga-2 mb-1">
                      <div
                        class="card-badge"
                        :class="item.kind === 'event' ? 'card-badge--success' : 'card-badge--info'"
                      >
                        <v-icon size="14">
                          {{ item.kind === 'event' ? 'mdi-ticket-outline' : 'mdi-home-city-outline' }}
                        </v-icon>
                      </div>

                      <div class="text-subtitle-1 font-weight-bold">
                        {{ item.mainTitle }}
                      </div>
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-1">
                      {{ item.secondary }}
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      {{ item.dateLabel }}
                    </div>
                  </div>

                  <div class="text-left text-md-right amount-side">
                    <div class="text-h6 font-weight-bold text-success amount-positive">
                      +{{ formatMoney(item.amount) }}
                    </div>

                    <v-chip
                      size="small"
                      :color="item.kind === 'event' ? 'success' : 'info'"
                      variant="tonal"
                      class="mt-1"
                    >
                      {{ item.kind === 'event' ? 'Event payment' : 'Venue payment' }}
                    </v-chip>
                  </div>
                </div>
              </v-card>
            </div>

            <div v-else class="text-center py-8 text-medium-emphasis">
              No transactions found.
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_Current_User, is_Moderator } from "@/dataModel/user"
import { get_All_Reservations } from "@/dataModel/reservation"
import { get_All_Venue_Reservations } from "@/dataModel/venue_reservation"
import { get_All_Events, get_Event_By_Id } from "@/dataModel/event"
import { get_All_Venues, get_Venue_By_Id } from "@/dataModel/venue"

const router = useRouter()
const theme = useTheme()

const tab = ref("events")
const eventSearch = ref("")
const venueSearch = ref("")
const currentUser = ref(get_Current_User())
const prefersDark = ref(false)

const historyDialog = ref({
  show: false,
  title: "",
  subtitle: "",
  transactions: [],
})

let mediaQuery = null

function applyBrowserThemePreference() {
  if (typeof window === "undefined" || !window.matchMedia) return
  prefersDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
  theme.global.name.value = prefersDark.value ? "dark" : "light"
}

function handleThemePreferenceChange(event) {
  prefersDark.value = event.matches
  theme.global.name.value = event.matches ? "dark" : "light"
}

onMounted(() => {
  if (typeof window !== "undefined" && window.matchMedia) {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    applyBrowserThemePreference()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleThemePreferenceChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleThemePreferenceChange)
    }
  }
})

onBeforeUnmount(() => {
  if (!mediaQuery) return

  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener("change", handleThemePreferenceChange)
  } else if (mediaQuery.removeListener) {
    mediaQuery.removeListener(handleThemePreferenceChange)
  }
})

watch(
  () => tab.value,
  () => {
    if (tab.value === "events") {
      venueSearch.value = venueSearch.value
    }

    if (tab.value === "venues") {
      eventSearch.value = eventSearch.value
    }
  }
)

function formatMoney(value) {
  return `${Number(value || 0).toFixed(2)} TND`
}

function formatDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString()
}

const browserThemeClass = computed(() => {
  return prefersDark.value ? "browser-theme-dark" : "browser-theme-light"
})

const allEvents = computed(() => get_All_Events())
const allVenues = computed(() => get_All_Venues())

const eventTransactions = computed(() => {
  const user = currentUser.value
  if (!user) return []

  return get_All_Reservations()
    .filter(item => item.payment && item.status !== "Cancelled")
    .filter(item => {
      const event = get_Event_By_Id(item.event_id)
      if (!event) return false

      if (is_Moderator(user) && !event.creator_user_id) {
        return true
      }

      return event.creator_user_id === user.id || item.recipient_user_id === user.id
    })
    .map(item => {
      const event = get_Event_By_Id(item.event_id)

      return {
        id: item.id,
        kind: "event",
        amount: Number(item.total_price || 0),
        dateLabel: formatDate(item.created_at),
        createdAt: new Date(item.created_at).getTime() || 0,
        item,
        event,
        eventId: event?.id || item.event_id || "unknown-event",
        groupTitle: event?.title || item.event_title || "Unknown event",
        city: event?.city || item.city || "",
        mainTitle: `${item.ticket_count || 0} ticket${Number(item.ticket_count || 0) === 1 ? "" : "s"} bought`,
        secondary: `${event?.title || item.event_title || "Unknown event"} • ${item.event_date || ""} ${item.event_time || ""}`.trim(),
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
})

const venueTransactions = computed(() => {
  const user = currentUser.value
  if (!user) return []

  return get_All_Venue_Reservations()
    .filter(item => item.payment && item.status !== "Cancelled")
    .filter(item => {
      const venue = get_Venue_By_Id(item.venue_id)
      if (!venue) return false

      if (is_Moderator(user) && !venue.owner_user_id) {
        return true
      }

      return venue.owner_user_id === user.id || item.paid_to_user_id === user.id
    })
    .map(item => {
      const venue = get_Venue_By_Id(item.venue_id)

      return {
        id: item.id,
        kind: "venue",
        amount: Number(item.total_price || 0),
        dateLabel: formatDate(item.created_at),
        createdAt: new Date(item.created_at).getTime() || 0,
        item,
        venue,
        venueId: venue?.id || item.venue_id || "unknown-venue",
        groupTitle: venue?.title || "Unknown venue",
        city: venue?.location || "",
        mainTitle: `${venue?.title || "Venue"} reserved`,
        secondary: `${formatDate(item.start_datetime)} → ${formatDate(item.end_datetime)} • ${item.duration_hours || item.duration || 0}h`,
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
})

const eventIncomeTotal = computed(() => {
  return eventTransactions.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
})

const venueIncomeTotal = computed(() => {
  return venueTransactions.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
})

const totalIncome = computed(() => {
  return eventIncomeTotal.value + venueIncomeTotal.value
})

const eventGroups = computed(() => {
  const map = {}

  eventTransactions.value.forEach(tx => {
    if (!map[tx.eventId]) {
      map[tx.eventId] = {
        id: tx.eventId,
        title: tx.groupTitle,
        city: tx.city,
        total: 0,
        ticketCount: 0,
        latestCreatedAt: 0,
        latestDateLabel: "-",
        transactions: [],
      }
    }

    map[tx.eventId].transactions.push(tx)
    map[tx.eventId].total += Number(tx.amount || 0)
    map[tx.eventId].ticketCount += Number(tx.item?.ticket_count || 0)

    if (tx.createdAt > map[tx.eventId].latestCreatedAt) {
      map[tx.eventId].latestCreatedAt = tx.createdAt
      map[tx.eventId].latestDateLabel = tx.dateLabel
    }
  })

  return Object.values(map).sort((a, b) => b.total - a.total)
})

const venueGroups = computed(() => {
  const map = {}

  venueTransactions.value.forEach(tx => {
    if (!map[tx.venueId]) {
      map[tx.venueId] = {
        id: tx.venueId,
        title: tx.groupTitle,
        city: tx.city,
        total: 0,
        totalHours: 0,
        latestCreatedAt: 0,
        latestDateLabel: "-",
        transactions: [],
      }
    }

    map[tx.venueId].transactions.push(tx)
    map[tx.venueId].total += Number(tx.amount || 0)
    map[tx.venueId].totalHours += Number(tx.item?.duration_hours || tx.item?.duration || 0)

    if (tx.createdAt > map[tx.venueId].latestCreatedAt) {
      map[tx.venueId].latestCreatedAt = tx.createdAt
      map[tx.venueId].latestDateLabel = tx.dateLabel
    }
  })

  return Object.values(map).sort((a, b) => b.total - a.total)
})

const filteredEventGroups = computed(() => {
  const q = eventSearch.value.trim().toLowerCase()
  if (!q) return eventGroups.value

  return eventGroups.value.filter(group =>
    group.title.toLowerCase().includes(q) ||
    String(group.city || "").toLowerCase().includes(q)
  )
})

const filteredVenueGroups = computed(() => {
  const q = venueSearch.value.trim().toLowerCase()
  if (!q) return venueGroups.value

  return venueGroups.value.filter(group =>
    group.title.toLowerCase().includes(q) ||
    String(group.city || "").toLowerCase().includes(q)
  )
})

function openTransactionHistory(type, group) {
  historyDialog.value = {
    show: true,
    title: type === "event" ? `Event history — ${group.title}` : `Venue history — ${group.title}`,
    subtitle: `Total: ${formatMoney(group.total)} • Transactions: ${group.transactions.length}`,
    transactions: group.transactions,
  }
}
</script>

<style scoped>
.payments-page-shell {
  min-height: 100vh;
  transition: background 0.3s ease, color 0.3s ease;
}

.browser-theme-dark {
  background:
    radial-gradient(circle at top right, rgba(76, 110, 245, 0.14), transparent 28%),
    radial-gradient(circle at top left, rgba(0, 188, 212, 0.09), transparent 24%),
    linear-gradient(180deg, rgba(10, 15, 25, 0.98), rgba(7, 10, 18, 1));
}

.browser-theme-light {
  background:
    radial-gradient(circle at top right, rgba(76, 110, 245, 0.08), transparent 28%),
    radial-gradient(circle at top left, rgba(33, 150, 243, 0.06), transparent 22%),
    linear-gradient(180deg, #f7f9fe 0%, #eef3fb 100%);
}

.payments-page {
  min-height: 100vh;
}

.page-hero-card {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(135deg, rgba(87, 163, 255, 0.14), rgba(87, 163, 255, 0.04)),
    rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.14);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 26px;
}

.hero-copy {
  max-width: 720px;
}

.hero-title {
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero-subtitle {
  max-width: 680px;
}

.hero-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(87, 163, 255, 0.12);
  border: 1px solid rgba(87, 163, 255, 0.18);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(60px);
  pointer-events: none;
  z-index: 1;
}

.hero-glow--one {
  width: 180px;
  height: 180px;
  right: -20px;
  top: -30px;
  background: rgba(76, 110, 245, 0.24);
}

.hero-glow--two {
  width: 140px;
  height: 140px;
  left: 16%;
  bottom: -40px;
  background: rgba(0, 188, 212, 0.14);
}

.hero-chip-group {
  align-items: center;
}

.hero-chip {
  font-weight: 700;
  backdrop-filter: blur(6px);
}

.login-required-card,
.content-main-card,
.history-dialog-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.025));
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.1);
}

.section-topbar {
  padding-bottom: 4px;
}

.summary-pill-group {
  align-items: center;
}

.summary-chip {
  font-weight: 600;
}

.stats-grid .v-col {
  display: flex;
}

.income-card {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.stat-card-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
}

.income-card--total {
  background: linear-gradient(135deg, rgba(87, 163, 255, 0.18), rgba(87, 163, 255, 0.06));
}

.income-card--event {
  background: linear-gradient(135deg, rgba(30, 180, 90, 0.18), rgba(30, 180, 90, 0.06));
}

.income-card--venue {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.18), rgba(33, 150, 243, 0.06));
}

.stat-label {
  opacity: 0.9;
  letter-spacing: 0.08em;
}

.stat-value {
  letter-spacing: -0.02em;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon--primary {
  background: rgba(87, 163, 255, 0.14);
  border: 1px solid rgba(87, 163, 255, 0.2);
}

.metric-icon--success {
  background: rgba(30, 180, 90, 0.14);
  border: 1px solid rgba(30, 180, 90, 0.2);
}

.metric-icon--info {
  background: rgba(33, 150, 243, 0.14);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.mini-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.mini-progress-fill--primary {
  background: linear-gradient(90deg, rgba(87, 163, 255, 1), rgba(123, 191, 255, 1));
}

.mini-progress-fill--success {
  background: linear-gradient(90deg, rgba(30, 180, 90, 1), rgba(84, 214, 129, 1));
}

.mini-progress-fill--info {
  background: linear-gradient(90deg, rgba(33, 150, 243, 1), rgba(97, 194, 255, 1));
}

.payments-tabs {
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tab-pill {
  min-height: 48px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.payments-window {
  min-height: 220px;
}

.search-field :deep(.v-field) {
  border-radius: 16px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.search-field :deep(.v-field:hover) {
  box-shadow: 0 0 0 3px rgba(87, 163, 255, 0.06);
}

.payment-group-card {
  height: 100%;
  border-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(255, 255, 255, 0.02);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
  border-color: rgba(87, 163, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.035);
}

.card-badge {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-badge--success {
  background: rgba(30, 180, 90, 0.14);
  border: 1px solid rgba(30, 180, 90, 0.2);
}

.card-badge--info {
  background: rgba(33, 150, 243, 0.14);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.amount-chip {
  font-weight: 700;
}

.group-stat-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.group-stat-row span {
  color: rgba(255, 255, 255, 0.72);
}

.group-stat-row strong {
  text-align: right;
  font-weight: 700;
}

.group-stat-row:last-of-type {
  border-bottom: none;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-item-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.08) !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.history-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.035);
}

.amount-side {
  min-width: 150px;
}

.amount-positive {
  letter-spacing: -0.01em;
}

.dialog-header {
  padding: 18px 20px;
}

.close-btn {
  flex-shrink: 0;
}

.empty-card {
  background: rgba(255, 255, 255, 0.02);
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  margin-inline: auto;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(87, 163, 255, 0.12);
  border: 1px solid rgba(87, 163, 255, 0.18);
}

.empty-state-icon--success {
  background: rgba(30, 180, 90, 0.12);
  border: 1px solid rgba(30, 180, 90, 0.18);
}

.empty-state-icon--info {
  background: rgba(33, 150, 243, 0.12);
  border: 1px solid rgba(33, 150, 243, 0.18);
}

.action-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.min-w-0 {
  min-width: 0;
}

.browser-theme-light .page-hero-card,
.browser-theme-light .login-required-card,
.browser-theme-light .content-main-card,
.browser-theme-light .history-dialog-card,
.browser-theme-light .payment-group-card,
.browser-theme-light .history-item-card,
.browser-theme-light .empty-card {
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.browser-theme-light .hero-badge {
  background: rgba(76, 110, 245, 0.08);
  border-color: rgba(76, 110, 245, 0.14);
}

.browser-theme-light .payments-tabs {
  background: rgba(15, 23, 42, 0.02);
  border-color: rgba(15, 23, 42, 0.08);
}

.browser-theme-light .group-stat-row {
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.browser-theme-light .group-stat-row span {
  color: rgba(15, 23, 42, 0.68);
}

.browser-theme-light .mini-progress-track {
  background: rgba(15, 23, 42, 0.08);
}

.browser-theme-light .payment-group-card,
.browser-theme-light .history-item-card,
.browser-theme-light .empty-card {
  background: rgba(255, 255, 255, 0.76);
}

.browser-theme-light .page-hero-card {
  background:
    linear-gradient(135deg, rgba(87, 163, 255, 0.12), rgba(87, 163, 255, 0.03)),
    rgba(255, 255, 255, 0.86);
}

.browser-theme-light .login-required-card,
.browser-theme-light .content-main-card,
.browser-theme-light .history-dialog-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.88));
}

@media (max-width: 959px) {
  .hero-content {
    padding: 22px;
  }

  .stat-value {
    font-size: 1.8rem !important;
  }
}

@media (max-width: 600px) {
  .hero-content {
    padding: 18px;
  }

  .hero-title {
    font-size: 1.8rem !important;
  }

  .dialog-header {
    padding: 16px;
  }

  .amount-side {
    min-width: 0;
  }
}
</style>