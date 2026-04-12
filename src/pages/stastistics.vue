<template>
  <AppNavbar />

  <v-container
    fluid
    class="statistics-page px-3 px-md-6"
    :class="[browserThemeClass, { 'theme-ready': themeReady }]"
    :theme="browserThemeName"
  >
    <div class="statistics-page-inner">
      <div class="page-bg-orb orb-one"></div>
      <div class="page-bg-orb orb-two"></div>
      <div class="page-bg-grid"></div>

      <div class="statistics-content-wrap">
        <v-row justify="center" align="start" class="ma-0 statistics-root-row">
        <v-col cols="12" xxl="11" class="pa-0 statistics-root-col">
          <v-card class="page-shell pa-4 pa-md-6" :class="{ 'page-shell-mobile': isMobile, 'page-shell-tablet': isTablet, 'page-shell-phone': isPhone }" rounded="xl">
            <div class="page-shell-glow"></div>

            <div class="page-topbar mb-4">
              <div class="page-topbar-pill">
                <v-icon size="16" class="me-2">mdi-chart-timeline-variant</v-icon>
                Blassti analytics workspace
              </div>
            </div>

            <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4 mb-6 page-hero" :class="{ 'page-hero-mobile': isMobile, 'page-hero-phone': isPhone }">
              <div class="hero-copy">
                <div class="text-overline text-primary font-weight-bold mb-1 hero-kicker">
                  ADMIN DASHBOARD
                </div>

                <div class="text-h4 text-md-h3 font-weight-bold hero-title">
                  Site Statistics
                </div>

                <div class="text-medium-emphasis mt-2 hero-subtitle">
                  Clean live overview of Blassti platform activity, growth, and revenue.
                </div>

                <div class="hero-meta mt-4">
                  <div class="hero-meta-chip">
                    <v-icon size="16" class="me-2">mdi-lightning-bolt-outline</v-icon>
                    Fast snapshot
                  </div>
                  <div class="hero-meta-chip">
                    <v-icon size="16" class="me-2">mdi-shield-check-outline</v-icon>
                    Admin insights
                  </div>
                  <div class="hero-meta-chip">
                    <v-icon size="16" class="me-2">mdi-theme-light-dark</v-icon>
                    Browser-aware theme
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap ga-2 align-center hero-actions">
                <v-chip
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-clock-outline"
                  class="hero-chip"
                >
                  Updated {{ nowLabel }}
                </v-chip>

                <v-chip
                  color="success"
                  variant="tonal"
                  prepend-icon="mdi-cash-multiple"
                  class="hero-chip"
                >
                  Revenue {{ money(stats.overview.totalRevenue) }}
                </v-chip>

                <v-chip
                  :color="browserThemeName === 'dark' ? 'indigo' : 'blue'"
                  variant="tonal"
                  prepend-icon="mdi-monitor"
                  class="hero-chip"
                >
                  {{ browserThemeName === "dark" ? "Dark mode" : "Light mode" }}
                </v-chip>

                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-refresh"
                  rounded="lg"
                  class="refresh-btn"
                  @click="refreshStats"
                >
                  Refresh
                </v-btn>
              </div>
            </div>

            <v-alert
              v-if="!isAdmin"
              type="warning"
              variant="tonal"
              border="start"
              class="mb-6 access-alert"
            >
              This page is intended for admins. You can still preview the UI, but access logic should stay admin-only.
            </v-alert>

            <div class="section-label mb-3">
              <span class="section-label-line"></span>
              <span class="section-label-text">Overview</span>
            </div>

            <v-row class="mb-2 overview-stats-row" dense>
              <v-col
                v-for="card in stats.cards"
                :key="card.id"
                cols="12"
                sm="6"
                xl="4"
              >
                <v-card
                  class="stat-card h-100"
                  rounded="xl"
                  :color="card.color"
                  variant="tonal"
                  :ripple="true"
                  @click="openDetail(card.id)"
                >
                  <div class="stat-card-glow"></div>

                  <v-card-text class="pa-5">
                    <div class="d-flex align-start justify-space-between ga-3">
                      <div class="stat-copy">
                        <div class="text-body-2 text-medium-emphasis mb-2 stat-title">
                          {{ card.title }}
                        </div>

                        <div class="text-h4 font-weight-bold mb-1 stat-value">
                          {{ card.currency ? money(card.value) : formatValue(card.value) }}
                        </div>

                        <div class="text-body-2 text-medium-emphasis stat-subtitle">
                          {{ card.subtitle }}
                        </div>
                      </div>

                      <v-avatar size="54" class="stat-avatar">
                        <v-icon size="28">{{ card.icon }}</v-icon>
                      </v-avatar>
                    </div>

                    <div class="d-flex align-center justify-space-between mt-6 stat-footer">
                      <span class="text-caption text-medium-emphasis">
                        Click for full charts
                      </span>
                      <v-icon size="18" class="stat-arrow">mdi-arrow-top-right</v-icon>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="section-label mt-5 mb-3">
              <span class="section-label-line"></span>
              <span class="section-label-text">Revenue Analytics</span>
            </div>

            <v-row dense class="mt-2 revenue-analytics-row" :class="{ 'revenue-analytics-row-mobile': isMobile, 'revenue-analytics-row-phone': isPhone }">
              <v-col cols="12" lg="8" class="revenue-main-col">
                <v-card rounded="xl" class="glass-card h-100 chart-card revenue-main-card">
                  <v-card-text class="pa-5 pa-md-6">
                    <div class="d-flex align-center justify-space-between mb-4 chart-header ga-3 flex-wrap" :class="{ 'chart-header-mobile': isMobile, 'chart-header-phone': isPhone }">
                      <div>
                        <div class="text-h6 font-weight-bold chart-title">Revenue Trend</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Monthly Blassti fee revenue across tickets and venue bookings
                        </div>
                      </div>

                      <v-chip color="success" variant="tonal" class="chart-chip">
                        {{ money(stats.overview.totalRevenue) }}
                      </v-chip>
                    </div>

                    <LineChart
                      :points="stats.details.totalRevenue.line"
                      :currency="true"
                      :height="isPhone ? 238 : isTablet ? 270 : 290"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="4" class="revenue-side-col">
                <v-card rounded="xl" class="glass-card h-100 chart-card">
                  <v-card-text class="pa-5 pa-md-6">
                    <div class="text-h6 font-weight-bold mb-1 chart-title">
                      Revenue Split
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-5 chart-subtitle">
                      Where Blassti revenue is coming from
                    </div>

                    <DonutChart
                      :items="stats.details.totalRevenue.bars.map((item, index) => ({
                        ...item,
                        color: donutPalette[index % donutPalette.length],
                      }))"
                      center-label="Revenue"
                      :center-value="money(stats.overview.totalRevenue)"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="section-label mt-5 mb-3">
              <span class="section-label-line"></span>
              <span class="section-label-text">Quick Insights</span>
            </div>

            <v-row dense class="mt-2">
              <v-col cols="12" md="6" xl="3">
                <MiniInsightCard
                  title="Pending Venue Requests"
                  :value="stats.overview.pendingVenueRequests"
                  subtitle="Waiting admin review"
                  icon="mdi-file-document-clock-outline"
                  color="warning"
                />
              </v-col>

              <v-col cols="12" md="6" xl="3">
                <MiniInsightCard
                  title="Ticket Reservations"
                  :value="stats.overview.totalTicketReservations"
                  subtitle="Across all events"
                  icon="mdi-ticket-outline"
                  color="primary"
                />
              </v-col>

              <v-col cols="12" md="6" xl="3">
                <MiniInsightCard
                  title="Venue Reservations"
                  :value="stats.overview.totalVenueReservations"
                  subtitle="Paid and active bookings"
                  icon="mdi-calendar-check-outline"
                  color="deep-purple-accent-4"
                />
              </v-col>

              <v-col cols="12" md="6" xl="3">
                <MiniInsightCard
                  title="Current Carpools"
                  :value="stats.overview.currentCarpools"
                  subtitle="Active ride offers"
                  icon="mdi-car-multiple"
                  color="teal"
                />
              </v-col>
            </v-row>

            <div class="section-label mt-5 mb-3">
              <span class="section-label-line"></span>
              <span class="section-label-text">Audience & Events</span>
            </div>

            <v-row dense class="mt-2">
              <v-col cols="12" lg="6">
                <v-card rounded="xl" class="glass-card h-100 chart-card">
                  <v-card-text class="pa-5 pa-md-6">
                    <div class="d-flex align-center justify-space-between mb-4 chart-header ga-3 flex-wrap">
                      <div>
                        <div class="text-h6 font-weight-bold chart-title">Users by Age</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Account distribution based on date of birth
                        </div>
                      </div>

                      <v-btn
                        size="small"
                        variant="text"
                        color="primary"
                        class="inline-action-btn"
                        @click="openDetail('users')"
                      >
                        Full view
                      </v-btn>
                    </div>

                    <BarChart
                      :items="stats.details.users.bars"
                      height="300"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6">
                <v-card rounded="xl" class="glass-card h-100 chart-card">
                  <v-card-text class="pa-5 pa-md-6">
                    <div class="d-flex align-center justify-space-between mb-4 chart-header ga-3 flex-wrap">
                      <div>
                        <div class="text-h6 font-weight-bold chart-title">Events by Type</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Platform activity by event category
                        </div>
                      </div>

                      <v-btn
                        size="small"
                        variant="text"
                        color="primary"
                        class="inline-action-btn"
                        @click="openDetail('events')"
                      >
                        Full view
                      </v-btn>
                    </div>

                    <BarChart
                      :items="stats.details.events.bars"
                      height="300"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="section-label mt-5 mb-3">
              <span class="section-label-line"></span>
              <span class="section-label-text">Performance Highlights</span>
            </div>

            <v-row dense class="mt-2">
              <v-col cols="12" lg="6">
                <v-card rounded="xl" class="glass-card h-100 chart-card">
                  <v-card-text class="pa-5 pa-md-6">
                    <div class="d-flex align-center justify-space-between mb-4 chart-header ga-3 flex-wrap">
                      <div>
                        <div class="text-h6 font-weight-bold chart-title">Top Events by Tickets Sold</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Highest-demand events on the platform
                        </div>
                      </div>

                      <v-btn
                        size="small"
                        variant="text"
                        color="primary"
                        class="inline-action-btn"
                        @click="openDetail('events')"
                      >
                        Full view
                      </v-btn>
                    </div>

                    <RankList :items="stats.details.events.topList" suffix="tickets" />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6">
                <v-card rounded="xl" class="glass-card h-100 chart-card">
                  <v-card-text class="pa-5 pa-md-6">
                    <div class="d-flex align-center justify-space-between mb-4 chart-header ga-3 flex-wrap">
                      <div>
                        <div class="text-h6 font-weight-bold chart-title">Latest Revenue Entries</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Most recent ticket and venue fee activity
                        </div>
                      </div>

                      <v-btn
                        size="small"
                        variant="text"
                        color="primary"
                        class="inline-action-btn"
                        @click="openDetail('totalRevenue')"
                      >
                        Full view
                      </v-btn>
                    </div>

                    <RevenueList :items="stats.details.totalRevenue.ledger.slice(0, 8)" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        </v-row>
      </div>
    </div>

    <v-dialog
      v-model="detailDialog"
      max-width="1320"
      scrollable
      :fullscreen="isMobile"
      :theme="browserThemeName"
      transition="dialog-bottom-transition"
      content-class="analytics-dialog-content"
    >
      <v-card rounded="xl" class="detail-dialog-card">
        <div class="detail-dialog-top-glow"></div>

        <v-card-title class="px-5 px-md-6 pt-5 pt-md-6 pb-4 d-flex align-center justify-space-between detail-titlebar">
          <div class="detail-title-wrap">
            <div class="detail-title-badge">
              <v-icon size="15" class="me-2">mdi-chart-areaspline</v-icon>
              Detailed analytics
            </div>

            <div class="text-h5 font-weight-bold mt-3 detail-main-title">
              {{ detailTitle }}
            </div>

            <div class="text-body-2 text-medium-emphasis mt-2 detail-title-subtitle">
              A richer breakdown with trends, distribution, category comparisons, and performance highlights.
            </div>
          </div>

          <v-btn icon variant="text" class="detail-close-btn" @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <div class="detail-header-divider"></div>

        <v-card-text class="px-5 px-md-6 py-5 detail-dialog-body">
          <template v-if="activeDetail">
            <div class="detail-section-banner mb-5">
              <div class="detail-section-banner-icon">
                <v-icon size="20">{{ getDetailMeta(activeDetailKey).icon }}</v-icon>
              </div>

              <div class="detail-section-banner-copy">
                <div class="detail-section-banner-title">
                  {{ getDetailMeta(activeDetailKey).label }}
                </div>
                <div class="detail-section-banner-text">
                  {{ getDetailMeta(activeDetailKey).description }}
                </div>
              </div>
            </div>

            <v-row dense class="mb-4">
              <v-col
                v-for="(value, key) in activeDetail.summary"
                :key="key"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card rounded="xl" class="mini-stat detail-summary-card">
                  <div class="detail-summary-card-glow"></div>
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center justify-space-between ga-3 mb-3">
                      <div class="text-caption text-medium-emphasis text-uppercase detail-summary-label">
                        {{ prettifyKey(key) }}
                      </div>
                      <v-avatar size="34" class="detail-summary-avatar">
                        <v-icon size="18">{{ getSummaryIcon(key) }}</v-icon>
                      </v-avatar>
                    </div>

                    <div class="text-h5 font-weight-bold mt-1 detail-summary-value">
                      {{ isMoneySummaryKey(key) ? money(value) : formatValue(value) }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" lg="8" v-if="activeDetail.line?.length">
                <v-card rounded="xl" class="glass-card chart-card detail-chart-card h-100">
                  <v-card-text class="pa-5">
                    <div class="detail-card-topline mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold mb-1 chart-title">Trend</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Timeline view
                        </div>
                      </div>
                      <v-chip color="primary" variant="tonal" class="detail-card-chip">
                        Live history
                      </v-chip>
                    </div>

                    <LineChart
                      :points="activeDetail.line"
                      :currency="activeDetailKey.includes('Revenue')"
                      height="320"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" :lg="activeDetail.line?.length ? 4 : 6" v-if="activeDetail.donut?.length">
                <v-card rounded="xl" class="glass-card chart-card detail-chart-card h-100">
                  <v-card-text class="pa-5">
                    <div class="detail-card-topline mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold mb-1 chart-title">Distribution</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Share breakdown
                        </div>
                      </div>
                      <v-chip color="secondary" variant="tonal" class="detail-card-chip">
                        Breakdown
                      </v-chip>
                    </div>

                    <DonutChart
                      :items="activeDetail.donut"
                      center-label="Total"
                      :center-value="getDonutCenterValue(activeDetail)"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" :lg="!activeDetail.line?.length && !activeDetail.donut?.length ? 12 : 6" v-if="activeDetail.bars?.length">
                <v-card rounded="xl" class="glass-card chart-card detail-chart-card h-100">
                  <v-card-text class="pa-5">
                    <div class="detail-card-topline mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold mb-1 chart-title">Main Breakdown</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Category comparison
                        </div>
                      </div>
                      <v-chip color="info" variant="tonal" class="detail-card-chip">
                        Key split
                      </v-chip>
                    </div>

                    <BarChart
                      :items="activeDetail.bars"
                      :currency="activeDetailKey.includes('Revenue')"
                      height="320"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6" v-if="activeDetail.secondaryBars?.length">
                <v-card rounded="xl" class="glass-card chart-card detail-chart-card h-100">
                  <v-card-text class="pa-5">
                    <div class="detail-card-topline mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold mb-1 chart-title">Secondary Breakdown</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Additional comparison data
                        </div>
                      </div>
                      <v-chip color="deep-purple" variant="tonal" class="detail-card-chip">
                        Extra view
                      </v-chip>
                    </div>

                    <BarChart
                      :items="activeDetail.secondaryBars"
                      height="320"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6" v-if="activeDetail.topList?.length">
                <v-card rounded="xl" class="glass-card chart-card detail-chart-card h-100">
                  <v-card-text class="pa-5">
                    <div class="detail-card-topline mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold mb-1 chart-title">Top Items</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Highest performers
                        </div>
                      </div>
                      <v-chip color="success" variant="tonal" class="detail-card-chip">
                        Top ranked
                      </v-chip>
                    </div>

                    <RankList
                      :items="activeDetail.topList"
                      :suffix="activeDetailKey === 'events' ? 'tickets' : 'capacity'"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" v-if="activeDetail.ledger?.length">
                <v-card rounded="xl" class="glass-card chart-card detail-chart-card">
                  <v-card-text class="pa-5">
                    <div class="detail-card-topline mb-4">
                      <div>
                        <div class="text-h6 font-weight-bold mb-1 chart-title">Revenue Entries</div>
                        <div class="text-body-2 text-medium-emphasis chart-subtitle">
                          Recent fee records saved in local storage
                        </div>
                      </div>
                      <v-chip color="warning" variant="tonal" class="detail-card-chip">
                        Latest activity
                      </v-chip>
                    </div>

                    <RevenueList :items="activeDetail.ledger" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import { useDisplay, useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_Current_User } from "@/dataModel/user"
import { get_Site_Statistics } from "@/dataModel/statistics"

const donutPalette = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#84cc16",
]

const theme = useTheme()
const display = useDisplay()
const THEME_STORAGE_KEY = "blassti-theme"

const stats = ref(get_Site_Statistics())
const detailDialog = ref(false)
const activeDetailKey = ref("users")
const themeReady = ref(false)

const currentUser = computed(() => get_Current_User())
const isAdmin = computed(() => Boolean(currentUser.value?.is_admin))
const isPhone = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)
const isMobile = computed(() => display.mdAndDown.value)

const browserThemeName = computed(() => (theme.global.name.value === "light" ? "light" : "dark"))
const browserThemeClass = computed(() => (browserThemeName.value === "dark" ? "browser-dark" : "browser-light"))

const nowLabel = computed(() => {
  return new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
})

const detailTitleMap = {
  users: "User Analytics",
  venues: "Venue Analytics",
  events: "Event Analytics",
  ticketRevenue: "Ticket Fee Revenue",
  venueRevenue: "Venue Booking Fee Revenue",
  totalRevenue: "Total Revenue Analytics",
}

const detailMetaMap = {
  users: {
    label: "Audience composition",
    description: "See how users are distributed, how they engage, and where the main growth signals are coming from.",
    icon: "mdi-account-group-outline",
  },
  venues: {
    label: "Venue ecosystem",
    description: "Track availability, venue categories, and how the platform inventory is currently structured.",
    icon: "mdi-office-building-marker-outline",
  },
  events: {
    label: "Event performance",
    description: "Compare event types, popularity, and demand to spot what is performing best on the platform.",
    icon: "mdi-calendar-star-four-points-outline",
  },
  ticketRevenue: {
    label: "Ticket fee performance",
    description: "Understand how ticket-related platform fees contribute to revenue across time and categories.",
    icon: "mdi-ticket-confirmation-outline",
  },
  venueRevenue: {
    label: "Venue booking income",
    description: "Inspect venue reservation fees and see how booking activity drives admin revenue.",
    icon: "mdi-cash-refund",
  },
  totalRevenue: {
    label: "Revenue command center",
    description: "Combine all fee streams into one polished view for a full picture of financial performance.",
    icon: "mdi-cash-multiple",
  },
}

const detailTitle = computed(() => detailTitleMap[activeDetailKey.value] || "Details")
const activeDetail = computed(() => stats.value.details?.[activeDetailKey.value] ?? null)

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
  }
}

function syncThemeFromStorage() {
  if (typeof window === "undefined") return

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    syncThemeFromStorage()
  }
}

onMounted(() => {
  syncThemeFromStorage()

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleWindowStorage)
    window.addEventListener("focus", syncThemeFromStorage)

    nextTick(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    })
  }

  themeReady.value = true
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleWindowStorage)
    window.removeEventListener("focus", syncThemeFromStorage)
  }
})

function refreshStats() {
  stats.value = get_Site_Statistics()
}

function openDetail(key) {
  activeDetailKey.value = key
  refreshStats()
  detailDialog.value = true
}

function formatValue(value) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-US").format(value)
    : value
}

function money(value) {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number(value || 0) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))} TND`
}

function prettifyKey(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
}

function isMoneySummaryKey(key) {
  return String(key).includes("revenue") || String(key).includes("sales")
}

function getDetailMeta(key) {
  return detailMetaMap[key] || {
    label: "Analytics overview",
    description: "Detailed breakdown of current platform data.",
    icon: "mdi-chart-box-outline",
  }
}

function getSummaryIcon(key) {
  const normalizedKey = String(key).toLowerCase()

  if (normalizedKey.includes("revenue") || normalizedKey.includes("sales")) return "mdi-cash-multiple"
  if (normalizedKey.includes("active")) return "mdi-check-decagram-outline"
  if (normalizedKey.includes("pending")) return "mdi-timer-sand"
  if (normalizedKey.includes("owner")) return "mdi-account-tie-outline"
  if (normalizedKey.includes("ticket")) return "mdi-ticket-outline"
  if (normalizedKey.includes("venue")) return "mdi-office-building-outline"
  if (normalizedKey.includes("event")) return "mdi-calendar-outline"
  if (normalizedKey.includes("unavailable")) return "mdi-close-octagon-outline"
  if (normalizedKey.includes("total")) return "mdi-counter"
  return "mdi-chart-box-outline"
}

function getDonutCenterValue(detail) {
  if (activeDetailKey.value === "ticketRevenue") {
    return money(detail.summary.fee_revenue || 0)
  }

  if (activeDetailKey.value === "venueRevenue") {
    return money(detail.summary.fee_revenue || 0)
  }

  if (activeDetailKey.value === "totalRevenue") {
    return money(detail.summary.total_revenue || 0)
  }

  const total = (detail.donut || []).reduce((sum, item) => sum + Number(item.value || 0), 0)
  return formatValue(total)
}

const MiniInsightCard = defineComponent({
  name: "MiniInsightCard",
  props: {
    title: String,
    value: [String, Number],
    subtitle: String,
    icon: String,
    color: String,
  },
  setup(props) {
    return () =>
      h(
        "div",
        { class: "h-100" },
        h(
          "div",
          { class: "mini-insight-card h-100" },
          [
            h("div", { class: "d-flex align-center justify-space-between mb-3" }, [
              h("div", { class: "text-body-2 text-medium-emphasis" }, props.title),
              h("i", { class: `mdi ${props.icon} text-${props.color}` }),
            ]),
            h("div", { class: "text-h5 font-weight-bold mb-1" }, formatValue(props.value)),
            h("div", { class: "text-body-2 text-medium-emphasis" }, props.subtitle),
          ]
        )
      )
  },
})

const LineChart = defineComponent({
  name: "LineChart",
  props: {
    points: { type: Array, default: () => [] },
    height: { type: [String, Number], default: 260 },
    currency: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const items = Array.isArray(props.points) ? props.points : []
      const width = 760
      const height = Number(props.height)
      const paddingX = isPhone.value ? 16 : 28
      const paddingTop = isPhone.value ? 36 : 30
      const paddingBottom = isPhone.value ? 42 : 38
      const chartHeight = height - paddingTop - paddingBottom
      const chartWidth = width - paddingX * 2

      const max = Math.max(...items.map(item => Number(item.value || 0)), 1)
      const min = 0

      const normalized = items.map((item, index) => {
        const x =
          items.length <= 1
            ? paddingX + chartWidth / 2
            : paddingX + (index / (items.length - 1)) * chartWidth

        const value = Number(item.value || 0)
        const ratio = (value - min) / (max - min || 1)
        const y = paddingTop + chartHeight - ratio * chartHeight

        return {
          ...item,
          x,
          y,
          value,
        }
      })

      const polyline = normalized.map(item => `${item.x},${item.y}`).join(" ")
      const gridStroke = browserThemeName.value === "dark" ? "rgba(148,163,184,0.18)" : "rgba(71,85,105,0.18)"
      const labelFill = browserThemeName.value === "dark" ? "rgba(226,232,240,0.76)" : "rgba(15,23,42,0.88)"
      const valueFill = browserThemeName.value === "dark" ? "#f8fafc" : "#0f172a"
      const pointFill = browserThemeName.value === "dark" ? "#0f172a" : "#ffffff"
      const valueFontSize = isPhone.value ? 11 : 12
      const labelFontSize = isPhone.value ? 11 : 12

      return h("div", { class: "line-chart-wrap" }, [
        h(
          "svg",
          {
            viewBox: `0 0 ${width} ${height}`,
            class: "line-chart-svg",
            preserveAspectRatio: "none",
          },
          [
            h("defs", null, [
              h("linearGradient", { id: "lineGradient", x1: "0", y1: "0", x2: "0", y2: "1" }, [
                h("stop", { offset: "0%", "stop-color": "#3b82f6", "stop-opacity": "0.35" }),
                h("stop", { offset: "100%", "stop-color": "#3b82f6", "stop-opacity": "0" }),
              ]),
            ]),

            [0, 0.25, 0.5, 0.75, 1].map((step, index) => {
              const y = paddingTop + chartHeight - chartHeight * step
              return h("line", {
                key: `grid-${index}`,
                x1: paddingX,
                y1: y,
                x2: width - paddingX,
                y2: y,
                stroke: gridStroke,
                "stroke-width": "1",
              })
            }),

            normalized.length > 1
              ? h("polygon", {
                  points: `${normalized[0].x},${height - paddingBottom} ${polyline} ${normalized[normalized.length - 1].x},${height - paddingBottom}`,
                  fill: "url(#lineGradient)",
                })
              : null,

            normalized.length > 1
              ? h("polyline", {
                  points: polyline,
                  fill: "none",
                  stroke: "#3b82f6",
                  "stroke-width": "4",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                })
              : null,

            ...normalized.map((point, index) =>
              h("g", { key: `point-${index}` }, [
                h("circle", {
                  cx: point.x,
                  cy: point.y,
                  r: "5",
                  fill: pointFill,
                  stroke: "#60a5fa",
                  "stroke-width": "3",
                }),
                h(
                  "text",
                  {
                    x: point.x,
                    y: point.y - (isPhone.value ? 16 : 14),
                    "text-anchor": index === 0 ? "start" : index === normalized.length - 1 ? "end" : "middle",
                    class: "line-chart-value",
                    fill: valueFill,
                    style: { fontSize: `${valueFontSize}px`, fontWeight: 800 },
                  },
                  props.currency ? money(point.value) : formatValue(point.value)
                ),
                h(
                  "text",
                  {
                    x: point.x,
                    y: height - 10,
                    "text-anchor": index === 0 ? "start" : index === normalized.length - 1 ? "end" : "middle",
                    class: "line-chart-label",
                    fill: labelFill,
                    style: { fontSize: `${labelFontSize}px`, fontWeight: 600 },
                  },
                  point.label
                ),
              ])
            ),
          ]
        ),
      ])
    }
  },
})

const BarChart = defineComponent({
  name: "BarChart",
  props: {
    items: { type: Array, default: () => [] },
    height: { type: [String, Number], default: 280 },
    currency: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const items = Array.isArray(props.items) ? props.items : []
      const max = Math.max(...items.map(item => Number(item.value || 0)), 1)

      return h(
        "div",
        { class: "bar-chart", style: { minHeight: `${props.height}px` } },
        items.map((item, index) =>
          h("div", { class: "bar-chart-row", key: `bar-${index}` }, [
            h("div", { class: "bar-chart-head" }, [
              h("div", { class: "bar-chart-label" }, item.label),
              h(
                "div",
                { class: "bar-chart-value" },
                props.currency ? money(item.value) : formatValue(item.value)
              ),
            ]),
            h("div", { class: "bar-chart-track" }, [
              h("div", {
                class: "bar-chart-fill",
                style: { width: `${(Number(item.value || 0) / max) * 100}%` },
              }),
            ]),
            item.sublabel
              ? h("div", { class: "bar-chart-sublabel" }, item.sublabel)
              : null,
          ])
        )
      )
    }
  },
})

const DonutChart = defineComponent({
  name: "DonutChart",
  props: {
    items: { type: Array, default: () => [] },
    centerLabel: { type: String, default: "" },
    centerValue: { type: String, default: "" },
  },
  setup(props) {
    return () => {
      const items = Array.isArray(props.items) ? props.items : []
      const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0)

      let angleCursor = 0
      const gradient = items.length
        ? `conic-gradient(${items
            .map(item => {
              const value = Number(item.value || 0)
              const angle = total ? (value / total) * 360 : 0
              const start = angleCursor
              const end = angleCursor + angle
              angleCursor += angle
              return `${item.color || "#3b82f6"} ${start}deg ${end}deg`
            })
            .join(", ")})`
        : "conic-gradient(#334155 0deg 360deg)"

      return h("div", { class: "donut-card-wrap" }, [
        h("div", { class: "donut-wrap" }, [
          h("div", {
            class: "donut-ring",
            style: { background: gradient },
          }),
          h("div", { class: "donut-center" }, [
            h("div", { class: "donut-center-label" }, props.centerLabel),
            h("div", { class: "donut-center-value" }, props.centerValue),
          ]),
        ]),
        h(
          "div",
          { class: "donut-legend" },
          items.map((item, index) =>
            h("div", { class: "donut-legend-item", key: `legend-${index}` }, [
              h("span", {
                class: "donut-legend-dot",
                style: { background: item.color || "#3b82f6" },
              }),
              h("span", { class: "donut-legend-label" }, item.label),
              h("span", { class: "donut-legend-value" }, formatValue(item.value)),
            ])
          )
        ),
      ])
    }
  },
})

const RankList = defineComponent({
  name: "RankList",
  props: {
    items: { type: Array, default: () => [] },
    suffix: { type: String, default: "" },
  },
  setup(props) {
    return () =>
      h(
        "div",
        { class: "rank-list" },
        props.items.map((item, index) =>
          h("div", { class: "rank-item", key: `rank-${index}` }, [
            h("div", { class: "rank-item-left" }, [
              h("div", { class: "rank-index" }, `#${index + 1}`),
              h("div", null, [
                h("div", { class: "rank-title" }, item.label),
                h("div", { class: "rank-subtitle" }, item.sublabel || ""),
              ]),
            ]),
            h("div", { class: "rank-value" }, `${formatValue(item.value)} ${props.suffix}`.trim()),
          ])
        )
      )
  },
})

const RevenueList = defineComponent({
  name: "RevenueList",
  props: {
    items: { type: Array, default: () => [] },
  },
  setup(props) {
    return () =>
      h(
        "div",
        { class: "revenue-list" },
        props.items.map((item, index) =>
          h("div", { class: "revenue-row", key: `rev-${index}` }, [
            h("div", { class: "revenue-row-left" }, [
              h("div", { class: "revenue-title" }, item.title),
              h(
                "div",
                { class: "revenue-time" },
                item.created_at
                  ? new Date(item.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : ""
              ),
            ]),
            h(
              "div",
              { class: "revenue-value" },
              money(Number(item.value || 0))
            ),
          ])
        )
      )
  },
})
</script>

<style scoped>
:deep(.v-main) {
  padding-top: 14px !important;
  margin-top: 0 !important;
  display: block !important;
  min-height: 0 !important;
  height: auto !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  align-content: flex-start !important;
  place-items: start stretch !important;
  place-content: start !important;
}

:deep(.v-main__wrap) {
  padding-top: 0 !important;
  margin-top: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  display: block !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  align-content: flex-start !important;
  place-items: start stretch !important;
  place-content: start !important;
}

:deep(main) {
  padding-top: 0 !important;
  margin-top: 0 !important;
  display: block !important;
  min-height: 0 !important;
  height: auto !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  align-content: flex-start !important;
  place-items: start stretch !important;
  place-content: start !important;
}

:deep(.v-application__wrap) {
  margin-top: 0 !important;
  padding-top: 0 !important;
  display: block !important;
  min-height: 0 !important;
  height: auto !important;
}

:deep(.v-main > .v-container),
:deep(.v-main__wrap > .v-container),
:deep(main > .v-container),
:deep(.v-main > .statistics-page),
:deep(.v-main__wrap > .statistics-page),
:deep(main > .statistics-page) {
  margin-top: 0 !important;
  padding-top: 0 !important;
  align-self: flex-start !important;
  justify-self: stretch !important;
}

:deep(.v-container) {
  align-items: flex-start !important;
}

:deep(.v-row) {
  align-items: flex-start;
}

:deep(.analytics-dialog-content) {
  margin-top: 24px !important;
}

.statistics-page {
  position: relative;
  display: block !important;
  flex-direction: column !important;
  width: 100% !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  place-items: start !important;
  place-content: start !important;
  min-height: 0 !important;
  height: auto !important;
  overflow: visible;
  padding-top: 14px !important;
  padding-bottom: 32px !important;
  margin-top: 0 !important;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.statistics-content-wrap {
  position: relative;
  z-index: 1;
  display: block !important;
  top: 0 !important;
  left: 0 !important;
  width: 100%;
  flex: 0 0 auto !important;
  padding-top: 0 !important;
  margin-top: 0 !important;
  transform: none !important;
}

.statistics-page-inner {
  position: relative;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.statistics-root-row {
  display: block !important;
  flex: 0 0 auto !important;
  min-height: 0 !important;
  height: auto !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
  align-items: flex-start !important;
  align-content: flex-start !important;
  justify-content: flex-start !important;
}

.statistics-root-col {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  flex: 0 0 100% !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
  align-self: flex-start !important;
}

.theme-ready {
  animation: pageFadeIn 0.45s ease;
}

.page-bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.orb-one {
  width: 360px;
  height: 360px;
  top: -70px;
  left: -80px;
}

.orb-two {
  width: 300px;
  height: 300px;
  right: -80px;
  top: 120px;
}

.page-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.36), transparent 88%);
  pointer-events: none;
  z-index: 0;
}

.statistics-page > * {
  position: relative;
  z-index: 1;
}

.browser-dark.statistics-page {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 26%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 24%),
    linear-gradient(180deg, #07111f 0%, #0b1324 36%, #0a1220 100%);
  color: #f8fafc;
}

.browser-dark .orb-one {
  background: rgba(59, 130, 246, 0.22);
}

.browser-dark .orb-two {
  background: rgba(139, 92, 246, 0.18);
}

.browser-light.statistics-page {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 26%),
    radial-gradient(circle at top right, rgba(147, 51, 234, 0.1), transparent 24%),
    linear-gradient(180deg, #eff6ff 0%, #f8fbff 36%, #eef4ff 100%);
  color: #0f172a;
}

.browser-light .orb-one {
  background: rgba(59, 130, 246, 0.2);
}

.browser-light .orb-two {
  background: rgba(168, 85, 247, 0.16);
}


.page-shell-mobile {
  padding: 20px !important;
}

.page-shell-tablet {
  padding: 22px !important;
}

.page-shell-phone {
  border-radius: 24px !important;
  padding: 16px !important;
}

.page-hero-mobile {
  gap: 18px !important;
}

.page-hero-phone {
  margin-bottom: 20px !important;
}

.overview-stats-row {
  row-gap: 2px;
}

.revenue-analytics-row-mobile {
  row-gap: 12px;
}

.chart-header-mobile {
  align-items: flex-start !important;
}

.chart-header-phone {
  flex-direction: column;
  align-items: stretch !important;
}

.chart-header-phone .chart-chip {
  align-self: flex-start;
}

.revenue-main-col,
.revenue-side-col {
  display: flex;
}

.revenue-main-col > .v-card,
.revenue-side-col > .v-card {
  width: 100%;
}

:deep(.line-chart-wrap) {
  width: 100%;
  overflow: visible;
}

:deep(.line-chart-svg) {
  width: 100%;
  height: 100%;
  overflow: visible;
}

:deep(.line-chart-label),
:deep(.line-chart-value) {
  paint-order: stroke;
}

:deep(.line-chart-value) {
  stroke: rgba(15, 23, 42, 0.18);
  stroke-width: 2px;
}

.browser-dark :deep(.line-chart-value) {
  stroke: rgba(2, 6, 23, 0.45);
}

.browser-light :deep(.line-chart-value) {
  stroke: rgba(255, 255, 255, 0.72);
}

.page-shell {
  position: relative;
  overflow: hidden;
  margin-top: 0 !important;
  top: 0 !important;
  transform: none !important;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.25s ease;
}

.page-shell-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 100% 0%, rgba(96, 165, 250, 0.12), transparent 22%),
    radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.12), transparent 24%);
}

.browser-dark .page-shell {
  background: rgba(9, 17, 31, 0.78);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.browser-light .page-shell {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow:
    0 18px 48px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.page-topbar {
  display: flex;
  justify-content: flex-start;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.page-topbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.browser-dark .page-topbar-pill {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.18);
  color: #bfdbfe;
}

.browser-light .page-topbar-pill {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.14);
  color: #1d4ed8;
}

.page-hero {
  position: relative;
  padding: 0 !important;
  margin-top: 0 !important;
}

.hero-copy {
  max-width: 740px;
}

.hero-kicker {
  letter-spacing: 0.12em;
}

.hero-title {
  line-height: 1.05;
  margin-top: 0 !important;
}

.hero-subtitle {
  max-width: 700px;
  line-height: 1.6;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 9px 14px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 600;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.browser-dark .hero-meta-chip {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: rgba(241, 245, 249, 0.92);
}

.browser-light .hero-meta-chip {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: rgba(15, 23, 42, 0.86);
}

.hero-meta-chip:hover {
  transform: translateY(-1px);
}

.hero-actions {
  align-self: flex-start;
}

.hero-chip {
  border-radius: 14px;
  font-weight: 700;
}

.refresh-btn {
  min-height: 42px;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
}

.access-alert {
  border-radius: 18px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label-line {
  flex: 1;
  height: 1px;
}

.browser-dark .section-label-line {
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.28), rgba(148, 163, 184, 0.05));
}

.browser-light .section-label-line {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.2), rgba(148, 163, 184, 0.04));
}

.section-label-text {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}

.browser-dark .section-label-text {
  color: rgba(191, 219, 254, 0.88);
}

.browser-light .section-label-text {
  color: rgba(29, 78, 216, 0.88);
}

.glass-card,
.mini-stat,
.mini-insight-card,
.detail-dialog-card {
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.browser-dark .glass-card,
.browser-dark .mini-stat,
.browser-dark .mini-insight-card,
.browser-dark .detail-dialog-card {
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.browser-light .glass-card,
.browser-light .mini-stat,
.browser-light .mini-insight-card,
.browser-light .detail-dialog-card {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.09);
}

.chart-card:hover,
.mini-stat:hover,
.mini-insight-card:hover {
  transform: translateY(-2px);
}

.stat-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.browser-dark .stat-card {
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
}

.browser-light .stat-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
}

.stat-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.26), transparent 34%);
  pointer-events: none;
  opacity: 0.9;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.browser-dark .stat-card:hover {
  box-shadow: 0 22px 40px rgba(0, 0, 0, 0.24);
}

.browser-light .stat-card:hover {
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
}

.stat-copy {
  min-width: 0;
}

.stat-title,
.stat-subtitle {
  line-height: 1.45;
}

.stat-value {
  letter-spacing: -0.02em;
}

.stat-footer {
  transition: opacity 0.2s ease;
}

.stat-arrow {
  transition: transform 0.2s ease;
}

.stat-card:hover .stat-arrow {
  transform: translate(3px, -3px);
}

.stat-avatar {
  transition:
    transform 0.22s ease,
    background 0.22s ease,
    border-color 0.22s ease;
}

.browser-dark .stat-avatar {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.browser-light .stat-avatar {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.stat-card:hover .stat-avatar {
  transform: scale(1.05);
}

.mini-insight-card {
  padding: 18px;
  border-radius: 22px;
}

.chart-header {
  align-items: flex-start;
}

.chart-title {
  letter-spacing: -0.01em;
}

.chart-subtitle {
  line-height: 1.55;
}

.chart-chip {
  font-weight: 800;
}

.inline-action-btn {
  border-radius: 12px;
}

.line-chart-wrap {
  width: 100%;
  overflow: hidden;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
}

.line-chart-label {
  fill: rgba(226, 232, 240, 0.72);
  font-size: 12px;
  font-weight: 500;
}

.browser-light .line-chart-label {
  fill: rgba(51, 65, 85, 0.82);
}

.line-chart-value {
  fill: #dbeafe;
  font-size: 12px;
  font-weight: 700;
}

.browser-light .line-chart-value {
  fill: #1d4ed8;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-chart-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 16px;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.browser-dark .bar-chart-row {
  background: rgba(255, 255, 255, 0.03);
}

.browser-light .bar-chart-row {
  background: rgba(148, 163, 184, 0.05);
}

.bar-chart-row:hover {
  transform: translateY(-1px);
}

.browser-dark .bar-chart-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.browser-light .bar-chart-row:hover {
  background: rgba(148, 163, 184, 0.08);
}

.bar-chart-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.bar-chart-label {
  font-size: 0.95rem;
  font-weight: 600;
}

.browser-dark .bar-chart-label {
  color: #f8fafc;
}

.browser-light .bar-chart-label {
  color: #0f172a;
}

.bar-chart-value {
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.browser-dark .bar-chart-value {
  color: #bfdbfe;
}

.browser-light .bar-chart-value {
  color: #2563eb;
}

.bar-chart-track {
  position: relative;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
}

.browser-dark .bar-chart-track {
  background: rgba(148, 163, 184, 0.12);
}

.browser-light .bar-chart-track {
  background: rgba(148, 163, 184, 0.18);
}

.bar-chart-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb 0%, #8b5cf6 100%);
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.35);
  transition: width 0.4s ease;
}

.bar-chart-sublabel {
  font-size: 0.78rem;
}

.browser-dark .bar-chart-sublabel {
  color: rgba(226, 232, 240, 0.56);
}

.browser-light .bar-chart-sublabel {
  color: rgba(71, 85, 105, 0.82);
}

.donut-card-wrap {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.donut-wrap {
  position: relative;
  width: 230px;
  height: 230px;
  margin: 0 auto;
}

.donut-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.06);
}

.donut-ring::after {
  content: "";
  position: absolute;
  inset: 24px;
  border-radius: 50%;
  box-shadow: inset 0 0 22px rgba(0, 0, 0, 0.18);
}

.browser-dark .donut-ring::after {
  background: rgba(10, 18, 32, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.browser-light .donut-ring::after {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-center-label {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.browser-dark .donut-center-label {
  color: rgba(226, 232, 240, 0.62);
}

.browser-light .donut-center-label {
  color: rgba(71, 85, 105, 0.86);
}

.donut-center-value {
  font-size: 1.15rem;
  font-weight: 800;
  text-align: center;
  max-width: 120px;
}

.browser-dark .donut-center-value {
  color: #f8fafc;
}

.browser-light .donut-center-value {
  color: #0f172a;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.donut-legend-item {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 10px;
  align-items: center;
  border-radius: 14px;
  padding: 10px 12px;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.browser-dark .donut-legend-item {
  background: rgba(255, 255, 255, 0.03);
}

.browser-light .donut-legend-item {
  background: rgba(148, 163, 184, 0.05);
}

.donut-legend-item:hover {
  transform: translateY(-1px);
}

.browser-dark .donut-legend-item:hover {
  background: rgba(148, 163, 184, 0.06);
}

.browser-light .donut-legend-item:hover {
  background: rgba(148, 163, 184, 0.08);
}

.donut-legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.donut-legend-label {
  font-size: 0.92rem;
}

.browser-dark .donut-legend-label {
  color: rgba(248, 250, 252, 0.9);
}

.browser-light .donut-legend-label {
  color: rgba(15, 23, 42, 0.92);
}

.donut-legend-value {
  font-size: 0.88rem;
  font-weight: 700;
}

.browser-dark .donut-legend-value {
  color: #bfdbfe;
}

.browser-light .donut-legend-value {
  color: #2563eb;
}

.rank-list,
.revenue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item,
.revenue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.browser-dark .rank-item,
.browser-dark .revenue-row {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.browser-light .rank-item,
.browser-light .revenue-row {
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.rank-item:hover,
.revenue-row:hover {
  transform: translateY(-1px);
}

.rank-item-left,
.revenue-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.rank-index {
  min-width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.browser-dark .rank-index {
  background: rgba(37, 99, 235, 0.18);
  color: #dbeafe;
}

.browser-light .rank-index {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.rank-title,
.revenue-title {
  font-weight: 700;
}

.browser-dark .rank-title,
.browser-dark .revenue-title {
  color: #f8fafc;
}

.browser-light .rank-title,
.browser-light .revenue-title {
  color: #0f172a;
}

.rank-subtitle,
.revenue-time {
  font-size: 0.82rem;
  margin-top: 2px;
}

.browser-dark .rank-subtitle,
.browser-dark .revenue-time {
  color: rgba(226, 232, 240, 0.58);
}

.browser-light .rank-subtitle,
.browser-light .revenue-time {
  color: rgba(71, 85, 105, 0.84);
}

.rank-value,
.revenue-value {
  font-weight: 800;
  white-space: nowrap;
}

.browser-dark .rank-value,
.browser-dark .revenue-value {
  color: #bfdbfe;
}

.browser-light .rank-value,
.browser-light .revenue-value {
  color: #1d4ed8;
}

.mini-stat {
  border-radius: 20px;
}

.detail-dialog-card {
  overflow: hidden;
  position: relative;
}

.detail-dialog-top-glow {
  position: absolute;
  inset: 0 0 auto 0;
  height: 180px;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 38%),
    radial-gradient(circle at top right, rgba(139, 92, 246, 0.14), transparent 36%);
}

.browser-dark .detail-dialog-card {
  background:
    linear-gradient(180deg, rgba(8, 18, 34, 0.98) 0%, rgba(13, 23, 41, 0.98) 100%);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.browser-light .detail-dialog-card {
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(238, 245, 255, 0.98) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow:
    0 30px 70px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.detail-titlebar {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(14px);
}

.browser-dark .detail-titlebar {
  background: linear-gradient(180deg, rgba(8, 18, 34, 0.54), rgba(8, 18, 34, 0.22));
}

.browser-light .detail-titlebar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.28));
}

.detail-title-wrap {
  max-width: 760px;
}

.detail-title-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.browser-dark .detail-title-badge {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.18);
}

.browser-light .detail-title-badge {
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.detail-main-title {
  letter-spacing: -0.02em;
}

.detail-title-subtitle {
  max-width: 620px;
  line-height: 1.6;
}

.detail-close-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.browser-dark .detail-close-btn {
  background: rgba(255, 255, 255, 0.04);
}

.browser-light .detail-close-btn {
  background: rgba(148, 163, 184, 0.08);
}

.detail-header-divider {
  height: 1px;
}

.browser-dark .detail-header-divider {
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.08), rgba(148, 163, 184, 0.18), rgba(139, 92, 246, 0.08));
}

.browser-light .detail-header-divider {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.04), rgba(148, 163, 184, 0.22), rgba(139, 92, 246, 0.04));
}

.detail-dialog-body {
  position: relative;
  z-index: 1;
}

.detail-section-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 22px;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.browser-dark .detail-section-banner {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.06));
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.browser-light .detail-section-banner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.detail-section-banner:hover {
  transform: translateY(-1px);
}

.detail-section-banner-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.browser-dark .detail-section-banner-icon {
  background: rgba(255, 255, 255, 0.06);
  color: #93c5fd;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.browser-light .detail-section-banner-icon {
  background: rgba(255, 255, 255, 0.62);
  color: #1d4ed8;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.detail-section-banner-title {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 2px;
}

.detail-section-banner-text {
  font-size: 0.92rem;
  line-height: 1.55;
}

.browser-dark .detail-section-banner-text {
  color: rgba(226, 232, 240, 0.74);
}

.browser-light .detail-section-banner-text {
  color: rgba(71, 85, 105, 0.88);
}

.detail-summary-card {
  position: relative;
  overflow: hidden;
}

.detail-summary-card-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at top right, rgba(96, 165, 250, 0.18), transparent 34%);
}

.detail-summary-label {
  letter-spacing: 0.08em;
  font-weight: 700;
}

.detail-summary-value {
  letter-spacing: -0.02em;
}

.detail-summary-avatar {
  flex-shrink: 0;
}

.browser-dark .detail-summary-avatar {
  background: rgba(255, 255, 255, 0.07);
  color: #93c5fd;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.browser-light .detail-summary-avatar {
  background: rgba(255, 255, 255, 0.7);
  color: #1d4ed8;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.detail-chart-card {
  position: relative;
  overflow: hidden;
}

.detail-chart-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 30%);
  border-radius: inherit;
}

.detail-card-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.detail-card-chip {
  font-weight: 700;
}

.revenue-main-card {
  position: relative;
}

.browser-dark .revenue-main-card::before,
.browser-light .revenue-main-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent 35%);
  border-radius: inherit;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1260px) {
  .hero-actions {
    max-width: 100%;
  }
}

@media (max-width: 960px) {
  .revenue-main-card .v-card-text,
  .chart-card .v-card-text {
    padding: 22px !important;
  }

  .chart-title {
    font-size: 1.05rem !important;
  }

  .donut-wrap {
    width: 200px;
    height: 200px;
  }

  .hero-title {
    font-size: 2rem !important;
  }

  .hero-subtitle {
    max-width: 100%;
  }
}

@media (max-width: 700px) {
  .detail-section-banner {
    align-items: flex-start;
  }

  .detail-title-wrap {
    max-width: calc(100% - 56px);
  }
}

@media (max-width: 600px) {
  .statistics-page {
    padding-top: 0 !important;
    padding-bottom: 24px !important;
  }

  .page-topbar-pill {
    font-size: 0.72rem;
    width: 100%;
    justify-content: center;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions > * {
    flex: 1 1 calc(50% - 6px);
    min-width: calc(50% - 6px);
  }

  .hero-actions .refresh-btn {
    width: 100%;
  }

  .stat-card .v-card-text {
    padding: 18px !important;
  }

  .stat-value {
    font-size: 1.72rem !important;
  }

  .chart-card {
    border-radius: 22px !important;
  }

  .chart-card .v-card-text {
    padding: 18px !important;
  }

  .chart-subtitle {
    max-width: 100%;
  }

  .hero-meta {
    gap: 8px;
  }

  .hero-meta-chip {
    width: 100%;
    justify-content: center;
  }

  .section-label {
    gap: 8px;
  }

  .rank-item,
  .revenue-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .rank-value,
  .revenue-value {
    margin-left: 56px;
  }

  .detail-card-topline {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-section-banner {
    flex-direction: column;
  }
}

@media (max-width: 420px) {
  .hero-actions > * {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .chart-chip {
    width: 100%;
    justify-content: center;
  }

  .mini-insight-card {
    padding: 16px;
  }
}
</style>