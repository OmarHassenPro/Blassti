<template>
  <AppNavbar />

  <v-container fluid class="py-8 reserved-venues-page" :class="browserThemeClass">
    <v-row justify="center">
      <v-col cols="12" xl="11">
        <v-card rounded="xl" class="pa-4 pa-md-6 reserved-main-card">
          <div class="page-hero mb-6">
            <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4">
              <div class="hero-copy">
                <div class="hero-badge mb-3">
                  <v-icon size="18" class="me-2">mdi-domain</v-icon>
                  Venue management workspace
                </div>

                <div class="text-h4 font-weight-bold hero-title">My venues</div>

                <div class="text-medium-emphasis hero-subtitle">
                  Venues you reserved and venues you own in one place.
                </div>
              </div>

              <div class="d-flex ga-2 flex-wrap hero-chip-group">
                <v-chip color="primary" variant="tonal" class="hero-chip" rounded="lg">
                  <v-icon start size="16">mdi-ticket-confirmation-outline</v-icon>
                  Reserved: {{ reservedVenueCards.length }}
                </v-chip>

                <v-chip color="success" variant="tonal" class="hero-chip" rounded="lg">
                  <v-icon start size="16">mdi-home-city-outline</v-icon>
                  Owned: {{ ownedVenues.length }}
                </v-chip>
              </div>
            </div>
          </div>

          <div class="tabs-shell mb-6">
            <v-tabs v-model="tab" color="primary" class="mb-0 custom-tabs" grow>
              <v-tab value="reserved" class="tab-pill">
                <v-icon start size="18">mdi-ticket-outline</v-icon>
                Reserved venues
              </v-tab>
              <v-tab value="owned" class="tab-pill">
                <v-icon start size="18">mdi-office-building-outline</v-icon>
                Owned venues
              </v-tab>
            </v-tabs>
          </div>

          <v-window v-model="tab">
            <v-window-item value="reserved">
              <v-row>
                <v-col
                  v-for="reservation in reservedVenueCards"
                  :key="reservation.id"
                  cols="12"
                  md="6"
                  xl="4"
                >
                  <v-card rounded="xl" variant="outlined" class="h-100 card-shell venue-card">
                    <div class="image-wrap">
                      <v-img :src="reservation.venue.image || fallbackImage" height="220" cover />
                      <div class="image-overlay" />
                      <div class="image-chip-row">
                        <v-chip size="small" color="primary" variant="flat" rounded="lg">
                          <v-icon start size="14">mdi-map-marker-outline</v-icon>
                          Reserved
                        </v-chip>
                      </div>
                    </div>

                    <v-card-text class="card-content">
                      <div class="text-h6 font-weight-bold mb-1 card-title">
                        {{ reservation.venue.title }}
                      </div>

                      <div class="text-body-2 text-medium-emphasis mb-3 card-subtitle">
                        {{ reservation.venue.location }} ·
                        {{
                          reservation.venue.exact_address ||
                          reservation.venue.contact_info?.address ||
                          'No address'
                        }}
                      </div>

                      <div class="d-flex ga-2 flex-wrap mb-4">
                        <v-chip
                          size="small"
                          color="primary"
                          variant="tonal"
                          rounded="lg"
                          class="info-chip"
                        >
                          {{ reservation.venue.category || 'Venue' }}
                        </v-chip>

                        <v-chip
                          size="small"
                          color="success"
                          variant="tonal"
                          rounded="lg"
                          class="info-chip"
                        >
                          {{ Number(reservation.total_price || 0).toFixed(2) }} TND
                        </v-chip>
                      </div>

                      <div class="details-panel">
                        <div class="info-row">
                          <span class="info-label">Start</span>
                          <span class="info-value">{{ formatDateTime(reservation.start_date) }}</span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">End</span>
                          <span class="info-value">{{ formatDateTime(reservation.end_date) }}</span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">Duration</span>
                          <span class="info-value">
                            {{ reservation.duration }} {{ reservation.duration_unit }}
                          </span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">Status</span>
                          <span class="info-value">
                            <v-chip
                              size="x-small"
                              color="info"
                              variant="tonal"
                              rounded="lg"
                              class="status-chip"
                            >
                              {{ reservation.status }}
                            </v-chip>
                          </span>
                        </div>
                      </div>
                    </v-card-text>

                    <v-card-actions class="card-actions">
                      <v-btn
                        variant="text"
                        color="primary"
                        rounded="lg"
                        prepend-icon="mdi-open-in-new"
                        class="nav-btn"
                        @click="goToVenue(reservation.venue.id)"
                        @contextmenu.prevent="openNavigationMenu($event, `/O_venueinfo?id=${reservation.venue.id}`)"
                      >
                        View venue
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>

                <v-col v-if="!reservedVenueCards.length" cols="12">
                  <v-alert type="info" variant="tonal" rounded="xl" class="empty-alert">
                    <div class="d-flex align-center ga-3">
                      <v-icon size="24">mdi-information-outline</v-icon>
                      <div>You have no venue reservations yet.</div>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="owned">
              <v-row>
                <v-col v-for="venue in ownedVenues" :key="venue.id" cols="12" md="6" xl="4">
                  <v-card rounded="xl" variant="outlined" class="h-100 card-shell venue-card">
                    <div class="image-wrap">
                      <v-img :src="venue.image || fallbackImage" height="220" cover />
                      <div class="image-overlay" />
                      <div class="image-chip-row">
                        <v-chip size="small" color="success" variant="flat" rounded="lg">
                          <v-icon start size="14">mdi-shield-home-outline</v-icon>
                          Owner
                        </v-chip>
                      </div>
                    </div>

                    <v-card-text class="card-content">
                      <div class="text-h6 font-weight-bold mb-1 card-title">{{ venue.title }}</div>

                      <div class="text-body-2 text-medium-emphasis mb-3 card-subtitle">
                        {{ venue.location }} ·
                        {{ venue.exact_address || venue.contact_info?.address || 'No address' }}
                      </div>

                      <div class="d-flex ga-2 flex-wrap mb-4">
                        <v-chip
                          size="small"
                          color="primary"
                          variant="tonal"
                          rounded="lg"
                          class="info-chip"
                        >
                          {{ venue.category || 'Venue' }}
                        </v-chip>

                        <v-chip
                          size="small"
                          variant="outlined"
                          rounded="lg"
                          class="info-chip"
                        >
                          {{ Number(venue.price_per_hour || 0).toFixed(2) }} TND / hour
                        </v-chip>

                        <v-chip
                          size="small"
                          color="error"
                          variant="tonal"
                          rounded="lg"
                          class="info-chip"
                        >
                          Administration blocks: {{ administrationBlockCount(venue) }}
                        </v-chip>
                      </div>

                      <div class="details-panel">
                        <div class="info-row">
                          <span class="info-label">Capacity</span>
                          <span class="info-value">{{ venue.capacity || 0 }} seats</span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">Reservations</span>
                          <span class="info-value">{{ ownerReservationCount(venue.id) }}</span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">Bank holder</span>
                          <span class="info-value">
                            {{ venue.bank_account_info?.account_holder_name || '-' }}
                          </span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">Bank</span>
                          <span class="info-value">{{ venue.bank_account_info?.bank_name || '-' }}</span>
                        </div>

                        <div class="info-row">
                          <span class="info-label">Account no.</span>
                          <span class="info-value">
                            {{ formatMaskedAccount(venue.bank_account_info?.account_number) }}
                          </span>
                        </div>
                      </div>
                    </v-card-text>

                    <v-card-actions class="d-flex flex-wrap ga-2 justify-space-between card-actions">
                      <v-btn
                        variant="text"
                        color="primary"
                        rounded="lg"
                        prepend-icon="mdi-open-in-new"
                        class="nav-btn"
                        @click="goToVenue(venue.id)"
                        @contextmenu.prevent="openNavigationMenu($event, `/O_venueinfo?id=${venue.id}`)"
                      >
                        View venue
                      </v-btn>

                      <v-btn
                        color="error"
                        variant="tonal"
                        prepend-icon="mdi-delete-outline"
                        rounded="lg"
                        class="delete-btn"
                        @click="openDeleteDialog(venue)"
                      >
                        Delete venue
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>

                <v-col v-if="!ownedVenues.length" cols="12">
                  <v-alert type="info" variant="tonal" rounded="xl" class="empty-alert">
                    <div class="d-flex align-center ga-3">
                      <v-icon size="24">mdi-information-outline</v-icon>
                      <div>You do not own any approved venues yet.</div>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <v-menu
      v-model="navigationMenu.show"
      :location-strategy="'connected'"
      :target="[navigationMenu.x, navigationMenu.y]"
      absolute
      offset="10"
      scrim="false"
    >
      <v-list rounded="xl" class="context-menu-list py-2">
        <v-list-subheader class="context-menu-subheader">Navigation options</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-page-next-outline"
          title="Open here"
          @click="navigateToPath(navigationMenu.path)"
        />

        <v-list-item
          prepend-icon="mdi-open-in-new"
          title="Open in new tab"
          @click="openPathInNewTab(navigationMenu.path)"
        />

        <v-list-item
          prepend-icon="mdi-application-outline"
          title="Open in new window"
          @click="openPathInNewWindow(navigationMenu.path)"
        />
      </v-list>
    </v-menu>

    <v-dialog v-model="deleteDialog" max-width="560">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="error">mdi-alert-circle-outline</v-icon>
          Delete venue?
        </v-card-title>

        <v-card-text>
          <div class="mb-3">
            You are about to permanently delete
            <strong>{{ venuePendingDelete?.title || 'this venue' }}</strong>.
          </div>

          <v-alert type="warning" variant="tonal" rounded="lg">
            This will also remove all venue reservations linked to it from local storage.
          </v-alert>
        </v-card-text>

        <v-card-actions class="justify-end ga-2">
          <v-btn variant="text" rounded="lg" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="error" rounded="lg" @click="confirmDeleteVenue">Delete permanently</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="resultDialog.show" max-width="520">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary">mdi-check-decagram-outline</v-icon>
          {{ resultDialog.title }}
        </v-card-title>

        <v-card-text>{{ resultDialog.text }}</v-card-text>

        <v-card-actions class="justify-end">
          <v-btn color="primary" rounded="lg" @click="resultDialog.show = false">Okay</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_Current_User } from "@/dataModel/user"
import {
  can_User_Manage_Venue,
  delete_Venue,
  get_All_Venues,
  maskBankAccountNumber,
} from "@/dataModel/venue"
import {
  delete_Reservations_By_Venue_Id,
  get_Reservations_By_User_Id,
  get_Reservations_By_Venue_Id,
} from "@/dataModel/venue_reservation"

const router = useRouter()
const currentUser = ref(get_Current_User())
const tab = ref("reserved")
const deleteDialog = ref(false)
const venuePendingDelete = ref(null)
const fallbackImage =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"

const resultDialog = reactive({
  show: false,
  title: "",
  text: "",
})

const browserPrefersDark = ref(false)

const navigationMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  path: "",
})

let mediaQuery = null

const allVenues = computed(() => get_All_Venues())
const myReservations = computed(() => get_Reservations_By_User_Id(currentUser.value?.id))

const reservedVenueCards = computed(() =>
  myReservations.value
    .map(reservation => ({
      ...reservation,
      venue: allVenues.value.find(venue => venue.id === reservation.venue_id),
    }))
    .filter(item => item.venue)
)

const ownedVenues = computed(() =>
  allVenues.value.filter(venue => venue.owner_user_id === currentUser.value?.id)
)

const browserThemeClass = computed(() =>
  browserPrefersDark.value ? "browser-theme-dark" : "browser-theme-light"
)

function ownerReservationCount(venueId) {
  return get_Reservations_By_Venue_Id(venueId).length
}

function administrationBlockCount(venue) {
  return Array.isArray(venue?.administration_blocks) ? venue.administration_blocks.length : 0
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "-"
}

function formatMaskedAccount(value) {
  return maskBankAccountNumber(value)
}

function goToVenue(id) {
  router.push(`/O_venueinfo?id=${id}`)
}

function openNavigationMenu(event, path) {
  navigationMenu.x = event.clientX
  navigationMenu.y = event.clientY
  navigationMenu.path = path
  navigationMenu.show = true
}

function closeNavigationMenu() {
  navigationMenu.show = false
  navigationMenu.path = ""
}

function navigateToPath(path) {
  if (!path) return
  closeNavigationMenu()
  router.push(path)
}

function openPathInNewTab(path) {
  if (!path) return
  closeNavigationMenu()
  window.open(path, "_blank")
}

function openPathInNewWindow(path) {
  if (!path) return
  closeNavigationMenu()
  window.open(path, "_blank", "noopener,noreferrer,width=1280,height=860")
}

function handleThemeChange(event) {
  browserPrefersDark.value = !!event.matches
}

function setupBrowserThemeListener() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return

  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  browserPrefersDark.value = mediaQuery.matches

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleThemeChange)
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleThemeChange)
  }
}

function removeBrowserThemeListener() {
  if (!mediaQuery) return

  if (typeof mediaQuery.removeEventListener === "function") {
    mediaQuery.removeEventListener("change", handleThemeChange)
  } else if (typeof mediaQuery.removeListener === "function") {
    mediaQuery.removeListener(handleThemeChange)
  }
}

function openDeleteDialog(venue) {
  if (!can_User_Manage_Venue(currentUser.value, venue)) {
    resultDialog.title = "Action not allowed"
    resultDialog.text = "Only the venue owner or an admin can delete this venue."
    resultDialog.show = true
    return
  }

  venuePendingDelete.value = venue
  deleteDialog.value = true
}

function closeDeleteDialog() {
  deleteDialog.value = false
  venuePendingDelete.value = null
}

function confirmDeleteVenue() {
  const venue = venuePendingDelete.value

  if (!venue) {
    closeDeleteDialog()
    return
  }

  if (!can_User_Manage_Venue(currentUser.value, venue)) {
    closeDeleteDialog()
    resultDialog.title = "Action not allowed"
    resultDialog.text = "You can no longer delete this venue."
    resultDialog.show = true
    return
  }

  const deletedReservations = delete_Reservations_By_Venue_Id(venue.id)
  const deletedVenue = delete_Venue(venue.id)

  closeDeleteDialog()

  if (!deletedVenue) {
    resultDialog.title = "Delete failed"
    resultDialog.text = "The venue could not be deleted."
    resultDialog.show = true
    return
  }

  resultDialog.title = "Venue deleted"
  resultDialog.text = `${deletedVenue.title} was deleted successfully.${deletedReservations.length ? ` ${deletedReservations.length} linked reservation${deletedReservations.length > 1 ? "s were" : " was"} also removed.` : ""}`
  resultDialog.show = true
}

onMounted(() => {
  setupBrowserThemeListener()
})

onBeforeUnmount(() => {
  removeBrowserThemeListener()
})
</script>

<style scoped>
.reserved-venues-page {
  min-height: calc(100vh - 64px);
  transition:
    background 0.35s ease,
    color 0.35s ease;
}

.browser-theme-dark.reserved-venues-page {
  background:
    radial-gradient(circle at top right, rgba(66, 133, 244, 0.12), transparent 30%),
    radial-gradient(circle at top left, rgba(25, 118, 210, 0.12), transparent 28%),
    linear-gradient(180deg, #0d1118 0%, #0a0d14 100%);
}

.browser-theme-light.reserved-venues-page {
  background:
    radial-gradient(circle at top right, rgba(25, 118, 210, 0.08), transparent 28%),
    radial-gradient(circle at top left, rgba(76, 175, 80, 0.07), transparent 26%),
    linear-gradient(180deg, #f7faff 0%, #eef3fb 100%);
}

.reserved-main-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.28);
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.browser-theme-dark .reserved-main-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 0.98), rgba(14, 16, 24, 0.98)) !important;
  border-color: rgba(255, 255, 255, 0.06);
}

.browser-theme-light .reserved-main-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 249, 255, 0.98)) !important;
  border-color: rgba(25, 118, 210, 0.12);
  box-shadow: 0 20px 45px rgba(38, 57, 77, 0.12);
}

.page-hero {
  position: relative;
  padding: 4px 2px 2px;
}

.hero-copy {
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.015em;
  transition:
    background 0.35s ease,
    color 0.35s ease,
    border-color 0.35s ease;
}

.browser-theme-dark .hero-badge {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.browser-theme-light .hero-badge {
  background: rgba(25, 118, 210, 0.08);
  color: #0d47a1;
  border: 1px solid rgba(25, 118, 210, 0.14);
}

.hero-title {
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 700px;
  line-height: 1.65;
}

.hero-chip-group {
  align-items: center;
}

.hero-chip {
  backdrop-filter: blur(8px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.tabs-shell {
  padding: 6px;
  border-radius: 18px;
  transition:
    background 0.35s ease,
    border-color 0.35s ease;
}

.browser-theme-dark .tabs-shell {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.browser-theme-light .tabs-shell {
  background: rgba(25, 118, 210, 0.04);
  border: 1px solid rgba(25, 118, 210, 0.08);
}

.custom-tabs :deep(.v-slide-group__content) {
  gap: 6px;
}

.tab-pill {
  min-height: 48px;
  border-radius: 14px;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.card-shell {
  overflow: hidden;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease,
    background 0.35s ease;
}

.browser-theme-dark .card-shell {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
}

.browser-theme-light .card-shell {
  background: rgba(255, 255, 255, 0.8) !important;
  border-color: rgba(25, 118, 210, 0.1) !important;
}

.venue-card:hover {
  transform: translateY(-6px);
}

.browser-theme-dark .venue-card:hover {
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  border-color: rgba(100, 181, 246, 0.22) !important;
}

.browser-theme-light .venue-card:hover {
  box-shadow: 0 18px 35px rgba(38, 57, 77, 0.12);
  border-color: rgba(25, 118, 210, 0.18) !important;
}

.image-wrap {
  position: relative;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 10, 16, 0.02) 0%, rgba(8, 10, 16, 0.52) 100%);
  pointer-events: none;
}

.image-chip-row {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 1;
}

.card-content {
  padding-top: 18px;
}

.card-title {
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.card-subtitle {
  min-height: 44px;
}

.info-chip {
  font-weight: 600;
}

.details-panel {
  border-radius: 16px;
  padding: 12px 14px;
  transition:
    background 0.35s ease,
    border-color 0.35s ease;
}

.browser-theme-dark .details-panel {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.browser-theme-light .details-panel {
  background: rgba(25, 118, 210, 0.035);
  border: 1px solid rgba(25, 118, 210, 0.08);
}

.info-row {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 700;
  opacity: 0.85;
  min-width: 92px;
}

.info-value {
  text-align: right;
  word-break: break-word;
}

.status-chip {
  font-weight: 700;
}

.card-actions {
  padding: 0 16px 18px;
}

.nav-btn,
.delete-btn {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-btn:hover,
.delete-btn:hover {
  transform: translateY(-1px);
}

.empty-alert {
  border: 1px dashed rgba(25, 118, 210, 0.22);
}

.context-menu-list {
  min-width: 230px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.browser-theme-dark :deep(.context-menu-list) {
  background: rgba(18, 20, 29, 0.98);
  backdrop-filter: blur(12px);
}

.browser-theme-light :deep(.context-menu-list) {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-color: rgba(25, 118, 210, 0.1);
}

.context-menu-subheader {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.dialog-card {
  transition:
    background 0.35s ease,
    border-color 0.35s ease;
}

.browser-theme-dark .dialog-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 1), rgba(14, 16, 24, 1)) !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.browser-theme-light .dialog-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(248, 251, 255, 1)) !important;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

@media (max-width: 959px) {
  .hero-title {
    font-size: 1.8rem !important;
  }

  .card-actions {
    padding-top: 4px;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }
}
</style>