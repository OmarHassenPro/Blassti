<template>
  <v-app>
    <AppNavbar />

    <v-main
      class="carpool-page"
      :class="[
        isBrowserDark ? 'carpool-page--dark' : 'carpool-page--light',
      ]"
    >
      <div class="page-background">
        <div class="bg-orb bg-orb-1" />
        <div class="bg-orb bg-orb-2" />
        <div class="bg-grid" />
      </div>

      <v-container class="py-8 py-md-10 page-content">
        <!-- HERO -->
        <v-card
          rounded="xl"
          variant="flat"
          class="hero-card mb-6 mb-md-8"
          :class="isBrowserDark ? 'hero-card--dark' : 'hero-card--light'"
        >
          <v-card-text class="pa-5 pa-md-7">
            <v-row align="center" class="ga-0">
              <v-col cols="12" md="8">
                <div class="d-flex align-start align-md-center flex-column flex-md-row ga-4">
                  <div class="hero-icon-wrap">
                    <v-icon size="34">mdi-car-multiple</v-icon>
                  </div>

                  <div>
                    <div class="text-h4 text-md-h3 font-weight-black hero-title mb-1">
                      Carpools
                    </div>

                    <div class="text-subtitle-1 hero-subtitle mb-4">
                      Find or create a carpool for upcoming events
                    </div>

                    <div class="d-flex flex-wrap ga-2">
                      <v-chip
                        size="small"
                        variant="flat"
                        class="hero-chip"
                      >
                        <v-icon start size="16">mdi-road-variant</v-icon>
                        Shared rides
                      </v-chip>

                      <v-chip
                        size="small"
                        variant="flat"
                        class="hero-chip"
                      >
                        <v-icon start size="16">mdi-ticket-confirmation-outline</v-icon>
                        Event-linked
                      </v-chip>

                      <v-chip
                        size="small"
                        variant="flat"
                        class="hero-chip"
                      >
                        <v-icon start size="16">mdi-account-group-outline</v-icon>
                        Easy joining
                      </v-chip>

                      <v-chip
                        size="small"
                        variant="flat"
                        class="hero-chip"
                      >
                        <v-icon start size="16">mdi-theme-light-dark</v-icon>
                        Browser theme aware
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <v-row class="mt-4 mt-md-0" dense>
                  <v-col cols="6">
                    <v-card class="stat-card" rounded="xl" variant="tonal">
                      <v-card-text class="pa-4">
                        <div class="stat-label">Available</div>
                        <div class="stat-value">{{ availableCarpoolsCount }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="6">
                    <v-card class="stat-card" rounded="xl" variant="tonal">
                      <v-card-text class="pa-4">
                        <div class="stat-label">All carpools</div>
                        <div class="stat-value">{{ searchableCarpools.length }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="6">
                    <v-card class="stat-card" rounded="xl" variant="tonal">
                      <v-card-text class="pa-4">
                        <div class="stat-label">Events</div>
                        <div class="stat-value">{{ eventItems.length }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="6">
                    <v-card class="stat-card" rounded="xl" variant="tonal">
                      <v-card-text class="pa-4">
                        <div class="stat-label">Venues</div>
                        <div class="stat-value">{{ venueFilterItems.length - 1 }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row class="align-start">
          <!-- LEFT -->
          <v-col cols="12" md="4">
            <v-card
              rounded="xl"
              variant="outlined"
              class="glass-card sticky-card"
              :class="isBrowserDark ? 'glass-card--dark' : 'glass-card--light'"
            >
              <div class="section-topbar" />

              <v-card-title class="pa-5 pb-2">
                <div class="d-flex align-center ga-3">
                  <div class="title-icon">
                    <v-icon size="22">mdi-plus-circle-outline</v-icon>
                  </div>

                  <div>
                    <div class="text-h6 font-weight-bold section-title">
                      Create a carpool
                    </div>
                    <div class="text-caption section-subtitle">
                      Fill in the ride details and publish it instantly
                    </div>
                  </div>
                </div>
              </v-card-title>

              <v-card-text class="pa-5 pt-3">
                <v-card
                  rounded="lg"
                  variant="tonal"
                  class="helper-card mb-5"
                >
                  <v-card-text class="py-3 px-4">
                    <div class="d-flex align-start ga-3">
                      <v-icon size="20" class="mt-1 helper-icon">
                        mdi-information-outline
                      </v-icon>

                      <div class="text-body-2 helper-text">
                        Choose an event, set your departure details, then select one
                        of your saved contact methods so people can reach you after joining.
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <div class="field-label">
                  <v-icon size="16" class="mr-1">mdi-calendar-star</v-icon>
                  Event
                </div>

                <v-select
                  v-model="form.event_id"
                  density="comfortable"
                  variant="outlined"
                  :items="eventItems"
                  item-title="title"
                  item-value="id"
                  placeholder="Select event"
                  hide-details
                  class="mb-4 polished-field"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-ticket-outline"
                />

                <div class="field-label">
                  <v-icon size="16" class="mr-1">mdi-map-marker-radius-outline</v-icon>
                  Departure location
                </div>

                <v-text-field
                  v-model="form.departure_location"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="mb-4 polished-field"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-map-marker-outline"
                  placeholder="Ex: MedTech campus, downtown, Mall parking..."
                />

                <div class="field-label">
                  <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
                  Time of going
                </div>

                <v-text-field
                  v-model="form.time_of_going"
                  density="comfortable"
                  variant="outlined"
                  type="time"
                  hide-details
                  class="mb-4 polished-field"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-timer-outline"
                />

                <v-row class="mb-4">
                  <v-col cols="6">
                    <div class="field-label">
                      <v-icon size="16" class="mr-1">mdi-seat-passenger</v-icon>
                      Available spots
                    </div>

                    <v-select
                      v-model="form.total_spots"
                      density="comfortable"
                      variant="outlined"
                      :items="[1, 2, 3, 4, 5]"
                      hide-details
                      color="primary"
                      rounded="lg"
                      class="polished-field"
                      prepend-inner-icon="mdi-account-multiple-outline"
                    />
                  </v-col>

                  <v-col cols="6">
                    <div class="field-label">
                      <v-icon size="16" class="mr-1">mdi-calendar-clock-outline</v-icon>
                      Deadline to join
                    </div>

                    <v-text-field
                      v-model="form.deadline"
                      density="comfortable"
                      variant="outlined"
                      type="date"
                      hide-details
                      color="primary"
                      rounded="lg"
                      class="polished-field"
                      prepend-inner-icon="mdi-calendar-end"
                    />
                  </v-col>
                </v-row>

                <div class="field-label">
                  <v-icon size="16" class="mr-1">mdi-message-text-outline</v-icon>
                  How people can contact you
                </div>

                <v-select
                  v-model="form.contact_method"
                  density="comfortable"
                  variant="outlined"
                  :items="contactMethodItems"
                  item-title="title"
                  item-value="value"
                  hide-details
                  class="mb-4 polished-field"
                  color="primary"
                  rounded="lg"
                  :disabled="contactMethodItems.length === 0"
                  prepend-inner-icon="mdi-account-voice"
                />

                <v-expand-transition>
                  <v-alert
                    v-if="contactMethodItems.length === 0"
                    type="warning"
                    variant="tonal"
                    class="mb-4"
                    rounded="lg"
                    border="start"
                  >
                    Add a phone number, Instagram, or Facebook to your profile settings first.
                  </v-alert>
                </v-expand-transition>

                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="field-label mb-0">
                    <v-icon size="16" class="mr-1">mdi-note-text-outline</v-icon>
                    Note (max 100 characters)
                  </div>

                  <v-chip
                    size="x-small"
                    variant="text"
                    class="note-counter-chip"
                  >
                    {{ noteLength }}/100
                  </v-chip>
                </div>

                <v-text-field
                  v-model="form.note"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  maxlength="100"
                  counter="100"
                  class="mb-5 polished-field"
                  color="primary"
                  rounded="lg"
                  prepend-inner-icon="mdi-text-short"
                  placeholder="Ex: Leaving early, no smoking, meeting by main entrance..."
                />

                <v-card
                  rounded="lg"
                  variant="tonal"
                  class="summary-card mb-5"
                >
                  <v-card-text class="py-3 px-4">
                    <div class="summary-title mb-2">
                      <v-icon size="16" class="mr-1">mdi-clipboard-text-outline</v-icon>
                      Quick summary
                    </div>

                    <div class="summary-line">
                      <span class="summary-key">Selected event:</span>
                      <span class="summary-value">{{ selectedFormEventTitle }}</span>
                    </div>

                    <div class="summary-line">
                      <span class="summary-key">Spots:</span>
                      <span class="summary-value">{{ form.total_spots }}</span>
                    </div>

                    <div class="summary-line">
                      <span class="summary-key">Contact method:</span>
                      <span class="summary-value">{{ selectedContactMethodTitle }}</span>
                    </div>
                  </v-card-text>
                </v-card>

                <div class="d-flex flex-column ga-3">
                  <v-btn
                    block
                    color="primary"
                    variant="flat"
                    rounded="lg"
                    size="large"
                    class="create-btn text-none"
                    @click="createCarpool"
                    :disabled="!currentUser || contactMethodItems.length === 0"
                    prepend-icon="mdi-plus"
                  >
                    Create carpool
                  </v-btn>

                  <div class="text-caption form-footer-text">
                    Your existing logic and data flow stay intact — this is just a cleaner UI layer.
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- RIGHT -->
          <v-col cols="12" md="8">
            <v-card
              rounded="xl"
              variant="outlined"
              class="glass-card mb-4"
              :class="isBrowserDark ? 'glass-card--dark' : 'glass-card--light'"
            >
              <v-card-text class="pa-5">
                <div class="d-flex flex-column flex-lg-row align-lg-center ga-3 mb-4">
                  <div>
                    <div class="text-h6 font-weight-bold section-title">
                      Browse carpools
                    </div>
                    <div class="text-caption section-subtitle">
                      Filter rides by event, venue, and availability
                    </div>
                  </div>

                  <v-spacer />

                  <v-chip
                    variant="tonal"
                    rounded="pill"
                    class="results-chip"
                  >
                    <v-icon start size="16">mdi-filter-outline</v-icon>
                    {{ filteredCarpools.length }} result<span v-if="filteredCarpools.length !== 1">s</span>
                  </v-chip>
                </div>

                <v-row>
                  <v-col cols="12" md="5">
                    <v-select
                      v-model="selectedEventId"
                      density="comfortable"
                      variant="outlined"
                      :items="eventFilterItems"
                      item-title="title"
                      item-value="id"
                      label="Filter by events"
                      hide-details
                      class="polished-field"
                      color="primary"
                      rounded="lg"
                      prepend-inner-icon="mdi-ticket-outline"
                    />
                  </v-col>

                  <v-col cols="12" md="5">
                    <v-select
                      v-model="selectedVenueId"
                      density="comfortable"
                      variant="outlined"
                      :items="venueFilterItems"
                      item-title="title"
                      item-value="id"
                      label="Filter by venues"
                      hide-details
                      class="polished-field"
                      color="primary"
                      rounded="lg"
                      prepend-inner-icon="mdi-office-building-outline"
                    />
                  </v-col>

                  <v-col cols="12" md="2" class="d-flex align-center">
                    <v-checkbox
                      v-model="onlyAvailable"
                      hide-details
                      density="comfortable"
                      label="Only available"
                      class="filter-checkbox"
                      color="primary"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card
              rounded="xl"
              variant="outlined"
              class="glass-card"
              :class="isBrowserDark ? 'glass-card--dark' : 'glass-card--light'"
            >
              <v-card-text class="pa-5">
                <v-fade-transition group>
                  <v-card
                    v-for="carpool in filteredCarpools"
                    :key="carpool.id"
                    variant="outlined"
                    rounded="xl"
                    class="pa-4 pa-md-5 mb-4 inner-card carpool-item"
                  >
                    <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-4">
                      <div class="d-flex align-start ga-3">
                        <div class="carpool-badge">
                          <v-icon size="22">mdi-car-estate</v-icon>
                        </div>

                        <div>
                          <RouterLink
                            :to="carpool.event_route"
                            class="text-decoration-none"
                          >
                            <div class="text-subtitle-1 font-weight-bold clickable-link carpool-title">
                              {{ carpool.event_title }}
                            </div>
                          </RouterLink>

                          <div class="d-flex flex-wrap align-center ga-2 mt-1">
                            <v-chip size="x-small" variant="tonal" class="mini-chip">
                              <v-icon start size="13">mdi-calendar</v-icon>
                              {{ carpool.event_date }}
                            </v-chip>

                            <v-chip size="x-small" variant="tonal" class="mini-chip">
                              <v-icon start size="13">mdi-clock-outline</v-icon>
                              {{ carpool.time_of_going }}
                            </v-chip>
                          </div>
                        </div>
                      </div>

                      <v-chip
                        :color="statusColor(carpool.status)"
                        size="small"
                        variant="flat"
                        class="status-chip"
                      >
                        <v-icon start size="14">
                          {{
                            carpool.status === 'Open'
                              ? 'mdi-check-circle-outline'
                              : carpool.status === 'Full'
                                ? 'mdi-close-circle-outline'
                                : carpool.status === 'Reserved'
                                  ? 'mdi-bookmark-outline'
                                  : 'mdi-flag-outline'
                          }}
                        </v-icon>
                        {{ carpool.status }}
                      </v-chip>
                    </div>

                    <div class="d-flex align-center mb-4 profile-strip">
                      <RouterLink
                        v-if="carpool.driver"
                        :to="carpool.driver.route"
                        class="text-decoration-none"
                      >
                        <v-avatar size="44" class="mr-3 clickable-avatar avatar-ring">
                          <v-img
                            v-if="carpool.driver.avatar"
                            :src="carpool.driver.avatar"
                            cover
                          />
                          <v-icon v-else>mdi-account</v-icon>
                        </v-avatar>
                      </RouterLink>

                      <div class="text-body-2 driver-line">
                        <RouterLink
                          v-if="carpool.driver"
                          :to="carpool.driver.route"
                          class="text-decoration-none clickable-link driver-name font-weight-medium"
                        >
                          {{ carpool.driver.name }}
                        </RouterLink>

                        <span
                          v-else
                          class="font-weight-medium driver-name"
                        >
                          {{ carpool.driver_name }}
                        </span>

                        <span class="driver-separator">•</span>
                        <span class="driver-location">{{ carpool.departure_location }}</span>
                      </div>
                    </div>

                    <v-row class="mb-4">
                      <v-col cols="12" md="7">
                        <div class="text-body-2 px-4 py-4 note-box h-100">
                          <div class="note-box-label mb-2">
                            <v-icon size="15" class="mr-1">mdi-note-outline</v-icon>
                            Driver note
                          </div>

                          <div class="note-box-text">
                            “{{ carpool.note }}”
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" md="5">
                        <v-card rounded="lg" variant="tonal" class="info-panel h-100">
                          <v-card-text class="py-4 px-4">
                            <div class="info-line">
                              <span class="info-key">
                                <v-icon size="14" class="mr-1">mdi-seat-passenger</v-icon>
                                Spots left
                              </span>
                              <strong class="info-value">{{ carpool.spots_left }}</strong>
                            </div>

                            <div class="info-line">
                              <span class="info-key">
                                <v-icon size="14" class="mr-1">mdi-calendar-end</v-icon>
                                Deadline
                              </span>
                              <span class="info-value">{{ carpool.deadline }}</span>
                            </div>

                            <div class="info-line">
                              <span class="info-key">
                                <v-icon size="14" class="mr-1">mdi-office-building-outline</v-icon>
                                Venue
                              </span>
                              <span class="info-value text-truncate">{{ carpool.venue_title }}</span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <div class="d-flex flex-wrap ga-2">
                      <v-btn
                        color="primary"
                        variant="flat"
                        rounded="lg"
                        class="text-none"
                        @click="joinCarpool(carpool.id)"
                        prepend-icon="mdi-account-plus-outline"
                      >
                        Join carpool
                      </v-btn>

                      <v-btn
                        variant="text"
                        rounded="lg"
                        class="text-none"
                        @click="openDetails(carpool)"
                        prepend-icon="mdi-information-outline"
                      >
                        More details
                      </v-btn>
                    </div>
                  </v-card>
                </v-fade-transition>

                <v-scale-transition>
                  <v-sheet
                    v-if="filteredCarpools.length === 0"
                    rounded="xl"
                    class="empty-state text-center py-10 px-6"
                  >
                    <div class="empty-icon mb-4">
                      <v-icon size="42">mdi-car-off</v-icon>
                    </div>

                    <div class="text-h6 font-weight-bold mb-2">
                      No carpools found
                    </div>

                    <div class="text-body-2 empty-text mx-auto">
                      Try changing the selected filters or create a new carpool to get things moving.
                    </div>
                  </v-sheet>
                </v-scale-transition>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- DETAILS DIALOG -->
        <v-dialog
          v-model="detailsDialog"
          max-width="880"
          transition="dialog-bottom-transition"
        >
          <v-card
            v-if="selectedCarpool"
            rounded="xl"
            class="details-dialog-card"
            :class="isBrowserDark ? 'details-dialog-card--dark' : 'details-dialog-card--light'"
          >
            <v-card-title class="details-header">
              <div class="d-flex align-start ga-3">
                <div class="details-header-icon">
                  <v-icon size="22">mdi-car-info</v-icon>
                </div>

                <div>
                  <div class="details-title">Carpool details</div>
                  <div class="details-subtitle">{{ selectedCarpool.event_title }}</div>
                </div>
              </div>

              <v-btn
                icon="mdi-close"
                variant="text"
                rounded="lg"
                @click="detailsDialog = false"
              />
            </v-card-title>

            <v-divider />

            <v-card-text class="details-body">
              <v-row class="mb-2">
                <v-col cols="12" md="6">
                  <div class="details-section-label">Event</div>

                  <RouterLink
                    :to="selectedCarpool.event_route"
                    class="text-decoration-none"
                  >
                    <div class="details-link">
                      {{ selectedCarpool.event_title }}
                    </div>
                  </RouterLink>

                  <div class="details-muted mt-2 d-flex flex-wrap ga-2">
                    <v-chip size="x-small" variant="tonal" class="mini-chip">
                      <v-icon start size="13">mdi-calendar</v-icon>
                      {{ selectedCarpool.event_date }}
                    </v-chip>

                    <v-chip size="x-small" variant="tonal" class="mini-chip">
                      <v-icon start size="13">mdi-clock-outline</v-icon>
                      {{ selectedCarpool.time_of_going }}
                    </v-chip>
                  </div>

                  <div class="details-text mt-3">
                    {{ selectedCarpool.route }}
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="details-section-label">Venue</div>

                  <RouterLink
                    v-if="selectedCarpool.venue_route"
                    :to="selectedCarpool.venue_route"
                    class="text-decoration-none"
                  >
                    <div class="details-link">
                      {{ selectedCarpool.venue_title }}
                    </div>
                  </RouterLink>

                  <div class="details-muted mt-2">
                    {{ selectedCarpool.venue_location }}
                  </div>

                  <div class="details-muted">
                    {{ selectedCarpool.venue_exact_address }}
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-5" />

              <div class="details-section-label mb-3">Driver</div>

              <v-card rounded="xl" variant="tonal" class="driver-card-dialog mb-5">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center">
                    <RouterLink
                      v-if="selectedCarpool.driver"
                      :to="selectedCarpool.driver.route"
                      class="text-decoration-none"
                    >
                      <v-avatar size="56" class="mr-3 clickable-avatar avatar-ring">
                        <v-img
                          v-if="selectedCarpool.driver.avatar"
                          :src="selectedCarpool.driver.avatar"
                          cover
                        />
                        <v-icon v-else>mdi-account</v-icon>
                      </v-avatar>
                    </RouterLink>

                    <div>
                      <RouterLink
                        v-if="selectedCarpool.driver"
                        :to="selectedCarpool.driver.route"
                        class="text-decoration-none"
                      >
                        <div class="details-link font-weight-bold">
                          {{ selectedCarpool.driver.name }}
                        </div>
                      </RouterLink>

                      <div class="details-muted">
                        Departure: {{ selectedCarpool.departure_location }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <div class="details-section-label mb-2">How to contact</div>
              <div class="details-contact-box mb-5">
                <div class="details-contact-method">
                  {{ selectedCarpool.contact_method_label }}
                </div>
                <div class="details-contact-note">
                  Contact info is shown after joining.
                </div>
              </div>

              <div class="details-section-label mb-2">Participants</div>

              <v-row v-if="selectedCarpool.participants.length">
                <v-col
                  v-for="participant in selectedCarpool.participants"
                  :key="participant.id"
                  cols="12"
                  sm="6"
                >
                  <RouterLink
                    :to="participant.route"
                    class="text-decoration-none"
                  >
                    <v-card variant="outlined" rounded="lg" class="participant-card-clean">
                      <div class="d-flex align-center">
                        <v-avatar size="44" class="mr-3 avatar-ring">
                          <v-img
                            v-if="participant.avatar"
                            :src="participant.avatar"
                            cover
                          />
                          <v-icon v-else>mdi-account</v-icon>
                        </v-avatar>

                        <div class="details-link font-weight-medium">
                          {{ participant.name }}
                        </div>
                      </div>
                    </v-card>
                  </RouterLink>
                </v-col>
              </v-row>

              <v-sheet
                v-else
                rounded="lg"
                class="details-empty-box"
              >
                No participants yet.
              </v-sheet>

              <v-divider class="my-5" />

              <v-row>
                <v-col cols="12" md="6">
                  <div class="details-section-label mb-2">Carpool info</div>

                  <v-card rounded="xl" variant="tonal" class="dialog-info-card">
                    <v-card-text class="pa-4">
                      <div class="details-text mb-2">
                        <strong>Status:</strong> {{ selectedCarpool.status }}
                      </div>
                      <div class="details-text mb-2">
                        <strong>Spots left:</strong> {{ selectedCarpool.spots_left }}
                      </div>
                      <div class="details-text mb-2">
                        <strong>Total spots:</strong> {{ selectedCarpool.total_spots }}
                      </div>
                      <div class="details-text mb-0">
                        <strong>Deadline:</strong> {{ selectedCarpool.deadline }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="details-section-label mb-2">Driver note</div>

                  <div class="details-note-panel">
                    “{{ selectedCarpool.note }}”
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4 d-flex justify-end ga-2 flex-wrap">
              <v-btn
                color="primary"
                variant="flat"
                rounded="lg"
                class="text-none"
                @click="joinCarpool(selectedCarpool.id)"
                prepend-icon="mdi-account-plus-outline"
              >
                Join carpool
              </v-btn>

              <v-btn
                variant="text"
                rounded="lg"
                class="text-none"
                @click="detailsDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- SNACKBAR -->
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          timeout="3500"
          rounded="pill"
          location="bottom right"
          class="snackbar-polished"
        >
          <div class="d-flex align-center ga-2">
            <v-icon size="18">
              {{
                snackbar.color === 'error'
                  ? 'mdi-alert-circle-outline'
                  : snackbar.color === 'warning'
                    ? 'mdi-alert-outline'
                    : 'mdi-check-circle-outline'
              }}
            </v-icon>

            <span>{{ snackbar.text }}</span>
          </div>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { RouterLink } from "vue-router"
import { useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"

import {
  Carpooling,
  add_Carpooling,
  get_Carpool_Contact_Method_Options_For_User,
  get_Searchable_Carpoolings_For_User,
  join_Carpooling,
} from "@/dataModel/carpooling"
import { get_All_Events } from "@/dataModel/event"
import { get_All_Venues } from "@/dataModel/venue"
import { get_Current_User } from "@/dataModel/user"

const theme = useTheme()

const currentUser = computed(() => get_Current_User())
const events = computed(() => get_All_Events())
const venues = computed(() => get_All_Venues())

const onlyAvailable = ref(false)
const selectedEventId = ref("all")
const selectedVenueId = ref("all")
const detailsDialog = ref(false)
const selectedCarpool = ref(null)
const isBrowserDark = ref(false)

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
})

const form = reactive({
  event_id: null,
  departure_location: "",
  time_of_going: "",
  total_spots: 1,
  deadline: "",
  contact_method: null,
  note: "",
})

const contactMethodItems = computed(() => {
  return get_Carpool_Contact_Method_Options_For_User(currentUser.value)
})

const eventItems = computed(() => events.value)

const eventFilterItems = computed(() => [
  { title: "All events", id: "all" },
  ...events.value,
])

const venueFilterItems = computed(() => [
  { title: "All venues", id: "all" },
  ...venues.value.map(venue => ({
    title: venue.title,
    id: venue.id,
  })),
])

const searchableCarpools = computed(() => {
  if (!currentUser.value) return []
  return get_Searchable_Carpoolings_For_User(currentUser.value.id)
})

const filteredCarpools = computed(() => {
  return searchableCarpools.value.filter(carpool => {
    const matchesEvent =
      selectedEventId.value === "all" || carpool.event_id === selectedEventId.value

    const matchesVenue =
      selectedVenueId.value === "all" || carpool.venue_id === selectedVenueId.value

    const matchesAvailable =
      !onlyAvailable.value || carpool.spots_left > 0

    return matchesEvent && matchesVenue && matchesAvailable
  })
})

const availableCarpoolsCount = computed(() => {
  return searchableCarpools.value.filter(carpool => carpool.spots_left > 0).length
})

const noteLength = computed(() => String(form.note || "").length)

const selectedFormEventTitle = computed(() => {
  if (!form.event_id) return "Not selected yet"
  const selectedEvent = eventItems.value.find(event => event.id === form.event_id)
  return selectedEvent?.title || "Not selected yet"
})

const selectedContactMethodTitle = computed(() => {
  if (!form.contact_method) return "Not selected yet"
  const selectedMethod = contactMethodItems.value.find(item => item.value === form.contact_method)
  return selectedMethod?.title || "Not selected yet"
})

let mediaQuery = null

function applyBrowserThemePreference() {
  if (typeof window === "undefined") return

  isBrowserDark.value = !!window.matchMedia?.("(prefers-color-scheme: dark)").matches

  if (theme?.global?.name?.value) {
    theme.global.name.value = isBrowserDark.value ? "dark" : "light"
  }
}

function handleThemePreferenceChange(event) {
  isBrowserDark.value = event.matches

  if (theme?.global?.name?.value) {
    theme.global.name.value = isBrowserDark.value ? "dark" : "light"
  }
}

function resetForm() {
  form.event_id = null
  form.departure_location = ""
  form.time_of_going = ""
  form.total_spots = 1
  form.deadline = ""
  form.note = ""
  form.contact_method = contactMethodItems.value[0]?.value ?? null
}

if (!form.contact_method && contactMethodItems.value.length > 0) {
  form.contact_method = contactMethodItems.value[0].value
}

function showSnackbar(text, color = "success") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function statusColor(status) {
  if (status === "Finished") return "grey-darken-1"
  if (status === "Reserved") return "primary"
  if (status === "Open") return "success"
  if (status === "Full") return "error"
  return "secondary"
}

function openDetails(carpool) {
  selectedCarpool.value = carpool
  detailsDialog.value = true
}

function createCarpool() {
  if (!currentUser.value) {
    showSnackbar("Please log in first.", "error")
    return
  }

  if (!form.event_id || !form.departure_location || !form.time_of_going || !form.deadline || !form.note || !form.contact_method) {
    showSnackbar("Please fill all fields.", "error")
    return
  }

  const selectedMethod = contactMethodItems.value.find(item => item.value === form.contact_method)
  if (!selectedMethod) {
    showSnackbar("Please choose a valid contact method from your profile.", "error")
    return
  }

  const user = currentUser.value
  let contactValue = ""

  if (form.contact_method === "phone" || form.contact_method === "whatsapp") {
    contactValue = user.contacts?.phone ?? ""
  } else if (form.contact_method === "instagram") {
    contactValue = user.contacts?.instagram ?? ""
  } else if (form.contact_method === "facebook") {
    contactValue = user.contacts?.facebook ?? ""
  }

  if (!String(contactValue).trim()) {
    showSnackbar("That contact method is missing from your profile.", "error")
    return
  }

  const created = add_Carpooling(
    new Carpooling({
      event_id: form.event_id,
      departure_location: form.departure_location,
      time_of_going: form.time_of_going,
      driver_user_id: user.id,
      contact_method: form.contact_method,
      contact_value: contactValue,
      total_spots: Number(form.total_spots),
      spots_left: Number(form.total_spots),
      deadline: form.deadline,
      participant_user_ids: [],
      note: form.note,
      status: "Open",
      is_current: true,
    })
  )

  resetForm()
  showSnackbar(`Carpool created for ${created.event_title}.`)
}

function joinCarpool(id) {
  if (!currentUser.value) {
    showSnackbar("Please log in first.", "error")
    return
  }

  const result = join_Carpooling(id, currentUser.value.id)

  if (!result?.success) {
    showSnackbar(result?.message || "Could not join carpool.", "error")
    return
  }

  detailsDialog.value = false
  showSnackbar(
    `Joined successfully. ${result.contact_method_label}: ${result.contact_value}`,
    "success"
  )
}

onMounted(() => {
  applyBrowserThemePreference()

  if (typeof window !== "undefined" && window.matchMedia) {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleThemePreferenceChange)
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleThemePreferenceChange)
    }
  }
})

onBeforeUnmount(() => {
  if (!mediaQuery) return

  if (typeof mediaQuery.removeEventListener === "function") {
    mediaQuery.removeEventListener("change", handleThemePreferenceChange)
  } else if (typeof mediaQuery.removeListener === "function") {
    mediaQuery.removeListener(handleThemePreferenceChange)
  }
})

resetForm()
</script>

<style scoped>
.carpool-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.carpool-page--dark {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 28%),
    radial-gradient(circle at bottom right, rgba(147, 51, 234, 0.12), transparent 24%),
    linear-gradient(180deg, #0b1020 0%, #0f172a 42%, #0b1220 100%);
  color: #f8fafc;
}

.carpool-page--light {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.1), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 48%, #f7faff 100%);
  color: #0f172a;
}

.page-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.page-content {
  position: relative;
  z-index: 1;
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.35;
}

.bg-orb-1 {
  width: 260px;
  height: 260px;
  top: -50px;
  left: -30px;
  background: rgba(59, 130, 246, 0.55);
}

.bg-orb-2 {
  width: 320px;
  height: 320px;
  right: -80px;
  top: 220px;
  background: rgba(168, 85, 247, 0.3);
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent 78%);
}

.hero-card {
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.35s ease;
}

.hero-card:hover {
  transform: translateY(-2px);
}

.hero-card--dark {
  background:
    linear-gradient(135deg, rgba(14, 22, 40, 0.96), rgba(17, 24, 39, 0.88));
  border-color: rgba(255, 255, 255, 0.08);
}

.hero-card--light {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(240, 246, 255, 0.96));
  border-color: rgba(15, 23, 42, 0.08);
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 85% 18%, rgba(99, 102, 241, 0.16), transparent 28%);
  pointer-events: none;
}

.hero-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(99, 102, 241, 0.18));
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: rgb(var(--v-theme-primary));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.hero-title {
  letter-spacing: -0.03em;
}

.carpool-page--dark .hero-title {
  color: #ffffff;
}

.carpool-page--light .hero-title {
  color: #0f172a;
}

.hero-subtitle {
  max-width: 650px;
  opacity: 0.9;
}

.carpool-page--dark .hero-subtitle {
  color: #cbd5e1;
}

.carpool-page--light .hero-subtitle {
  color: #475569;
}

.hero-chip {
  backdrop-filter: blur(8px);
  font-weight: 600;
}

.carpool-page--dark .hero-chip {
  background: rgba(255, 255, 255, 0.06) !important;
  color: #e2e8f0;
}

.carpool-page--light .hero-chip {
  background: rgba(15, 23, 42, 0.05) !important;
  color: #1e293b;
}

.stat-card {
  height: 100%;
  border: 1px solid transparent;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.carpool-page--dark .stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.06);
}

.carpool-page--light .stat-card {
  background: rgba(255, 255, 255, 0.76);
  border-color: rgba(15, 23, 42, 0.06);
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.carpool-page--dark .stat-label {
  color: #94a3b8;
}

.carpool-page--light .stat-label {
  color: #64748b;
}

.stat-value {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}

.carpool-page--dark .stat-value {
  color: #ffffff;
}

.carpool-page--light .stat-value {
  color: #0f172a;
}

.glass-card {
  position: relative;
  overflow: hidden;
  border-width: 1px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 35px rgba(2, 8, 23, 0.1);
  transition: background 0.35s ease, border-color 0.35s ease, transform 0.25s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
}

.glass-card--dark {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.glass-card--light {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.section-topbar {
  height: 4px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(99, 102, 241, 0.55));
}

.sticky-card {
  position: sticky;
  top: 88px;
}

.title-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-primary), 0.16);
}

.section-title {
  letter-spacing: -0.02em;
}

.carpool-page--dark .section-title {
  color: #ffffff;
}

.carpool-page--light .section-title {
  color: #0f172a;
}

.section-subtitle {
  opacity: 0.9;
}

.carpool-page--dark .section-subtitle {
  color: #94a3b8;
}

.carpool-page--light .section-subtitle {
  color: #64748b;
}

.helper-card,
.summary-card,
.info-panel,
.driver-card-dialog,
.dialog-info-card {
  border: 1px solid transparent;
}

.carpool-page--dark .helper-card,
.carpool-page--dark .summary-card,
.carpool-page--dark .info-panel,
.carpool-page--dark .driver-card-dialog,
.carpool-page--dark .dialog-info-card {
  background: rgba(255, 255, 255, 0.045) !important;
  border-color: rgba(255, 255, 255, 0.06);
}

.carpool-page--light .helper-card,
.carpool-page--light .summary-card,
.carpool-page--light .info-panel,
.carpool-page--light .driver-card-dialog,
.carpool-page--light .dialog-info-card {
  background: rgba(15, 23, 42, 0.03) !important;
  border-color: rgba(15, 23, 42, 0.06);
}

.helper-icon {
  color: rgb(var(--v-theme-primary));
}

.helper-text {
  line-height: 1.55;
}

.carpool-page--dark .helper-text {
  color: #dbe4f0;
}

.carpool-page--light .helper-text {
  color: #334155;
}

.field-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.carpool-page--dark .field-label {
  color: #cbd5e1;
}

.carpool-page--light .field-label {
  color: #475569;
}

.polished-field :deep(.v-field) {
  border-radius: 14px !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.25s ease;
}

.polished-field :deep(.v-field:hover) {
  transform: translateY(-1px);
}

.carpool-page--dark .polished-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.03);
}

.carpool-page--light .polished-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.92);
}

.note-counter-chip {
  font-weight: 700;
}

.carpool-page--dark .note-counter-chip {
  color: #cbd5e1;
}

.carpool-page--light .note-counter-chip {
  color: #475569;
}

.summary-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.carpool-page--dark .summary-title {
  color: #ffffff;
}

.carpool-page--light .summary-title {
  color: #0f172a;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 0.9rem;
  padding: 4px 0;
}

.summary-key {
  opacity: 0.8;
}

.summary-value {
  font-weight: 700;
  text-align: right;
}

.carpool-page--dark .summary-key {
  color: #cbd5e1;
}

.carpool-page--light .summary-key {
  color: #64748b;
}

.carpool-page--dark .summary-value {
  color: #ffffff;
}

.carpool-page--light .summary-value {
  color: #0f172a;
}

.create-btn {
  min-height: 46px;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), 0.25);
}

.form-footer-text {
  text-align: center;
  line-height: 1.4;
}

.carpool-page--dark .form-footer-text {
  color: #94a3b8;
}

.carpool-page--light .form-footer-text {
  color: #64748b;
}

.results-chip {
  font-weight: 700;
}

.filter-checkbox {
  width: 100%;
}

.filter-checkbox :deep(.v-selection-control) {
  min-height: 44px;
}

.carpool-item {
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.carpool-item:hover {
  transform: translateY(-2px);
}

.inner-card {
  border-width: 1px !important;
}

.carpool-page--dark .inner-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.07) !important;
}

.carpool-page--light .inner-card {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.carpool-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  flex-shrink: 0;
}

.carpool-title {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.carpool-page--dark .carpool-title {
  color: #ffffff;
}

.carpool-page--light .carpool-title {
  color: #0f172a;
}

.clickable-link:hover {
  opacity: 0.8;
}

.mini-chip {
  font-weight: 600;
}

.status-chip {
  font-weight: 700;
}

.profile-strip {
  min-height: 48px;
}

.driver-line {
  line-height: 1.45;
}

.driver-name {
  transition: opacity 0.2s ease;
}

.carpool-page--dark .driver-name {
  color: #ffffff;
}

.carpool-page--light .driver-name {
  color: #0f172a;
}

.driver-separator {
  margin: 0 8px;
  opacity: 0.5;
}

.carpool-page--dark .driver-location {
  color: #cbd5e1;
}

.carpool-page--light .driver-location {
  color: #475569;
}

.avatar-ring {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.16);
}

.clickable-avatar {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-avatar:hover {
  transform: scale(1.04);
}

.note-box {
  border-radius: 14px;
  height: 100%;
}

.carpool-page--dark .note-box {
  border: 1px dashed rgba(255, 255, 255, 0.22);
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.02);
}

.carpool-page--light .note-box {
  border: 1px dashed rgba(15, 23, 42, 0.14);
  color: #334155;
  background: rgba(15, 23, 42, 0.02);
}

.note-box-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.carpool-page--dark .note-box-label {
  color: #94a3b8;
}

.carpool-page--light .note-box-label {
  color: #64748b;
}

.note-box-text {
  font-style: italic;
  line-height: 1.6;
}

.info-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 6px 0;
  font-size: 0.92rem;
}

.info-key {
  display: inline-flex;
  align-items: center;
  opacity: 0.88;
}

.carpool-page--dark .info-key,
.carpool-page--dark .info-value {
  color: #e2e8f0;
}

.carpool-page--light .info-key {
  color: #475569;
}

.carpool-page--light .info-value {
  color: #0f172a;
}

.empty-state {
  border: 1px dashed transparent;
}

.carpool-page--dark .empty-state {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.12);
}

.carpool-page--light .empty-state {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(15, 23, 42, 0.12);
}

.empty-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
}

.empty-text {
  max-width: 420px;
}

.carpool-page--dark .empty-text {
  color: #cbd5e1;
}

.carpool-page--light .empty-text {
  color: #475569;
}

/* DIALOG */
.details-dialog-card {
  overflow: hidden;
  border: 1px solid transparent;
  transition: background 0.35s ease, color 0.35s ease;
}

.details-dialog-card--dark {
  background: #0f172a !important;
  color: #f8fafc !important;
  border-color: rgba(255, 255, 255, 0.08);
}

.details-dialog-card--light {
  background: #ffffff !important;
  color: #111827 !important;
  border-color: rgba(15, 23, 42, 0.08);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.carpool-page--dark .details-header {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
  color: #f8fafc;
}

.carpool-page--light .details-header {
  background: #ffffff;
  color: #111827;
}

.details-header-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
}

.details-title {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.carpool-page--dark .details-title {
  color: #f8fafc;
}

.carpool-page--light .details-title {
  color: #111827;
}

.details-subtitle {
  font-size: 0.92rem;
}

.carpool-page--dark .details-subtitle {
  color: #94a3b8;
}

.carpool-page--light .details-subtitle {
  color: #6b7280;
}

.details-body {
  padding: 24px !important;
}

.carpool-page--dark .details-body {
  background: #0f172a;
  color: #f8fafc;
}

.carpool-page--light .details-body {
  background: #ffffff;
  color: #111827;
}

.details-section-label {
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.carpool-page--dark .details-section-label {
  color: #cbd5e1;
}

.carpool-page--light .details-section-label {
  color: #111827;
}

.details-link {
  text-decoration: none;
  transition: opacity 0.2s ease;
  font-weight: 700;
}

.carpool-page--dark .details-link {
  color: #f8fafc;
}

.carpool-page--light .details-link {
  color: #111827;
}

.details-link:hover {
  opacity: 0.75;
}

.details-muted {
  font-size: 0.92rem;
}

.carpool-page--dark .details-muted {
  color: #94a3b8;
}

.carpool-page--light .details-muted {
  color: #6b7280;
}

.details-text {
  font-size: 0.95rem;
}

.carpool-page--dark .details-text {
  color: #e2e8f0;
}

.carpool-page--light .details-text {
  color: #111827;
}

.details-contact-box {
  border-radius: 12px;
  padding: 14px 16px;
}

.carpool-page--dark .details-contact-box {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.carpool-page--light .details-contact-box {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.details-contact-method {
  font-weight: 700;
}

.carpool-page--dark .details-contact-method {
  color: #f8fafc;
}

.carpool-page--light .details-contact-method {
  color: #111827;
}

.details-contact-note {
  margin-top: 4px;
  font-size: 0.9rem;
}

.carpool-page--dark .details-contact-note {
  color: #94a3b8;
}

.carpool-page--light .details-contact-note {
  color: #6b7280;
}

.details-empty-box {
  padding: 16px;
}

.carpool-page--dark .details-empty-box {
  border: 1px dashed rgba(255, 255, 255, 0.14);
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.02);
}

.carpool-page--light .details-empty-box {
  border: 1px dashed #d1d5db;
  color: #6b7280;
  background: #fafafa;
}

.details-note-panel {
  border-radius: 12px;
  padding: 14px 16px;
  font-style: italic;
  min-height: 100%;
}

.carpool-page--dark .details-note-panel {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #e2e8f0;
}

.carpool-page--light .details-note-panel {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
}

.participant-card-clean {
  padding: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.carpool-page--dark .participant-card-clean {
  border-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(255, 255, 255, 0.03);
}

.carpool-page--light .participant-card-clean {
  border-color: #e5e7eb !important;
  background: #ffffff;
}

.participant-card-clean:hover {
  transform: translateY(-2px);
}

.snackbar-polished :deep(.v-snackbar__wrapper) {
  box-shadow: 0 16px 40px rgba(2, 8, 23, 0.22);
}

@media (max-width: 959px) {
  .sticky-card {
    position: static;
    top: auto;
  }
}

@media (max-width: 600px) {
  .hero-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .details-header {
    padding: 20px;
  }

  .details-body {
    padding: 20px !important;
  }
}
</style>