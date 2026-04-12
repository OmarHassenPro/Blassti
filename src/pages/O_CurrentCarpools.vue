<template>
  <v-app :theme="currentTheme">
    <AppNavbar />

    <v-main
      class="carpools-main"
      :class="browserThemeClass"
    >
      <div class="page-backdrop" />

      <v-container class="py-5 py-sm-6 py-md-8 page-container">
        <v-card
          rounded="xl"
          class="hero-card mb-5 mb-sm-6 mb-md-8"
          :class="browserThemeClass"
        >
          <div class="hero-glow hero-glow-1" />
          <div class="hero-glow hero-glow-2" />

          <div class="d-flex justify-space-between align-center flex-wrap ga-4 ga-sm-5 hero-content">
            <div class="hero-copy">
              <div class="d-inline-flex align-center ga-2 hero-badge mb-3">
                <v-icon size="18">mdi-car-multiple</v-icon>
                <span>Your ride coordination hub</span>
              </div>

              <div class="text-h5 text-sm-h4 text-md-h4 font-weight-bold hero-title">
                My Carpools
              </div>

              <div class="text-body-1 hero-subtitle">
                Cleanly manage the carpools you created or joined, track participants, and stay on top of your upcoming rides.
              </div>
            </div>

            <div class="d-flex flex-wrap justify-start justify-sm-end ga-2 hero-actions">
              <v-chip
                v-if="currentUser"
                color="primary"
                variant="flat"
                rounded="pill"
                class="hero-user-chip"
              >
                <v-icon start size="16">mdi-account-circle</v-icon>
                {{ currentUser.full_name }}
              </v-chip>

              <v-chip
                size="small"
                variant="outlined"
                rounded="pill"
                class="summary-chip"
              >
                <v-icon start size="16">mdi-lightning-bolt-outline</v-icon>
                {{ currentCarpools.length }} current
              </v-chip>

              <v-chip
                size="small"
                variant="outlined"
                rounded="pill"
                class="summary-chip"
              >
                <v-icon start size="16">mdi-history</v-icon>
                {{ pastCarpools.length }} past
              </v-chip>

              
            </div>
          </div>
        </v-card>


        <div
          v-if="currentUser"
          class="summary-grid mb-5 mb-sm-6 mb-md-8"
          :class="{
            'summary-grid-mobile': isMobile,
            'summary-grid-tablet': isTablet,
          }"
        >
          <v-card
            v-for="item in summaryCards"
            :key="item.label"
            rounded="xl"
            class="summary-panel"
            :class="browserThemeClass"
          >
            <div class="summary-panel-icon">
              <v-icon size="20">{{ item.icon }}</v-icon>
            </div>

            <div class="summary-panel-copy">
              <div class="summary-panel-label">{{ item.label }}</div>
              <div class="summary-panel-value">{{ item.value }}</div>
              <div class="summary-panel-caption">{{ item.caption }}</div>
            </div>
          </v-card>
        </div>

        <v-row v-if="!currentUser" justify="center">
          <v-col cols="12" md="10" lg="8">
            <v-card rounded="xl" class="empty-state-card pa-5 pa-sm-6 pa-md-8" :class="browserThemeClass">
              <div class="empty-orb mb-4">
                <v-icon size="34">mdi-account-lock-outline</v-icon>
              </div>

              <div class="text-h6 font-weight-bold mb-2">
                Please log in to view your carpools
              </div>

              <div class="text-body-1 empty-state-text">
                Once you are signed in, you will be able to review the carpools you created or joined and manage them from here.
              </div>
            </v-card>
          </v-col>
        </v-row>

        <template v-else>
          <div class="section-shell mb-8">
            <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
              <div class="section-heading-wrap">
                <div class="section-kicker">
                  <v-icon size="17" class="me-1">mdi-car-clock</v-icon>
                  Active rides
                </div>

                <div class="text-h6 font-weight-bold section-title">
                  Current Carpools
                </div>

                <div class="text-body-2 section-subtitle">
                  Upcoming carpools that still matter for your event flow.
                </div>
              </div>

              <v-chip
                variant="tonal"
                rounded="pill"
                class="section-count-chip"
              >
                <v-icon start size="16">mdi-format-list-bulleted-square</v-icon>
                {{ currentCarpools.length }} item(s)
              </v-chip>
            </div>

            <template v-if="currentCarpools.length">
              <v-row v-if="isDesktop">
                <v-col
                  v-for="carpool in currentCarpools"
                  :key="carpool.id"
                  cols="12"
                  md="6"
                  lg="6"
                >
                  <v-card
                    rounded="xl"
                    class="pa-4 pa-sm-5 pa-md-6 h-100 glass-card current-carpool-card"
                    :class="browserThemeClass"
                  >
                    <div class="card-top-strip" />

                    <div class="d-flex justify-space-between flex-wrap ga-4">
                      <div class="min-w-0">
                        <div class="d-flex flex-wrap align-center ga-2 mb-2">
                          <v-chip
                            size="x-small"
                            variant="tonal"
                            rounded="pill"
                            class="micro-chip"
                          >
                            <v-icon start size="14">mdi-calendar-blank-outline</v-icon>
                            Upcoming
                          </v-chip>

                          <v-chip
                            size="x-small"
                            variant="tonal"
                            rounded="pill"
                            class="micro-chip"
                          >
                            <v-icon start size="14">mdi-account-tie</v-icon>
                            {{ isDriver(carpool) ? "Driver" : "Participant" }}
                          </v-chip>
                        </div>

                        <RouterLink
                          :to="carpool.event_route"
                          class="text-decoration-none"
                        >
                          <div class="text-h6 font-weight-bold clickable-link title-link">
                            {{ carpool.event_title }}
                          </div>
                        </RouterLink>

                        <div class="text-body-2 meta-line mt-2">
                          <v-icon size="16" class="me-1">mdi-clock-outline</v-icon>
                          {{ carpool.event_date }} • {{ carpool.time_of_going }}
                        </div>

                        <div class="text-body-2 meta-line mt-1">
                          <v-icon size="16" class="me-1">mdi-map-marker-path</v-icon>
                          {{ carpool.route }}
                        </div>
                      </div>

                      <div class="d-flex align-center ga-2 flex-wrap justify-end status-side">
                        <v-btn
                          v-if="isDriver(carpool)"
                          color="error"
                          variant="flat"
                          rounded="pill"
                          size="small"
                          class="delete-top-btn touch-target-btn"
                          prepend-icon="mdi-delete-outline"
                          @click="openDeleteDialog(carpool)"
                        >
                          Delete
                        </v-btn>

                        <v-chip
                          :color="statusColor(carpool.status)"
                          size="small"
                          rounded="pill"
                          class="status-chip"
                        >
                          <v-icon start size="15">
                            {{
                              carpool.status === "Finished"
                                ? "mdi-flag-checkered"
                                : carpool.status === "Reserved"
                                ? "mdi-bookmark-check-outline"
                                : carpool.status === "Open"
                                ? "mdi-lock-open-variant-outline"
                                : carpool.status === "Full"
                                ? "mdi-account-group"
                                : "mdi-information-outline"
                            }}
                          </v-icon>
                          {{ carpool.status }}
                        </v-chip>
                      </div>
                    </div>

                    <v-divider class="my-4 divider-light" />

                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="section-mini-title mb-3">
                          <v-icon size="17" class="me-1">mdi-steering</v-icon>
                          Driver
                        </div>

                        <div class="profile-spotlight d-flex align-center">
                          <RouterLink
                            v-if="carpool.driver"
                            :to="carpool.driver.route"
                            class="text-decoration-none"
                          >
                            <v-avatar size="56" class="mr-3 clickable-avatar spotlight-avatar">
                              <v-img
                                v-if="carpool.driver.avatar"
                                :src="carpool.driver.avatar"
                                cover
                              />
                              <v-icon v-else size="26">mdi-account</v-icon>
                            </v-avatar>
                          </RouterLink>

                          <div class="min-w-0">
                            <RouterLink
                              v-if="carpool.driver"
                              :to="carpool.driver.route"
                              class="text-decoration-none"
                            >
                              <div class="font-weight-bold clickable-link text-truncate">
                                {{ carpool.driver.name }}
                              </div>
                            </RouterLink>

                            <div class="text-body-2 meta-line">
                              <v-icon size="15" class="me-1">mdi-map-marker-outline</v-icon>
                              Departure: {{ carpool.departure_location }}
                            </div>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" md="6">
                        <div class="section-mini-title mb-3">
                          <v-icon size="17" class="me-1">mdi-office-building-marker-outline</v-icon>
                          Venue
                        </div>

                        <div class="detail-box">
                          <RouterLink
                            v-if="carpool.venue_route"
                            :to="carpool.venue_route"
                            class="text-decoration-none"
                          >
                            <div class="font-weight-medium clickable-link mb-1">
                              {{ carpool.venue_title }}
                            </div>
                          </RouterLink>

                          <div class="text-body-2 meta-line">
                            <v-icon size="15" class="me-1">mdi-city-variant-outline</v-icon>
                            {{ carpool.venue_location }}
                          </div>

                          <div class="text-body-2 meta-line mt-1">
                            <v-icon size="15" class="me-1">mdi-crosshairs-gps</v-icon>
                            {{ carpool.venue_exact_address }}
                          </div>
                        </div>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4 divider-light" />

                    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4">
                      <div class="stats-strip d-flex flex-wrap ga-2">
                        <v-chip
                          size="small"
                          variant="outlined"
                          rounded="pill"
                          class="stat-chip"
                        >
                          <v-icon start size="15">mdi-seat-passenger</v-icon>
                          {{ carpool.spots_left }} spot(s) left
                        </v-chip>

                        <v-chip
                          size="small"
                          variant="outlined"
                          rounded="pill"
                          class="stat-chip"
                        >
                          <v-icon start size="15">mdi-account-check-outline</v-icon>
                          You are {{ isDriver(carpool) ? "the driver" : "a participant" }}
                        </v-chip>
                      </div>

                      <div class="d-flex ga-2 flex-wrap action-wrap">
                        <v-btn
                          :to="carpool.event_route"
                          variant="outlined"
                          rounded="pill"
                          prepend-icon="mdi-open-in-new"
                          class="action-btn touch-target-btn"
                        >
                          Open Event
                        </v-btn>

                        <v-btn
                          variant="outlined"
                          rounded="pill"
                          prepend-icon="mdi-card-account-details-outline"
                          class="action-btn touch-target-btn"
                          @click="openDetails(carpool)"
                        >
                          View Details
                        </v-btn>

                        <v-btn
                          v-if="!isDriver(carpool)"
                          color="error"
                          variant="outlined"
                          rounded="pill"
                          prepend-icon="mdi-close-circle-outline"
                          class="action-btn touch-target-btn"
                          @click="openCancelDialog(carpool)"
                        >
                          Cancel Join
                        </v-btn>
                      </div>
                    </div>

                    <v-card
                      variant="outlined"
                      rounded="lg"
                      class="pa-4 info-card driver-note-card"
                    >
                      <div class="d-flex align-center ga-2 text-subtitle-2 font-weight-bold mb-2">
                        <v-icon size="17">mdi-note-text-outline</v-icon>
                        Driver note
                      </div>

                      <div class="font-italic note-text">
                        “{{ carpool.note }}”
                      </div>
                    </v-card>
                  </v-card>
                </v-col>
              </v-row>

              <div
                v-else
                class="responsive-current-layout"
                :class="{
                  'responsive-current-layout-mobile': isMobile,
                  'responsive-current-layout-tablet': isTablet,
                }"
              >
                <v-card
                  v-if="featuredCurrentCarpool"
                  rounded="xl"
                  class="glass-card featured-current-card"
                  :class="browserThemeClass"
                >
                  <div class="card-top-strip" />

                  <div class="featured-current-inner">
                    <div class="featured-current-top">
                      <div class="d-flex flex-wrap align-center ga-2 mb-3">
                        <v-chip
                          size="x-small"
                          variant="tonal"
                          rounded="pill"
                          class="micro-chip"
                        >
                          <v-icon start size="14">mdi-star-four-points-outline</v-icon>
                          Featured ride
                        </v-chip>

                        <v-chip
                          size="x-small"
                          variant="tonal"
                          rounded="pill"
                          class="micro-chip"
                        >
                          <v-icon start size="14">mdi-account-tie</v-icon>
                          {{ isDriver(featuredCurrentCarpool) ? "Driver" : "Participant" }}
                        </v-chip>
                      </div>

                      <div class="d-flex justify-space-between align-start ga-3 flex-wrap">
                        <div class="min-w-0">
                          <RouterLink
                            :to="featuredCurrentCarpool.event_route"
                            class="text-decoration-none"
                          >
                            <div class="text-h6 text-sm-h5 font-weight-bold clickable-link title-link featured-current-title">
                              {{ featuredCurrentCarpool.event_title }}
                            </div>
                          </RouterLink>

                          <div class="text-body-2 meta-line mt-2">
                            <v-icon size="16" class="me-1">mdi-clock-outline</v-icon>
                            {{ featuredCurrentCarpool.event_date }} • {{ featuredCurrentCarpool.time_of_going }}
                          </div>

                          <div class="text-body-2 meta-line mt-1">
                            <v-icon size="16" class="me-1">mdi-map-marker-path</v-icon>
                            {{ featuredCurrentCarpool.route }}
                          </div>
                        </div>

                        <v-chip
                          :color="statusColor(featuredCurrentCarpool.status)"
                          size="small"
                          rounded="pill"
                          class="status-chip"
                        >
                          <v-icon start size="15">
                            {{
                              featuredCurrentCarpool.status === "Finished"
                                ? "mdi-flag-checkered"
                                : featuredCurrentCarpool.status === "Reserved"
                                ? "mdi-bookmark-check-outline"
                                : featuredCurrentCarpool.status === "Open"
                                ? "mdi-lock-open-variant-outline"
                                : featuredCurrentCarpool.status === "Full"
                                ? "mdi-account-group"
                                : "mdi-information-outline"
                            }}
                          </v-icon>
                          {{ featuredCurrentCarpool.status }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="featured-current-grid">
                      <div class="featured-info-block profile-spotlight">
                        <div class="section-mini-title mb-2">
                          <v-icon size="17" class="me-1">mdi-steering</v-icon>
                          Driver
                        </div>

                        <div class="d-flex align-center">
                          <RouterLink
                            v-if="featuredCurrentCarpool.driver"
                            :to="featuredCurrentCarpool.driver.route"
                            class="text-decoration-none"
                          >
                            <v-avatar size="52" class="mr-3 clickable-avatar spotlight-avatar">
                              <v-img
                                v-if="featuredCurrentCarpool.driver.avatar"
                                :src="featuredCurrentCarpool.driver.avatar"
                                cover
                              />
                              <v-icon v-else size="24">mdi-account</v-icon>
                            </v-avatar>
                          </RouterLink>

                          <div class="min-w-0">
                            <RouterLink
                              v-if="featuredCurrentCarpool.driver"
                              :to="featuredCurrentCarpool.driver.route"
                              class="text-decoration-none"
                            >
                              <div class="font-weight-bold clickable-link text-truncate">
                                {{ featuredCurrentCarpool.driver.name }}
                              </div>
                            </RouterLink>

                            <div class="text-body-2 meta-line">
                              <v-icon size="15" class="me-1">mdi-map-marker-outline</v-icon>
                              Departure: {{ featuredCurrentCarpool.departure_location }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="featured-info-block detail-box">
                        <div class="section-mini-title mb-2">
                          <v-icon size="17" class="me-1">mdi-office-building-marker-outline</v-icon>
                          Venue
                        </div>

                        <RouterLink
                          v-if="featuredCurrentCarpool.venue_route"
                          :to="featuredCurrentCarpool.venue_route"
                          class="text-decoration-none"
                        >
                          <div class="font-weight-medium clickable-link mb-1">
                            {{ featuredCurrentCarpool.venue_title }}
                          </div>
                        </RouterLink>

                        <div class="text-body-2 meta-line">
                          <v-icon size="15" class="me-1">mdi-city-variant-outline</v-icon>
                          {{ featuredCurrentCarpool.venue_location }}
                        </div>

                        <div class="text-body-2 meta-line mt-1">
                          <v-icon size="15" class="me-1">mdi-crosshairs-gps</v-icon>
                          {{ featuredCurrentCarpool.venue_exact_address }}
                        </div>
                      </div>
                    </div>

                    <div class="featured-stat-row">
                      <v-chip
                        size="small"
                        variant="outlined"
                        rounded="pill"
                        class="stat-chip"
                      >
                        <v-icon start size="15">mdi-seat-passenger</v-icon>
                        {{ featuredCurrentCarpool.spots_left }} spot(s) left
                      </v-chip>

                      <v-chip
                        size="small"
                        variant="outlined"
                        rounded="pill"
                        class="stat-chip"
                      >
                        <v-icon start size="15">mdi-account-check-outline</v-icon>
                        You are {{ isDriver(featuredCurrentCarpool) ? "the driver" : "a participant" }}
                      </v-chip>
                    </div>

                    <v-card
                      variant="outlined"
                      rounded="lg"
                      class="pa-4 info-card driver-note-card"
                    >
                      <div class="d-flex align-center ga-2 text-subtitle-2 font-weight-bold mb-2">
                        <v-icon size="17">mdi-note-text-outline</v-icon>
                        Driver note
                      </div>

                      <div class="font-italic note-text">
                        “{{ featuredCurrentCarpool.note }}”
                      </div>
                    </v-card>

                    <div class="featured-current-actions">
                      <v-btn
                        :to="featuredCurrentCarpool.event_route"
                        variant="outlined"
                        rounded="pill"
                        prepend-icon="mdi-open-in-new"
                        class="action-btn touch-target-btn"
                      >
                        Open Event
                      </v-btn>

                      <v-btn
                        variant="outlined"
                        rounded="pill"
                        prepend-icon="mdi-card-account-details-outline"
                        class="action-btn touch-target-btn"
                        @click="openDetails(featuredCurrentCarpool)"
                      >
                        View Details
                      </v-btn>

                      <v-btn
                        v-if="!isDriver(featuredCurrentCarpool)"
                        color="error"
                        variant="outlined"
                        rounded="pill"
                        prepend-icon="mdi-close-circle-outline"
                        class="action-btn touch-target-btn"
                        @click="openCancelDialog(featuredCurrentCarpool)"
                      >
                        Cancel Join
                      </v-btn>

                      <v-btn
                        v-if="isDriver(featuredCurrentCarpool)"
                        color="error"
                        variant="flat"
                        rounded="pill"
                        prepend-icon="mdi-delete-outline"
                        class="action-btn touch-target-btn"
                        @click="openDeleteDialog(featuredCurrentCarpool)"
                      >
                        Delete
                      </v-btn>
                    </div>
                  </div>
                </v-card>

                <div
                  v-if="remainingCurrentCarpools.length"
                  class="current-secondary-shell"
                >
                  <div class="compact-section-header">
                    <div>
                      <div class="compact-section-title">More upcoming rides</div>
                      <div class="compact-section-subtitle">
                        Faster browsing for the rest of your active carpools.
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="isMobile"
                    class="current-secondary-scroll"
                  >
                    <v-card
                      v-for="carpool in remainingCurrentCarpools"
                      :key="carpool.id"
                      rounded="xl"
                      class="glass-card compact-current-card"
                      :class="browserThemeClass"
                    >
                      <div class="compact-card-inner">
                        <div class="d-flex justify-space-between align-start ga-2 mb-3">
                          <div class="min-w-0">
                            <RouterLink
                              :to="carpool.event_route"
                              class="text-decoration-none"
                            >
                              <div class="font-weight-bold clickable-link compact-card-title">
                                {{ carpool.event_title }}
                              </div>
                            </RouterLink>

                            <div class="text-body-2 meta-line mt-2">
                              <v-icon size="15" class="me-1">mdi-clock-outline</v-icon>
                              {{ carpool.event_date }}
                            </div>
                          </div>

                          <v-chip
                            size="x-small"
                            variant="tonal"
                            rounded="pill"
                            class="micro-chip"
                          >
                            {{ isDriver(carpool) ? "Driver" : "Joined" }}
                          </v-chip>
                        </div>

                        <div class="text-body-2 meta-line mb-2">
                          <v-icon size="15" class="me-1">mdi-map-marker-path</v-icon>
                          {{ carpool.route }}
                        </div>

                        <div class="compact-card-footer">
                          <v-chip
                            :color="statusColor(carpool.status)"
                            size="x-small"
                            rounded="pill"
                            class="status-chip"
                          >
                            {{ carpool.status }}
                          </v-chip>

                          <v-btn
                            size="small"
                            variant="text"
                            rounded="pill"
                            class="past-action-btn"
                            @click="openDetails(carpool)"
                          >
                            Details
                          </v-btn>
                        </div>
                      </div>
                    </v-card>
                  </div>

                  <div
                    v-else
                    class="current-secondary-grid"
                  >
                    <v-card
                      v-for="carpool in remainingCurrentCarpools"
                      :key="carpool.id"
                      rounded="xl"
                      class="glass-card compact-current-card compact-current-card-tablet"
                      :class="browserThemeClass"
                    >
                      <div class="compact-card-inner">
                        <div class="d-flex justify-space-between align-start ga-2 mb-3">
                          <div class="min-w-0">
                            <RouterLink
                              :to="carpool.event_route"
                              class="text-decoration-none"
                            >
                              <div class="font-weight-bold clickable-link compact-card-title">
                                {{ carpool.event_title }}
                              </div>
                            </RouterLink>

                            <div class="text-body-2 meta-line mt-2">
                              <v-icon size="15" class="me-1">mdi-clock-outline</v-icon>
                              {{ carpool.event_date }} • {{ carpool.time_of_going }}
                            </div>
                          </div>

                          <v-chip
                            size="x-small"
                            variant="tonal"
                            rounded="pill"
                            class="micro-chip"
                          >
                            {{ isDriver(carpool) ? "Driver" : "Joined" }}
                          </v-chip>
                        </div>

                        <div class="text-body-2 meta-line mb-2">
                          <v-icon size="15" class="me-1">mdi-map-marker-path</v-icon>
                          {{ carpool.route }}
                        </div>

                        <div class="text-body-2 meta-line mb-3">
                          <v-icon size="15" class="me-1">mdi-seat-passenger</v-icon>
                          {{ carpool.spots_left }} spot(s) left
                        </div>

                        <div class="compact-card-footer">
                          <v-chip
                            :color="statusColor(carpool.status)"
                            size="x-small"
                            rounded="pill"
                            class="status-chip"
                          >
                            {{ carpool.status }}
                          </v-chip>

                          <div class="d-flex ga-1 flex-wrap">
                            <v-btn
                              size="small"
                              variant="text"
                              rounded="pill"
                              class="past-action-btn"
                              @click="openDetails(carpool)"
                            >
                              Details
                            </v-btn>

                            <v-btn
                              v-if="!isDriver(carpool)"
                              size="small"
                              color="error"
                              variant="text"
                              rounded="pill"
                              class="past-action-btn"
                              @click="openCancelDialog(carpool)"
                            >
                              Leave
                            </v-btn>

                            <v-btn
                              v-if="isDriver(carpool)"
                              size="small"
                              color="error"
                              variant="text"
                              rounded="pill"
                              class="past-action-btn"
                              @click="openDeleteDialog(carpool)"
                            >
                              Delete
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>
            </template>
            <v-row v-else>
              <v-col cols="12">
                <v-card rounded="xl" class="empty-state-card pa-5 pa-sm-6 pa-md-8" :class="browserThemeClass">
                  <div class="empty-orb mb-4">
                    <v-icon size="34">mdi-car-off</v-icon>
                  </div>

                  <div class="text-h6 font-weight-bold mb-2">
                    No current carpools found
                  </div>

                  <div class="text-body-1 empty-state-text">
                    Create or join a carpool to see it appear here 🚗
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div class="section-shell">
            <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
              <div class="section-heading-wrap">
                <div class="section-kicker">
                  <v-icon size="17" class="me-1">mdi-history</v-icon>
                  Ride history
                </div>

                <div class="text-h6 font-weight-bold section-title">
                  Past Carpools
                </div>

                <div class="text-body-2 section-subtitle">
                  Previously completed carpools, kept accessible in a cleaner archive view.
                </div>
              </div>

              <v-chip
                variant="tonal"
                rounded="pill"
                class="section-count-chip"
              >
                <v-icon start size="16">mdi-archive-outline</v-icon>
                {{ pastCarpools.length }} archived
              </v-chip>
            </div>

            <template v-if="pastCarpools.length">
              <v-row v-if="isDesktop">
                <v-col
                  v-for="carpool in pastCarpools"
                  :key="carpool.id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card
                    rounded="xl"
                    class="pa-4 pa-sm-5 pa-md-6 h-100 d-flex flex-column glass-card past-carpool-card"
                    :class="browserThemeClass"
                  >
                    <div class="d-flex justify-space-between align-start ga-3">
                      <div class="min-w-0">
                        <RouterLink
                          :to="carpool.event_route"
                          class="text-decoration-none"
                        >
                          <div class="text-h6 font-weight-bold clickable-link title-link">
                            {{ carpool.event_title }}
                          </div>
                        </RouterLink>

                        <div class="text-body-2 meta-line mt-2">
                          <v-icon size="16" class="me-1">mdi-clock-outline</v-icon>
                          {{ carpool.event_date }} • {{ carpool.time_of_going }}
                        </div>
                      </div>

                      <v-chip
                        size="small"
                        :color="statusColor(carpool.status)"
                        rounded="pill"
                        class="status-chip"
                      >
                        <v-icon start size="15">
                          {{
                            carpool.status === "Finished"
                              ? "mdi-flag-checkered"
                              : carpool.status === "Reserved"
                              ? "mdi-bookmark-check-outline"
                              : carpool.status === "Open"
                              ? "mdi-lock-open-variant-outline"
                              : carpool.status === "Full"
                              ? "mdi-account-group"
                              : "mdi-information-outline"
                          }}
                        </v-icon>
                        {{ carpool.status }}
                      </v-chip>
                    </div>

                    <v-divider class="my-4 divider-light" />

                    <div class="archive-line mb-3">
                      <span class="archive-label">
                        <v-icon size="15" class="me-1">mdi-map-marker-path</v-icon>
                        Route:
                      </span>
                      <span class="archive-value">{{ carpool.route }}</span>
                    </div>

                    <div class="archive-line mb-3">
                      <span class="archive-label">
                        <v-icon size="15" class="me-1">mdi-office-building-marker-outline</v-icon>
                        Venue:
                      </span>
                      <RouterLink
                        v-if="carpool.venue_route"
                        :to="carpool.venue_route"
                        class="text-decoration-none clickable-link archive-link ms-1"
                      >
                        {{ carpool.venue_title }}
                      </RouterLink>
                    </div>

                    <div class="text-body-2 meta-line mb-3">
                      <v-icon size="15" class="me-1">mdi-crosshairs-gps</v-icon>
                      {{ carpool.venue_exact_address }}
                    </div>

                    <div class="archive-line mb-3">
                      <span class="archive-label">
                        <v-icon size="15" class="me-1">mdi-account-tie</v-icon>
                        Driver:
                      </span>
                      <RouterLink
                        v-if="carpool.driver"
                        :to="carpool.driver.route"
                        class="text-decoration-none clickable-link archive-link ms-1"
                      >
                        {{ carpool.driver.name }}
                      </RouterLink>
                    </div>

                    <div class="archive-line mb-5">
                      <span class="archive-label">
                        <v-icon size="15" class="me-1">mdi-badge-account-outline</v-icon>
                        Your role:
                      </span>
                      <span class="archive-value">
                        {{ isDriver(carpool) ? "Driver" : "Participant" }}
                      </span>
                    </div>

                    <v-spacer />

                    <div class="d-flex ga-2 flex-wrap">
                      <v-btn
                        :to="carpool.event_route"
                        variant="text"
                        rounded="pill"
                        prepend-icon="mdi-open-in-new"
                        class="past-action-btn touch-target-btn"
                      >
                        Open Event
                      </v-btn>

                      <v-btn
                        variant="text"
                        rounded="pill"
                        prepend-icon="mdi-card-account-details-outline"
                        class="past-action-btn touch-target-btn"
                        @click="openDetails(carpool)"
                      >
                        View Details
                      </v-btn>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <div
                v-else
                class="past-responsive-shell"
                :class="{
                  'past-responsive-shell-mobile': isMobile,
                  'past-responsive-shell-tablet': isTablet,
                }"
              >
                <div
                  v-if="isMobile"
                  class="past-scroll-track"
                >
                  <v-card
                    v-for="carpool in pastCarpools"
                    :key="carpool.id"
                    rounded="xl"
                    class="glass-card compact-past-card"
                    :class="browserThemeClass"
                  >
                    <div class="compact-card-inner">
                      <div class="d-flex justify-space-between align-start ga-2 mb-3">
                        <div class="min-w-0">
                          <RouterLink
                            :to="carpool.event_route"
                            class="text-decoration-none"
                          >
                            <div class="font-weight-bold clickable-link compact-card-title">
                              {{ carpool.event_title }}
                            </div>
                          </RouterLink>

                          <div class="text-body-2 meta-line mt-2">
                            <v-icon size="15" class="me-1">mdi-clock-outline</v-icon>
                            {{ carpool.event_date }}
                          </div>
                        </div>

                        <v-chip
                          size="x-small"
                          :color="statusColor(carpool.status)"
                          rounded="pill"
                          class="status-chip"
                        >
                          {{ carpool.status }}
                        </v-chip>
                      </div>

                      <div class="text-body-2 meta-line mb-2">
                        <v-icon size="15" class="me-1">mdi-account-tie</v-icon>
                        {{ carpool.driver?.name }}
                      </div>

                      <div class="text-body-2 meta-line mb-2">
                        <v-icon size="15" class="me-1">mdi-map-marker-path</v-icon>
                        {{ carpool.route }}
                      </div>

                      <div class="compact-card-footer">
                        <span class="archive-value">{{ isDriver(carpool) ? "Driver" : "Participant" }}</span>

                        <v-btn
                          size="small"
                          variant="text"
                          rounded="pill"
                          class="past-action-btn"
                          @click="openDetails(carpool)"
                        >
                          Details
                        </v-btn>
                      </div>
                    </div>
                  </v-card>
                </div>

                <div
                  v-else
                  class="past-tablet-grid"
                >
                  <v-card
                    v-for="carpool in pastCarpools"
                    :key="carpool.id"
                    rounded="xl"
                    class="glass-card compact-past-card compact-past-card-tablet"
                    :class="browserThemeClass"
                  >
                    <div class="compact-card-inner">
                      <div class="d-flex justify-space-between align-start ga-2 mb-3">
                        <div class="min-w-0">
                          <RouterLink
                            :to="carpool.event_route"
                            class="text-decoration-none"
                          >
                            <div class="font-weight-bold clickable-link compact-card-title">
                              {{ carpool.event_title }}
                            </div>
                          </RouterLink>

                          <div class="text-body-2 meta-line mt-2">
                            <v-icon size="15" class="me-1">mdi-clock-outline</v-icon>
                            {{ carpool.event_date }} • {{ carpool.time_of_going }}
                          </div>
                        </div>

                        <v-chip
                          size="x-small"
                          :color="statusColor(carpool.status)"
                          rounded="pill"
                          class="status-chip"
                        >
                          {{ carpool.status }}
                        </v-chip>
                      </div>

                      <div class="text-body-2 meta-line mb-2">
                        <v-icon size="15" class="me-1">mdi-map-marker-path</v-icon>
                        {{ carpool.route }}
                      </div>

                      <div class="text-body-2 meta-line mb-2">
                        <v-icon size="15" class="me-1">mdi-office-building-marker-outline</v-icon>
                        {{ carpool.venue_title }}
                      </div>

                      <div class="text-body-2 meta-line mb-3">
                        <v-icon size="15" class="me-1">mdi-account-tie</v-icon>
                        {{ carpool.driver?.name }} • {{ isDriver(carpool) ? "Driver" : "Participant" }}
                      </div>

                      <div class="d-flex ga-2 flex-wrap">
                        <v-btn
                          :to="carpool.event_route"
                          size="small"
                          variant="text"
                          rounded="pill"
                          class="past-action-btn"
                        >
                          Open Event
                        </v-btn>

                        <v-btn
                          size="small"
                          variant="text"
                          rounded="pill"
                          class="past-action-btn"
                          @click="openDetails(carpool)"
                        >
                          Details
                        </v-btn>
                      </div>
                    </div>
                  </v-card>
                </div>
              </div>
            </template>
            <v-row v-else>
              <v-col cols="12">
                <v-card rounded="xl" class="empty-state-card pa-5 pa-sm-6 pa-md-8" :class="browserThemeClass">
                  <div class="empty-orb mb-4">
                    <v-icon size="34">mdi-archive-off-outline</v-icon>
                  </div>

                  <div class="text-h6 font-weight-bold mb-2">
                    You have no past carpools yet
                  </div>

                  <div class="text-body-1 empty-state-text">
                    Finished carpools will be grouped here later so you can revisit the event, venue, and participant info anytime.
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </template>

        <!-- DETAILS DIALOG -->
        <v-dialog v-model="detailsDialog" :max-width="isMobile ? '96vw' : 880" transition="dialog-bottom-transition">
          <v-card
            v-if="selectedCarpool"
            rounded="xl"
            class="details-dialog-card" :class="browserThemeClass"
          >
            <div class="dialog-top-accent" />

            <v-card-title class="d-flex justify-space-between align-center pa-6 dialog-title-wrap">
              <div>
                <div class="text-overline dialog-overline mb-1">
                  Carpool overview
                </div>

                <div class="text-h6 font-weight-bold">
                  Carpool Details
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{ selectedCarpool.event_title }}
                </div>
              </div>

              <v-btn
                icon="mdi-close"
                variant="text"
                rounded="pill"
                @click="detailsDialog = false"
              />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4 pa-sm-5 pa-md-6">
              <v-row class="mb-1">
                <v-col cols="12" md="6">
                  <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card h-100">
                    <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                      <v-icon size="18" class="me-2">mdi-calendar-star</v-icon>
                      Event
                    </div>

                    <RouterLink
                      :to="selectedCarpool.event_route"
                      class="text-decoration-none"
                    >
                      <div class="font-weight-medium clickable-link text-high-emphasis">
                        {{ selectedCarpool.event_title }}
                      </div>
                    </RouterLink>

                    <div class="text-body-2 text-medium-emphasis mt-2">
                      <v-icon size="15" class="me-1">mdi-clock-outline</v-icon>
                      {{ selectedCarpool.event_date }} • {{ selectedCarpool.time_of_going }}
                    </div>

                    <div class="text-body-2 mt-2">
                      <v-icon size="15" class="me-1">mdi-map-marker-path</v-icon>
                      {{ selectedCarpool.route }}
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card h-100">
                    <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                      <v-icon size="18" class="me-2">mdi-office-building-marker-outline</v-icon>
                      Venue
                    </div>

                    <RouterLink
                      v-if="selectedCarpool.venue_route"
                      :to="selectedCarpool.venue_route"
                      class="text-decoration-none"
                    >
                      <div class="font-weight-medium clickable-link text-high-emphasis">
                        {{ selectedCarpool.venue_title }}
                      </div>
                    </RouterLink>

                    <div class="text-body-2 text-medium-emphasis mt-2">
                      <v-icon size="15" class="me-1">mdi-city-variant-outline</v-icon>
                      {{ selectedCarpool.venue_location }}
                    </div>

                    <div class="text-body-2 text-medium-emphasis mt-1">
                      <v-icon size="15" class="me-1">mdi-crosshairs-gps</v-icon>
                      {{ selectedCarpool.venue_exact_address }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-5" />

              <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon size="18" class="me-2">mdi-steering</v-icon>
                Driver
              </div>

              <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card mb-5">
                <div class="d-flex align-center">
                  <RouterLink
                    v-if="selectedCarpool.driver"
                    :to="selectedCarpool.driver.route"
                    class="text-decoration-none"
                  >
                    <v-avatar size="60" class="mr-4 clickable-avatar spotlight-avatar">
                      <v-img
                        v-if="selectedCarpool.driver.avatar"
                        :src="selectedCarpool.driver.avatar"
                        cover
                      />
                      <v-icon v-else size="28">mdi-account</v-icon>
                    </v-avatar>
                  </RouterLink>

                  <div class="min-w-0">
                    <RouterLink
                      v-if="selectedCarpool.driver"
                      :to="selectedCarpool.driver.route"
                      class="text-decoration-none"
                    >
                      <div class="font-weight-bold clickable-link text-high-emphasis">
                        {{ selectedCarpool.driver.name }}
                      </div>
                    </RouterLink>

                    <div class="text-body-2 text-medium-emphasis mt-1">
                      <v-icon size="15" class="me-1">mdi-map-marker-outline</v-icon>
                      Departure: {{ selectedCarpool.departure_location }}
                    </div>
                  </div>
                </div>
              </v-card>

              <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
                <v-icon size="17" class="me-2">mdi-phone-outline</v-icon>
                Contact info
              </div>

              <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card mb-5">
                <div>
                  <strong>{{ selectedCarpool.contact_method_label }}:</strong>
                  {{ selectedCarpool.contact_value }}
                </div>
              </v-card>

              <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon size="18" class="me-2">mdi-account-group-outline</v-icon>
                Participants
              </div>

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
                    <v-card
                      variant="outlined"
                      rounded="xl"
                      class="pa-3 participant-card participant-dialog-card h-100"
                    >
                      <div class="d-flex align-center">
                        <v-avatar size="50" class="mr-3">
                          <v-img
                            v-if="participant.avatar"
                            :src="participant.avatar"
                            cover
                          />
                          <v-icon v-else size="24">mdi-account</v-icon>
                        </v-avatar>

                        <div class="font-weight-medium clickable-link text-high-emphasis">
                          {{ participant.name }}
                        </div>
                      </div>
                    </v-card>
                  </RouterLink>
                </v-col>
              </v-row>

              <v-card
                v-else
                variant="outlined"
                rounded="xl"
                class="pa-4 text-medium-emphasis dialog-info-card"
              >
                No participants yet.
              </v-card>

              <v-divider class="my-5" />

              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card h-100">
                    <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                      <v-icon size="17" class="me-2">mdi-information-outline</v-icon>
                      Carpool Info
                    </div>

                    <div class="mb-2"><strong>Status:</strong> {{ selectedCarpool.status }}</div>
                    <div class="mb-2"><strong>Spots left:</strong> {{ selectedCarpool.spots_left }}</div>
                    <div class="mb-2"><strong>Total spots:</strong> {{ selectedCarpool.total_spots }}</div>
                    <div class="mb-0"><strong>Deadline:</strong> {{ selectedCarpool.deadline }}</div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card h-100">
                    <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                      <v-icon size="17" class="me-2">mdi-note-text-outline</v-icon>
                      Driver Note
                    </div>

                    <div class="font-italic note-text">
                      “{{ selectedCarpool.note }}”
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4 d-flex justify-end flex-wrap ga-2">
              <v-btn
                variant="flat"
                rounded="pill"
                class="dialog-close-btn touch-target-btn"
                @click="detailsDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- CANCEL JOIN DIALOG -->
        <v-dialog v-model="cancelDialog" :max-width="isMobile ? '96vw' : 640" transition="dialog-bottom-transition">
          <v-card rounded="xl" v-if="cancelTarget" class="action-dialog-card" :class="browserThemeClass">
            <div class="dialog-top-accent warning-accent" />

            <v-card-title class="d-flex justify-space-between align-center pa-6">
              <div>
                <div class="text-overline dialog-overline mb-1">
                  Participant action
                </div>

                <div class="text-h6 font-weight-bold">
                  Cancel join
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{ cancelTarget.event_title }}
                </div>
              </div>

              <v-btn
                icon="mdi-close"
                variant="text"
                rounded="pill"
                @click="cancelDialog = false"
              />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4 pa-sm-5 pa-md-6">
              <div class="mb-4 text-body-1">
                Are you sure you want to leave this carpool?
              </div>

              <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
                <v-icon size="17" class="me-2">mdi-format-list-bulleted</v-icon>
                Reason
              </div>

              <v-select
                v-model="cancelReason"
                :items="cancelReasonItems"
                label="Choose a reason"
                variant="outlined"
                rounded="xl"
                prepend-inner-icon="mdi-alert-circle-outline"
                class="mb-4"
              />

              <v-textarea
                v-if="cancelReason === 'Other'"
                v-model="cancelOtherText"
                label="Write your reason"
                variant="outlined"
                rounded="xl"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-pencil-outline"
                class="mb-4"
              />

              <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card">
                <div class="font-weight-medium mb-2 d-flex align-center">
                  <v-icon size="17" class="me-2">mdi-lightbulb-on-outline</v-icon>
                  Suggestions
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  Try canceling early so someone else can join. The carpool will appear again in search after you leave.
                </div>
              </v-card>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4 d-flex justify-end flex-wrap ga-2">
              <v-btn
                variant="text"
                rounded="pill"
                @click="cancelDialog = false"
              >
                Keep join
              </v-btn>

              <v-btn
                color="error"
                variant="outlined"
                rounded="pill"
                prepend-icon="mdi-close-circle-outline"
                @click="confirmCancelJoin"
              >
                Confirm cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- DELETE CARPOOL DIALOG -->
        <v-dialog v-model="deleteDialog" :max-width="isMobile ? '96vw' : 560" transition="dialog-bottom-transition">
          <v-card rounded="xl" v-if="deleteTarget" class="action-dialog-card" :class="browserThemeClass">
            <div class="dialog-top-accent danger-accent" />

            <v-card-title class="d-flex justify-space-between align-center pa-6">
              <div>
                <div class="text-overline dialog-overline mb-1">
                  Driver action
                </div>

                <div class="text-h6 font-weight-bold">
                  Delete carpool
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{ deleteTarget.event_title }}
                </div>
              </div>

              <v-btn
                icon="mdi-close"
                variant="text"
                rounded="pill"
                @click="deleteDialog = false"
              />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4 pa-sm-5 pa-md-6">
              <div class="mb-4 text-body-1">
                Are you sure you want to delete this carpool?
              </div>

              <v-card variant="outlined" rounded="xl" class="pa-4 dialog-info-card">
                <div class="font-weight-medium mb-2 d-flex align-center">
                  <v-icon size="17" class="me-2">mdi-information-slab-circle-outline</v-icon>
                  What happens next
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  The carpool will be removed, all joined users will receive a notification, and you will receive one too.
                </div>
              </v-card>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4 d-flex justify-end flex-wrap ga-2">
              <v-btn
                variant="text"
                rounded="pill"
                @click="deleteDialog = false"
              >
                No
              </v-btn>

              <v-btn
                color="error"
                variant="flat"
                rounded="pill"
                prepend-icon="mdi-delete-outline"
                @click="confirmDeleteCarpool"
              >
                Yes, delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          timeout="3500"
          location="bottom right"
          rounded="pill"
          class="app-snackbar"
        >
          <div class="d-flex align-center">
            <v-icon class="me-2" size="18">
              {{ snackbar.color === "error" ? "mdi-alert-circle-outline" : "mdi-check-circle-outline" }}
            </v-icon>
            {{ snackbar.text }}
          </div>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { RouterLink } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"

import { get_Current_User } from "@/dataModel/user"
import {
  delete_Carpooling,
  get_Current_Carpoolings_For_User,
  get_Past_Carpoolings_For_User,
  leave_Carpooling,
} from "@/dataModel/carpooling"

const detailsDialog = ref(false)
const selectedCarpool = ref(null)

const cancelDialog = ref(false)
const cancelTarget = ref(null)
const cancelReason = ref("")
const cancelOtherText = ref("")

const deleteDialog = ref(false)
const deleteTarget = ref(null)

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
})

const cancelReasonItems = [
  "My plans changed",
  "I found another ride",
  "Timing no longer works",
  "Departure location is not convenient",
  "Other",
]

const currentUser = ref(get_Current_User() || null)

const currentCarpools = computed(() => {
  if (!currentUser.value) return []
  return get_Current_Carpoolings_For_User(currentUser.value.id)
})

const pastCarpools = computed(() => {
  if (!currentUser.value) return []
  return get_Past_Carpoolings_For_User(currentUser.value.id)
})

const theme = useTheme()
const display = useDisplay()
const THEME_STORAGE_KEY = "blassti-theme"

const isMobile = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)
const isDesktop = computed(() => display.lgAndUp.value)
const featuredCurrentCarpool = computed(() => currentCarpools.value[0] || null)
const remainingCurrentCarpools = computed(() => currentCarpools.value.slice(1))
const summaryCards = computed(() => [
  {
    label: "Current rides",
    value: currentCarpools.value.length,
    caption: currentCarpools.value.length ? "Upcoming carpools you can still act on" : "Nothing active yet",
    icon: "mdi-lightning-bolt-outline",
  },
  {
    label: "Past rides",
    value: pastCarpools.value.length,
    caption: pastCarpools.value.length ? "Archived rides kept for reference" : "Archive is empty",
    icon: "mdi-history",
  },
  {
    label: "Your role",
    value: currentCarpools.value.some((carpool) => isDriver(carpool)) ? "Driver" : "Rider",
    caption: currentCarpools.value.some((carpool) => isDriver(carpool))
      ? "You currently manage at least one ride"
      : "You are currently joining other rides",
    icon: "mdi-account-switch-outline",
  },
])
const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})
const isDarkTheme = computed(() => currentTheme.value === "dark")
const browserThemeClass = computed(() =>
  isDarkTheme.value ? "browser-dark" : "browser-light"
)

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
  }
}

function loadSavedTheme() {
  if (typeof window === "undefined") return

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function syncCurrentUser() {
  currentUser.value = get_Current_User() || null
}


function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    applyThemeChoice(savedTheme === "light" ? "light" : "dark")
  }

  if (!event.key || event.key === "currentUser") {
    syncCurrentUser()
  }
}

function handleWindowFocus() {
  loadSavedTheme()
  syncCurrentUser()
}

onMounted(() => {
  if (typeof window === "undefined") return

  loadSavedTheme()
  syncCurrentUser()
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", handleWindowFocus)
})

onBeforeUnmount(() => {
  if (typeof window === "undefined") return

  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", handleWindowFocus)
})

function showSnackbar(text, color = "success") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function openDetails(carpool) {
  selectedCarpool.value = carpool
  detailsDialog.value = true
}

function openCancelDialog(carpool) {
  cancelTarget.value = carpool
  cancelReason.value = ""
  cancelOtherText.value = ""
  cancelDialog.value = true
}

function openDeleteDialog(carpool) {
  if (!isDriver(carpool)) {
    showSnackbar("You cannot delete someone else's carpool.", "error")
    return
  }

  deleteTarget.value = carpool
  deleteDialog.value = true
}

function confirmCancelJoin() {
  if (!currentUser.value || !cancelTarget.value) return

  const finalReason =
    cancelReason.value === "Other"
      ? "Other"
      : cancelReason.value

  const finalNote =
    cancelReason.value === "Other"
      ? cancelOtherText.value.trim()
      : ""

  const result = leave_Carpooling(
    cancelTarget.value.id,
    currentUser.value.id,
    finalReason,
    finalNote
  )

  if (!result?.success) {
    showSnackbar(result?.message || "Could not cancel join.", "error")
    return
  }

  cancelDialog.value = false
  detailsDialog.value = false
  showSnackbar("You left the carpool. It is now visible again in search.", "success")
}

function confirmDeleteCarpool() {
  if (!currentUser.value || !deleteTarget.value) return

  const result = delete_Carpooling(deleteTarget.value.id, currentUser.value.id)

  if (!result?.success) {
    showSnackbar(result?.message || "Could not delete carpool.", "error")
    return
  }

  if (selectedCarpool.value?.id === deleteTarget.value.id) {
    selectedCarpool.value = null
    detailsDialog.value = false
  }

  if (cancelTarget.value?.id === deleteTarget.value.id) {
    cancelTarget.value = null
    cancelDialog.value = false
  }

  deleteDialog.value = false
  deleteTarget.value = null

  showSnackbar("Carpool deleted successfully.", "success")
}

function isDriver(carpool) {
  return !!currentUser.value && carpool.driver_user_id === currentUser.value.id
}

function statusColor(status) {
  if (status === "Finished") return "grey-darken-1"
  if (status === "Reserved") return "primary"
  if (status === "Open") return "success"
  if (status === "Full") return "error"
  return "secondary"
}
</script>

<style scoped>
.carpools-main {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  transition: background 0.28s ease, color 0.28s ease;
}

.page-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 25%),
    radial-gradient(circle at bottom center, rgba(16, 185, 129, 0.08), transparent 30%);
  opacity: 1;
}

.browser-dark.carpools-main {
  background:
    linear-gradient(180deg, #0b1220 0%, #0f172a 45%, #111827 100%);
  color: #f8fafc;
}

.browser-light.carpools-main {
  background:
    linear-gradient(180deg, #f5f7fb 0%, #edf2f7 45%, #e9eef7 100%);
  color: #111827;
}

.page-container {
  position: relative;
  z-index: 1;
}

.hero-card {
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
  transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease, border-color 0.24s ease;
}

.hero-card:hover {
  transform: translateY(-2px);
}

.browser-dark .hero-card {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(17, 24, 39, 0.88));
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
}

.browser-light .hero-card {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.88));
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 28px;
}

@media (min-width: 960px) {
  .hero-content {
    padding: 34px;
  }
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  pointer-events: none;
  opacity: 0.8;
}

.hero-glow-1 {
  width: 180px;
  height: 180px;
  top: -40px;
  right: -24px;
  background: rgba(59, 130, 246, 0.18);
}

.hero-glow-2 {
  width: 160px;
  height: 160px;
  bottom: -60px;
  left: 8%;
  background: rgba(168, 85, 247, 0.12);
}

.hero-copy {
  max-width: 720px;
}

.hero-badge {
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.browser-dark .hero-badge {
  background: rgba(59, 130, 246, 0.14);
  color: #bfdbfe;
  border: 1px solid rgba(96, 165, 250, 0.18);
}

.browser-light .hero-badge {
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.hero-title {
  letter-spacing: -0.02em;
}

.browser-dark .hero-title {
  color: #f8fafc;
}

.browser-light .hero-title {
  color: #0f172a;
}

.hero-subtitle {
  max-width: 720px;
  line-height: 1.7;
}

.browser-dark .hero-subtitle {
  color: rgba(226, 232, 240, 0.8);
}

.browser-light .hero-subtitle {
  color: rgba(51, 65, 85, 0.84);
}

.hero-actions {
  max-width: 420px;
}

.hero-user-chip {
  font-weight: 700;
}

.summary-chip {
  backdrop-filter: blur(10px);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.summary-panel {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 18px;
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.summary-panel:hover {
  transform: translateY(-2px);
}

.browser-dark .summary-panel {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(255, 255, 255, 0.07);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
}

.browser-light .summary-panel {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
}

.summary-panel-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.browser-dark .summary-panel-icon {
  background: rgba(59, 130, 246, 0.14);
  color: #bfdbfe;
}

.browser-light .summary-panel-icon {
  background: rgba(37, 99, 235, 0.09);
  color: #1d4ed8;
}

.summary-panel-copy {
  min-width: 0;
}

.summary-panel-label {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.8;
}

.summary-panel-value {
  margin-top: 2px;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.summary-panel-caption {
  margin-top: 4px;
  font-size: 0.88rem;
  line-height: 1.45;
  opacity: 0.8;
}

.responsive-current-layout,
.past-responsive-shell {
  display: grid;
  gap: 18px;
}

.featured-current-card {
  overflow: hidden;
}

.featured-current-inner {
  position: relative;
  padding: 22px;
  display: grid;
  gap: 18px;
}

.featured-current-title {
  max-width: 720px;
}

.featured-current-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.featured-info-block {
  min-width: 0;
}

.featured-stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.featured-current-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.current-secondary-shell {
  display: grid;
  gap: 12px;
}

.compact-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.compact-section-title {
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.compact-section-subtitle {
  margin-top: 4px;
  font-size: 0.88rem;
  line-height: 1.45;
  opacity: 0.75;
}

.current-secondary-scroll,
.past-scroll-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(280px, 84vw);
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x proximity;
}

.current-secondary-scroll::-webkit-scrollbar,
.past-scroll-track::-webkit-scrollbar {
  height: 8px;
}

.current-secondary-grid,
.past-tablet-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.compact-current-card,
.compact-past-card {
  overflow: hidden;
}

.compact-card-inner {
  padding: 18px;
  height: 100%;
}

.compact-card-title {
  font-size: 1rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.compact-card-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.section-shell {
  position: relative;
}

.section-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.browser-dark .section-kicker {
  color: #93c5fd;
}

.browser-light .section-kicker {
  color: #2563eb;
}

.section-title {
  letter-spacing: -0.01em;
}

.browser-dark .section-title {
  color: #f8fafc;
}

.browser-light .section-title {
  color: #0f172a;
}

.section-subtitle {
  margin-top: 6px;
}

.browser-dark .section-subtitle {
  color: rgba(226, 232, 240, 0.74);
}

.browser-light .section-subtitle {
  color: rgba(51, 65, 85, 0.72);
}

.section-count-chip {
  font-weight: 700;
}

.glass-card {
  position: relative;
  overflow: hidden;
  border-width: 1px !important;
  backdrop-filter: blur(10px);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease,
    background 0.24s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
}

.browser-dark .glass-card {
  background: rgba(19, 24, 35, 0.9);
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.2);
}

.browser-light .glass-card {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.card-top-strip {
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.95), rgba(168, 85, 247, 0.85));
  opacity: 0.95;
}

.current-carpool-card {
  isolation: isolate;
}

.past-carpool-card {
  isolation: isolate;
}

.title-link {
  letter-spacing: -0.01em;
}

.browser-dark .title-link,
.browser-dark .clickable-link,
.browser-dark .archive-link {
  color: #f8fafc;
}

.browser-light .title-link,
.browser-light .clickable-link,
.browser-light .archive-link {
  color: #0f172a;
}

.clickable-link {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.clickable-link:hover {
  opacity: 0.82;
}

.meta-line {
  display: flex;
  align-items: center;
  line-height: 1.65;
}

.browser-dark .meta-line {
  color: rgba(226, 232, 240, 0.72);
}

.browser-light .meta-line {
  color: rgba(51, 65, 85, 0.76);
}

.status-side {
  align-content: flex-start;
}

.status-chip {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.micro-chip {
  font-weight: 600;
}

.section-mini-title {
  display: flex;
  align-items: center;
  font-weight: 700;
}

.browser-dark .section-mini-title {
  color: #f8fafc;
}

.browser-light .section-mini-title {
  color: #0f172a;
}

.profile-spotlight,
.detail-box {
  padding: 12px 14px;
  border-radius: 18px;
}

.browser-dark .profile-spotlight,
.browser-dark .detail-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.browser-light .profile-spotlight,
.browser-light .detail-box {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.spotlight-avatar {
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.clickable-avatar:hover,
.spotlight-avatar:hover {
  transform: scale(1.04);
}

.browser-dark .spotlight-avatar {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.03);
}

.browser-light .spotlight-avatar {
  box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.04);
}

.stats-strip {
  align-items: center;
}

.stat-chip {
  font-weight: 600;
}

.action-wrap {
  justify-content: flex-end;
}

.action-btn,
.past-action-btn {
  text-transform: none;
  font-weight: 700;
}

.info-card {
  transition: background 0.24s ease, border-color 0.24s ease, transform 0.24s ease;
}

.info-card:hover {
  transform: translateY(-1px);
}

.browser-dark .info-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.browser-light .info-card {
  background: rgba(15, 23, 42, 0.025);
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.driver-note-card {
  position: relative;
}

.note-text {
  line-height: 1.75;
}

.browser-dark .note-text {
  color: rgba(226, 232, 240, 0.84);
}

.browser-light .note-text {
  color: rgba(51, 65, 85, 0.82);
}

.archive-line {
  line-height: 1.6;
}

.archive-label {
  font-weight: 700;
}

.archive-value {
  opacity: 0.92;
}

.browser-dark .archive-label,
.browser-dark .archive-value {
  color: rgba(226, 232, 240, 0.86);
}

.browser-light .archive-label,
.browser-light .archive-value {
  color: rgba(51, 65, 85, 0.86);
}

.divider-light {
  opacity: 0.25;
}

.participant-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.participant-card:hover {
  transform: translateY(-2px);
}

.browser-dark .participant-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.browser-light .participant-card {
  background: rgba(15, 23, 42, 0.02);
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.participant-dialog-card {
  min-height: 84px;
}

.delete-top-btn {
  min-width: unset;
  padding-inline: 14px;
  font-weight: 700;
}

.empty-state-card {
  text-align: center;
  border: 1px dashed transparent;
  transition: background 0.24s ease, border-color 0.24s ease, transform 0.24s ease;
}

.empty-state-card:hover {
  transform: translateY(-2px);
}

.browser-dark .empty-state-card {
  background: rgba(15, 23, 42, 0.64);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.18);
}

.browser-light .empty-state-card {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(15, 23, 42, 0.1);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.empty-orb {
  width: 76px;
  height: 76px;
  margin-inline: auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
}

.browser-dark .empty-orb {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.07));
  color: #bfdbfe;
}

.browser-light .empty-orb {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.05));
  color: #1d4ed8;
}

.empty-state-text {
  max-width: 620px;
  margin-inline: auto;
  line-height: 1.7;
}

.browser-dark .empty-state-text {
  color: rgba(226, 232, 240, 0.78);
}

.browser-light .empty-state-text {
  color: rgba(51, 65, 85, 0.76);
}

.details-dialog-card,
.action-dialog-card {
  overflow: hidden;
}

.browser-dark .details-dialog-card,
.browser-dark .action-dialog-card {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: #f8fafc;
}

.browser-light .details-dialog-card,
.browser-light .action-dialog-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #0f172a;
}

.dialog-top-accent {
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.warning-accent {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.danger-accent {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.dialog-overline {
  letter-spacing: 0.09em;
  font-weight: 800;
}

.browser-dark .dialog-overline {
  color: #93c5fd;
}

.browser-light .dialog-overline {
  color: #2563eb;
}

.dialog-info-card {
  transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.browser-dark .dialog-info-card {
  background: rgba(255, 255, 255, 0.025);
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.browser-light .dialog-info-card {
  background: rgba(15, 23, 42, 0.02);
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.dialog-close-btn {
  text-transform: none;
  font-weight: 700;
}

.app-snackbar :deep(.v-snackbar__wrapper) {
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.18);
}

.min-w-0 {
  min-width: 0;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1279px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .featured-current-actions .action-btn {
    flex: 1 1 calc(50% - 6px);
  }
}

@media (max-width: 959px) {
  .status-side {
    width: 100%;
    justify-content: space-between;
  }

  .action-wrap {
    justify-content: flex-start;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-content {
    padding: 24px;
  }

  .featured-current-grid {
    grid-template-columns: 1fr;
  }

  .featured-current-inner {
    padding: 20px;
  }

  .current-secondary-grid,
  .past-tablet-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .hero-content {
    padding: 22px;
  }

  .hero-title {
    font-size: 1.9rem !important;
  }

  .hero-actions {
    max-width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-panel {
    padding: 16px;
    border-radius: 22px;
  }

  .featured-current-inner {
    padding: 18px;
  }

  .featured-current-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .action-btn,
  .past-action-btn {
    width: 100%;
  }

  .compact-card-inner {
    padding: 16px;
  }

  .current-secondary-scroll,
  .past-scroll-track {
    grid-auto-columns: minmax(262px, 84vw);
  }
}
</style>