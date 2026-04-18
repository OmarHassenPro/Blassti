<template>
  <AppNavbar />

  <div
    class="bundle-page-shell"
    :class="[
      browserThemeClass,
      `theme-${currentTheme}`,
      { 'bundle-mobile': isMobile, 'bundle-tablet': isTablet },
    ]"
  >
    <v-container class="page-main px-4 px-sm-6 px-md-8 py-6 py-md-8">
      <v-card rounded="xl" class="hero-card pa-5 pa-md-7 mb-6" elevation="0">
        <div class="hero-glow hero-glow--one" />
        <div class="hero-glow hero-glow--two" />

        <div class="d-flex flex-column flex-lg-row align-start align-lg-center justify-space-between ga-6 position-relative">
          <div class="hero-copy">
            <div class="hero-badge mb-4">
              <v-icon size="18">mdi-calendar-multiple-check</v-icon>
              <span>Bundle planner</span>
            </div>

            <div class="text-h4 text-sm-h3 font-weight-black mb-3 hero-title">
              Build event bundles that feel like a real mini itinerary.
            </div>

            <div class="text-body-1 text-medium-emphasis hero-subtitle">
              Pick up to 9 events, drop them into a polished timeline, save the bundle,
              and buy all its tickets in one shot with a bundle discount.
            </div>

            <div class="d-flex flex-wrap ga-2 mt-5 hero-chip-row">
              <v-chip rounded="pill" variant="tonal" class="hero-chip">
                <v-icon start size="16">mdi-timeline-outline</v-icon>
                Dynamic timeline
              </v-chip>
              <v-chip rounded="pill" variant="tonal" class="hero-chip">
                <v-icon start size="16">mdi-ticket-percent-outline</v-icon>
                10% off after 3 events
              </v-chip>
            </div>
          </div>

          <div class="hero-side w-100" :class="{ 'hero-side-mobile': isMobile }">
            <v-card rounded="xl" class="hero-side-card pa-4 pa-md-5" elevation="0">
              <div class="d-flex align-center justify-space-between ga-3 mb-4">
                <div>
                  <div class="text-overline hero-side-label">Quick snapshot</div>
                  <div class="text-h6 font-weight-bold">Your bundle space</div>
                </div>

                <div class="metric-icon metric-icon--primary">
                  <v-icon size="22">mdi-view-dashboard-outline</v-icon>
                </div>
              </div>

              <div class="hero-stat-grid">
                <div class="hero-stat-box">
                  <span>Saved bundles</span>
                  <strong>{{ currentUser ? userBundles.length : 0 }}</strong>
                </div>
                <div class="hero-stat-box">
                  <span>Purchased</span>
                  <strong>{{ totalPurchases }}</strong>
                </div>
                <div class="hero-stat-box">
                  <span>Planned events</span>
                  <strong>{{ totalPlannedEvents }}</strong>
                </div>
                <div class="hero-stat-box">
                  <span>Avg. value</span>
                  <strong>{{ formatMoney(averageBundleValue) }}</strong>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-card>

      <template v-if="!currentUser">
        <v-card rounded="xl" class="login-card pa-7 text-center" elevation="0">
          <div class="empty-icon mb-4">
            <v-icon size="34">mdi-lock-outline</v-icon>
          </div>
          <div class="text-h6 font-weight-bold mb-2">Login required</div>
          <div class="text-medium-emphasis mb-5">
            Log in first to create, save, and buy your event bundles.
          </div>
          <v-btn color="primary" rounded="lg" size="large" class="action-btn" @click="router.push('/O_login')">
            <v-icon start>mdi-login</v-icon>
            Go to login
          </v-btn>
        </v-card>
      </template>

      <template v-else>
        <div v-if="userBundles.length" class="mb-6">
          <div v-if="isMobile" class="mobile-stats-rail">
            <div class="mobile-stats-scroll">
              <v-card rounded="xl" class="stat-card stat-card--primary pa-5" elevation="0">
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div>
                    <div class="text-overline stat-label">Saved bundles</div>
                    <div class="text-h4 font-weight-black">{{ userBundles.length }}</div>
                    <div class="text-medium-emphasis">Ready to reopen anytime</div>
                  </div>
                  <div class="metric-icon metric-icon--primary">
                    <v-icon size="22">mdi-folder-multiple-outline</v-icon>
                  </div>
                </div>
                <div class="mini-progress-track"><div class="mini-progress-fill mini-progress-fill--primary" style="width: 100%" /></div>
              </v-card>

              <v-card rounded="xl" class="stat-card stat-card--success pa-5" elevation="0">
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div>
                    <div class="text-overline stat-label">Total purchases</div>
                    <div class="text-h4 font-weight-black">{{ totalPurchases }}</div>
                    <div class="text-medium-emphasis">Bundle checkouts completed</div>
                  </div>
                  <div class="metric-icon metric-icon--success">
                    <v-icon size="22">mdi-cash-check</v-icon>
                  </div>
                </div>
                <div class="mini-progress-track"><div class="mini-progress-fill mini-progress-fill--success" style="width: 100%" /></div>
              </v-card>

              <v-card rounded="xl" class="stat-card stat-card--info pa-5" elevation="0">
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div>
                    <div class="text-overline stat-label">Planned events</div>
                    <div class="text-h4 font-weight-black">{{ totalPlannedEvents }}</div>
                    <div class="text-medium-emphasis">Across all saved bundles</div>
                  </div>
                  <div class="metric-icon metric-icon--info">
                    <v-icon size="22">mdi-calendar-check-outline</v-icon>
                  </div>
                </div>
                <div class="mini-progress-track"><div class="mini-progress-fill mini-progress-fill--info" style="width: 100%" /></div>
              </v-card>
            </div>
          </div>

          <v-row v-else class="stats-grid mb-1">
            <v-col cols="12" md="4">
              <v-card rounded="xl" class="stat-card stat-card--primary pa-5" elevation="0">
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div>
                    <div class="text-overline stat-label">Saved bundles</div>
                    <div class="text-h4 font-weight-black">{{ userBundles.length }}</div>
                    <div class="text-medium-emphasis">Ready to reopen anytime</div>
                  </div>
                  <div class="metric-icon metric-icon--primary"><v-icon size="22">mdi-folder-multiple-outline</v-icon></div>
                </div>
                <div class="mini-progress-track"><div class="mini-progress-fill mini-progress-fill--primary" style="width: 100%" /></div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card rounded="xl" class="stat-card stat-card--success pa-5" elevation="0">
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div>
                    <div class="text-overline stat-label">Total purchases</div>
                    <div class="text-h4 font-weight-black">{{ totalPurchases }}</div>
                    <div class="text-medium-emphasis">Bundle checkouts completed</div>
                  </div>
                  <div class="metric-icon metric-icon--success"><v-icon size="22">mdi-cash-check</v-icon></div>
                </div>
                <div class="mini-progress-track"><div class="mini-progress-fill mini-progress-fill--success" style="width: 100%" /></div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card rounded="xl" class="stat-card stat-card--info pa-5" elevation="0">
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div>
                    <div class="text-overline stat-label">Planned events</div>
                    <div class="text-h4 font-weight-black">{{ totalPlannedEvents }}</div>
                    <div class="text-medium-emphasis">Across all saved bundles</div>
                  </div>
                  <div class="metric-icon metric-icon--info"><v-icon size="22">mdi-calendar-check-outline</v-icon></div>
                </div>
                <div class="mini-progress-track"><div class="mini-progress-fill mini-progress-fill--info" style="width: 100%" /></div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <template v-if="!bundleCards.length">
          <v-card rounded="xl" class="empty-card pa-7 pa-md-9 text-center" elevation="0">
            <div class="empty-icon mb-4">
              <v-icon size="40">mdi-calendar-plus</v-icon>
            </div>
            <div class="text-h5 font-weight-bold mb-3">No bundles yet</div>
            <div class="text-body-1 text-medium-emphasis mb-6 empty-copy mx-auto">
              Start with a date range, choose the events you want day by day, then save the whole plan as a reusable bundle.
            </div>
            <v-btn color="primary" size="large" rounded="lg" class="action-btn" @click="openCreateBundle">
              <v-icon start>mdi-plus</v-icon>
              Create bundle
            </v-btn>
          </v-card>
        </template>

        <template v-else>
          <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3 mb-4">
            <div>
              <div class="text-h5 font-weight-bold">Saved bundles</div>
              <div class="text-medium-emphasis">
                Reopen, edit, duplicate, or buy any bundle again.
              </div>
            </div>

            <v-btn color="primary" rounded="lg" size="large" class="action-btn" @click="openCreateBundle">
              <v-icon start>mdi-plus</v-icon>
              Create bundle
            </v-btn>
          </div>

          <v-row>
            <v-col
              v-for="bundle in bundleCards"
              :key="bundle.id"
              cols="12"
              md="6"
              xl="4"
            >
              <v-card rounded="xl" class="bundle-card pa-4 pa-md-5" elevation="0">
                <div class="bundle-card-top mb-4">
                  <div class="d-flex align-start justify-space-between ga-3 mb-3">
                    <div class="min-w-0">
                      <div class="bundle-title text-h6 font-weight-bold text-truncate">
                        {{ bundle.title || 'Untitled bundle' }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        {{ bundle.rangeLabel }}
                      </div>
                    </div>

                    <div class="bundle-icon-wrap">
                      <v-icon size="20">mdi-timeline-text-outline</v-icon>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap ga-2 mb-3">
                    <v-chip size="small" rounded="pill" variant="tonal" class="summary-chip">
                      <v-icon start size="14">mdi-check-decagram-outline</v-icon>
                      {{ bundle.filledCount }}/{{ bundle.dayCount }} days filled
                    </v-chip>
                    <v-chip size="small" rounded="pill" variant="tonal" class="summary-chip">
                      <v-icon start size="14">mdi-cart-outline</v-icon>
                      {{ bundle.purchaseCount }} purchase{{ bundle.purchaseCount === 1 ? '' : 's' }}
                    </v-chip>
                  </div>
                </div>

                <div class="mini-timeline mb-4">
                  <div class="mini-timeline-line" />
                  <div
                    v-for="(entry, index) in bundle.previewEntries"
                    :key="`${bundle.id}-${entry.date_key}`"
                    class="mini-timeline-node"
                    :class="{ 'mini-timeline-node--filled': !!entry.event_id }"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                  >
                    <div class="mini-node-bubble" :title="entry.event?.title || 'Empty bundle slot'">
                      <template v-if="entry.event">
                        <v-img
                          v-if="entry.event.image || entry.event.images?.[0]"
                          :src="entry.event.image || entry.event.images?.[0]"
                          cover
                          class="mini-node-image"
                        >
                          <template #placeholder>
                            <div class="w-100 h-100 d-flex align-center justify-center placeholder-surface">
                              <v-icon size="14">mdi-image-outline</v-icon>
                            </div>
                          </template>
                        </v-img>
                        <v-icon v-else size="14">{{ entry.icon }}</v-icon>

                        <div class="mini-node-overlay">
                          <v-icon size="11">{{ entry.icon }}</v-icon>
                        </div>
                      </template>

                      <v-icon v-else size="14">mdi-help</v-icon>
                    </div>
                    <div class="mini-node-label text-caption">
                      {{ entry.shortDate }}
                    </div>
                  </div>
                </div>

                <div class="bundle-estimates mb-4">
                  <div class="estimate-row estimate-row--economy">
                    <span>Economy</span>
                    <strong>{{ formatMoney(bundle.estimates.economy.total_amount) }}</strong>
                  </div>
                  <div class="estimate-row estimate-row--special">
                    <span>Special</span>
                    <strong>{{ formatMoney(bundle.estimates.special.total_amount) }}</strong>
                  </div>
                  <div class="estimate-row estimate-row--luxury">
                    <span>Luxury</span>
                    <strong>{{ formatMoney(bundle.estimates.luxury.total_amount) }}</strong>
                  </div>
                </div>

                <div class="text-caption text-medium-emphasis mb-4">
                  Updated {{ formatDate(bundle.updated_at) }}
                </div>

                <div class="bundle-actions d-flex flex-wrap ga-2">
                  <v-btn color="primary" rounded="lg" class="text-none flex-grow-1" @click="openBundle(bundle.id)">
                    <v-icon start>mdi-pencil-outline</v-icon>
                    Edit
                  </v-btn>
                  <v-btn color="success" variant="outlined" rounded="lg" class="text-none" @click="buyBundleAgain(bundle.id)">
                    <v-icon start>mdi-credit-card-refresh-outline</v-icon>
                    Buy again
                  </v-btn>
                  <v-btn variant="outlined" rounded="lg" class="text-none" @click="duplicateBundle(bundle.id)">
                    <v-icon start>mdi-content-copy</v-icon>
                    Duplicate
                  </v-btn>
                  <v-btn variant="outlined" color="error" rounded="lg" class="text-none" @click="promptDelete(bundle)">
                    <v-icon start>mdi-delete-outline</v-icon>
                    Delete
                  </v-btn>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" xl="4">
              <v-card rounded="xl" class="create-tile pa-6 d-flex flex-column align-center justify-center text-center" elevation="0" @click="openCreateBundle">
                <div class="create-tile-icon mb-4">
                  <v-icon size="34">mdi-plus</v-icon>
                </div>
                <div class="text-h6 font-weight-bold mb-2">Create another bundle</div>
                <div class="text-body-2 text-medium-emphasis create-copy">
                  Start a fresh timeline and build a new event combo.
                </div>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </template>
    </v-container>
  </div>

  <v-dialog v-model="deleteDialog.show" max-width="520">
    <v-card rounded="xl" class="dialog-card pa-2" :class="currentTheme === 'light' ? 'dialog-card--light' : 'dialog-card--dark'">
      <v-card-title class="px-6 pt-6 pb-3 d-flex align-center ga-3">
        <v-avatar size="42" class="dialog-avatar dialog-avatar--danger">
          <v-icon size="20">mdi-delete-alert-outline</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Delete bundle</div>
          <div class="text-body-2 text-medium-emphasis">This removes the saved timeline only.</div>
        </div>
      </v-card-title>

      <v-card-text class="px-6 pb-2">
        <div class="text-body-1">
          Delete <strong>{{ deleteDialog.bundle?.title || 'this bundle' }}</strong>?
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-3 d-flex flex-wrap ga-2 justify-end">
        <v-btn variant="outlined" rounded="lg" class="text-none" @click="deleteDialog.show = false">Cancel</v-btn>
        <v-btn color="error" rounded="lg" class="text-none" @click="confirmDelete">
          <v-icon start>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import {
  delete_Bundle,
  duplicate_Bundle,
  estimate_Bundle_Price,
  get_Bundles_By_User_Id,
} from "@/dataModel/bundle"
import { get_Current_User } from "@/dataModel/user"
import { get_Event_By_Id } from "@/dataModel/event"

const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const currentUser = ref(get_Current_User())
const prefersDark = ref(false)
const currentTheme = ref("light")
const isMobile = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)

const deleteDialog = ref({
  show: false,
  bundle: null,
})

let storageThemeInterval = null
let currentUserInterval = null

function readStoredTheme() {
  if (typeof window === "undefined") return "light"
  const savedTheme = window.localStorage.getItem("blassti-theme")
  return savedTheme === "dark" ? "dark" : "light"
}

function applyStoredTheme() {
  const savedTheme = readStoredTheme()
  currentTheme.value = savedTheme
  prefersDark.value = savedTheme === "dark"
  theme.global.name.value = savedTheme
}

function handleStorageThemeChange(event) {
  if (event.key === "blassti-theme") {
    applyStoredTheme()
  }
}

onMounted(() => {
  applyStoredTheme()

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageThemeChange)

    storageThemeInterval = window.setInterval(() => {
      const savedTheme = readStoredTheme()
      if (savedTheme !== currentTheme.value) {
        applyStoredTheme()
      }
    }, 250)

    currentUserInterval = window.setInterval(() => {
      currentUser.value = get_Current_User()
    }, 400)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleStorageThemeChange)
  }

  if (storageThemeInterval) window.clearInterval(storageThemeInterval)
  if (currentUserInterval) window.clearInterval(currentUserInterval)
})

const browserThemeClass = computed(() => {
  return prefersDark.value ? "browser-theme-dark" : "browser-theme-light"
})

const userBundles = computed(() => {
  if (!currentUser.value?.id) return []
  return get_Bundles_By_User_Id(currentUser.value.id)
})

function getSlotIcon(event) {
  if (!event?.time) return "mdi-help"

  const hour = Number(String(event.time).split(":")[0] || 0)
  if (hour >= 18 || hour < 6) return "mdi-weather-night"
  if (hour >= 12) return "mdi-weather-partly-cloudy"
  return "mdi-white-balance-sunny"
}

function formatShortDate(dateKey) {
  const parsed = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateKey
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatRange(startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Custom timeline"

  const sameYear = start.getFullYear() === end.getFullYear()
  const startText = start.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) })
  const endText = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  return `${startText} → ${endText}`
}

const bundleCards = computed(() => {
  return [...userBundles.value]
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .map(bundle => {
      const previewEntries = (bundle.timeline_entries || []).map(entry => {
        const event = get_Event_By_Id(entry.event_id)
        return {
          ...entry,
          event,
          icon: getSlotIcon(event),
          shortDate: formatShortDate(entry.date_key),
        }
      })

      return {
        ...bundle,
        dayCount: bundle.selected_dates?.length || 0,
        filledCount: (bundle.timeline_entries || []).filter(entry => entry?.event_id).length,
        purchaseCount: bundle.purchase_history?.length || 0,
        previewEntries,
        estimates: {
          economy: estimate_Bundle_Price(bundle, "economy", 1),
          special: estimate_Bundle_Price(bundle, "special", 1),
          luxury: estimate_Bundle_Price(bundle, "luxury", 1),
        },
        rangeLabel: formatRange(bundle.start_date, bundle.end_date),
      }
    })
})

const totalPurchases = computed(() => {
  return userBundles.value.reduce((sum, bundle) => sum + (bundle.purchase_history?.length || 0), 0)
})

const totalPlannedEvents = computed(() => {
  return userBundles.value.reduce((sum, bundle) => {
    return sum + (bundle.timeline_entries || []).filter(entry => entry?.event_id).length
  }, 0)
})

const averageBundleValue = computed(() => {
  if (!bundleCards.value.length) return 0

  const total = bundleCards.value.reduce((sum, bundle) => sum + bundle.estimates.economy.total_amount, 0)
  return total / bundleCards.value.length
})

function formatMoney(value) {
  return `${Number(value || 0).toFixed(2)} TND`
}

function formatDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "just now"
  return parsed.toLocaleString()
}

function openCreateBundle() {
  router.push("/bundle_builder")
}

function openBundle(bundleId) {
  router.push(`/bundle_builder?id=${bundleId}`)
}

function buyBundleAgain(bundleId) {
  router.push(`/bundle_builder?id=${bundleId}&buy=1`)
}

function duplicateBundle(bundleId) {
  if (!currentUser.value?.id) return
  const duplicated = duplicate_Bundle(bundleId, currentUser.value.id)
  if (duplicated?.id) {
    router.push(`/bundle_builder?id=${duplicated.id}`)
  }
}

function promptDelete(bundle) {
  deleteDialog.value = {
    show: true,
    bundle,
  }
}

function confirmDelete() {
  if (!deleteDialog.value.bundle?.id) return
  delete_Bundle(deleteDialog.value.bundle.id)
  deleteDialog.value.show = false
}
</script>

<style scoped>
.bundle-page-shell {
  min-height: 100vh;
  transition: background 0.25s ease, color 0.25s ease;
}

.page-main {
  max-width: 1500px;
}

.position-relative {
  position: relative;
}

.hero-card,
.login-card,
.empty-card,
.bundle-card,
.create-tile,
.dialog-card,
.stat-card,
.hero-side-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(14px);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease;
}

.dialog-card {
  backdrop-filter: blur(6px);
  box-shadow: 0 24px 60px rgba(2, 8, 23, 0.24);
}

.dialog-card--dark {
  background: rgba(15, 23, 42, 0.96);
  color: rgba(241, 245, 249, 0.96);
}

.dialog-card--light {
  background: rgba(255, 255, 255, 0.995);
  color: #0f172a;
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 60px rgba(148, 163, 184, 0.18);
}

.hero-card:hover,
.bundle-card:hover,
.create-tile:hover,
.stat-card:hover {
  transform: translateY(-4px);
}

.hero-card {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 30%),
    radial-gradient(circle at right center, rgba(6, 182, 212, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.84), rgba(30, 41, 59, 0.78));
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.6;
  pointer-events: none;
}

.hero-glow--one {
  width: 220px;
  height: 220px;
  top: -70px;
  right: 8%;
  background: rgba(99, 102, 241, 0.28);
}

.hero-glow--two {
  width: 160px;
  height: 160px;
  bottom: -55px;
  left: 22%;
  background: rgba(14, 165, 233, 0.22);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-copy {
  max-width: 760px;
}

.hero-title {
  line-height: 1.08;
}

.hero-subtitle {
  max-width: 720px;
}

.hero-chip-row {
  row-gap: 10px;
}

.hero-chip {
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.hero-side {
  max-width: 390px;
}

.hero-side-mobile {
  max-width: 100%;
}

.hero-side-card {
  background: rgba(255, 255, 255, 0.06);
}

.hero-side-label,
.stat-label {
  letter-spacing: 0.08em;
  font-weight: 700;
}

.hero-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat-box {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stat-box span {
  font-size: 0.76rem;
  opacity: 0.82;
}

.hero-stat-box strong {
  font-size: 1.1rem;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
}

.metric-icon--primary {
  background: rgba(99, 102, 241, 0.18);
}

.metric-icon--success {
  background: rgba(34, 197, 94, 0.14);
}

.metric-icon--info {
  background: rgba(14, 165, 233, 0.14);
}

.mobile-stats-rail,
.mobile-stats-scroll {
  overflow-x: auto;
}

.mobile-stats-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(260px, 1fr);
  gap: 14px;
  padding-bottom: 6px;
}

.stats-grid {
  margin-top: 0;
}

.stat-card {
  min-height: 168px;
}

.stat-card--primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0.08));
}

.stat-card--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(34, 197, 94, 0.06));
}

.stat-card--info {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(14, 165, 233, 0.06));
}

.mini-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.14);
}

.mini-progress-fill {
  height: 100%;
  border-radius: inherit;
}

.mini-progress-fill--primary {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.95), rgba(129, 140, 248, 0.82));
}

.mini-progress-fill--success {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.92), rgba(74, 222, 128, 0.82));
}

.mini-progress-fill--info {
  background: linear-gradient(90deg, rgba(14, 165, 233, 0.95), rgba(56, 189, 248, 0.82));
}

.empty-card,
.login-card {
  background: rgba(255, 255, 255, 0.04);
}

.empty-copy {
  max-width: 680px;
}

.empty-icon,
.create-tile-icon,
.dialog-avatar {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dialog-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.dialog-avatar--danger {
  background: rgba(239, 68, 68, 0.14);
}

.bundle-card {
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
}

.bundle-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.bundle-title {
  max-width: 100%;
}

.summary-chip {
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.mini-timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(54px, 1fr));
  gap: 8px;
  align-items: start;
  min-height: 78px;
}

.mini-timeline-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 22px;
  height: 2px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
}

.mini-timeline-node {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: floatIn 0.3s ease both;
}

.mini-node-bubble {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.86);
  border: 2px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
}

.mini-node-image {
  width: 100%;
  height: 100%;
}

.mini-node-overlay {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
}

.mini-timeline-node--filled .mini-node-bubble {
  border-color: rgba(99, 102, 241, 0.45);
  background: rgba(15, 23, 42, 0.92);
}

.mini-node-label {
  text-align: center;
}

.bundle-estimates {
  display: grid;
  gap: 10px;
}

.estimate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.estimate-row--economy {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(245, 158, 11, 0.05));
  border-color: rgba(245, 158, 11, 0.18);
}

.estimate-row--special {
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.18), rgba(148, 163, 184, 0.05));
  border-color: rgba(203, 213, 225, 0.2);
}

.estimate-row--luxury {
  background: linear-gradient(135deg, rgba(253, 224, 71, 0.18), rgba(250, 204, 21, 0.05));
  border-color: rgba(250, 204, 21, 0.2);
}

.create-tile {
  min-height: 100%;
  cursor: pointer;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.18), transparent 36%),
    rgba(255, 255, 255, 0.04);
  border-style: dashed;
}

.create-copy {
  max-width: 260px;
}

.placeholder-surface {
  background: rgba(148, 163, 184, 0.12);
}

.action-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: none;
}

.browser-theme-dark {
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.12), transparent 28%),
    linear-gradient(180deg, #07111f 0%, #0b1220 48%, #0f172a 100%);
  color: rgba(241, 245, 249, 0.96);
}

.browser-theme-light {
  background:
    radial-gradient(circle at top, rgba(125, 211, 252, 0.22), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 54%, #e8eef7 100%);
  color: #0f172a;
}

.browser-theme-light .hero-card {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 30%),
    radial-gradient(circle at right center, rgba(6, 182, 212, 0.1), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.browser-theme-light .hero-side-card,
.browser-theme-light .bundle-card,
.browser-theme-light .create-tile,
.browser-theme-light .empty-card,
.browser-theme-light .login-card,
.browser-theme-light .stat-card {
  background: rgba(255, 255, 255, 0.9);
}

.browser-theme-light .dialog-card {
  background: rgba(255, 255, 255, 0.995);
}

.browser-theme-light .hero-badge,
.browser-theme-light .hero-stat-box,
.browser-theme-light .summary-chip {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.14);
}

.browser-theme-light .estimate-row--economy {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.995), rgba(254, 243, 199, 0.68));
  border-color: rgba(245, 158, 11, 0.18);
}

.browser-theme-light .estimate-row--special {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.995), rgba(241, 245, 249, 0.8));
  border-color: rgba(203, 213, 225, 0.2);
}

.browser-theme-light .estimate-row--luxury {
  background: linear-gradient(135deg, rgba(254, 252, 232, 0.995), rgba(253, 240, 138, 0.64));
  border-color: rgba(250, 204, 21, 0.2);
}

.browser-theme-light .mini-node-bubble {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 10px 24px rgba(148, 163, 184, 0.18);
}

.browser-theme-light .mini-timeline-node--filled .mini-node-bubble {
  color: white;
}

.browser-theme-light .mini-progress-track {
  background: rgba(148, 163, 184, 0.18);
}

.browser-theme-light .empty-icon,
.browser-theme-light .create-tile-icon,
.browser-theme-light .dialog-avatar {
  background: rgba(99, 102, 241, 0.1);
}

.bundle-mobile .page-main {
  padding-top: 20px !important;
}

.bundle-actions {
  width: 100%;
}

.bundle-mobile .hero-title {
  font-size: 2rem !important;
}

.bundle-mobile .hero-stat-grid {
  grid-template-columns: 1fr;
}

.bundle-mobile .bundle-card,
.bundle-mobile .create-tile,
.bundle-mobile .empty-card,
.bundle-mobile .login-card {
  border-radius: 24px !important;
}

.bundle-mobile .create-copy {
  max-width: 100%;
}

.bundle-mobile .mini-timeline {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  min-height: auto;
}

.bundle-mobile .mini-timeline-line {
  left: 20px;
  right: 20px;
  top: 24px;
}

.bundle-mobile .mini-timeline-node {
  min-width: 58px;
}

.bundle-mobile .mini-node-bubble {
  width: 50px;
  height: 50px;
}

.bundle-mobile .bundle-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.bundle-mobile .bundle-actions > :first-child {
  grid-column: 1 / -1;
}

.bundle-mobile .bundle-card,
.bundle-mobile .stat-card,
.bundle-mobile .hero-side-card {
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.mini-timeline::-webkit-scrollbar {
  height: 8px;
}

.mini-timeline::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.32);
  border-radius: 999px;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
