<template>
  <AppNavbar />

  <div class="venue-browsing-shell" :class="browserThemeClass">
    <v-container fluid class="py-8 px-4 px-md-6">
      <v-row justify="center">
        <v-col cols="12" xl="11">
          <v-card rounded="xl" class="hero-surface hero-surface--blended pa-5 pa-md-7 mb-6" elevation="0">
            <div class="page-header page-header--single">
              <div class="hero-copy">
                <div class="text-overline page-kicker mb-2">BLASSTI VENUES</div>

                <div class="text-h3 text-md-h2 font-weight-bold mb-3 page-title">
                  Browse venues across Tunisia
                </div>

                <div class="text-body-1 text-medium-emphasis page-subtitle mb-4">
                  Discover theatres, cinemas, stadiums, hotels, nightlife spaces, and newly approved venues ready for booking.
                </div>

                <div class="hero-search-wrap mb-4">
                  <v-text-field
                    v-model="search"
                    label="Search venues, cities, categories..."
                    variant="outlined"
                    rounded="xl"
                    density="comfortable"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details
                    class="hero-search-field"
                  >
                    <template #append-inner>
                      <v-fade-transition>
                        <v-chip
                          v-if="normalizedSearch"
                          size="small"
                          rounded="lg"
                          color="primary"
                          variant="tonal"
                        >
                          Live search
                        </v-chip>
                      </v-fade-transition>
                    </template>
                  </v-text-field>

                  <div class="d-flex flex-wrap ga-2 mt-3">
                    <v-chip
                      v-for="quickFilter in quickFilterChips"
                      :key="quickFilter.value"
                      rounded="lg"
                      :color="selectedCategory === quickFilter.value ? 'primary' : undefined"
                      :variant="selectedCategory === quickFilter.value ? 'flat' : 'outlined'"
                      class="quick-filter-chip"
                      @click="toggleQuickCategory(quickFilter.value)"
                    >
                      <v-icon start size="16">{{ quickFilter.icon }}</v-icon>
                      {{ quickFilter.label }}
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex flex-wrap ga-2 hero-tags">
                  <v-chip color="primary" variant="tonal" rounded="lg">
                    <v-icon size="16" class="me-2">mdi-domain</v-icon>
                    {{ filteredAndSortedVenues.length }} venues found
                  </v-chip>

                  <v-chip variant="outlined" rounded="lg">
                    <v-icon size="16" class="me-2">mdi-check-decagram-outline</v-icon>
                    {{ availableVenuesCount }} available now
                  </v-chip>

                  <v-chip variant="outlined" rounded="lg">
                    <v-icon size="16" class="me-2">mdi-map-marker-radius-outline</v-icon>
                    {{ locationOptions.length }} cities
                  </v-chip>

                  <v-chip variant="outlined" rounded="lg">
                    <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
                    {{ categoryOptions.length }} categories
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row justify="center" align="start">
        <!-- SIDE FILTERS -->
        <v-col cols="12" lg="3" xl="3">
          <v-card rounded="xl" class="filter-card pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-h6 font-weight-bold">Filters</div>
                <div class="text-caption text-medium-emphasis">Refine venues faster with smart availability-first browsing.</div>
              </div>

              <v-chip
                size="small"
                rounded="lg"
                color="primary"
                :variant="hasActiveFilters ? 'flat' : 'tonal'"
              >
                {{ hasActiveFilters ? "Active" : "Default" }}
              </v-chip>
            </div>

            <div class="filter-status-row mb-4">
              <v-chip
                size="small"
                rounded="lg"
                color="primary"
                :variant="showUnavailable ? 'outlined' : 'tonal'"
              >
                {{ showUnavailable ? 'Showing all venues' : 'Available only' }}
              </v-chip>
              <v-chip
                v-if="hasActiveFilters"
                size="small"
                rounded="lg"
                color="primary"
                variant="flat"
              >
                {{ activeFilterCount }} active
              </v-chip>
            </div>

            <v-select
              v-model="selectedLocation"
              :items="locationOptions"
              label="City / State"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              clearable
              hide-details
              class="mb-4"
            />

            <v-select
              v-model="selectedType"
              :items="typeOptions"
              label="Venue type"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              clearable
              hide-details
              class="mb-4"
            />

            <v-select
              v-model="selectedCategory"
              :items="categoryOptions"
              label="Category"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              clearable
              hide-details
              class="mb-4"
            />

            <div class="filter-section mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-2 font-weight-bold">Availability</div>
                <v-switch
                  v-model="showUnavailable"
                  color="primary"
                  hide-details
                  inset
                  density="compact"
                  class="show-unavailable-switch"
                >
                  <template #label>
                    <span class="text-body-2">Show unavailable</span>
                  </template>
                </v-switch>
              </div>

              <div class="d-flex flex-wrap ga-2 availability-chip-group">
                <v-chip
                  v-for="option in availabilityOptions"
                  :key="option"
                  rounded="lg"
                  filter
                  :color="selectedAvailability === option ? 'primary' : undefined"
                  :variant="selectedAvailability === option ? 'flat' : 'outlined'"
                  class="availability-filter-chip"
                  @click="toggleAvailability(option)"
                >
                  <v-icon start size="16">
                    {{ option === 'Available' ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}
                  </v-icon>
                  {{ option }}
                </v-chip>
              </div>
            </div>

            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hide-details
              class="mb-4"
            />

            <div class="filter-divider mb-4"></div>

            <div v-if="hasActiveFilters" class="active-filter-callout mb-4">
              <div class="text-body-2 font-weight-medium mb-1">Filters are shaping your results</div>
              <div class="text-caption text-medium-emphasis">Remove chips below or reset everything in one click.</div>
            </div>

            <div class="d-flex flex-column ga-3">
              <v-btn
                color="primary"
                rounded="lg"
                variant="flat"
                block
                size="large"
                @click="resetFilters"
              >
                <v-icon start>mdi-filter-off-outline</v-icon>
                Reset filters
              </v-btn>

              <v-btn
                variant="text"
                rounded="lg"
                block
                class="clear-top-btn"
                @click="clearOnlyFilters"
              >
                <v-icon start>mdi-close-circle-outline</v-icon>
                Clear active filters
              </v-btn>

              <div class="text-caption text-medium-emphasis filter-tip">
                Tip: Right-click any venue card or venue button to open it in a new tab or a new window.
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- RESULTS -->
        <v-col cols="12" lg="9" xl="8">
          <v-card rounded="xl" class="results-toolbar pa-3 pa-md-4 mb-4">
            <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ filteredAndSortedVenues.length }} result{{ filteredAndSortedVenues.length === 1 ? "" : "s" }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Refined by your search, filters, and sorting preferences.
                </div>
                <div class="d-flex flex-wrap ga-2 mt-2">
                  <v-chip size="x-small" rounded="lg" :variant="showUnavailable ? 'outlined' : 'tonal'" color="primary">
                    {{ showUnavailable ? 'Including unavailable venues' : 'Unavailable venues hidden' }}
                  </v-chip>
                  <v-chip v-if="normalizedSearch" size="x-small" rounded="lg" variant="outlined">
                    Searching for “{{ truncateText(search, 18) }}”
                  </v-chip>
                </div>
              </div>

              <div class="d-flex flex-wrap ga-2">
                <v-chip size="small" rounded="lg" color="primary" variant="tonal">
                  <v-icon start size="16">mdi-sort</v-icon>
                  {{
                    sortOptions.find(option => option.value === sortBy)?.title || "Highest rating"
                  }}
                </v-chip>

                <v-chip
                  size="small"
                  rounded="lg"
                  :color="hasActiveFilters ? 'primary' : undefined"
                  :variant="hasActiveFilters ? 'tonal' : 'outlined'"
                >
                  <v-icon start size="16">mdi-tune-variant</v-icon>
                  {{ hasActiveFilters ? "Filters applied" : "No filters applied" }}
                </v-chip>

                <v-chip
                  size="small"
                  rounded="lg"
                  :color="showUnavailable ? undefined : 'success'"
                  :variant="showUnavailable ? 'outlined' : 'tonal'"
                >
                  <v-icon start size="16">{{ showUnavailable ? 'mdi-eye-outline' : 'mdi-eye' }}</v-icon>
                  {{ showUnavailable ? 'Showing unavailable too' : 'Only available shown' }}
                </v-chip>
              </div>
            </div>
          </v-card>

          <div v-if="hasActiveFilters || !showUnavailable" class="d-flex flex-wrap ga-2 mb-4 active-chips-wrap">
            <v-chip
              v-if="normalizedSearch"
              closable
              rounded="lg"
              color="primary"
              variant="tonal"
              @click:close="search = ''"
            >
              Search: {{ search }}
            </v-chip>

            <v-chip
              v-if="selectedLocation"
              closable
              rounded="lg"
              color="primary"
              variant="tonal"
              @click:close="selectedLocation = null"
            >
              City/State: {{ selectedLocation }}
            </v-chip>

            <v-chip
              v-if="selectedType"
              closable
              rounded="lg"
              color="primary"
              variant="tonal"
              @click:close="selectedType = null"
            >
              Type: {{ selectedType }}
            </v-chip>

            <v-chip
              v-if="selectedCategory"
              closable
              rounded="lg"
              color="primary"
              variant="tonal"
              @click:close="selectedCategory = null"
            >
              Category: {{ selectedCategory }}
            </v-chip>

            <v-chip
              v-if="selectedAvailability"
              closable
              rounded="lg"
              color="primary"
              variant="tonal"
              @click:close="selectedAvailability = null"
            >
              Availability: {{ selectedAvailability }}
            </v-chip>

            <v-chip
              v-if="!showUnavailable"
              closable
              rounded="lg"
              color="success"
              variant="tonal"
              @click:close="showUnavailable = true"
            >
              Hiding unavailable venues
            </v-chip>
          </div>

          <v-row v-if="filteredAndSortedVenues.length">
            <v-col
              v-for="venue in filteredAndSortedVenues"
              :key="venue.id"
              cols="12"
              sm="6"
              xl="4"
            >
              <v-card
                rounded="xl"
                class="venue-card h-100 d-flex flex-column"
                :class="{ 'venue-card--unavailable': !venue.availability }"
                @click="openVenue(venue)"
                @contextmenu.prevent="openVenueContextMenu($event, venue)"
              >
                <div class="venue-image-wrap">
                  <img
                    :src="venue.image"
                    :alt="venue.title"
                    class="venue-image"
                  />

                  <div class="venue-image-overlay"></div>
                  <div class="venue-image-glow"></div>

                  <div class="venue-image-top">
                    <v-chip
                      size="small"
                      :color="venue.availability ? 'success' : 'error'"
                      variant="elevated"
                      rounded="lg"
                    >
                      {{ venue.availability ? "Available" : "Unavailable" }}
                    </v-chip>
                  </div>

                  <div class="venue-image-top-left">
                    <v-chip
                      size="small"
                      variant="flat"
                      rounded="lg"
                      class="glass-chip"
                    >
                      <v-icon size="15" class="me-1">mdi-map-marker-outline</v-icon>
                      {{ venue.location }}
                    </v-chip>
                  </div>

                  <div class="venue-image-bottom">
                    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                      <div class="text-body-2 d-flex align-center text-white font-weight-medium">
                        <v-icon size="16" class="me-1">mdi-ticket-confirmation-outline</v-icon>
                        {{ venue.category }}
                      </div>

                      <div class="mini-price-pill">
                        {{ venue.price_per_hour }} TND / hr
                      </div>
                    </div>
                  </div>

                  <div class="quick-action-hint">
                    <v-icon size="16" class="me-1">mdi-cursor-default-click-outline</v-icon>
                    Click to open
                  </div>
                </div>

                <v-card-text class="pa-4 pa-md-5 d-flex flex-column flex-grow-1">
                  <div class="d-flex align-start justify-space-between ga-3 mb-2">
                    <div class="text-h6 font-weight-bold venue-title">
                      {{ venue.title }}
                    </div>

                    <div class="rating-pill">
                      <v-icon size="15" color="warning">mdi-star</v-icon>
                      <span>{{ formatRating(venue.review_rating) }}</span>
                    </div>
                  </div>

                  <div class="text-body-2 text-medium-emphasis d-flex align-center mb-2">
                    <v-icon size="16" class="me-1">mdi-map</v-icon>
                    {{ truncateText(venue.exact_address, 55) }}
                  </div>

                  <div class="d-flex flex-wrap ga-2 mb-3">
                    <v-chip size="small" variant="outlined" rounded="lg" class="info-chip">
                      {{ venue.category }}
                    </v-chip>
                    <v-chip size="small" variant="outlined" rounded="lg" class="info-chip">
                      {{ venue.type }}
                    </v-chip>
                  </div>

                  <div class="text-body-2 card-description mb-4">
                    {{ truncateText(venue.description, 120) }}
                  </div>

                  <div class="venue-meta-grid mb-4">
                    <div class="meta-item">
                      <div class="meta-label">Capacity</div>
                      <div class="meta-value">{{ formatNumber(venue.capacity) }}</div>
                    </div>

                    <div class="meta-item">
                      <div class="meta-label">Price / hour</div>
                      <div class="meta-value">{{ venue.price_per_hour }} TND</div>
                    </div>
                  </div>

                  <div class="mt-auto">
                    <div class="d-flex align-center justify-space-between stat-row mb-2">
                      <span class="text-body-2 text-medium-emphasis">Capacity</span>
                      <span class="text-body-2 font-weight-bold">{{ formatNumber(venue.capacity) }}</span>
                    </div>

                    <div class="d-flex align-center justify-space-between stat-row mb-4">
                      <span class="text-body-2 text-medium-emphasis">Price / hour</span>
                      <span class="text-body-2 font-weight-bold">{{ venue.price_per_hour }} TND</span>
                    </div>

                    <div class="d-flex ga-2">
                      <v-btn
                        block
                        rounded="lg"
                        color="primary"
                        variant="flat"
                        size="large"
                        class="venue-action-btn"
                        @click.stop="openVenue(venue)"
                        @contextmenu.prevent.stop="openVenueContextMenu($event, venue)"
                      >
                        <v-icon start>mdi-arrow-top-right</v-icon>
                        View venue
                      </v-btn>

                      <v-btn
                        icon
                        rounded="lg"
                        variant="tonal"
                        color="primary"
                        class="venue-more-btn"
                        @click.stop="openVenue(venue)"
                        @contextmenu.prevent.stop="openVenueContextMenu($event, venue)"
                      >
                        <v-icon>mdi-dots-horizontal</v-icon>
                        <v-tooltip activator="parent" location="top">
                          Right-click for new tab / new window
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card
            v-else
            rounded="xl"
            class="pa-8 text-center empty-card"
          >
            <v-icon size="56" class="mb-4 empty-icon">mdi-domain-off</v-icon>

            <div class="text-h5 font-weight-bold mb-2">No venues found</div>

            <div class="text-body-1 text-medium-emphasis mb-6">
              Try changing your search, filters, or sorting options to discover more places.
              <span v-if="!showUnavailable"> You can also enable unavailable venues from the filter panel.</span>
            </div>

            <div class="d-flex justify-center flex-wrap ga-3">
              <v-btn color="primary" rounded="lg" size="large" @click="resetFilters">
                <v-icon start>mdi-filter-off-outline</v-icon>
                Clear filters
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- Link Context Menu -->
  <v-menu
    v-model="linkContextMenu.show"
    :target="[linkContextMenu.x, linkContextMenu.y]"
    location="top left"
    absolute
    :close-on-content-click="true"
    transition="scale-transition"
  >
    <v-list min-width="220" class="dropdown-list">
      <v-list-subheader>{{ linkContextMenu.label || "Open" }}</v-list-subheader>

      <v-list-item
        class="dropdown-item"
        title="Open in new tab"
        prepend-icon="mdi-open-in-new"
        @click="openContextMenuTargetInNewTab"
      />
      <v-list-item
        class="dropdown-item"
        title="Open in new window"
        prepend-icon="mdi-open-in-app"
        @click="openContextMenuTargetInNewWindow"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_All_Venues } from "@/dataModel/venue"

const router = useRouter()

const linkContextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  href: "",
  label: "",
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

function openVenueContextMenu(event, venue) {
  openRouteContextMenu(event, "/O_venueinfo", venue?.title || "Venue details", { id: venue?.id })
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

const isBrowserDark = ref(false)
let browserThemeMediaQuery = null

function applyBrowserThemePreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
  isBrowserDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
}

function handleBrowserThemeChange(event) {
  isBrowserDark.value = event.matches
}

onMounted(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return

  browserThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  isBrowserDark.value = browserThemeMediaQuery.matches

  if (typeof browserThemeMediaQuery.addEventListener === "function") {
    browserThemeMediaQuery.addEventListener("change", handleBrowserThemeChange)
  } else if (typeof browserThemeMediaQuery.addListener === "function") {
    browserThemeMediaQuery.addListener(handleBrowserThemeChange)
  }

  applyBrowserThemePreference()
})

onBeforeUnmount(() => {
  if (!browserThemeMediaQuery) return

  if (typeof browserThemeMediaQuery.removeEventListener === "function") {
    browserThemeMediaQuery.removeEventListener("change", handleBrowserThemeChange)
  } else if (typeof browserThemeMediaQuery.removeListener === "function") {
    browserThemeMediaQuery.removeListener(handleBrowserThemeChange)
  }
})

const browserThemeClass = computed(() => {
  return isBrowserDark.value ? "theme-dark" : "theme-light"
})

const search = ref("")
const normalizedSearch = computed(() => search.value.trim().toLowerCase())

watch(search, value => {
  if (!value || !value.trim()) {
    search.value = ""
  }
})

const selectedLocation = ref(null)
const selectedType = ref(null)
const selectedCategory = ref(null)
const selectedAvailability = ref(null)
const showUnavailable = ref(false)
const sortBy = ref("rating_desc")

const sortOptions = [
  { title: "Highest rating", value: "rating_desc" },
  { title: "Lowest price", value: "price_asc" },
  { title: "Highest capacity", value: "capacity_desc" },
  { title: "A to Z", value: "title_asc" },
]

const availabilityOptions = ["Available", "Unavailable"]
const quickFilterChips = [
  { label: "Concerts", value: "Concert Hall", icon: "mdi-music" },
  { label: "Sports", value: "Sports Arena", icon: "mdi-basketball" },
  { label: "Cinema", value: "Cinema", icon: "mdi-movie-open-outline" },
  { label: "Nightlife", value: "Nightlife", icon: "mdi-glass-cocktail" },
]

const allVenues = computed(() => get_All_Venues())

const locationOptions = computed(() => {
  return [...new Set(allVenues.value.map(venue => venue.location).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
})

const typeOptions = computed(() => {
  return [...new Set(allVenues.value.map(venue => venue.type).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
})

const categoryOptions = computed(() => {
  return [...new Set(allVenues.value.map(venue => venue.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
})

const availableVenuesCount = computed(() => {
  return allVenues.value.filter(venue => venue.availability).length
})

const unavailableVenuesCount = computed(() => {
  return allVenues.value.filter(venue => !venue.availability).length
})

const filteredVenues = computed(() => {
  const searchValue = normalizedSearch.value

  return allVenues.value.filter(venue => {
    const matchesSearch =
      !searchValue ||
      venue.title?.toLowerCase().includes(searchValue) ||
      venue.location?.toLowerCase().includes(searchValue) ||
      venue.exact_address?.toLowerCase().includes(searchValue) ||
      venue.category?.toLowerCase().includes(searchValue) ||
      venue.type?.toLowerCase().includes(searchValue) ||
      venue.description?.toLowerCase().includes(searchValue)

    const matchesLocation =
      !selectedLocation.value || venue.location === selectedLocation.value

    const matchesType =
      !selectedType.value || venue.type === selectedType.value

    const matchesCategory =
      !selectedCategory.value || venue.category === selectedCategory.value

    const matchesAvailabilityVisibility = showUnavailable.value || venue.availability

    const matchesAvailability =
      !selectedAvailability.value ||
      (selectedAvailability.value === "Available" && venue.availability) ||
      (selectedAvailability.value === "Unavailable" && !venue.availability)

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesCategory &&
      matchesAvailabilityVisibility &&
      matchesAvailability
    )
  })
})

const filteredAndSortedVenues = computed(() => {
  const items = [...filteredVenues.value]

  switch (sortBy.value) {
    case "price_asc":
      return items.sort((a, b) => Number(a.price_per_hour || 0) - Number(b.price_per_hour || 0))

    case "capacity_desc":
      return items.sort((a, b) => Number(b.capacity || 0) - Number(a.capacity || 0))

    case "title_asc":
      return items.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")))

    case "rating_desc":
    default:
      return items.sort((a, b) => Number(b.review_rating || 0) - Number(a.review_rating || 0))
  }
})

const hasActiveFilters = computed(() => {
  return Boolean(
    normalizedSearch.value ||
    selectedLocation.value ||
    selectedType.value ||
    selectedCategory.value ||
    selectedAvailability.value
  )
})

const activeFilterCount = computed(() => {
  return [normalizedSearch.value, selectedLocation.value, selectedType.value, selectedCategory.value, selectedAvailability.value]
    .filter(Boolean).length
})

function clearOnlyFilters() {
  search.value = ""
  selectedLocation.value = null
  selectedType.value = null
  selectedCategory.value = null
  selectedAvailability.value = null
}

function resetFilters() {
  clearOnlyFilters()
  showUnavailable.value = false
  sortBy.value = "rating_desc"
}

function toggleAvailability(option) {
  selectedAvailability.value = selectedAvailability.value === option ? null : option
}

function toggleQuickCategory(category) {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

function formatRating(value) {
  return Number(value || 0).toFixed(1)
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0))
}

function truncateText(text, max = 100) {
  const safeText = String(text || "")
  if (safeText.length <= max) return safeText
  return `${safeText.slice(0, max).trim()}...`
}

function openVenue(venue) {
  router.push(`/O_venueinfo?id=${venue.id}`)
}
</script>

<style scoped>
.venue-browsing-shell {
  min-height: 100vh;
  transition:
    background 0.28s ease,
    color 0.28s ease;
}

/* -------------------- DARK THEME -------------------- */
.venue-browsing-shell.theme-dark {
  background:
    radial-gradient(circle at top, rgba(51, 123, 255, 0.09), transparent 34%),
    linear-gradient(180deg, #0d1117 0%, #101826 100%);
  color: rgba(255, 255, 255, 0.95);
}

/* -------------------- LIGHT THEME -------------------- */
.venue-browsing-shell.theme-light {
  background:
    radial-gradient(circle at top, rgba(51, 123, 255, 0.12), transparent 30%),
    linear-gradient(180deg, #f5f8ff 0%, #edf2fb 100%);
  color: #172033;
}

.page-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-surface {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
  animation: subtlePageIn 0.28s ease-out both;
}

.hero-surface--blended {
  border-radius: 28px;
}

.hero-surface--blended::before,
.hero-surface--blended::after {
  opacity: 0.3;
}

.hero-surface::before,
.hero-surface::after {
  content: "";
  position: absolute;
  inset: auto;
  border-radius: 999px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.22;
  filter: blur(42px);
  animation: heroGlowFloat 9s ease-in-out infinite alternate;
}

.hero-surface::before {
  width: 280px;
  height: 280px;
  top: -110px;
  left: -55px;
  background: radial-gradient(circle, rgba(57, 153, 255, 0.22) 0%, rgba(57, 153, 255, 0) 72%);
}

.hero-surface::after {
  width: 320px;
  height: 320px;
  right: -90px;
  bottom: -140px;
  background: radial-gradient(circle, rgba(0, 197, 255, 0.18) 0%, rgba(0, 197, 255, 0) 72%);
  animation-duration: 11s;
  animation-delay: 0.35s;
}

.venue-browsing-shell.theme-dark .hero-surface {
  border: 1px solid rgba(255, 255, 255, 0.04);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.018), rgba(255, 255, 255, 0.006)),
    rgba(13, 17, 23, 0.18);
  box-shadow: none;
  backdrop-filter: blur(4px);
}

.venue-browsing-shell.theme-light .hero-surface {
  border: 1px solid rgba(19, 35, 62, 0.04);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(248, 251, 255, 0.18)),
    rgba(255, 255, 255, 0.14);
  box-shadow: none;
  backdrop-filter: blur(4px);
}

.page-header--single {
  justify-content: center;
}

.page-header--single .hero-copy {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.hero-copy {
  position: relative;
  z-index: 1;
  flex: 1 1 700px;
}

.hero-aside {
  flex: 0 0 320px;
  max-width: 360px;
}

.page-kicker {
  letter-spacing: 2px;
  color: rgba(var(--v-theme-primary), 0.9);
}

.page-title {
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.page-subtitle {
  max-width: 980px;
  line-height: 1.7;
}

.hero-search-wrap {
  max-width: 1180px;
}

.hero-search-field :deep(.v-field) {
  backdrop-filter: blur(12px);
}

.venue-browsing-shell.theme-dark .hero-search-field :deep(.v-field) {
  background: rgba(9, 14, 23, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.venue-browsing-shell.theme-light .hero-search-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(19, 35, 62, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.quick-filter-chip {
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.quick-filter-chip:hover {
  transform: translateY(-1px);
}

.hero-tags {
  row-gap: 10px;
}

.hero-stat-card,
.filter-card,
.venue-card,
.empty-card,
.results-toolbar {
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.venue-browsing-shell.theme-dark .hero-stat-card,
.venue-browsing-shell.theme-dark .filter-card,
.venue-browsing-shell.theme-dark .venue-card,
.venue-browsing-shell.theme-dark .empty-card,
.venue-browsing-shell.theme-dark .results-toolbar {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.012)),
    rgba(13, 17, 23, 0.92);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(10px);
}

.venue-browsing-shell.theme-light .hero-stat-card,
.venue-browsing-shell.theme-light .filter-card,
.venue-browsing-shell.theme-light .venue-card,
.venue-browsing-shell.theme-light .empty-card,
.venue-browsing-shell.theme-light .results-toolbar {
  border: 1px solid rgba(19, 35, 62, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 251, 255, 0.92)),
    rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 34px rgba(36, 60, 96, 0.12);
  backdrop-filter: blur(10px);
}

.hero-stat-card:hover,
.filter-card:hover,
.results-toolbar:hover {
  transform: translateY(-2px);
}

.hero-aside-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.aside-stat-pill {
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.venue-browsing-shell.theme-dark .aside-stat-pill {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.venue-browsing-shell.theme-light .aside-stat-pill {
  background: rgba(245, 248, 255, 0.86);
  border: 1px solid rgba(18, 36, 58, 0.08);
}

.aside-stat-value {
  font-size: 1.05rem;
  font-weight: 800;
}

.aside-stat-label {
  font-size: 0.8rem;
  opacity: 0.72;
}

.hero-stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.venue-browsing-shell.theme-dark .hero-stat-icon {
  background: rgba(var(--v-theme-primary), 0.16);
  border: 1px solid rgba(var(--v-theme-primary), 0.24);
}

.venue-browsing-shell.theme-light .hero-stat-icon {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
}

.filter-card {
  position: sticky;
  top: 96px;
  animation: subtlePageIn 0.3s ease-out 0.03s both;
}

.filter-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-section {
  border-radius: 18px;
  padding: 12px 12px 4px;
}

.venue-browsing-shell.theme-dark .filter-section {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.venue-browsing-shell.theme-light .filter-section {
  background: rgba(244, 248, 255, 0.9);
  border: 1px solid rgba(18, 36, 58, 0.07);
}

.show-unavailable-switch {
  margin-inline-start: auto;
}

.availability-chip-group {
  padding-bottom: 8px;
}

.availability-filter-chip {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.availability-filter-chip:hover {
  transform: translateY(-1px);
}

.active-filter-callout {
  border-radius: 16px;
  padding: 12px 14px;
}

.venue-browsing-shell.theme-dark .active-filter-callout {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
}

.venue-browsing-shell.theme-light .active-filter-callout {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.14);
}

.clear-top-btn {
  justify-content: flex-start;
}

.filter-divider {
  height: 1px;
}

.venue-browsing-shell.theme-dark .filter-divider {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.venue-browsing-shell.theme-light .filter-divider {
  background: linear-gradient(90deg, transparent, rgba(20, 35, 56, 0.1), transparent);
}

.filter-tip {
  line-height: 1.5;
}

.results-toolbar {
  overflow: hidden;
  animation: subtlePageIn 0.3s ease-out 0.06s both;
}

.active-chips-wrap {
  align-items: center;
}

.venue-card {
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.venue-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.24s ease;
}

.venue-browsing-shell.theme-dark .venue-card::after {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.venue-browsing-shell.theme-light .venue-card::after {
  box-shadow: inset 0 0 0 1px rgba(18, 36, 58, 0.05);
}

.venue-browsing-shell.theme-dark .venue-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.venue-card:hover::after {
  opacity: 1;
}

.venue-browsing-shell.theme-light .venue-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 22px 44px rgba(34, 56, 92, 0.16);
  border-color: rgba(var(--v-theme-primary), 0.22);
}

.venue-image-wrap {
  position: relative;
  height: 230px;
  overflow: hidden;
}

.venue-image-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.18), transparent 28%);
  z-index: 1;
  opacity: 0;
  transition: opacity 0.28s ease;
}

.venue-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.venue-card:hover .venue-image {
  transform: scale(1.08);
}

.venue-card:hover .venue-image-glow {
  opacity: 1;
}

.venue-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.68));
}

.venue-image-top {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  justify-content: flex-end;
  z-index: 2;
}

.venue-image-top-left {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
}

.glass-chip {
  color: white !important;
  background: rgba(17, 20, 29, 0.42) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  backdrop-filter: blur(10px);
}

.venue-image-bottom {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 2;
}

.mini-price-pill {
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(10, 13, 22, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.quick-action-hint {
  position: absolute;
  right: 14px;
  bottom: 48px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: rgba(8, 11, 18, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.22s ease, transform 0.22s ease;
  backdrop-filter: blur(10px);
}

.venue-card:hover .quick-action-hint {
  opacity: 1;
  transform: translateY(0);
}

.venue-title {
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.info-chip {
  transition: transform 0.18s ease, background 0.18s ease;
}

.venue-card:hover .info-chip {
  transform: translateY(-1px);
}

.rating-pill {
  min-width: 62px;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 700;
  flex-shrink: 0;
}

.venue-browsing-shell.theme-dark .rating-pill {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.venue-browsing-shell.theme-light .rating-pill {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(18, 36, 58, 0.08);
}

.card-description {
  line-height: 1.6;
}

.venue-browsing-shell.theme-dark .card-description {
  color: rgba(255, 255, 255, 0.82);
}

.venue-browsing-shell.theme-light .card-description {
  color: rgba(23, 32, 51, 0.82);
}

.venue-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-item {
  padding: 12px 14px;
  border-radius: 16px;
}

.venue-browsing-shell.theme-dark .meta-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.venue-browsing-shell.theme-light .meta-item {
  background: rgba(245, 248, 255, 0.9);
  border: 1px solid rgba(18, 36, 58, 0.07);
}

.meta-label {
  font-size: 0.77rem;
  opacity: 0.72;
  margin-bottom: 4px;
}

.meta-value {
  font-size: 0.98rem;
  font-weight: 700;
}

.stat-row {
  padding-bottom: 6px;
}

.venue-browsing-shell.theme-dark .stat-row {
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}

.venue-browsing-shell.theme-light .stat-row {
  border-bottom: 1px dashed rgba(25, 42, 68, 0.12);
}

.venue-action-btn,
.venue-more-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.venue-card:hover .venue-action-btn,
.venue-card:hover .venue-more-btn {
  transform: translateY(-1px);
}

.empty-card {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-icon {
  opacity: 0.86;
}

.venue-card--unavailable {
  opacity: 0.88;
}

.venue-card--unavailable .venue-image {
  filter: saturate(0.78) brightness(0.92);
}

.venue-card--unavailable .venue-action-btn {
  opacity: 0.92;
}

.dropdown-list {
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 18px !important;
  padding: 8px;
}

.venue-browsing-shell.theme-dark .dropdown-list,
.dropdown-list {
  background: rgba(20, 20, 25, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28);
}

.dropdown-item {
  border-radius: 12px;
  transition: background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease;
}

.dropdown-item:hover {
  transform: translateX(2px);
}

.venue-browsing-shell.theme-dark .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025);
}

.venue-browsing-shell.theme-light .dropdown-item:hover {
  background: rgba(30, 56, 93, 0.06);
  box-shadow: inset 0 0 0 1px rgba(30, 56, 93, 0.04);
}

@keyframes heroGlowFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.18;
  }

  100% {
    transform: translate3d(18px, 10px, 0) scale(1.08);
    opacity: 0.26;
  }
}

@keyframes subtlePageIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1280px) {
  .page-header {
    align-items: start;
  }

  .hero-aside {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

@media (max-width: 960px) {
  .venue-image-wrap {
    height: 210px;
  }

  .filter-card {
    position: static;
    top: auto;
  }
}

@media (max-width: 700px) {
  .page-title {
    font-size: 2rem !important;
  }

  .hero-aside-stats {
    grid-template-columns: 1fr;
  }

  .venue-meta-grid {
    grid-template-columns: 1fr;
  }

  .quick-action-hint {
    display: none;
  }
}
</style>