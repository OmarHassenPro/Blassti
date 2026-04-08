<template>
  <AppNavbar />

  <div class="request-page-shell" :class="browserThemeClass">
    <v-container fluid class="py-6 py-md-8 request-page">
      <v-row justify="center">
        <v-col cols="12" xl="11">
          <div class="page-hero-wrap mb-6">
            <v-card rounded="xl" class="pa-4 pa-md-6 request-hero-card">
              <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-5">
                <div class="hero-copy">
                  <div class="hero-badge mb-3">
                    <v-icon size="18" class="me-2">mdi-office-building-check</v-icon>
                    Venue moderation workspace
                  </div>

                  <div class="text-h4 text-md-h3 font-weight-bold hero-title mb-2">
                    Venue Requests
                  </div>

                  <div class="text-body-1 text-medium-emphasis hero-subtitle">
                    Review pending venue submissions, inspect venue details, and approve or deny each request with a cleaner, production-style workflow.
                  </div>
                </div>

                <div class="hero-side d-flex ga-3 flex-wrap">
                  <v-card rounded="xl" class="stat-card stat-card-pending" variant="flat">
                    <div class="d-flex align-center ga-3">
                      <div class="stat-icon-wrap">
                        <v-icon size="20">mdi-timer-sand</v-icon>
                      </div>
                      <div>
                        <div class="text-caption text-medium-emphasis">Pending</div>
                        <div class="text-h6 font-weight-bold">{{ pendingRequests.length }}</div>
                      </div>
                    </div>
                  </v-card>

                  <v-card rounded="xl" class="stat-card stat-card-approved" variant="flat">
                    <div class="d-flex align-center ga-3">
                      <div class="stat-icon-wrap">
                        <v-icon size="20">mdi-check-decagram</v-icon>
                      </div>
                      <div>
                        <div class="text-caption text-medium-emphasis">Approved</div>
                        <div class="text-h6 font-weight-bold">{{ approvedRequests.length }}</div>
                      </div>
                    </div>
                  </v-card>

                  <v-card rounded="xl" class="stat-card stat-card-denied" variant="flat">
                    <div class="d-flex align-center ga-3">
                      <div class="stat-icon-wrap">
                        <v-icon size="20">mdi-close-octagon</v-icon>
                      </div>
                      <div>
                        <div class="text-caption text-medium-emphasis">Denied</div>
                        <div class="text-h6 font-weight-bold">{{ deniedRequests.length }}</div>
                      </div>
                    </div>
                  </v-card>
                </div>
              </div>
            </v-card>
          </div>

          <v-card rounded="xl" class="pa-4 pa-md-6 request-main-card">
            <div class="toolbar-wrap mb-5">
              <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4 mb-4">
                <div>
                  <div class="text-h5 font-weight-bold mb-1">Requests overview</div>
                  <div class="text-medium-emphasis">
                    Search, inspect, and process venue submissions from owners.
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap align-center">
                  <v-chip color="warning" variant="tonal" rounded="lg" class="toolbar-chip">
                    Pending: {{ pendingRequests.length }}
                  </v-chip>

                  <v-chip color="success" variant="tonal" rounded="lg" class="toolbar-chip">
                    Approved: {{ approvedRequests.length }}
                  </v-chip>

                  <v-chip color="error" variant="tonal" rounded="lg" class="toolbar-chip">
                    Denied: {{ deniedRequests.length }}
                  </v-chip>

                  <v-btn
                    v-if="processedRequests.length"
                    color="primary"
                    variant="outlined"
                    rounded="lg"
                    prepend-icon="mdi-broom"
                    class="toolbar-action-btn"
                    @click="openClearProcessedDialog"
                  >
                    Clear processed
                  </v-btn>
                </div>
              </div>

              <v-row class="mb-1">
                <v-col cols="12" md="8" lg="7">
                  <v-text-field
                    v-model="search"
                    label="Search requests"
                    placeholder="Search by venue, city, category, status, or owner"
                    prepend-inner-icon="mdi-magnify"
                    append-inner-icon="mdi-tune-variant"
                    variant="outlined"
                    rounded="xl"
                    density="comfortable"
                    class="search-field"
                    clearable
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="4" lg="5">
                  <v-card rounded="xl" class="quick-tip-card h-100" variant="flat">
                    <div class="d-flex align-center ga-3">
                      <v-avatar size="42" rounded="lg" class="quick-tip-avatar">
                        <v-icon size="22">mdi-lightbulb-on-outline</v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold">Quick review tip</div>
                        <div class="text-caption text-medium-emphasis">
                          Pending requests stay pinned first, then processed items are sorted by newest review activity.
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div class="request-table-shell">
              <v-table class="rounded-xl request-table">
                <thead>
                  <tr>
                    <th>Venue</th>
                    <th>City</th>
                    <th>Created by</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="request in filteredRequests"
                    :key="request.id"
                    :class="[
                      'request-row',
                      {
                        'row-approved': request.status === 'Approved',
                        'row-denied': request.status === 'Denied',
                      }
                    ]"
                  >
                    <td>
                      <div class="d-flex align-center ga-3 venue-cell">
                        <v-avatar rounded="xl" size="56" class="venue-avatar">
                          <v-img :src="request.cover_image || fallbackImage" cover />
                        </v-avatar>

                        <div class="min-w-0">
                          <div class="font-weight-bold text-body-1 text-truncate">
                            {{ request.title }}
                          </div>
                          <div class="text-caption text-medium-emphasis text-truncate">
                            {{ request.category }} · {{ request.type }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div class="text-body-2 font-weight-medium">{{ request.location }}</div>
                    </td>

                    <td>
                      <div class="font-weight-medium">{{ getOwnerName(request.owner_user_id) }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ getOwnerEmail(request.owner_user_id) }}
                      </div>
                    </td>

                    <td>
                      <v-chip
                        size="small"
                        :color="getStatusColor(request.status)"
                        variant="tonal"
                        rounded="lg"
                        class="status-chip"
                      >
                        <v-icon start size="15">
                          {{
                            request.status === "Approved"
                              ? "mdi-check-circle"
                              : request.status === "Denied"
                                ? "mdi-close-circle"
                                : "mdi-progress-clock"
                          }}
                        </v-icon>
                        {{ request.status }}
                      </v-chip>
                    </td>

                    <td>
                      <div class="text-body-2">{{ formatDate(request.submitted_at) }}</div>
                    </td>

                    <td class="text-right">
                      <div class="d-flex justify-end ga-2 flex-wrap action-group">
                        <v-btn
                          size="small"
                          variant="outlined"
                          rounded="lg"
                          prepend-icon="mdi-file-document-outline"
                          class="action-btn"
                          @click="openDetails(request)"
                        >
                          Details
                        </v-btn>

                        <template v-if="request.status === 'Pending'">
                          <v-btn
                            size="small"
                            color="success"
                            rounded="lg"
                            prepend-icon="mdi-check"
                            class="action-btn"
                            @click="approveRequest(request)"
                          >
                            Approve
                          </v-btn>

                          <v-btn
                            size="small"
                            color="error"
                            variant="outlined"
                            rounded="lg"
                            prepend-icon="mdi-close"
                            class="action-btn"
                            @click="openDenyDialog(request)"
                          >
                            Deny
                          </v-btn>
                        </template>

                        <template v-else>
                          <v-chip
                            size="small"
                            :color="getStatusColor(request.status)"
                            variant="flat"
                            rounded="lg"
                            class="processed-chip"
                          >
                            {{ request.status }}
                          </v-chip>

                          <v-btn
                            size="small"
                            color="error"
                            variant="outlined"
                            rounded="lg"
                            prepend-icon="mdi-delete-outline"
                            class="action-btn"
                            @click="clearSingleProcessedRequest(request)"
                          >
                            Clear
                          </v-btn>
                        </template>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredRequests.length === 0">
                    <td colspan="6" class="text-center py-10">
                      <div class="empty-state">
                        <v-icon size="34" class="mb-3">mdi-inbox-search-outline</v-icon>
                        <div class="text-subtitle-1 font-weight-bold mb-1">
                          No venue requests found
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          Try another search term or clear the current search field.
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="detailsDialog" max-width="1080" transition="dialog-bottom-transition">
        <v-card rounded="xl" class="details-dialog-card" v-if="selectedRequest">
          <div class="details-header">
            <div class="details-header-overlay"></div>

            <v-img
              :src="selectedRequest.cover_image || fallbackImage"
              cover
              height="220"
              class="details-header-image"
            />

            <div class="details-header-content">
              <div class="d-flex flex-column flex-md-row justify-space-between align-md-end ga-4">
                <div>
                  <div class="details-mini-badge mb-3">
                    <v-icon size="16" class="me-2">mdi-office-building-marker-outline</v-icon>
                    Venue submission details
                  </div>

                  <div class="text-h5 text-md-h4 font-weight-bold mb-2">
                    {{ selectedRequest.title }}
                  </div>

                  <div class="d-flex ga-2 flex-wrap align-center">
                    <v-chip size="small" variant="flat" rounded="lg" class="details-soft-chip">
                      {{ selectedRequest.category }}
                    </v-chip>

                    <v-chip size="small" variant="flat" rounded="lg" class="details-soft-chip">
                      {{ selectedRequest.type }}
                    </v-chip>

                    <v-chip
                      size="small"
                      :color="getStatusColor(selectedRequest.status)"
                      variant="tonal"
                      rounded="lg"
                    >
                      {{ selectedRequest.status }}
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap justify-start justify-md-end">
                  <v-btn
                    v-if="selectedRequest.cover_image || fallbackImage"
                    variant="flat"
                    rounded="lg"
                    prepend-icon="mdi-open-in-new"
                    class="header-link-btn"
                    @click="openLinkTarget(selectedRequest.cover_image || fallbackImage, 'tab')"
                    @contextmenu.prevent="openLinkContextMenu($event, selectedRequest.cover_image || fallbackImage)"
                  >
                    Open image
                  </v-btn>

                  <v-btn
                    v-if="selectedRequest.contact_info?.website"
                    variant="flat"
                    rounded="lg"
                    prepend-icon="mdi-web"
                    class="header-link-btn"
                    @click="openLinkTarget(normalizeWebsite(selectedRequest.contact_info?.website), 'tab')"
                    @contextmenu.prevent="openLinkContextMenu($event, normalizeWebsite(selectedRequest.contact_info?.website))"
                  >
                    Visit website
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <v-card-text class="pa-4 pa-md-6">
            <v-row>
              <v-col cols="12" md="5">
                <v-card rounded="xl" class="details-side-card mb-4" variant="flat">
                  <div class="details-cover mb-4">
                    <v-img
                      :src="selectedRequest.cover_image || fallbackImage"
                      cover
                      height="260"
                    />
                  </div>

                  <div class="d-flex ga-2 flex-wrap">
                    <v-btn
                      v-if="selectedRequest.cover_image || fallbackImage"
                      size="small"
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-open-in-new"
                      class="details-link-btn"
                      @click="openLinkTarget(selectedRequest.cover_image || fallbackImage, 'tab')"
                      @contextmenu.prevent="openLinkContextMenu($event, selectedRequest.cover_image || fallbackImage)"
                    >
                      Open in new tab
                    </v-btn>

                    <v-btn
                      v-if="selectedRequest.cover_image || fallbackImage"
                      size="small"
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-monitor-dashboard"
                      class="details-link-btn"
                      @click="openLinkTarget(selectedRequest.cover_image || fallbackImage, 'window')"
                      @contextmenu.prevent="openLinkContextMenu($event, selectedRequest.cover_image || fallbackImage)"
                    >
                      Open in new window
                    </v-btn>
                  </div>
                </v-card>

                <v-row v-if="selectedRequest.extra_images?.length">
                  <v-col
                    v-for="(img, index) in selectedRequest.extra_images"
                    :key="index"
                    cols="4"
                  >
                    <v-card rounded="lg" class="extra-image-card" variant="flat">
                      <v-img :src="img" height="90" cover class="rounded-lg" />
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" md="7">
                <v-row class="mb-1">
                  <v-col cols="12" sm="6">
                    <v-card rounded="xl" class="info-stat-card" variant="flat">
                      <div class="text-caption text-medium-emphasis mb-1">Price per hour</div>
                      <div class="text-h6 font-weight-bold">
                        {{ selectedRequest.price_per_hour }} TND
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-card rounded="xl" class="info-stat-card" variant="flat">
                      <div class="text-caption text-medium-emphasis mb-1">Capacity</div>
                      <div class="text-h6 font-weight-bold">
                        {{ String(selectedRequest.seat_count || selectedRequest.capacity) }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <v-card rounded="xl" class="details-info-card mb-4" variant="flat">
                  <v-list lines="two" class="bg-transparent py-0">
                    <v-list-item title="Venue title" :subtitle="selectedRequest.title" />
                    <v-list-item title="City" :subtitle="selectedRequest.location" />
                    <v-list-item title="Exact address" :subtitle="selectedRequest.exact_address" />
                    <v-list-item title="Category" :subtitle="selectedRequest.category" />
                    <v-list-item title="Type" :subtitle="selectedRequest.type" />
                    <v-list-item
                      title="Dimensions"
                      :subtitle="`${selectedRequest.dimensions?.width_m || 0}m × ${selectedRequest.dimensions?.height_m || 0}m`"
                    />
                    <v-list-item
                      title="Created by"
                      :subtitle="`${getOwnerName(selectedRequest.owner_user_id)} · ${getOwnerEmail(selectedRequest.owner_user_id)}`"
                    />
                    <v-list-item
                      v-if="selectedRequest.reviewed_at"
                      title="Reviewed at"
                      :subtitle="formatDate(selectedRequest.reviewed_at)"
                    />
                  </v-list>
                </v-card>

                <v-card rounded="xl" class="details-info-card mb-4" variant="flat">
                  <div class="section-title mb-2">
                    <v-icon size="18" class="me-2">mdi-text-box-outline</v-icon>
                    Description
                  </div>
                  <div class="text-body-2 section-body">
                    {{ selectedRequest.description || "No description provided." }}
                  </div>
                </v-card>

                <v-card rounded="xl" class="details-info-card mb-4" variant="flat">
                  <div class="section-title mb-3">
                    <v-icon size="18" class="me-2">mdi-card-account-phone-outline</v-icon>
                    Contact
                  </div>

                  <div class="contact-grid">
                    <div class="contact-row">
                      <span class="contact-label">Phone</span>
                      <span class="contact-value">{{ selectedRequest.contact_info?.phone || "-" }}</span>
                    </div>

                    <div class="contact-row">
                      <span class="contact-label">Email</span>
                      <span class="contact-value">{{ selectedRequest.contact_info?.email || "-" }}</span>
                    </div>

                    <div class="contact-row">
                      <span class="contact-label">Website</span>
                      <span class="contact-value">{{ selectedRequest.contact_info?.website || "-" }}</span>
                    </div>

                    <div class="contact-row">
                      <span class="contact-label">Instagram</span>
                      <span class="contact-value">{{ selectedRequest.contact_info?.instagram || "-" }}</span>
                    </div>
                  </div>

                  <div class="d-flex ga-2 flex-wrap mt-4">
                    <v-btn
                      v-if="selectedRequest.contact_info?.email"
                      size="small"
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-email-outline"
                      class="details-link-btn"
                      @click="openLinkTarget(`mailto:${selectedRequest.contact_info?.email}`, 'tab')"
                      @contextmenu.prevent="openLinkContextMenu($event, `mailto:${selectedRequest.contact_info?.email}`)"
                    >
                      Email
                    </v-btn>

                    <v-btn
                      v-if="selectedRequest.contact_info?.website"
                      size="small"
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-web"
                      class="details-link-btn"
                      @click="openLinkTarget(normalizeWebsite(selectedRequest.contact_info?.website), 'tab')"
                      @contextmenu.prevent="openLinkContextMenu($event, normalizeWebsite(selectedRequest.contact_info?.website))"
                    >
                      Website
                    </v-btn>

                    <v-btn
                      v-if="selectedRequest.contact_info?.instagram"
                      size="small"
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-instagram"
                      class="details-link-btn"
                      @click="openLinkTarget(normalizeInstagram(selectedRequest.contact_info?.instagram), 'tab')"
                      @contextmenu.prevent="openLinkContextMenu($event, normalizeInstagram(selectedRequest.contact_info?.instagram))"
                    >
                      Instagram
                    </v-btn>
                  </div>

                  <div class="text-caption text-medium-emphasis mt-3">
                    Right-click any external-link button above to open it in a new tab or a new window.
                  </div>
                </v-card>

                <div v-if="selectedRequest.status === 'Denied'" class="mt-4">
                  <v-card rounded="xl" class="details-info-card" variant="flat">
                    <div class="section-title mb-2">
                      <v-icon size="18" class="me-2">mdi-alert-circle-outline</v-icon>
                      Denial reason
                    </div>
                    <div class="text-body-2 section-body">
                      {{ selectedRequest.denial_reason || "-" }}
                    </div>
                  </v-card>
                </div>

                <div v-if="selectedRequest.status === 'Approved'" class="mt-4">
                  <v-alert type="success" variant="tonal" rounded="lg" density="comfortable">
                    This request has already been approved and published.
                  </v-alert>
                </div>

                <div v-if="selectedRequest.status === 'Denied'" class="mt-4">
                  <v-alert type="error" variant="tonal" rounded="lg" density="comfortable">
                    This request has already been denied.
                  </v-alert>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="justify-end pa-4 pa-md-5 details-actions">
            <v-btn variant="text" rounded="lg" @click="detailsDialog = false">Close</v-btn>

            <template v-if="selectedRequest.status === 'Pending'">
              <v-btn
                color="success"
                rounded="lg"
                prepend-icon="mdi-check"
                @click="approveRequest(selectedRequest)"
              >
                Approve
              </v-btn>

              <v-btn
                color="error"
                variant="outlined"
                rounded="lg"
                prepend-icon="mdi-close"
                @click="openDenyDialog(selectedRequest)"
              >
                Deny
              </v-btn>
            </template>

            <template v-else>
              <v-btn
                color="error"
                variant="outlined"
                rounded="lg"
                prepend-icon="mdi-delete-outline"
                @click="clearSingleProcessedRequest(selectedRequest)"
              >
                Clear request
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="denyDialog" max-width="560" transition="dialog-transition">
        <v-card rounded="xl" class="action-dialog-card">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
            <v-icon size="22" color="error">mdi-close-octagon-outline</v-icon>
            Deny venue request
          </v-card-title>

          <v-card-text class="pt-2">
            <div class="text-body-2 text-medium-emphasis mb-4">
              Select a reason for denying this request. You can also provide a custom reason if needed.
            </div>

            <v-select
              v-model="denyReason"
              :items="denyReasonOptions"
              label="Choose a reason"
              variant="outlined"
              rounded="lg"
              class="mb-4"
            />

            <v-textarea
              v-if="denyReason === 'Other'"
              v-model="denyCustomReason"
              label="Custom reason"
              rows="4"
              variant="outlined"
              rounded="lg"
              auto-grow
            />
          </v-card-text>

          <v-card-actions class="justify-end px-4 pb-4">
            <v-btn variant="text" rounded="lg" @click="closeDenyDialog">Cancel</v-btn>
            <v-btn color="error" rounded="lg" prepend-icon="mdi-close" @click="denyRequestConfirmed">
              Deny request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="clearProcessedDialog" max-width="520" transition="dialog-transition">
        <v-card rounded="xl" class="action-dialog-card">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
            <v-icon size="22" color="error">mdi-broom</v-icon>
            Clear processed requests
          </v-card-title>

          <v-card-text class="pt-2">
            <div class="text-body-2 text-medium-emphasis">
              This will permanently remove all approved and denied venue requests from the list.
            </div>
          </v-card-text>

          <v-card-actions class="justify-end px-4 pb-4">
            <v-btn variant="text" rounded="lg" @click="clearProcessedDialog = false">Cancel</v-btn>
            <v-btn color="error" rounded="lg" prepend-icon="mdi-delete-sweep" @click="clearProcessedRequests">
              Clear all processed
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-menu
        v-model="linkMenu.show"
        :target="[linkMenu.x, linkMenu.y]"
        location="bottom start"
        absolute
      >
        <v-card rounded="xl" class="link-context-card" min-width="220">
          <v-list density="compact" nav class="py-1">
            <v-list-item
              prepend-icon="mdi-open-in-new"
              title="Open in new tab"
              @click="openContextLinkInTab"
            />
            <v-list-item
              prepend-icon="mdi-monitor-dashboard"
              title="Open in new window"
              @click="openContextLinkInWindow"
            />
            <v-list-item
              prepend-icon="mdi-content-copy"
              title="Copy link"
              @click="copyContextLink"
            />
          </v-list>
        </v-card>
      </v-menu>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="2600"
        location="bottom right"
        rounded="pill"
        class="request-snackbar"
      >
        {{ snackbar.text }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount } from "vue"
import { useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_Current_User, get_User_By_Id } from "@/dataModel/user"
import {
  get_All_Venue_Requests,
  approve_Venue_Request,
  deny_Venue_Request,
  delete_Venue_Request,
} from "@/dataModel/venue_request"

const theme = useTheme()

const search = ref("")
const detailsDialog = ref(false)
const denyDialog = ref(false)
const clearProcessedDialog = ref(false)
const selectedRequest = ref(null)
const requestToDeny = ref(null)

const denyReason = ref("")
const denyCustomReason = ref("")
const denyReasonOptions = [
  "Incomplete venue information",
  "Invalid contact details",
  "Duplicate venue",
  "Unclear or unrealistic pricing",
  "Inappropriate content",
  "Other",
]

const fallbackImage =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop"

const snackbar = reactive({
  show: false,
  text: "",
  color: "primary",
})

const isBrowserDark = ref(false)
const browserThemeClass = computed(() =>
  isBrowserDark.value ? "browser-dark" : "browser-light"
)

const linkMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  href: "",
})

const currentUser = ref(get_Current_User())

const allRequests = computed(() => get_All_Venue_Requests())

const filteredRequests = computed(() => {
  const q = search.value.trim().toLowerCase()

  const list = !q
    ? [...allRequests.value]
    : allRequests.value.filter(request => {
        const owner = get_User_By_Id(request.owner_user_id)
        const ownerName = owner ? `${owner.first_name} ${owner.last_name}`.toLowerCase() : ""
        return (
          request.title?.toLowerCase().includes(q) ||
          request.location?.toLowerCase().includes(q) ||
          request.category?.toLowerCase().includes(q) ||
          request.status?.toLowerCase().includes(q) ||
          ownerName.includes(q)
        )
      })

  return list.sort((a, b) => {
    const statusOrder = {
      Pending: 0,
      Approved: 1,
      Denied: 2,
    }

    const aOrder = statusOrder[a.status] ?? 99
    const bOrder = statusOrder[b.status] ?? 99

    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
  })
})

const pendingRequests = computed(() =>
  allRequests.value.filter(request => request.status === "Pending")
)

const approvedRequests = computed(() =>
  allRequests.value.filter(request => request.status === "Approved")
)

const deniedRequests = computed(() =>
  allRequests.value.filter(request => request.status === "Denied")
)

const processedRequests = computed(() =>
  allRequests.value.filter(
    request => request.status === "Approved" || request.status === "Denied"
  )
)

function notify(text, color = "primary") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function getOwnerName(userId) {
  const user = get_User_By_Id(userId)
  if (!user) return "Unknown user"
  return `${user.first_name} ${user.last_name}`.trim()
}

function getOwnerEmail(userId) {
  const user = get_User_By_Id(userId)
  return user?.email || "-"
}

function formatDate(dateString) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString()
}

function getStatusColor(status) {
  if (status === "Approved") return "success"
  if (status === "Denied") return "error"
  return "warning"
}

function normalizeWebsite(value) {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function normalizeInstagram(value) {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value

  const cleaned = String(value).trim().replace(/^@/, "")
  if (cleaned.includes("instagram.com/")) {
    return `https://${cleaned}`
  }

  return `https://instagram.com/${cleaned}`
}

function openLinkTarget(href, mode = "tab") {
  if (!href || typeof window === "undefined") return

  if (mode === "window") {
    window.open(href, "_blank", "noopener,noreferrer,width=1200,height=800")
    return
  }

  window.open(href, "_blank", "noopener,noreferrer")
}

function openLinkContextMenu(event, href) {
  if (!href) return
  linkMenu.x = event.clientX
  linkMenu.y = event.clientY
  linkMenu.href = href
  linkMenu.show = true
}

function closeLinkContextMenu() {
  linkMenu.show = false
  linkMenu.href = ""
}

function openContextLinkInTab() {
  openLinkTarget(linkMenu.href, "tab")
  closeLinkContextMenu()
}

function openContextLinkInWindow() {
  openLinkTarget(linkMenu.href, "window")
  closeLinkContextMenu()
}

async function copyContextLink() {
  if (!linkMenu.href) return

  try {
    await navigator.clipboard.writeText(linkMenu.href)
    notify("Link copied.", "success")
  } catch {
    notify("Could not copy the link.", "error")
  }

  closeLinkContextMenu()
}

function openDetails(request) {
  selectedRequest.value = request
  detailsDialog.value = true
}

function approveRequest(request) {
  if (request.status !== "Pending") {
    notify("This request has already been processed.", "warning")
    return
  }

  const result = approve_Venue_Request(
    request.id,
    currentUser.value?.id ?? null
  )

  if (!result?.success) {
    notify(result?.message || "Could not approve this request.", "error")
    return
  }

  detailsDialog.value = false
  notify(result.message || "Venue approved and published.", "success")
}

function openDenyDialog(request) {
  if (request.status !== "Pending") {
    notify("This request has already been processed.", "warning")
    return
  }

  requestToDeny.value = request
  denyReason.value = ""
  denyCustomReason.value = ""
  denyDialog.value = true
}

function closeDenyDialog() {
  denyDialog.value = false
  requestToDeny.value = null
  denyReason.value = ""
  denyCustomReason.value = ""
}

function denyRequestConfirmed() {
  if (!requestToDeny.value) return

  if (requestToDeny.value.status !== "Pending") {
    notify("This request has already been processed.", "warning")
    closeDenyDialog()
    return
  }

  if (!denyReason.value) {
    notify("Please choose a denial reason.", "error")
    return
  }

  if (denyReason.value === "Other" && !denyCustomReason.value.trim()) {
    notify("Please write the custom denial reason.", "error")
    return
  }

  const result = deny_Venue_Request(
    requestToDeny.value.id,
    currentUser.value?.id ?? null,
    denyReason.value,
    denyCustomReason.value.trim()
  )

  closeDenyDialog()

  if (!result?.success) {
    notify(result?.message || "Could not deny this request.", "error")
    return
  }

  detailsDialog.value = false
  notify(result.message || "Venue request denied.", "warning")
}

function clearSingleProcessedRequest(request) {
  if (!request || request.status === "Pending") {
    notify("Only approved or denied requests can be cleared.", "error")
    return
  }

  delete_Venue_Request(request.id)

  if (selectedRequest.value?.id === request.id) {
    selectedRequest.value = null
    detailsDialog.value = false
  }

  notify("Processed request cleared.", "success")
}

function openClearProcessedDialog() {
  clearProcessedDialog.value = true
}

function clearProcessedRequests() {
  const processed = processedRequests.value

  processed.forEach(request => {
    delete_Venue_Request(request.id)
  })

  if (
    selectedRequest.value &&
    (selectedRequest.value.status === "Approved" || selectedRequest.value.status === "Denied")
  ) {
    selectedRequest.value = null
    detailsDialog.value = false
  }

  clearProcessedDialog.value = false
  notify("All processed requests cleared.", "success")
}

function applyBrowserTheme() {
  if (typeof window === "undefined") return

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  isBrowserDark.value = prefersDark

  const targetThemeName = prefersDark ? "dark" : "light"
  const availableThemes = theme?.themes?.value ? Object.keys(theme.themes.value) : []

  if (availableThemes.includes(targetThemeName)) {
    theme.global.name.value = targetThemeName
  }
}

let browserThemeMediaQuery = null

function handleBrowserThemeChange() {
  applyBrowserTheme()
}

onMounted(() => {
  if (typeof window === "undefined") return

  applyBrowserTheme()
  browserThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  if (browserThemeMediaQuery.addEventListener) {
    browserThemeMediaQuery.addEventListener("change", handleBrowserThemeChange)
  } else if (browserThemeMediaQuery.addListener) {
    browserThemeMediaQuery.addListener(handleBrowserThemeChange)
  }
})

onBeforeUnmount(() => {
  if (!browserThemeMediaQuery) return

  if (browserThemeMediaQuery.removeEventListener) {
    browserThemeMediaQuery.removeEventListener("change", handleBrowserThemeChange)
  } else if (browserThemeMediaQuery.removeListener) {
    browserThemeMediaQuery.removeListener(handleBrowserThemeChange)
  }
})
</script>

<style scoped>
.request-page-shell {
  min-height: 100vh;
  transition: background 0.35s ease, color 0.35s ease;
}

.browser-dark {
  background:
    radial-gradient(circle at top right, rgba(74, 144, 226, 0.12), transparent 24%),
    radial-gradient(circle at top left, rgba(0, 188, 212, 0.08), transparent 20%),
    linear-gradient(180deg, #0a0d14 0%, #0d1018 38%, #0b0f17 100%);
}

.browser-light {
  background:
    radial-gradient(circle at top right, rgba(33, 150, 243, 0.11), transparent 26%),
    radial-gradient(circle at top left, rgba(0, 188, 212, 0.08), transparent 20%),
    linear-gradient(180deg, #f5f8ff 0%, #eef3fb 50%, #f8fbff 100%);
}

.request-page {
  background: transparent;
}

.page-hero-wrap {
  position: relative;
}

.request-hero-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.browser-dark .request-hero-card,
.browser-dark .request-main-card,
.browser-dark .details-dialog-card,
.browser-dark .action-dialog-card,
.browser-dark .link-context-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 0.96), rgba(14, 16, 24, 0.98)) !important;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.3);
}

.browser-light .request-hero-card,
.browser-light .request-main-card,
.browser-light .details-dialog-card,
.browser-light .action-dialog-card,
.browser-light .link-context-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 255, 0.98)) !important;
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 50px rgba(31, 41, 55, 0.1);
}

.request-main-card {
  backdrop-filter: blur(18px);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.request-hero-card:hover,
.request-main-card:hover {
  transform: translateY(-1px);
}

.hero-copy {
  max-width: 720px;
}

.hero-badge,
.details-mini-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.browser-dark .hero-badge,
.browser-dark .details-mini-badge {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.browser-light .hero-badge,
.browser-light .details-mini-badge {
  background: rgba(33, 150, 243, 0.08);
  color: #114b7a;
  border: 1px solid rgba(33, 150, 243, 0.12);
}

.hero-title {
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.hero-subtitle {
  max-width: 760px;
}

.hero-side {
  align-items: stretch;
}

.stat-card {
  min-width: 170px;
  padding: 16px 18px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  border: 1px solid transparent;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.browser-dark .stat-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.07);
}

.browser-light .stat-card {
  background: rgba(255, 255, 255, 0.74) !important;
  border-color: rgba(17, 24, 39, 0.08);
}

.stat-icon-wrap {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
}

.stat-card-pending .stat-icon-wrap {
  background: rgba(251, 140, 0, 0.14);
}

.stat-card-approved .stat-icon-wrap {
  background: rgba(46, 125, 50, 0.14);
}

.stat-card-denied .stat-icon-wrap {
  background: rgba(198, 40, 40, 0.14);
}

.toolbar-wrap {
  position: relative;
}

.toolbar-chip {
  font-weight: 700;
}

.toolbar-action-btn {
  min-width: 150px;
}

.search-field {
  transition: transform 0.2s ease;
}

.search-field:focus-within {
  transform: translateY(-1px);
}

.quick-tip-card {
  padding: 14px 16px;
  border: 1px solid transparent;
}

.browser-dark .quick-tip-card,
.browser-dark .details-side-card,
.browser-dark .details-info-card,
.browser-dark .info-stat-card,
.browser-dark .extra-image-card {
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.browser-light .quick-tip-card,
.browser-light .details-side-card,
.browser-light .details-info-card,
.browser-light .info-stat-card,
.browser-light .extra-image-card {
  background: rgba(255, 255, 255, 0.78) !important;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.quick-tip-avatar {
  background: rgba(33, 150, 243, 0.12);
}

.request-table-shell {
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid transparent;
}

.browser-dark .request-table-shell {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
}

.browser-light .request-table-shell {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(17, 24, 39, 0.08);
}

.request-table {
  overflow: hidden;
  border-radius: 20px;
  background: transparent;
}

.venue-cell {
  min-width: 220px;
}

.venue-avatar {
  flex-shrink: 0;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
}

.request-row td {
  transition: background 0.2s ease, transform 0.2s ease;
}

.browser-dark .request-row:hover td {
  background: rgba(255, 255, 255, 0.04);
}

.browser-light .request-row:hover td {
  background: rgba(17, 24, 39, 0.03);
}

.row-approved td {
  background: rgba(46, 125, 50, 0.06);
}

.row-denied td {
  background: rgba(198, 40, 40, 0.06);
}

.status-chip {
  font-weight: 700;
}

.action-group {
  align-items: center;
}

.action-btn {
  min-width: 98px;
}

.processed-chip {
  min-width: 92px;
  justify-content: center;
  font-weight: 700;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.details-dialog-card {
  overflow: hidden;
}

.details-header {
  position: relative;
  overflow: hidden;
}

.details-header-image {
  filter: saturate(1.06);
}

.details-header-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(5, 7, 11, 0.1), rgba(5, 7, 11, 0.72)),
    linear-gradient(90deg, rgba(10, 14, 24, 0.9), rgba(10, 14, 24, 0.25));
}

.details-header-content {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  padding: 24px;
  color: white;
}

.details-soft-chip,
.header-link-btn {
  background: rgba(255, 255, 255, 0.14) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
}

.details-cover {
  overflow: hidden;
  border-radius: 18px;
}

.details-side-card,
.details-info-card,
.info-stat-card {
  padding: 16px;
}

.info-stat-card {
  height: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 800;
  font-size: 0.98rem;
}

.section-body {
  line-height: 1.75;
}

.contact-grid {
  display: grid;
  gap: 10px;
}

.contact-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(128, 128, 128, 0.18);
}

.contact-row:last-child {
  border-bottom: 0;
}

.contact-label {
  font-weight: 700;
  min-width: 84px;
}

.contact-value {
  text-align: right;
  color: rgba(var(--v-theme-on-surface), 0.82);
  word-break: break-word;
}

.details-link-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.details-link-btn:hover {
  transform: translateY(-1px);
}

.extra-image-card {
  overflow: hidden;
}

.details-actions {
  border-top: 1px solid rgba(128, 128, 128, 0.12);
}

.action-dialog-card {
  overflow: hidden;
}

.link-context-card {
  overflow: hidden;
}

.request-snackbar {
  backdrop-filter: blur(10px);
}

:deep(.v-table .v-table__wrapper > table) {
  background: transparent;
}

:deep(.v-table th) {
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.browser-dark :deep(.v-table th) {
  background: rgba(255, 255, 255, 0.03);
}

.browser-light :deep(.v-table th) {
  background: rgba(17, 24, 39, 0.03);
}

:deep(.v-table td) {
  vertical-align: middle;
}

.browser-dark :deep(.v-field) {
  background: rgba(255, 255, 255, 0.03) !important;
}

.browser-light :deep(.v-field) {
  background: rgba(255, 255, 255, 0.82) !important;
}

.browser-dark :deep(.v-field__outline) {
  --v-field-border-opacity: 0.12;
}

.browser-light :deep(.v-field__outline) {
  --v-field-border-opacity: 0.14;
}

:deep(.v-list-item-title) {
  white-space: normal;
}

@media (max-width: 960px) {
  .details-header-content {
    padding: 18px;
  }

  .stat-card {
    min-width: 150px;
    flex: 1 1 150px;
  }
}

@media (max-width: 600px) {
  .contact-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .contact-value {
    text-align: left;
  }

  .header-link-btn {
    width: 100%;
  }
}
</style>