<template>
  <v-app>
    <AppNavbar />

    <v-main class="event-page-shell" :class="[browserThemeClass, `theme-${currentTheme}`, { 'is-mobile-view': isMobile }]">
      <div class="page-background-orb orb-1"></div>
      <div class="page-background-orb orb-2"></div>

      <v-container fluid class="py-8 px-4 px-md-6 page-container">
        <v-row justify="center">
          <v-col cols="12" xl="11">
            <v-card class="hero-surface hero-surface--blended pa-5 pa-md-7 rounded-xl rounded-xxl mb-6" elevation="0">
              <div class="page-header page-header--single">
                <div class="hero-copy">
                  <div class="text-overline page-kicker mb-2">BLASSTI EVENTS</div>

                  <div class="text-h3 text-md-h2 font-weight-bold mb-3 page-title">
                    Browse events across Tunisia
                  </div>

                  <div class="text-body-1 text-medium-emphasis page-subtitle mb-4">
                    Explore upcoming experiences, discover artists, and book the right seat faster with availability-first browsing.
                  </div>

                  <div class="hero-search-wrap mb-4">
                    <v-text-field
                      v-model="searchQuery"
                      label="Search events, cities, venues, artists..."
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
                            v-if="searchQuery"
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
                        :color="selectedCategories.includes(quickFilter.value) ? 'primary' : undefined"
                        :variant="selectedCategories.includes(quickFilter.value) ? 'flat' : 'outlined'"
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
                      <v-icon size="16" class="me-2">mdi-ticket-confirmation-outline</v-icon>
                      {{ filteredEvents.length }} events found
                    </v-chip>

                    <v-chip variant="outlined" rounded="lg">
                      <v-icon size="16" class="me-2">mdi-check-decagram-outline</v-icon>
                      {{ availableNowCount }} bookable now
                    </v-chip>

                    <v-chip variant="outlined" rounded="lg">
                      <v-icon size="16" class="me-2">mdi-map-marker-radius-outline</v-icon>
                      {{ cities.length }} cities
                    </v-chip>

                    <v-chip variant="outlined" rounded="lg">
                      <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
                      {{ labels.length }} categories
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="isBelowDesktop" class="mb-4">
          <v-col cols="12">
            <v-card class="pa-3 pa-sm-4 rounded-xl rounded-xxl mobile-browse-toolbar" elevation="0">
              <div class="d-flex align-center justify-space-between ga-3 flex-wrap mb-3">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Browse smarter on smaller screens</div>
                  <div class="text-caption text-medium-emphasis">
                    Filters move into a touch-friendly panel and cards rebalance for phone and tablet.
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap mobile-toolbar-actions">
                  <v-btn
                    color="primary"
                    rounded="xl"
                    class="mobile-toolbar-btn"
                    @click="mobileFiltersOpen = true"
                  >
                    <v-icon start size="18">mdi-tune-variant</v-icon>
                    Filters
                    <v-badge
                      v-if="mobileActiveFilterCount"
                      :content="mobileActiveFilterCount"
                      color="primary"
                      inline
                      class="ms-2"
                    />
                  </v-btn>

                  <v-btn
                    variant="tonal"
                    rounded="xl"
                    class="mobile-toolbar-btn"
                    @click="resetAllFilters"
                  >
                    <v-icon start size="18">mdi-filter-remove-outline</v-icon>
                    Reset
                  </v-btn>
                </div>
              </div>

              <div class="mobile-summary-strip">
                <v-chip size="small" variant="tonal" class="summary-chip">
                  <v-icon start size="16">mdi-ticket-confirmation-outline</v-icon>
                  {{ filteredEvents.length }} results
                </v-chip>

                <v-chip size="small" variant="tonal" class="summary-chip">
                  <v-icon start size="16">mdi-sort</v-icon>
                  {{ currentSortLabel }}
                </v-chip>

                <v-chip size="small" variant="tonal" class="summary-chip">
                  <v-icon start size="16">mdi-map-marker</v-icon>
                  {{ locationCity || "All cities" }}
                </v-chip>

                <v-chip size="small" variant="tonal" class="summary-chip">
                  <v-icon start size="16">mdi-shape-outline</v-icon>
                  {{ selectedCategories.length ? selectedCategories.length + " selected" : "All categories" }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="ga-md-0">
          <v-col v-if="!isBelowDesktop" cols="12" lg="3" xl="3" class="filter-column">
            <v-card class="pa-4 pa-md-5 rounded-xl rounded-xxl filter-card" elevation="0">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <div class="section-icon-wrap me-3">
                    <v-icon size="20">mdi-tune-variant</v-icon>
                  </div>
                  <div>
                    <div class="text-h6 font-weight-bold">Filters</div>
                    <div class="text-caption text-medium-emphasis">
                      Narrow down your results
                    </div>
                    <div
                      v-if="isMobile"
                      class="text-caption text-medium-emphasis mt-1 mobile-filter-note"
                    >
                      Optimized for touch and smaller screens
                    </div>
                  </div>
                </div>

                <v-chip size="small" variant="tonal" class="filter-count-chip">
                  {{ filteredEvents.length }}
                </v-chip>
              </div>

              <div class="filter-toolbar mb-4">
                <v-select
                  v-model="sortBy"
                  :items="sortOptions"
                  item-title="label"
                  item-value="value"
                  label="Sort by"
                  variant="outlined"
                  density="comfortable"
                  class="enhanced-field"
                />

                <div class="toggle-stack mt-1">
                  <v-switch
                    v-model="showSoldOutEvents"
                    label="Show sold out events"
                    hide-details
                    inset
                    color="error"
                    density="comfortable"
                    class="enhanced-switch"
                  />
                  <v-switch
                    v-model="showPastEvents"
                    label="Show past events"
                    hide-details
                    inset
                    color="grey-darken-1"
                    density="comfortable"
                    class="enhanced-switch"
                  />
                </div>

                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  class="mt-3 reset-filter-btn"
                  @click="resetAllFilters"
                >
                  <v-icon start size="18">mdi-filter-remove-outline</v-icon>
                  Clear filters
                </v-btn>
              </div>

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
                  Categories
                </div>

                <v-chip-group
                  v-model="selectedCategories"
                  multiple
                  column
                  class="filter-chip-group"
                >
                  <v-chip
                    v-for="label in labels"
                    :key="label"
                    :value="label"
                    filter
                    variant="outlined"
                    class="filter-chip"
                  >
                    {{ label }}
                  </v-chip>
                </v-chip-group>
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-calendar-range</v-icon>
                  Date range
                </div>

                <v-menu
                  v-model="fromMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="fromDateDisplay"
                      label="From"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      class="mb-3 enhanced-field"
                      prepend-inner-icon="mdi-calendar-month-outline"
                    />
                  </template>

                  <v-card class="date-picker-card">
                    <v-date-picker v-model="fromDate" />
                    <v-card-actions class="justify-end">
                      <v-btn variant="text" @click="fromMenu = false">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>

                <v-menu
                  v-model="toMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="toDateDisplay"
                      label="To"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      class="enhanced-field"
                      prepend-inner-icon="mdi-calendar-end-outline"
                    />
                  </template>

                  <v-card class="date-picker-card">
                    <v-date-picker v-model="toDate" />
                    <v-card-actions class="justify-end">
                      <v-btn variant="text" @click="toMenu = false">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                  City
                </div>
                <v-select
                  v-model="locationCity"
                  :items="cities"
                  label="Select city"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  class="enhanced-field"
                  prepend-inner-icon="mdi-city-variant-outline"
                />
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-seat-outline</v-icon>
                  Availability
                </div>
                <div class="checkbox-stack">
                  <v-checkbox
                    v-model="availability.available"
                    label="Available"
                    hide-details
                    density="comfortable"
                    color="success"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="availability.almostSold"
                    label="Almost sold out"
                    hide-details
                    density="comfortable"
                    color="warning"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="availability.soldOut"
                    label="Sold out"
                    hide-details
                    density="comfortable"
                    color="error"
                    class="enhanced-checkbox"
                  />
                </div>
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-account-music-outline</v-icon>
                  Artist
                </div>
                <v-select
                  v-model="artist"
                  :items="artistOptions"
                  item-title="label"
                  item-value="value"
                  label="Select artist"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  class="enhanced-field"
                  prepend-inner-icon="mdi-microphone-outline"
                />
              </div>

              <v-divider class="my-5 section-divider" />

              <div class="filter-group">
                <div class="filter-label">
                  <v-icon size="16" class="me-2">mdi-badge-account-outline</v-icon>
                  Age restriction
                </div>
                <div class="checkbox-stack">
                  <v-checkbox
                    v-model="ageRestrictions.allAges"
                    label="All ages"
                    hide-details
                    density="comfortable"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="ageRestrictions.fifteenPlus"
                    label="15+"
                    hide-details
                    density="comfortable"
                    class="enhanced-checkbox"
                  />
                  <v-checkbox
                    v-model="ageRestrictions.eighteenPlus"
                    label="18+"
                    hide-details
                    density="comfortable"
                    class="enhanced-checkbox"
                  />
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="9" xl="8" class="results-column">
            <v-card class="pa-4 pa-md-5 rounded-xl rounded-xxl results-card" elevation="0">
              <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-5 ga-4">
                <div>
                  <div class="d-flex align-center mb-1">
                    <div class="section-icon-wrap me-3">
                      <v-icon size="20">mdi-calendar-search-outline</v-icon>
                    </div>
                    <div class="text-h5 font-weight-bold">Upcoming Events</div>
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    {{ filteredEvents.length }} result<span v-if="filteredEvents.length !== 1">s</span>
                  </div>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip size="small" variant="tonal" class="summary-chip">
                    <v-icon start size="16">mdi-map-marker</v-icon>
                    {{ locationCity || "All cities" }}
                  </v-chip>

                  <v-chip size="small" variant="tonal" class="summary-chip">
                    <v-icon start size="16">mdi-shape-outline</v-icon>
                    {{ selectedCategories.length ? selectedCategories.length + " selected" : "All categories" }}
                  </v-chip>

                  <v-chip size="small" variant="tonal" class="summary-chip">
                    <v-icon start size="16">mdi-sort</v-icon>
                    {{ currentSortLabel }}
                  </v-chip>
                </div>
              </div>

              <div v-if="activeFilterChips.length" class="active-filters-wrap mb-5">
                <div class="text-caption text-medium-emphasis mb-2">Active filters</div>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="chip in activeFilterChips"
                    :key="chip.key"
                    size="small"
                    closable
                    variant="tonal"
                    class="active-filter-chip"
                    @click:close="chip.action"
                  >
                    <v-icon start size="14">{{ chip.icon }}</v-icon>
                    {{ chip.label }}
                  </v-chip>
                </div>
              </div>

              <v-row class="event-list-row" :key="resultsAnimationKey">
                <v-col
                  v-for="event in filteredEvents"
                  :key="event.id"
                  cols="12"
                  :md="isTablet ? 6 : 12"
                  :lg="12"
                >
                  <v-card
                    class="rounded-xl rounded-xxl pa-3 pa-md-4 event-card"
                    :class="{
                      'event-card-muted': isPastEvent(event) || event.seats_left === 0,
                      'event-card-mobile': isMobile,
                      'event-card-tablet': isTablet,
                      'event-card-phone': isPhone
                    }"
                    elevation="0"
                    @touchstart.passive="handleCardTouchStart($event, event)"
                    @touchend="clearLongPress"
                    @touchmove="clearLongPress"
                    @touchcancel="clearLongPress"
                  >
                    <v-row class="align-stretch">
                      <v-col cols="12" :md="isTablet ? 12 : 4" lg="4">
                        <div class="event-image-wrap">
                          <v-img
                            :src="event.image"
                            height="240"
                            class="rounded-xl event-image"
                            cover
                          >
                            <template #placeholder>
                              <div class="w-100 h-100 d-flex align-center justify-center image-placeholder">
                                <v-icon size="50">mdi-image</v-icon>
                              </div>
                            </template>
                          </v-img>

                          <div class="image-overlay-glow"></div>
                        </div>
                      </v-col>

                      <v-col cols="12" :md="isTablet ? 12 : 8" lg="8">
                        <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-2">
                          <div class="title-stack">
                            <div class="text-h5 font-weight-bold event-title">
                              {{ event.title }}
                            </div>

                            <div class="text-subtitle-2 text-medium-emphasis d-flex align-center flex-wrap ga-2 event-location-line">
                              <v-icon size="16">mdi-map-marker-outline</v-icon>
                              <span>{{ event.venue }} • {{ event.city }}</span>
                            </div>
                          </div>

                          <div class="d-flex ga-2 flex-wrap status-chip-group">
                            <v-chip
                              v-if="event.featured"
                              color="primary"
                              variant="outlined"
                              class="status-chip"
                            >
                              <v-icon start size="16">mdi-star-four-points-outline</v-icon>
                              Featured
                            </v-chip>

                            <v-chip
                              v-if="event.last_call"
                              color="warning"
                              variant="outlined"
                              class="status-chip"
                            >
                              <v-icon start size="16">mdi-timer-sand</v-icon>
                              Last Call
                            </v-chip>

                            <v-chip
                              :color="getAvailabilityColor(event)"
                              variant="tonal"
                              class="status-chip"
                            >
                              <v-icon start size="16">{{ getAvailabilityIcon(event) }}</v-icon>
                              {{ getAvailabilityLabel(event) }}
                            </v-chip>
                          </div>
                        </div>

                        <div class="event-info-pills">
                          <div class="info-pill">
                            <v-icon size="17" class="me-2">mdi-calendar-blank-outline</v-icon>
                            <strong>Date:</strong>&nbsp;{{ event.date }}
                          </div>

                          <div class="info-pill">
                            <v-icon size="17" class="me-2">mdi-clock-time-four-outline</v-icon>
                            <strong>Time:</strong>&nbsp;{{ event.time }}
                          </div>

                          <div class="info-pill">
                            <v-icon size="17" class="me-2">mdi-seat-outline</v-icon>
                            <strong>Seats:</strong>&nbsp;{{ event.seats_left }}
                          </div>
                        </div>

                        <div class="event-description text-body-2 mt-4 line-clamp-3">
                          {{ event.description }}
                        </div>

                        <div
                          v-if="getArtistNames(event).length"
                          class="text-body-2 mt-3 text-medium-emphasis artist-line"
                        >
                          <v-icon size="16" class="me-1">mdi-account-music-outline</v-icon>
                          <strong>Artist:</strong>&nbsp;{{ getArtistNames(event).join(", ") }}
                        </div>

                        <v-row style="margin-top:16px" class="align-center action-row">
                          <v-btn
                            size="small"
                            :color="canBuyTicket(event) ? 'primary' : (isPastEvent(event) ? 'grey-darken-1' : 'error')"
                            class="action-btn primary-action-btn"
                            :class="{ 'action-btn-mobile': isMobile }"
                            :disabled="!canBuyTicket(event)"
                            @click="goToSeatSelection(event)"
                            @contextmenu.prevent.stop="openSeatSelectionContextMenu($event, event)"
                            @touchstart.passive.stop="handleSeatSelectionTouchStart($event, event)"
                            @touchend.stop="clearLongPress"
                            @touchmove.stop="clearLongPress"
                            @touchcancel.stop="clearLongPress"
                          >
                            <v-icon start size="18">{{ canBuyTicket(event) ? 'mdi-ticket-outline' : (isPastEvent(event) ? 'mdi-calendar-remove-outline' : 'mdi-close-circle-outline') }}</v-icon>
                            {{ canBuyTicket(event) ? 'Buy Ticket' : (isPastEvent(event) ? 'Event Ended' : 'Sold Out') }}
                          </v-btn>

                          <v-btn
                            size="small"
                            variant="outlined"
                            class="ml-2 action-btn"
                            :class="{ 'action-btn-mobile': isMobile }"
                            @click="goToMoreInfo(event)"
                            @contextmenu.prevent.stop="openMoreInfoContextMenu($event, event)"
                            @touchstart.passive.stop="handleMoreInfoTouchStart($event, event)"
                            @touchend.stop="clearLongPress"
                            @touchmove.stop="clearLongPress"
                            @touchcancel.stop="clearLongPress"
                          >
                            <v-icon start size="18">mdi-information-outline</v-icon>
                            More Info
                          </v-btn>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>

              <v-sheet
                v-if="filteredEvents.length === 0"
                class="d-flex align-center justify-center mt-4 empty-state-sheet"
                height="200"
              >
                <div class="text-center empty-state-content">
                  <div class="empty-state-icon mb-3">
                    <v-icon size="42">mdi-calendar-remove-outline</v-icon>
                  </div>
                  <div class="text-h6 mb-2 font-weight-bold">No matching events</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Try changing your filters to see more results.
                  </div>
                  <v-btn
                    class="mt-4"
                    color="primary"
                    variant="tonal"
                    rounded="xl"
                    @click="resetAllFilters"
                  >
                    <v-icon start size="18">mdi-refresh</v-icon>
                    Reset filters
                  </v-btn>
                </div>
              </v-sheet>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>

  <v-dialog
    v-model="mobileFiltersOpen"
    :fullscreen="isPhone"
    :max-width="isTablet ? 860 : 640"
    scrollable
  >
    <v-card class="rounded-0 rounded-md-xl rounded-lg-xxl mobile-filter-dialog">
      <div class="mobile-filter-dialog__header pa-4 pa-sm-5">
        <div class="d-flex align-start justify-space-between ga-3">
          <div>
            <div class="text-overline page-kicker mb-1">BLASSTI FILTERS</div>
            <div class="text-h5 font-weight-bold">Refine your event feed</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Your filters update live while keeping the desktop layout untouched.
            </div>
          </div>

          <v-btn
            icon
            variant="text"
            @click="mobileFiltersOpen = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="d-flex flex-wrap ga-2 mt-4">
          <v-chip size="small" variant="tonal" class="filter-count-chip">
            <v-icon start size="16">mdi-filter-check-outline</v-icon>
            {{ mobileActiveFilterCount }} active
          </v-chip>

          <v-chip size="small" variant="tonal" class="filter-count-chip">
            <v-icon start size="16">mdi-ticket-confirmation-outline</v-icon>
            {{ filteredEvents.length }} matches
          </v-chip>
        </div>
      </div>

      <v-divider />

      <v-card-text class="pa-4 pa-sm-5 mobile-filter-dialog__body">
        <div class="filter-toolbar mb-4">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            item-title="label"
            item-value="value"
            label="Sort by"
            variant="outlined"
            density="comfortable"
            class="enhanced-field"
          />

          <div class="toggle-stack mt-1">
            <v-switch
              v-model="showSoldOutEvents"
              label="Show sold out events"
              hide-details
              inset
              color="error"
              density="comfortable"
              class="enhanced-switch"
            />
            <v-switch
              v-model="showPastEvents"
              label="Show past events"
              hide-details
              inset
              color="grey-darken-1"
              density="comfortable"
              class="enhanced-switch"
            />
          </div>

          <v-btn
            block
            variant="tonal"
            color="primary"
            class="mt-3 reset-filter-btn"
            @click="resetAllFilters"
          >
            <v-icon start size="18">mdi-filter-remove-outline</v-icon>
            Clear filters
          </v-btn>
        </div>

        <div class="mobile-filter-grid">
          <div class="filter-group mobile-filter-section">
            <div class="filter-label">
              <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
              Categories
            </div>

            <v-chip-group
              v-model="selectedCategories"
              multiple
              column
              class="filter-chip-group"
            >
              <v-chip
                v-for="label in labels"
                :key="label"
                :value="label"
                filter
                variant="outlined"
                class="filter-chip"
              >
                {{ label }}
              </v-chip>
            </v-chip-group>
          </div>

          <div class="filter-group mobile-filter-section">
            <div class="filter-label">
              <v-icon size="16" class="me-2">mdi-calendar-range</v-icon>
              Date range
            </div>

            <v-menu
              v-model="fromMenu"
              :close-on-content-click="false"
              transition="scale-transition"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="fromDateDisplay"
                  label="From"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  class="mb-3 enhanced-field"
                  prepend-inner-icon="mdi-calendar-month-outline"
                />
              </template>

              <v-card class="date-picker-card">
                <v-date-picker v-model="fromDate" />
                <v-card-actions class="justify-end">
                  <v-btn variant="text" @click="fromMenu = false">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>

            <v-menu
              v-model="toMenu"
              :close-on-content-click="false"
              transition="scale-transition"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="toDateDisplay"
                  label="To"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  class="enhanced-field"
                  prepend-inner-icon="mdi-calendar-end-outline"
                />
              </template>

              <v-card class="date-picker-card">
                <v-date-picker v-model="toDate" />
                <v-card-actions class="justify-end">
                  <v-btn variant="text" @click="toMenu = false">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </div>

          <div class="filter-group mobile-filter-section">
            <div class="filter-label">
              <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
              City
            </div>
            <v-select
              v-model="locationCity"
              :items="cities"
              label="Select city"
              variant="outlined"
              density="comfortable"
              clearable
              class="enhanced-field"
              prepend-inner-icon="mdi-city-variant-outline"
            />
          </div>

          <div class="filter-group mobile-filter-section">
            <div class="filter-label">
              <v-icon size="16" class="me-2">mdi-seat-outline</v-icon>
              Availability
            </div>
            <div class="checkbox-stack">
              <v-checkbox
                v-model="availability.available"
                label="Available"
                hide-details
                density="comfortable"
                color="success"
                class="enhanced-checkbox"
              />
              <v-checkbox
                v-model="availability.almostSold"
                label="Almost sold out"
                hide-details
                density="comfortable"
                color="warning"
                class="enhanced-checkbox"
              />
              <v-checkbox
                v-model="availability.soldOut"
                label="Sold out"
                hide-details
                density="comfortable"
                color="error"
                class="enhanced-checkbox"
              />
            </div>
          </div>

          <div class="filter-group mobile-filter-section">
            <div class="filter-label">
              <v-icon size="16" class="me-2">mdi-account-music-outline</v-icon>
              Artist
            </div>
            <v-select
              v-model="artist"
              :items="artistOptions"
              item-title="label"
              item-value="value"
              label="Select artist"
              variant="outlined"
              density="comfortable"
              clearable
              class="enhanced-field"
              prepend-inner-icon="mdi-microphone-outline"
            />
          </div>

          <div class="filter-group mobile-filter-section">
            <div class="filter-label">
              <v-icon size="16" class="me-2">mdi-badge-account-outline</v-icon>
              Age restriction
            </div>
            <div class="checkbox-stack">
              <v-checkbox
                v-model="ageRestrictions.allAges"
                label="All ages"
                hide-details
                density="comfortable"
                class="enhanced-checkbox"
              />
              <v-checkbox
                v-model="ageRestrictions.fifteenPlus"
                label="15+"
                hide-details
                density="comfortable"
                class="enhanced-checkbox"
              />
              <v-checkbox
                v-model="ageRestrictions.eighteenPlus"
                label="18+"
                hide-details
                density="comfortable"
                class="enhanced-checkbox"
              />
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 pa-sm-5 justify-space-between mobile-filter-dialog__actions">
        <v-btn
          variant="text"
          @click="resetAllFilters"
        >
          Reset all
        </v-btn>

        <v-btn
          color="primary"
          rounded="xl"
          @click="mobileFiltersOpen = false"
        >
          View {{ filteredEvents.length }} result<span v-if="filteredEvents.length !== 1">s</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Link Context Menu -->
  <v-menu
    v-model="linkContextMenu.show"
    :target="[linkContextMenu.x, linkContextMenu.y]"
    location="top left"
    absolute
    :close-on-content-click="true"
    transition="scale-transition"
  >
    <v-list min-width="220" class="context-menu-list">
      <v-list-subheader>{{ linkContextMenu.label || "Open" }}</v-list-subheader>

      <v-list-item
        title="Open in new tab"
        prepend-icon="mdi-open-in-new"
        @click="openContextMenuTargetInNewTab"
      />
      <v-list-item
        title="Open in new window"
        prepend-icon="mdi-open-in-app"
        @click="openContextMenuTargetInNewWindow"
      />
      <v-list-item
        v-if="isMobile"
        title="Long press is enabled on mobile"
        prepend-icon="mdi-cellphone-cog"
        disabled
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import { get_All_Events, can_Buy_Event_Tickets, is_Event_Past } from "@/dataModel/event"
import { get_All_Artists, get_User_By_Id } from "@/dataModel/user"

const router = useRouter()
const theme = useTheme()
const display = useDisplay()
const THEME_STORAGE_KEY = "blassti-theme"
const events = get_All_Events()
const artists = get_All_Artists()

const labels = ref([...new Set(events.map(e => e.type))])

const selectedCategories = ref([])

const fromDate = ref(null)
const toDate = ref(null)
const fromMenu = ref(false)
const toMenu = ref(false)

const cities = [...new Set(events.map(e => e.city))]
const locationCity = ref(null)
const searchQuery = ref("")
const showSoldOutEvents = ref(false)
const showPastEvents = ref(false)
const sortBy = ref("soonest")

const sortOptions = [
  { label: "Soonest first", value: "soonest" },
  { label: "Latest first", value: "latest" },
  { label: "Most seats left", value: "mostSeats" },
  { label: "Fewest seats left", value: "leastSeats" },
  { label: "A to Z", value: "titleAsc" },
  { label: "Z to A", value: "titleDesc" }
]

const quickFilterIconMap = {
  Concert: "mdi-music-circle-outline",
  Sports: "mdi-basketball",
  Theater: "mdi-drama-masks",
  Festival: "mdi-party-popper",
  Comedy: "mdi-emoticon-outline",
  Cinema: "mdi-filmstrip-box-multiple"
}

const quickFilterChips = computed(() => {
  return labels.value.slice(0, 6).map(label => ({
    label,
    value: label,
    icon: quickFilterIconMap[label] || "mdi-shape-outline"
  }))
})

const availability = ref({
  available: false,
  almostSold: false,
  soldOut: false
})

const artist = ref(null)

const isMobile = computed(() => display.mdAndDown.value)
const isBelowDesktop = computed(() => display.mdAndDown.value)
const isPhone = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)
const mobileFiltersOpen = ref(false)

const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})

const isDarkTheme = computed(() => currentTheme.value === "dark")

const linkContextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  href: "",
  label: "",
})

const longPressTimeout = ref(null)
const longPressTriggered = ref(false)
const LONG_PRESS_DELAY = 520

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)
  }
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

onMounted(() => {
  loadSavedTheme()
  window.addEventListener("storage", handleWindowStorage)
})

onBeforeUnmount(() => {
  clearLongPress()
  window.removeEventListener("storage", handleWindowStorage)
})

const browserThemeClass = computed(() => {
  return isDarkTheme.value ? "browser-dark" : "browser-light"
})

function getPointerPosition(event) {
  if (event?.touches?.[0]) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    }
  }

  if (event?.changedTouches?.[0]) {
    return {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
    }
  }

  return {
    clientX: event?.clientX ?? window.innerWidth / 2,
    clientY: event?.clientY ?? window.innerHeight / 2,
  }
}

function startLongPress(event, callback) {
  if (!isMobile.value) return
  clearLongPress()
  longPressTriggered.value = false

  longPressTimeout.value = window.setTimeout(() => {
    longPressTriggered.value = true
    callback()
  }, LONG_PRESS_DELAY)
}

function clearLongPress() {
  if (longPressTimeout.value) {
    window.clearTimeout(longPressTimeout.value)
    longPressTimeout.value = null
  }
}

function handleCardTouchStart(event, item) {
  startLongPress(event, () => {
    openMoreInfoContextMenu(event, item)
  })
}

function handleMoreInfoTouchStart(event, item) {
  startLongPress(event, () => {
    openMoreInfoContextMenu(event, item)
  })
}

function handleSeatSelectionTouchStart(event, item) {
  if (!canBuyTicket(item)) return
  startLongPress(event, () => {
    openSeatSelectionContextMenu(event, item)
  })
}

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
  const { clientX, clientY } = getPointerPosition(event)

  linkContextMenu.value = {
    show: true,
    x: clientX,
    y: clientY,
    href: getRouteHref(path, query),
    label,
  }
}

function openMoreInfoContextMenu(domEvent, item) {
  openRouteContextMenu(domEvent, "/o_eventinfo", item?.title || "Event details", { id: item?.id })
}

function openSeatSelectionContextMenu(domEvent, item) {
  if (!canBuyTicket(item)) return
  openRouteContextMenu(domEvent, "/seatSelection", item?.title || "Seat selection", { id: item?.id })
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

const ageRestrictions = ref({
  allAges: false,
  fifteenPlus: false,
  eighteenPlus: false
})

function canBuyTicket(event) {
  return can_Buy_Event_Tickets(event)
}

function isPastEvent(event) {
  return is_Event_Past(event)
}

const availableNowCount = computed(() => {
  return events.filter(event => !isPastEvent(event) && canBuyTicket(event)).length
})

function getAvailabilityLabel(event) {
  if (isPastEvent(event)) return "Event ended"
  if (event.seats_left === 0) return "Sold out"
  if (event.seats_left <= 20) return "Almost sold out"
  return "Available"
}

function getAvailabilityColor(event) {
  if (isPastEvent(event)) return "grey-darken-1"
  if (event.seats_left === 0) return "error"
  if (event.seats_left <= 20) return "warning"
  return "success"
}

function getAvailabilityIcon(event) {
  if (isPastEvent(event)) return "mdi-calendar-remove-outline"
  if (event.seats_left === 0) return "mdi-close-circle-outline"
  if (event.seats_left <= 20) return "mdi-alert-circle-outline"
  return "mdi-check-circle-outline"
}

const artistOptions = computed(() => {
  return artists.map(artistUser => ({
    label: `${artistUser.first_name} ${artistUser.last_name}`.trim(),
    value: artistUser.id
  }))
})

const fromDateDisplay = computed(() => formatPickerDate(fromDate.value))
const toDateDisplay = computed(() => formatPickerDate(toDate.value))

function formatPickerDate(value) {
  if (!value) return ""
  const parsed = parsePickerDate(value)
  if (!parsed) return ""
  return parsed.toLocaleDateString("en-GB")
}

function parsePickerDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  if (typeof value === "string") {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
  }

  return null
}

function parseEventDate(dateString) {
  if (!dateString) return null

  const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  }

  const parts = String(dateString).trim().split(" ")
  if (parts.length !== 3) return null

  const day = Number(parts[0])
  const month = months[parts[1].slice(0, 3).toLowerCase()]
  const year = Number(parts[2])

  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null

  return new Date(year, month, day)
}

function getArtistNames(event) {
  if (!Array.isArray(event.featured_artist_ids)) return []

  return event.featured_artist_ids
    .map(id => get_User_By_Id(id))
    .filter(Boolean)
    .map(user => `${user.first_name} ${user.last_name}`.trim())
}

function goToMoreInfo(event) {
  if (longPressTriggered.value) {
    longPressTriggered.value = false
    return
  }
  router.push(`/o_eventinfo?id=${event.id}`)
}

function goToSeatSelection(event) {
  if (longPressTriggered.value) {
    longPressTriggered.value = false
    return
  }
  if (!canBuyTicket(event)) return
  router.push(`/seatSelection?id=${event.id}`)
}

function toggleQuickCategory(category) {
  if (!category) return
  if (selectedCategories.value.includes(category)) {
    selectedCategories.value = selectedCategories.value.filter(item => item !== category)
    return
  }
  selectedCategories.value = [...selectedCategories.value, category]
}

const currentSortLabel = computed(() => {
  return sortOptions.find(option => option.value === sortBy.value)?.label || "Soonest first"
})

const activeFilterChips = computed(() => {
  const chips = []

  if (searchQuery.value) {
    chips.push({
      key: "search",
      label: `Search: ${searchQuery.value}`,
      icon: "mdi-magnify",
      action: () => {
        searchQuery.value = ""
      }
    })
  }

  if (selectedCategories.value.length) {
    chips.push({
      key: "categories",
      label: `${selectedCategories.value.length} categor${selectedCategories.value.length > 1 ? "ies" : "y"}`,
      icon: "mdi-shape-outline",
      action: () => {
        selectedCategories.value = []
      }
    })
  }

  if (fromDate.value) {
    chips.push({
      key: "from",
      label: `From: ${fromDateDisplay.value}`,
      icon: "mdi-calendar-start",
      action: () => {
        fromDate.value = null
      }
    })
  }

  if (toDate.value) {
    chips.push({
      key: "to",
      label: `To: ${toDateDisplay.value}`,
      icon: "mdi-calendar-end",
      action: () => {
        toDate.value = null
      }
    })
  }

  if (locationCity.value) {
    chips.push({
      key: "city",
      label: locationCity.value,
      icon: "mdi-map-marker-outline",
      action: () => {
        locationCity.value = null
      }
    })
  }

  if (artist.value) {
    const artistLabel = artistOptions.value.find(item => item.value === artist.value)?.label || "Artist"
    chips.push({
      key: "artist",
      label: artistLabel,
      icon: "mdi-account-music-outline",
      action: () => {
        artist.value = null
      }
    })
  }

  if (availability.value.available || availability.value.almostSold || availability.value.soldOut) {
    const selectedAvailability = [
      availability.value.available ? "Available" : null,
      availability.value.almostSold ? "Almost sold out" : null,
      availability.value.soldOut ? "Sold out" : null
    ].filter(Boolean).join(", ")

    chips.push({
      key: "availability",
      label: selectedAvailability,
      icon: "mdi-seat-outline",
      action: () => {
        availability.value = {
          available: false,
          almostSold: false,
          soldOut: false
        }
      }
    })
  }

  if (
    ageRestrictions.value.allAges ||
    ageRestrictions.value.fifteenPlus ||
    ageRestrictions.value.eighteenPlus
  ) {
    const selectedAges = [
      ageRestrictions.value.allAges ? "All ages" : null,
      ageRestrictions.value.fifteenPlus ? "15+" : null,
      ageRestrictions.value.eighteenPlus ? "18+" : null
    ].filter(Boolean).join(", ")

    chips.push({
      key: "ages",
      label: selectedAges,
      icon: "mdi-badge-account-outline",
      action: () => {
        ageRestrictions.value = {
          allAges: false,
          fifteenPlus: false,
          eighteenPlus: false
        }
      }
    })
  }

  if (showSoldOutEvents.value) {
    chips.push({
      key: "showSoldOut",
      label: "Showing sold out",
      icon: "mdi-close-circle-outline",
      action: () => {
        showSoldOutEvents.value = false
      }
    })
  }

  if (showPastEvents.value) {
    chips.push({
      key: "showPast",
      label: "Showing past events",
      icon: "mdi-calendar-remove-outline",
      action: () => {
        showPastEvents.value = false
      }
    })
  }

  return chips
})

const mobileActiveFilterCount = computed(() => activeFilterChips.value.length)

const resultsAnimationKey = computed(() => JSON.stringify({
  search: searchQuery.value,
  categories: selectedCategories.value,
  from: fromDate.value,
  to: toDate.value,
  city: locationCity.value,
  availability: availability.value,
  artist: artist.value,
  ages: ageRestrictions.value,
  showSoldOut: showSoldOutEvents.value,
  showPast: showPastEvents.value,
  sort: sortBy.value
}))

function resetAllFilters() {
  searchQuery.value = ""
  selectedCategories.value = []
  fromDate.value = null
  toDate.value = null
  locationCity.value = null
  availability.value = {
    available: false,
    almostSold: false,
    soldOut: false
  }
  artist.value = null
  ageRestrictions.value = {
    allAges: false,
    fifteenPlus: false,
    eighteenPlus: false
  }
  showSoldOutEvents.value = false
  showPastEvents.value = false
  sortBy.value = "soonest"
}

const filteredEvents = computed(() => {
  const from = parsePickerDate(fromDate.value)
  const to = parsePickerDate(toDate.value)

  const filtered = events.filter(event => {
    const seatsLeft = Number(event.seats_left) || 0
    const eventDate = parseEventDate(event.date)
    const eventTitle = String(event.title || "").toLowerCase()
    const eventDescription = String(event.description || "").toLowerCase()
    const venueName = String(event.venue || "").toLowerCase()
    const cityName = String(event.city || "").toLowerCase()
    const artistNames = getArtistNames(event).join(" ").toLowerCase()
    const query = searchQuery.value.trim().toLowerCase()

    const matchesSearch =
      !query ||
      eventTitle.includes(query) ||
      eventDescription.includes(query) ||
      venueName.includes(query) ||
      cityName.includes(query) ||
      artistNames.includes(query)

    const matchesCategory =
      selectedCategories.value.length === 0 ||
      selectedCategories.value.includes(event.type)

    let matchesDate = true
    if (from && eventDate) {
      matchesDate = eventDate >= from
    }
    if (matchesDate && to && eventDate) {
      matchesDate = eventDate <= to
    }
    if ((from || to) && !eventDate) {
      matchesDate = false
    }

    const matchesCity =
      !locationCity.value || event.city === locationCity.value

    let matchesAvailability = true
    if (
      availability.value.available ||
      availability.value.almostSold ||
      availability.value.soldOut
    ) {
      matchesAvailability =
        (availability.value.available && seatsLeft > 20) ||
        (availability.value.almostSold && seatsLeft > 0 && seatsLeft <= 20) ||
        (availability.value.soldOut && seatsLeft === 0)
    }

    const matchesArtist =
      !artist.value ||
      (Array.isArray(event.featured_artist_ids) &&
        event.featured_artist_ids.includes(artist.value))

    let matchesAge = true
    if (
      ageRestrictions.value.allAges ||
      ageRestrictions.value.fifteenPlus ||
      ageRestrictions.value.eighteenPlus
    ) {
      matchesAge =
        (ageRestrictions.value.allAges && event.age_restriction === "All ages") ||
        (ageRestrictions.value.fifteenPlus && event.age_restriction === "15+") ||
        (ageRestrictions.value.eighteenPlus && event.age_restriction === "18+")
    }

    const passesSoldOutVisibility = showSoldOutEvents.value || seatsLeft > 0
    const passesPastVisibility = showPastEvents.value || !isPastEvent(event)

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDate &&
      matchesCity &&
      matchesAvailability &&
      matchesArtist &&
      matchesAge &&
      passesSoldOutVisibility &&
      passesPastVisibility
    )
  })

  return [...filtered].sort((a, b) => {
    const aDate = parseEventDate(a.date)
    const bDate = parseEventDate(b.date)
    const aSeats = Number(a.seats_left) || 0
    const bSeats = Number(b.seats_left) || 0
    const titleCompare = String(a.title || "").localeCompare(String(b.title || ""))

    switch (sortBy.value) {
      case "latest":
        return (bDate?.getTime() || 0) - (aDate?.getTime() || 0)
      case "mostSeats":
        return bSeats - aSeats
      case "leastSeats":
        return aSeats - bSeats
      case "titleAsc":
        return titleCompare
      case "titleDesc":
        return -titleCompare
      case "soonest":
      default:
        return (aDate?.getTime() || 0) - (bDate?.getTime() || 0)
    }
  })
})
</script>

<style scoped>
.ml-2 {
  margin-left: 8px;
}

.event-page-shell {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.page-container {
  position: relative;
  z-index: 1;
}

.page-background-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.16;
  pointer-events: none;
  transition: opacity 0.35s ease, background 0.35s ease;
}

.orb-1 {
  width: 260px;
  height: 260px;
  top: 90px;
  left: -60px;
}

.orb-2 {
  width: 340px;
  height: 340px;
  right: -100px;
  top: 260px;
}

.browser-light {
  background:
    radial-gradient(circle at top left, rgba(76, 110, 245, 0.07), transparent 28%),
    radial-gradient(circle at right center, rgba(0, 188, 212, 0.06), transparent 24%),
    linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%);
  color: #162033;
}

.browser-light .orb-1 {
  background: #6f8cff;
}

.browser-light .orb-2 {
  background: #62d6ff;
}

.browser-dark {
  background:
    radial-gradient(circle at top left, rgba(94, 114, 228, 0.12), transparent 30%),
    radial-gradient(circle at right center, rgba(0, 188, 212, 0.1), transparent 26%),
    linear-gradient(180deg, #0b1220 0%, #121a29 100%);
  color: #ecf2ff;
}

.browser-dark .orb-1 {
  background: #5d7cff;
}

.browser-dark .orb-2 {
  background: #00bcd4;
}

.hero-surface,
.filter-card,
.results-card,
.event-card {
  backdrop-filter: blur(12px);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    background 0.35s ease,
    border-color 0.35s ease;
}

.browser-light .hero-surface,
.browser-light .filter-card,
.browser-light .results-card,
.browser-light .event-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(37, 59, 102, 0.08);
  box-shadow: 0 10px 30px rgba(20, 31, 56, 0.06);
}

.browser-dark .hero-surface,
.browser-dark .filter-card,
.browser-dark .results-card,
.browser-dark .event-card {
  background: rgba(15, 23, 36, 0.82);
  border: 1px solid rgba(145, 170, 220, 0.12);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
}

.browser-light .hero-surface {
  border: 1px solid rgba(19, 35, 62, 0.04);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(248, 251, 255, 0.18)),
    rgba(255, 255, 255, 0.14);
  box-shadow: none;
  backdrop-filter: blur(4px);
}

.browser-dark .hero-surface {
  border: 1px solid rgba(255, 255, 255, 0.04);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.018), rgba(255, 255, 255, 0.006)),
    rgba(13, 17, 23, 0.18);
  box-shadow: none;
  backdrop-filter: blur(4px);
}

.hero-surface {
  position: relative;
  overflow: hidden;
  isolation: isolate;
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
  border-radius: 999px;
  pointer-events: none;
  z-index: 0;
  filter: blur(42px);
  opacity: 0.22;
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

.hero-copy {
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.page-header--single {
  justify-content: center;
}

.page-header--single .hero-copy {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
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
  backdrop-filter: blur(10px);
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

.filter-card {
  position: sticky;
  top: 88px;
  animation: subtlePageIn 0.3s ease-out 0.03s both;
}

.section-icon-wrap {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
}

.browser-light .section-icon-wrap {
  background: rgba(98, 108, 255, 0.08);
  color: #4757d8;
  border: 1px solid rgba(98, 108, 255, 0.12);
}

.browser-dark .section-icon-wrap {
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
  border: 1px solid rgba(129, 140, 248, 0.18);
}

.filter-count-chip,
.summary-chip {
  font-weight: 600;
}

.filter-group + .filter-group {
  margin-top: 2px;
}

.filter-label {
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: 0.01em;
}

.section-divider {
  opacity: 0.8;
}

.filter-chip-group {
  gap: 8px;
}

.filter-chip {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
}

.checkbox-stack {
  display: grid;
  gap: 6px;
}

.enhanced-field :deep(.v-field),
.enhanced-checkbox :deep(.v-selection-control) {
  transition: all 0.22s ease;
}

.browser-light .enhanced-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.76);
}

.browser-dark .enhanced-field :deep(.v-field) {
  background: rgba(15, 23, 36, 0.72);
}

.enhanced-field:hover :deep(.v-field),
.enhanced-checkbox:hover :deep(.v-selection-control) {
  transform: translateY(-1px);
}

.date-picker-card {
  overflow: hidden;
  border-radius: 18px;
}

.results-card {
  animation: subtlePageIn 0.3s ease-out 0.06s both;
}

.event-list-row {
  row-gap: 8px;
}

.event-card {
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-3px);
}

.browser-light .event-card:hover {
  box-shadow: 0 16px 34px rgba(20, 31, 56, 0.1);
}

.browser-dark .event-card:hover {
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.34);
}

.event-image-wrap {
  position: relative;
  height: 100%;
}

.event-image {
  transition: transform 0.35s ease;
}

.event-card:hover .event-image {
  transform: scale(1.02);
}

.image-overlay-glow {
  position: absolute;
  inset: auto 14px 14px 14px;
  height: 46px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.22));
  pointer-events: none;
}

.image-placeholder {
  border-radius: 16px;
}

.browser-light .image-placeholder {
  background: #e9eef7;
  color: #6b7a96;
}

.browser-dark .image-placeholder {
  background: #192335;
  color: #9cb1d8;
}

.title-stack {
  min-width: 0;
}

.event-title {
  line-height: 1.15;
  letter-spacing: -0.015em;
}

.event-location-line {
  margin-top: 6px;
}

.status-chip-group {
  max-width: 100%;
}

.status-chip {
  font-weight: 700;
}

.event-info-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  padding: 9px 12px;
  border-radius: 999px;
  font-size: 0.92rem;
  transition: background 0.35s ease, border-color 0.35s ease, transform 0.2s ease;
}

.info-pill:hover {
  transform: translateY(-1px);
}

.browser-light .info-pill {
  background: rgba(243, 246, 252, 0.95);
  border: 1px solid rgba(37, 59, 102, 0.08);
  color: #21304a;
}

.browser-dark .info-pill {
  background: rgba(23, 34, 52, 0.95);
  border: 1px solid rgba(145, 170, 220, 0.12);
  color: #dce7fb;
}

.event-description {
  line-height: 1.7;
}

.artist-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  min-height: 36px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.primary-action-btn {
  box-shadow: 0 10px 20px rgba(25, 118, 210, 0.18);
}

.empty-state-sheet {
  border-radius: 22px;
  border: 1px dashed transparent;
  transition: background 0.35s ease, border-color 0.35s ease;
}

.browser-light .empty-state-sheet {
  background: rgba(250, 252, 255, 0.88);
  border-color: rgba(37, 59, 102, 0.16);
}

.browser-dark .empty-state-sheet {
  background: rgba(14, 20, 30, 0.75);
  border-color: rgba(145, 170, 220, 0.18);
}

.empty-state-content {
  max-width: 360px;
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.browser-light .empty-state-icon {
  background: rgba(98, 108, 255, 0.08);
  color: #4d5de0;
}

.browser-dark .empty-state-icon {
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
}

.context-menu-list {
  border-radius: 18px;
  overflow: hidden;
}

.browser-light :deep(.v-list.context-menu-list) {
  background: rgba(255, 255, 255, 0.98);
}

.browser-dark :deep(.v-list.context-menu-list) {
  background: rgba(19, 28, 43, 0.98);
  color: #eef4ff;
}

.browser-dark :deep(.text-medium-emphasis) {
  color: rgba(226, 235, 255, 0.7) !important;
}

.browser-dark :deep(.v-label),
.browser-dark :deep(.v-field__input),
.browser-dark :deep(.v-field__prepend-inner),
.browser-dark :deep(.v-selection-control__label),
.browser-dark :deep(.v-chip),
.browser-dark :deep(.v-card),
.browser-dark :deep(.v-list-item-title),
.browser-dark :deep(.v-list-subheader) {
  color: #eef4ff;
}

.browser-dark :deep(.v-field) {
  color: #eef4ff;
}

.browser-dark :deep(.v-divider) {
  opacity: 0.18;
}

.rounded-xxl {
  border-radius: 24px !important;
}

.filter-toolbar {
  padding: 14px;
  border-radius: 20px;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}

.browser-light .filter-toolbar {
  background: rgba(246, 249, 255, 0.9);
  border: 1px solid rgba(37, 59, 102, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.browser-dark .filter-toolbar {
  background: rgba(17, 25, 39, 0.78);
  border: 1px solid rgba(145, 170, 220, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.toggle-stack {
  display: grid;
  gap: 2px;
}

.enhanced-switch {
  margin: 0;
}

.reset-filter-btn {
  min-height: 40px;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.active-filters-wrap {
  padding: 14px 16px;
  border-radius: 18px;
  transition: background 0.35s ease, border-color 0.35s ease;
}

.browser-light .active-filters-wrap {
  background: rgba(248, 250, 255, 0.86);
  border: 1px solid rgba(37, 59, 102, 0.08);
}

.browser-dark .active-filters-wrap {
  background: rgba(16, 24, 38, 0.78);
  border: 1px solid rgba(145, 170, 220, 0.12);
}

.active-filter-chip {
  font-weight: 600;
}

.event-list-row {
  row-gap: 8px;
  animation: resultsFadeIn 0.28s ease;
}

.event-card-muted .event-image {
  filter: saturate(0.72) brightness(0.88);
}

.event-card-muted .event-title,
.event-card-muted .event-description,
.event-card-muted .artist-line {
  opacity: 0.92;
}

.browser-light .event-card-muted {
  background: rgba(250, 251, 254, 0.74);
}

.browser-dark .event-card-muted {
  background: rgba(18, 26, 40, 0.74);
}

.event-card:hover .event-title {
  color: #4f63ff;
}

.browser-dark .event-card:hover .event-title {
  color: #d4ddff;
}

.event-card:hover .status-chip {
  transform: translateY(-1px);
}

.event-description.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

@keyframes resultsFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.mobile-filter-note {
  line-height: 1.45;
}

.filter-column,
.results-column {
  min-width: 0;
}

.action-row {
  row-gap: 10px;
}

.event-card-mobile {
  cursor: default;
}

.action-btn-mobile {
  min-height: 42px;
}

.browser-light .hero-search-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.82);
}

.browser-dark .hero-search-field :deep(.v-field) {
  background: rgba(16, 24, 38, 0.82);
}

.event-card,
.filter-card,
.results-card,
.hero-surface,
.info-pill,
.status-chip,
.quick-filter-chip,
.active-filter-chip,
.summary-chip,
.filter-count-chip {
  max-width: 100%;
}

.event-title,
.event-description,
.artist-line,
.event-location-line,
.info-pill {
  overflow-wrap: anywhere;
}

.mobile-browse-toolbar {
  animation: subtlePageIn 0.3s ease-out 0.04s both;
}

.mobile-toolbar-actions {
  width: 100%;
  justify-content: flex-end;
}

.mobile-toolbar-btn {
  min-height: 42px;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.mobile-summary-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.mobile-summary-strip::-webkit-scrollbar {
  display: none;
}

.mobile-summary-strip .summary-chip {
  flex: 0 0 auto;
}

.mobile-filter-dialog {
  transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease;
}

.browser-light .mobile-filter-dialog {
  background: rgba(255, 255, 255, 0.98);
  color: #162033;
}

.browser-dark .mobile-filter-dialog {
  background: rgba(11, 18, 32, 0.98);
  color: #ecf2ff;
}

.mobile-filter-dialog__header,
.mobile-filter-dialog__actions {
  position: relative;
  z-index: 1;
}

.mobile-filter-dialog__body {
  max-height: min(72vh, 780px);
}

.mobile-filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.mobile-filter-section {
  padding: 16px;
  border-radius: 20px;
  transition: background 0.35s ease, border-color 0.35s ease;
}

.browser-light .mobile-filter-section {
  background: rgba(247, 250, 255, 0.92);
  border: 1px solid rgba(37, 59, 102, 0.08);
}

.browser-dark .mobile-filter-section {
  background: rgba(16, 24, 38, 0.82);
  border: 1px solid rgba(145, 170, 220, 0.12);
}

.event-card-tablet .event-image-wrap {
  min-height: 188px;
}

.event-card-phone .event-image-wrap {
  min-height: 200px;
}

.quick-filter-chip,
.filter-chip {
  white-space: nowrap;
}

.action-btn + .action-btn {
  margin-left: 8px;
}

@media (max-width: 1264px) {
  .page-header--single .hero-copy {
    max-width: 100%;
  }

  .event-image-wrap {
    min-height: 220px;
  }
}

@media (max-width: 959px) {
  .page-container {
    padding-top: 4px;
  }

  .mobile-filter-grid {
    grid-template-columns: 1fr;
  }

  .mobile-toolbar-actions {
    justify-content: stretch;
  }

  .mobile-toolbar-actions > * {
    flex: 1 1 0;
  }

  .page-header {
    gap: 18px;
  }

  .hero-surface,
  .filter-card,
  .results-card {
    border-radius: 22px !important;
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .event-card {
    padding: 14px !important;
  }

  .status-chip-group {
    width: 100%;
  }

  .action-row {
    margin-top: 18px !important;
  }

  .action-row :deep(.v-col),
  .action-row :deep(.v-col-auto) {
    width: 100%;
    max-width: 100%;
    flex: 1 1 100%;
  }

  .action-btn,
  .action-btn-mobile {
    width: 100%;
    min-height: 44px;
  }

  .action-btn + .action-btn {
    margin-left: 0;
  }

  .ml-2 {
    margin-left: 0;
  }

  .event-image-wrap {
    min-height: 210px;
  }
}

@media (max-width: 600px) {
  .event-page-shell {
    overflow-x: hidden;
  }

  .mobile-browse-toolbar {
    padding: 14px !important;
  }

  .mobile-filter-dialog__body {
    max-height: none;
  }

  .page-container {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .hero-surface {
    padding: 20px !important;
  }

  .page-title {
    font-size: 1.9rem !important;
    line-height: 1.08;
  }

  .page-subtitle {
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .hero-search-wrap {
    max-width: 100%;
  }

  .hero-tags,
  .event-info-pills,
  .status-chip-group {
    gap: 8px;
  }

  .hero-search-wrap .d-flex.flex-wrap.ga-2.mt-3 {
    flex-wrap: nowrap !important;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .hero-search-wrap .d-flex.flex-wrap.ga-2.mt-3::-webkit-scrollbar {
    display: none;
  }

  .filter-toolbar,
  .active-filters-wrap {
    padding: 12px;
  }

  .event-title {
    font-size: 1.24rem !important;
  }

  .event-description {
    font-size: 0.94rem;
  }

  .info-pill {
    width: 100%;
    justify-content: flex-start;
    padding: 10px 12px;
  }

  .empty-state-sheet {
    min-height: 220px;
    height: auto !important;
    padding: 20px 12px;
  }

  .context-menu-list {
    min-width: 240px;
  }
}

@media (max-width: 959px) {
  .filter-card {
    position: static;
    top: auto;
  }
}

@media (max-width: 600px) {
  .event-info-pills {
    gap: 8px;
  }

  .info-pill {
    width: 100%;
    justify-content: flex-start;
  }

  .page-title {
    font-size: 2rem !important;
  }
}
</style>
