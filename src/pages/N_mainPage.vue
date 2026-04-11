<template>
  <v-app :class="['mainpage-app', `theme-${currentTheme}`, { 'is-mobile': isMobile }]">
    <AppNavbar />

    <v-main class="mainpage-root">
      <v-container class="mainpage-container">
        <div class="page-top-glow"></div>
        <div class="page-top-glow page-top-glow-secondary"></div>

        <section class="hero-section hero-section-minimal hero-section--blended mb-8">
          <div class="hero-accent hero-accent-primary"></div>
          <div class="hero-accent hero-accent-secondary"></div>
          <div class="hero-copy">
            <h1 class="hero-title">
              Welcome, {{ currentUser ? currentUserName : "Guest" }}
            </h1>

            <p class="hero-subtitle text-medium-emphasis">
              {{ currentUser
                ? "Here are picks tailored for you."
                : "Login to unlock personalized recommendations." }}
            </p>
          </div>
        </section>

        <v-divider class="section-divider my-8"></v-divider>

        <!-- Recommended Events -->
        <section class="section-shell mb-10">
          <div class="section-header mb-4">
            <div>
              <div class="section-kicker">
                <v-icon size="16" class="me-2">mdi-star-four-points</v-icon>
                Curated for you
              </div>
              <h2 class="section-title">Recommended Events</h2>
              <div
                v-if="!currentUser"
                class="section-subtitle text-caption text-medium-emphasis mt-1"
              >
                Login to see personalized recommendations 👀
              </div>
              <div
                v-else-if="recommendedEvents.length > 0"
                class="section-subtitle text-caption text-medium-emphasis mt-1"
              >
                Based on your city, past bookings, and featured events.
              </div>
              <div
                v-else
                class="section-subtitle text-caption text-medium-emphasis mt-1"
              >
                We will start suggesting better matches as your activity grows.
              </div>
            </div>

            <div class="section-actions">
              <v-btn
                v-if="recommendedExtra.length > 0"
                variant="text"
                rounded="xl"
                class="section-toggle-btn"
                @click="showMoreRecommended = !showMoreRecommended"
              >
                <v-icon start>
                  {{ showMoreRecommended ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
                {{ showMoreRecommended ? "Collapse" : "See more" }}
              </v-btn>
            </div>
          </div>

          <!-- Guest state -->
          <v-sheet
            v-if="!currentUser"
            class="state-card state-card-dashed mt-4 d-flex flex-column align-center justify-center text-center pa-8"
            rounded="xl"
            min-height="240"
          >
            <div class="state-icon-wrap mb-4">
              <v-icon size="42">mdi-star-outline</v-icon>
            </div>
            <div class="text-h6 font-weight-bold mb-2">Personalized picks are waiting</div>
            <div class="text-body-2 text-medium-emphasis mb-5 state-text">
              Login to see events recommended for your profile and activity.
            </div>
            <v-btn
              color="primary"
              variant="flat"
              rounded="xl"
              size="large"
              class="state-action-btn"
              @click="router.push('/O_login')"
              @contextmenu.prevent="openRouteContextMenu($event, '/O_login', 'Login')"
              @touchstart.passive="handleLongPressStart($event, '/O_login', 'Login')"
              @touchend="handleLongPressEnd"
              @touchcancel="handleLongPressEnd"
            >
              <v-icon start>mdi-login</v-icon>
              Login
            </v-btn>
          </v-sheet>

          <!-- Logged-in but none found -->
          <v-sheet
            v-else-if="recommendedEvents.length === 0"
            class="state-card state-card-dashed mt-4 d-flex align-center justify-center text-center pa-8"
            rounded="xl"
            min-height="240"
          >
            <div>
              <div class="state-icon-wrap mb-4 mx-auto">
                <v-icon size="40">mdi-compass-off-outline</v-icon>
              </div>
              <div class="text-h6 font-weight-bold mb-2">No recommendations yet</div>
              <div class="text-body-2 text-medium-emphasis state-text">
                Browse events and make a few bookings so Blassti can get smarter.
              </div>
            </div>
          </v-sheet>

          <!-- Logged-in recommendations -->
          <div v-else>
            <v-row class="mt-1">
              <v-col
                v-for="(event, index) in recommendedPreview"
                :key="event.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="stagger-col"
                :style="getStaggerStyle(index)"
              >
                <v-card
                  class="content-card event-card"
                  rounded="xl"
                  elevation="0"
                  style="cursor: pointer;"
                  @click="openEvent(event.id)"
                  @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
                  @touchstart.passive="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                  @touchend="handleLongPressEnd"
                  @touchcancel="handleLongPressEnd"
                >
                  <div class="card-media-wrap">
                    <v-img :src="event.image" height="220" cover class="card-media">
                      <template #placeholder>
                        <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                          <v-icon size="50" color="grey-darken-1">mdi-image</v-icon>
                        </div>
                      </template>
                    </v-img>

                    <div class="media-overlay-top">
                      <v-chip
                        size="small"
                        variant="flat"
                        color="primary"
                        class="card-badge"
                      >
                        <v-icon start size="14">mdi-star-four-points</v-icon>
                        Recommended
                      </v-chip>
                    </div>

                    <div class="card-media-overlay">
                      <div class="card-media-overlay-content">
                        <span class="card-media-overlay-label">View Event</span>
                        <v-icon size="18" class="card-media-overlay-icon">mdi-arrow-top-right</v-icon>
                      </div>
                    </div>
                  </div>

                  <v-card-title class="card-title clamp-2">{{ event.title }}</v-card-title>

                  <div class="px-4 pb-2">
                    <div class="meta-row">
                      <v-icon size="16" class="me-2">mdi-calendar-clock-outline</v-icon>
                      <span>{{ event.date }}</span>
                    </div>
                    <div class="meta-row">
                      <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                      <span>{{ event.city }}</span>
                    </div>
                  </div>

                  <v-card-actions class="pa-4 pt-2">
                    <v-btn
                      class="w-100 card-action-btn"
                      rounded="xl"
                      variant="flat"
                      @click.stop="openEvent(event.id)"
                      @contextmenu.prevent.stop="openEventContextMenu($event, event.id, event.title)"
                      @touchstart.passive.stop="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                      @touchend.stop="handleLongPressEnd"
                      @touchcancel.stop="handleLongPressEnd"
                    >
                      <v-icon start>mdi-arrow-right</v-icon>
                      More Details
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <v-expand-transition>
              <div v-show="showMoreRecommended">
                <v-row class="mt-0">
                  <v-col
                    v-for="(event, index) in recommendedExtra"
                    :key="event.id"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                    class="stagger-col stagger-col-delayed"
                    :style="getStaggerStyle(index + 4)"
                  >
                    <v-card
                      class="content-card event-card"
                      rounded="xl"
                      elevation="0"
                      style="cursor: pointer;"
                      @click="openEvent(event.id)"
                      @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
                  @touchstart.passive="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                  @touchend="handleLongPressEnd"
                  @touchcancel="handleLongPressEnd"
                    >
                      <div class="card-media-wrap">
                        <v-img :src="event.image" height="220" cover class="card-media">
                          <template #placeholder>
                            <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                              <v-icon size="50" color="grey-darken-1">mdi-image</v-icon>
                            </div>
                          </template>
                        </v-img>

                        <div class="media-overlay-top">
                          <v-chip
                            size="small"
                            variant="flat"
                            color="primary"
                            class="card-badge"
                          >
                            <v-icon start size="14">mdi-star-four-points</v-icon>
                            Recommended
                          </v-chip>
                        </div>
                      </div>

                      <v-card-title class="card-title clamp-2">{{ event.title }}</v-card-title>

                      <div class="px-4 pb-2">
                        <div class="meta-row">
                          <v-icon size="16" class="me-2">mdi-calendar-clock-outline</v-icon>
                          <span>{{ event.date }}</span>
                        </div>
                        <div class="meta-row">
                          <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                          <span>{{ event.city }}</span>
                        </div>
                      </div>

                      <v-card-actions class="pa-4 pt-2">
                        <v-btn
                          class="w-100 card-action-btn"
                          rounded="xl"
                          variant="flat"
                          @click.stop="openEvent(event.id)"
                          @contextmenu.prevent.stop="openEventContextMenu($event, event.id, event.title)"
                      @touchstart.passive.stop="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                      @touchend.stop="handleLongPressEnd"
                      @touchcancel.stop="handleLongPressEnd"
                        >
                          <v-icon start>mdi-arrow-right</v-icon>
                          More Details
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </div>
        </section>

        <!-- Featured Venues -->
        <section class="section-shell mt-8 mb-10">
          <div class="section-header mb-4">
            <div>
              <div class="section-kicker">
                <v-icon size="16" class="me-2">mdi-office-building-marker-outline</v-icon>
                Handpicked spaces
              </div>
              <h2 class="section-title">Featured Venues</h2>
              <div class="section-subtitle text-caption text-medium-emphasis mt-1">
                Explore standout spaces ready to host memorable experiences.
              </div>
            </div>

            <div class="section-actions">
              <v-btn
                v-if="featuredVenuesExtra.length > 0"
                variant="text"
                rounded="xl"
                class="section-toggle-btn"
                @click="showMoreVenues = !showMoreVenues"
              >
                <v-icon start>
                  {{ showMoreVenues ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
                {{ showMoreVenues ? "Collapse" : "See more" }}
              </v-btn>
            </div>
          </div>

          <v-row>
            <v-col
              v-for="(venue, index) in featuredVenuesPreview"
              :key="venue.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              class="stagger-col"
              :style="getStaggerStyle(index)"
            >
              <v-card
                class="content-card venue-card"
                rounded="xl"
                elevation="0"
                style="cursor: pointer;"
                @click="openVenue(venue.id)"
                @contextmenu.prevent="openVenueContextMenu($event, venue.id, venue.title)"
                @touchstart.passive="handleLongPressStart($event, '/o_venueinfo', venue.title || 'Venue details', { id: venue.id })"
                @touchend="handleLongPressEnd"
                @touchcancel="handleLongPressEnd"
              >
                <div class="card-media-wrap">
                  <v-img :src="venue.image" height="220" cover class="card-media">
                    <template #placeholder>
                      <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                        <v-icon size="50" color="grey-darken-1">mdi-image</v-icon>
                      </div>
                    </template>
                  </v-img>

                  <div class="media-overlay-top">
                    <v-chip
                      size="small"
                      variant="flat"
                      color="secondary"
                      class="card-badge"
                    >
                      <v-icon start size="14">mdi-check-decagram-outline</v-icon>
                      Featured
                    </v-chip>
                  </div>
                </div>

                <v-card-title class="card-title clamp-2">{{ venue.title }}</v-card-title>

                <div class="px-4 pb-2">
                  <div class="meta-row">
                    <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
                    <span>{{ venue.category }}</span>
                  </div>
                  <div class="meta-row">
                    <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                    <span>{{ venue.location }}</span>
                  </div>
                </div>

                <v-card-actions class="pa-4 pt-2">
                  <v-btn
                    class="w-100 card-action-btn"
                    rounded="xl"
                    variant="flat"
                    @click.stop="openVenue(venue.id)"
                    @contextmenu.prevent.stop="openVenueContextMenu($event, venue.id, venue.title)"
                    @touchstart.passive.stop="handleLongPressStart($event, '/o_venueinfo', venue.title || 'Venue details', { id: venue.id })"
                    @touchend.stop="handleLongPressEnd"
                    @touchcancel.stop="handleLongPressEnd"
                  >
                    <v-icon start>mdi-arrow-right</v-icon>
                    More Details
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-expand-transition>
            <div v-show="showMoreVenues">
              <v-row class="mt-0">
                <v-col
                  v-for="(venue, index) in featuredVenuesExtra"
                  :key="venue.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                  class="stagger-col stagger-col-delayed"
                  :style="getStaggerStyle(index + 4)"
                >
                  <v-card
                    class="content-card venue-card"
                    rounded="xl"
                    elevation="0"
                    style="cursor: pointer;"
                    @click="openVenue(venue.id)"
                    @contextmenu.prevent="openVenueContextMenu($event, venue.id, venue.title)"
                @touchstart.passive="handleLongPressStart($event, '/o_venueinfo', venue.title || 'Venue details', { id: venue.id })"
                @touchend="handleLongPressEnd"
                @touchcancel="handleLongPressEnd"
                  >
                    <div class="card-media-wrap">
                      <v-img :src="venue.image" height="220" cover class="card-media">
                        <template #placeholder>
                          <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                            <v-icon size="50" color="grey-darken-1">mdi-image</v-icon>
                          </div>
                        </template>
                      </v-img>

                      <div class="media-overlay-top">
                        <v-chip
                          size="small"
                          variant="flat"
                          color="secondary"
                          class="card-badge"
                        >
                          <v-icon start size="14">mdi-check-decagram-outline</v-icon>
                          Featured
                        </v-chip>
                      </div>

                      <div class="card-media-overlay">
                        <div class="card-media-overlay-content">
                          <span class="card-media-overlay-label">View Venue</span>
                          <v-icon size="18" class="card-media-overlay-icon">mdi-arrow-top-right</v-icon>
                        </div>
                      </div>
                    </div>

                    <v-card-title class="card-title clamp-2">{{ venue.title }}</v-card-title>

                    <div class="px-4 pb-2">
                      <div class="meta-row">
                        <v-icon size="16" class="me-2">mdi-shape-outline</v-icon>
                        <span>{{ venue.category }}</span>
                      </div>
                      <div class="meta-row">
                        <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                        <span>{{ venue.location }}</span>
                      </div>
                    </div>

                    <v-card-actions class="pa-4 pt-2">
                      <v-btn
                        class="w-100 card-action-btn"
                        rounded="xl"
                        variant="flat"
                        @click.stop="openVenue(venue.id)"
                        @contextmenu.prevent.stop="openVenueContextMenu($event, venue.id, venue.title)"
                    @touchstart.passive.stop="handleLongPressStart($event, '/o_venueinfo', venue.title || 'Venue details', { id: venue.id })"
                    @touchend.stop="handleLongPressEnd"
                    @touchcancel.stop="handleLongPressEnd"
                      >
                        <v-icon start>mdi-arrow-right</v-icon>
                        More Details
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </section>

        <!-- Last Call -->
        <section class="section-shell mt-8 mb-10">
          <div class="section-header mb-4">
            <div>
              <div class="section-kicker">
                <v-icon size="16" class="me-2">mdi-fire</v-icon>
                Hurry up
              </div>
              <h2 class="section-title">Last Call</h2>
              <div class="section-subtitle text-caption text-medium-emphasis mt-1">
                These events are almost gone — grab your spot before they disappear.
              </div>
            </div>

            <div class="section-actions">
              <v-btn
                v-if="lastCallEventsExtra.length > 0"
                variant="text"
                rounded="xl"
                class="section-toggle-btn"
                @click="showMoreLastCall = !showMoreLastCall"
              >
                <v-icon start>
                  {{ showMoreLastCall ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
                {{ showMoreLastCall ? "Collapse" : "See more" }}
              </v-btn>
            </div>
          </div>

          <v-row>
            <v-col
              v-for="(event, index) in lastCallEventsPreview"
              :key="event.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              class="stagger-col"
              :style="getStaggerStyle(index)"
            >
              <v-card
                class="content-card event-card last-call-card"
                rounded="xl"
                elevation="0"
                style="cursor: pointer;"
                @click="openEvent(event.id)"
                @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
                  @touchstart.passive="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                  @touchend="handleLongPressEnd"
                  @touchcancel="handleLongPressEnd"
              >
                <div class="card-media-wrap">
                  <v-img :src="event.image" height="220" cover class="card-media">
                    <template #placeholder>
                      <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                        <v-icon size="50">mdi-image</v-icon>
                      </div>
                    </template>
                  </v-img>

                  <div class="media-overlay-top">
                    <v-chip
                      size="small"
                      variant="flat"
                      color="warning"
                      class="card-badge"
                    >
                      <v-icon start size="14">mdi-fire</v-icon>
                      Last Call
                    </v-chip>
                  </div>

                  <div class="card-media-overlay">
                    <div class="card-media-overlay-content">
                      <span class="card-media-overlay-label">View Event</span>
                      <v-icon size="18" class="card-media-overlay-icon">mdi-arrow-top-right</v-icon>
                    </div>
                  </div>
                </div>

                <v-card-title class="card-title clamp-2">{{ event.title }}</v-card-title>

                <div class="px-4 pb-2">
                  <div class="meta-row">
                    <v-icon size="16" class="me-2">mdi-calendar-clock-outline</v-icon>
                    <span>{{ event.date }}</span>
                  </div>
                  <div class="meta-row">
                    <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                    <span>{{ event.city }}</span>
                  </div>
                </div>

                <v-card-actions class="pa-4 pt-2">
                  <v-btn
                    class="w-100 card-action-btn"
                    rounded="xl"
                    variant="flat"
                    @click.stop="openEvent(event.id)"
                    @contextmenu.prevent.stop="openEventContextMenu($event, event.id, event.title)"
                      @touchstart.passive.stop="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                      @touchend.stop="handleLongPressEnd"
                      @touchcancel.stop="handleLongPressEnd"
                  >
                    <v-icon start>mdi-arrow-right</v-icon>
                    More Details
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-expand-transition>
            <div v-show="showMoreLastCall">
              <v-row class="mt-0">
                <v-col
                  v-for="(event, index) in lastCallEventsExtra"
                  :key="event.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                  class="stagger-col stagger-col-delayed"
                  :style="getStaggerStyle(index + 4)"
                >
                  <v-card
                    class="content-card event-card last-call-card"
                    rounded="xl"
                    elevation="0"
                    style="cursor: pointer;"
                    @click="openEvent(event.id)"
                    @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
                  @touchstart.passive="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                  @touchend="handleLongPressEnd"
                  @touchcancel="handleLongPressEnd"
                  >
                    <div class="card-media-wrap">
                      <v-img :src="event.image" height="220" cover class="card-media">
                        <template #placeholder>
                          <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                            <v-icon size="50">mdi-image</v-icon>
                          </div>
                        </template>
                      </v-img>

                      <div class="media-overlay-top">
                        <v-chip
                          size="small"
                          variant="flat"
                          color="warning"
                          class="card-badge"
                        >
                          <v-icon start size="14">mdi-fire</v-icon>
                          Last Call
                        </v-chip>
                      </div>

                      <div class="card-media-overlay">
                        <div class="card-media-overlay-content">
                          <span class="card-media-overlay-label">View Event</span>
                          <v-icon size="18" class="card-media-overlay-icon">mdi-arrow-top-right</v-icon>
                        </div>
                      </div>
                    </div>

                    <v-card-title class="card-title clamp-2">{{ event.title }}</v-card-title>

                    <div class="px-4 pb-2">
                      <div class="meta-row">
                        <v-icon size="16" class="me-2">mdi-calendar-clock-outline</v-icon>
                        <span>{{ event.date }}</span>
                      </div>
                      <div class="meta-row">
                        <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                        <span>{{ event.city }}</span>
                      </div>
                    </div>

                    <v-card-actions class="pa-4 pt-2">
                      <v-btn
                        class="w-100 card-action-btn"
                        rounded="xl"
                        variant="flat"
                        @click.stop="openEvent(event.id)"
                        @contextmenu.prevent.stop="openEventContextMenu($event, event.id, event.title)"
                      @touchstart.passive.stop="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                      @touchend.stop="handleLongPressEnd"
                      @touchcancel.stop="handleLongPressEnd"
                      >
                        <v-icon start>mdi-arrow-right</v-icon>
                        More Details
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </section>

        <!-- Sold Out -->
        <section class="section-shell mt-8 mb-12">
          <div class="section-header mb-4">
            <div>
              <div class="section-kicker">
                <v-icon size="16" class="me-2">mdi-ticket-off-outline</v-icon>
                Popular moments
              </div>
              <h2 class="section-title">Sold Out</h2>
              <div class="section-subtitle text-caption text-medium-emphasis mt-1">
                These experiences already filled up — proof people moved fast.
              </div>
            </div>

            <div class="section-actions">
              <v-btn
                v-if="soldOutEventsExtra.length > 0"
                variant="text"
                rounded="xl"
                class="section-toggle-btn"
                @click="showMoreSoldOut = !showMoreSoldOut"
              >
                <v-icon start>
                  {{ showMoreSoldOut ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
                {{ showMoreSoldOut ? "Collapse" : "See more" }}
              </v-btn>
            </div>
          </div>

          <v-row>
            <v-col
              v-for="(event, index) in soldOutEventsPreview"
              :key="event.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              class="stagger-col"
              :style="getStaggerStyle(index)"
            >
              <v-card
                class="content-card event-card sold-out-card"
                rounded="xl"
                elevation="0"
                style="cursor: pointer;"
                @click="openEvent(event.id)"
                @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
                  @touchstart.passive="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                  @touchend="handleLongPressEnd"
                  @touchcancel="handleLongPressEnd"
              >
                <div class="card-media-wrap">
                  <v-img :src="event.image" height="220" cover class="card-media">
                    <template #placeholder>
                      <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                        <v-icon size="50">mdi-image</v-icon>
                      </div>
                    </template>
                  </v-img>

                  <div class="media-overlay-top">
                    <v-chip
                      size="small"
                      variant="flat"
                      color="error"
                      class="card-badge"
                    >
                      <v-icon start size="14">mdi-ticket-off-outline</v-icon>
                      Sold Out
                    </v-chip>
                  </div>

                  <div class="card-media-overlay">
                    <div class="card-media-overlay-content">
                      <span class="card-media-overlay-label">View Event</span>
                      <v-icon size="18" class="card-media-overlay-icon">mdi-arrow-top-right</v-icon>
                    </div>
                  </div>
                </div>

                <v-card-title class="card-title clamp-2">{{ event.title }}</v-card-title>

                <div class="px-4 pb-2">
                  <div class="meta-row">
                    <v-icon size="16" class="me-2">mdi-calendar-clock-outline</v-icon>
                    <span>{{ event.date }}</span>
                  </div>
                  <div class="meta-row">
                    <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                    <span>{{ event.city }}</span>
                  </div>
                </div>

                <v-card-actions class="pa-4 pt-2">
                  <v-btn
                    class="w-100 sold-out-btn"
                    rounded="xl"
                    disabled
                    @click.stop
                  >
                    <v-icon start>mdi-close-circle-outline</v-icon>
                    Sold Out
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-expand-transition>
            <div v-show="showMoreSoldOut">
              <v-row class="mt-0">
                <v-col
                  v-for="(event, index) in soldOutEventsExtra"
                  :key="event.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                  class="stagger-col stagger-col-delayed"
                  :style="getStaggerStyle(index + 4)"
                >
                  <v-card
                    class="content-card event-card sold-out-card"
                    rounded="xl"
                    elevation="0"
                    style="cursor: pointer;"
                    @click="openEvent(event.id)"
                    @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
                  @touchstart.passive="handleLongPressStart($event, '/o_eventinfo', event.title || 'Event details', { id: event.id })"
                  @touchend="handleLongPressEnd"
                  @touchcancel="handleLongPressEnd"
                  >
                    <div class="card-media-wrap">
                      <v-img :src="event.image" height="220" cover class="card-media">
                        <template #placeholder>
                          <div class="w-100 h-100 d-flex align-center justify-center bg-grey-lighten-3">
                            <v-icon size="50">mdi-image</v-icon>
                          </div>
                        </template>
                      </v-img>

                      <div class="media-overlay-top">
                        <v-chip
                          size="small"
                          variant="flat"
                          color="error"
                          class="card-badge"
                        >
                          <v-icon start size="14">mdi-ticket-off-outline</v-icon>
                          Sold Out
                        </v-chip>
                      </div>

                      <div class="card-media-overlay">
                        <div class="card-media-overlay-content">
                          <span class="card-media-overlay-label">View Event</span>
                          <v-icon size="18" class="card-media-overlay-icon">mdi-arrow-top-right</v-icon>
                        </div>
                      </div>
                    </div>

                    <v-card-title class="card-title clamp-2">{{ event.title }}</v-card-title>

                    <div class="px-4 pb-2">
                      <div class="meta-row">
                        <v-icon size="16" class="me-2">mdi-calendar-clock-outline</v-icon>
                        <span>{{ event.date }}</span>
                      </div>
                      <div class="meta-row">
                        <v-icon size="16" class="me-2">mdi-map-marker-outline</v-icon>
                        <span>{{ event.city }}</span>
                      </div>
                    </div>

                    <v-card-actions class="pa-4 pt-2">
                      <v-btn
                        class="w-100 sold-out-btn"
                        rounded="xl"
                        disabled
                        @click.stop
                      >
                        <v-icon start>mdi-close-circle-outline</v-icon>
                        Sold Out
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </section>
      </v-container>
    </v-main>

    <!-- Link Context Menu -->
    <v-menu
      v-model="linkContextMenu.show"
      :target="[linkContextMenu.x, linkContextMenu.y]"
      location="top left"
      absolute
      :close-on-content-click="true"
      transition="scale-transition"
      :class="[`context-menu-shell`, `theme-${currentTheme}`]"
    >
      <v-list min-width="240" rounded="xl" :class="['context-menu-list', `theme-${currentTheme}`]">
        <v-list-subheader>{{ linkContextMenu.label || "Open" }}</v-list-subheader>

        <v-list-item
          title="Open in new tab"
          prepend-icon="mdi-open-in-new"
          rounded="lg"
          @click="openContextMenuTargetInNewTab"
        />
        <v-list-item
          title="Open in new window"
          prepend-icon="mdi-open-in-app"
          rounded="lg"
          @click="openContextMenuTargetInNewWindow"
        />
      </v-list>
    </v-menu>
  </v-app>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import { get_All_Events } from "@/dataModel/event"
import { get_All_Venues } from "@/dataModel/venue"
import { get_Current_User } from "@/dataModel/user"
import { get_All_Reservations } from "@/dataModel/reservation"

const router = useRouter()
const theme = useTheme()

const events = get_All_Events()
const venues = get_All_Venues()
const reservations = get_All_Reservations()

const PREVIEW_COUNT = 4

const showMoreRecommended = ref(false)
const showMoreVenues = ref(false)
const showMoreLastCall = ref(false)
const showMoreSoldOut = ref(false)

const linkContextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  href: "",
  label: "",
})

const THEME_STORAGE_KEY = "blassti-theme"
const MOBILE_BREAKPOINT = 960
const LONG_PRESS_DURATION = 520

const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1280)
const isMobile = computed(() => windowWidth.value <= MOBILE_BREAKPOINT)
const currentTheme = computed(() => {
  return theme?.global?.name?.value === "light" ? "light" : "dark"
})

let longPressTimer = null

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"

  if (theme?.global?.name) {
    theme.global.name.value = normalizedTheme
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

function syncThemeFromStorage() {
  if (typeof window === "undefined") return
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === "light" || savedTheme === "dark") {
    applyThemeChoice(savedTheme)
    return
  }

  applyThemeChoice("dark")
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    syncThemeFromStorage()
  }
}

function updateWindowWidth() {
  if (typeof window === "undefined") return
  windowWidth.value = window.innerWidth
}

function extractTouchPoint(event) {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0]

  if (!touch) {
    return {
      clientX: 24,
      clientY: 24,
    }
  }

  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
  }
}

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function handleLongPressStart(event, path, label, query = undefined) {
  if (!isMobile.value) return

  clearLongPressTimer()

  const touchPoint = extractTouchPoint(event)

  longPressTimer = window.setTimeout(() => {
    openRouteContextMenu(
      {
        clientX: touchPoint.clientX,
        clientY: touchPoint.clientY,
      },
      path,
      label,
      query
    )
  }, LONG_PRESS_DURATION)
}

function handleLongPressEnd() {
  clearLongPressTimer()
}

onMounted(() => {
  loadSavedTheme()

  if (typeof window !== "undefined") {
    updateWindowWidth()
    window.addEventListener("storage", handleWindowStorage)
    window.addEventListener("focus", syncThemeFromStorage)
    window.addEventListener("resize", updateWindowWidth)
  }
})

onBeforeUnmount(() => {
  clearLongPressTimer()

  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleWindowStorage)
    window.removeEventListener("focus", syncThemeFromStorage)
    window.removeEventListener("resize", updateWindowWidth)
  }
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

function openEventContextMenu(event, eventId, title = "Event") {
  openRouteContextMenu(event, "/o_eventinfo", title || "Event details", { id: eventId })
}

function openVenueContextMenu(event, venueId, title = "Venue") {
  openRouteContextMenu(event, "/o_venueinfo", title || "Venue details", { id: venueId })
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

const currentUser = computed(() => get_Current_User())

const currentUserName = computed(() => {
  return currentUser.value?.first_name || "Guest"
})

const currentUserReservations = computed(() => {
  if (!currentUser.value?.id) return []

  return reservations.filter(reservation =>
    reservation.user_id === currentUser.value.id
  )
})

const bookedEventIds = computed(() => {
  return new Set(currentUserReservations.value.map(reservation => reservation.event_id))
})

const bookedEvents = computed(() => {
  return events.filter(event => bookedEventIds.value.has(event.id))
})

const bookedCities = computed(() => {
  return new Set(
    bookedEvents.value
      .map(event => (event.city || "").toLowerCase())
      .filter(Boolean)
  )
})

const bookedVenues = computed(() => {
  return new Set(
    bookedEvents.value
      .map(event => (event.venue || "").toLowerCase())
      .filter(Boolean)
  )
})

const availableEvents = computed(() => {
  return events.filter(event => {
    const capacity = Number(event.capacity ?? 0)
    const sold = Number(event.tickets_sold ?? 0)

    if (!capacity) return true
    return sold < capacity
  })
})

const recommendedEvents = computed(() => {
  if (!currentUser.value?.id) return []

  const userCity = (currentUser.value.city || "").toLowerCase()
  const userState = (currentUser.value.state || "").toLowerCase()

  return availableEvents.value
    .filter(event => !bookedEventIds.value.has(event.id))
    .map(event => {
      let score = 0

      const eventCity = (event.city || "").toLowerCase()
      const eventVenue = (event.venue || "").toLowerCase()

      if (event.featured) score += 4
      if (event.last_call) score += 1

      if (userCity && eventCity === userCity) score += 5
      if (userState && eventCity === userState) score += 2

      if (bookedCities.value.has(eventCity)) score += 4
      if (bookedVenues.value.has(eventVenue)) score += 3

      return {
        ...event,
        recommendation_score: score
      }
    })
    .filter(event => event.recommendation_score > 0)
    .sort((a, b) => {
      if (b.recommendation_score !== a.recommendation_score) {
        return b.recommendation_score - a.recommendation_score
      }

      if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }

      return 0
    })
})

const featuredVenues = computed(() => {
  return venues.filter(venue => venue.featured)
})

const lastCallEvents = computed(() => {
  return events.filter(event => {
    const capacity = Number(event.capacity ?? 0)
    const sold = Number(event.tickets_sold ?? 0)
    return event.last_call && (!capacity || sold < capacity)
  })
})

const soldOutEvents = computed(() => {
  return events.filter(event => {
    const capacity = Number(event.capacity ?? 0)
    const sold = Number(event.tickets_sold ?? 0)
    return capacity > 0 && sold >= capacity
  })
})

const recommendedPreview = computed(() => {
  return recommendedEvents.value.slice(0, PREVIEW_COUNT)
})

const recommendedExtra = computed(() => {
  return recommendedEvents.value.slice(PREVIEW_COUNT)
})

const featuredVenuesPreview = computed(() => {
  return featuredVenues.value.slice(0, PREVIEW_COUNT)
})

const featuredVenuesExtra = computed(() => {
  return featuredVenues.value.slice(PREVIEW_COUNT)
})

const lastCallEventsPreview = computed(() => {
  return lastCallEvents.value.slice(0, PREVIEW_COUNT)
})

const lastCallEventsExtra = computed(() => {
  return lastCallEvents.value.slice(PREVIEW_COUNT)
})

const soldOutEventsPreview = computed(() => {
  return soldOutEvents.value.slice(0, PREVIEW_COUNT)
})

const soldOutEventsExtra = computed(() => {
  return soldOutEvents.value.slice(PREVIEW_COUNT)
})

function getStaggerStyle(index) {
  return {
    animationDelay: `${index * 70}ms`
  }
}

function openEvent(eventId) {
  router.push({
    path: "/o_eventinfo",
    query: { id: eventId }
  })
}

function openVenue(venueId) {
  router.push({
    path: "/o_venueinfo",
    query: { id: venueId }
  })
}
</script>

<style scoped>
.mainpage-root {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(var(--v-theme-secondary), 0.08), transparent 24%),
    linear-gradient(180deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 1) 100%);
}

.mainpage-container {
  position: relative;
  padding-top: 28px;
  padding-bottom: 56px;
  max-width: 1480px !important;
}

.page-top-glow {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.12);
  filter: blur(80px);
  pointer-events: none;
}

.page-top-glow-secondary {
  top: 140px;
  right: auto;
  left: -140px;
  width: 300px;
  height: 300px;
  background: rgba(var(--v-theme-secondary), 0.10);
  filter: blur(90px);
}

.hero-section {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.hero-section--blended {
  border: 1px solid rgba(var(--v-border-color), 0.05);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.22), rgba(var(--v-theme-surface), 0.08)),
    rgba(var(--v-theme-surface), 0.10);
  backdrop-filter: blur(4px);
  box-shadow: none;
}

.hero-accent {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(42px);
  opacity: 0.3;
}

.hero-accent-primary {
  top: -22px;
  right: 8%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.22) 0%, rgba(var(--v-theme-primary), 0) 72%);
}

.hero-accent-secondary {
  bottom: -50px;
  left: 12%;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(var(--v-theme-secondary), 0.18) 0%, rgba(var(--v-theme-secondary), 0) 72%);
}

.hero-section-minimal {
  padding: 28px 32px;
  min-height: unset;
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 100%;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}

.hero-subtitle {
  margin: 12px 0 0;
  font-size: 1.02rem;
  max-width: 720px;
  line-height: 1.65;
}

.section-divider {
  opacity: 0.65;
}

.section-shell {
  position: relative;
}

.section-shell::before {
  content: "";
  position: absolute;
  top: -14px;
  left: 0;
  width: 92px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.95), rgba(var(--v-theme-secondary), 0.7));
  opacity: 0.95;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.section-kicker {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 8px;
}

.section-title {
  margin: 0;
  font-size: clamp(1.45rem, 2vw, 2rem);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.section-subtitle {
  max-width: 720px;
}

.section-actions {
  display: flex;
  align-items: center;
}

.section-toggle-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
  padding-inline: 12px;
  min-height: 40px;
  transition: transform 0.22s ease, background-color 0.22s ease;
}

.section-toggle-btn:hover {
  transform: translateY(-1px);
  background: rgba(var(--v-theme-primary), 0.08);
}

.state-card {
  border: 1px solid rgba(var(--v-border-color), 0.16);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.98), rgba(var(--v-theme-surface), 0.92));
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.state-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 42px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.20);
}

.state-card-dashed {
  border-style: dashed;
}

.state-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.10);
  color: rgb(var(--v-theme-primary));
}

.state-text {
  max-width: 560px;
}

.state-action-btn {
  min-width: 150px;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
}

.content-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-surface), 0.96));
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease,
    background 0.28s ease;
}

.content-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 35%, rgba(var(--v-theme-primary), 0.03));
  opacity: 0;
  transition: opacity 0.28s ease;
  pointer-events: none;
  z-index: 0;
}

.content-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 26px 48px rgba(0, 0, 0, 0.14);
  border-color: rgba(var(--v-theme-primary), 0.24);
}

.content-card:hover::before {
  opacity: 1;
}

.card-media-wrap {
  position: relative;
  overflow: hidden;
}

.card-media {
  transition: transform 0.6s ease, filter 0.35s ease;
}

.content-card:hover .card-media {
  transform: scale(1.08);
  filter: saturate(1.04);
}

.media-overlay-top {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
  z-index: 2;
}

.card-media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 16px;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.08) 42%, rgba(0, 0, 0, 0.52) 100%);
  opacity: 0;
  transition: opacity 0.26s ease;
  pointer-events: none;
  z-index: 1;
}

.card-media-overlay-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  color: white;
  transform: translateY(8px);
  transition: transform 0.28s ease, background 0.28s ease;
}

.card-media-overlay-label {
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.card-media-overlay-icon {
  transition: transform 0.24s ease;
}

.content-card:hover .card-media-overlay {
  opacity: 1;
}

.content-card:hover .card-media-overlay-content {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.14);
}

.content-card:hover .card-media-overlay-icon {
  transform: translate(2px, -2px);
}

.card-badge {
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  font-weight: 700;
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.content-card:hover .card-badge {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}

.card-title {
  position: relative;
  z-index: 1;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.3;
  padding-bottom: 10px;
  transition: color 0.24s ease;
}

.content-card:hover .card-title {
  color: rgb(var(--v-theme-primary));
}

.meta-row {
  display: flex;
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 0.94rem;
  line-height: 1.4;
  margin-bottom: 8px;
  gap: 2px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.card-action-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 42px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
}

.content-card:hover .card-action-btn {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.14);
  filter: brightness(1.03);
}

.sold-out-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 42px;
  opacity: 0.95;
}

.event-card::after,
.venue-card::after,
.last-call-card::after,
.sold-out-card::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.event-card::after {
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 1), rgba(var(--v-theme-secondary), 1));
}

.venue-card::after {
  background: linear-gradient(90deg, rgba(var(--v-theme-secondary), 1), rgba(var(--v-theme-primary), 0.8));
}

.last-call-card::after {
  background: linear-gradient(90deg, rgba(var(--v-theme-warning), 1), rgba(var(--v-theme-primary), 0.75));
}

.sold-out-card::after {
  background: linear-gradient(90deg, rgba(var(--v-theme-error), 1), rgba(var(--v-theme-primary), 0.5));
}

.content-card:hover::after {
  opacity: 1;
}

.sold-out-card {
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.98), rgba(var(--v-theme-surface), 0.92));
}

.sold-out-card .card-media {
  filter: saturate(0.88);
}

.last-call-card:hover {
  border-color: rgba(var(--v-theme-warning), 0.4);
}

.venue-card:hover {
  border-color: rgba(var(--v-theme-secondary), 0.28);
}

.stagger-col {
  animation: cardEnter 0.55s ease both;
}

.stagger-col-delayed {
  animation-duration: 0.62s;
}

.context-menu-list {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
}

.clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1264px) {
  .hero-section-minimal {
    padding: 24px 28px;
  }
}


@media (max-width: 960px) {
  .mainpage-container {
    padding-inline: 18px !important;
  }

  .section-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .section-toggle-btn {
    min-height: 42px;
  }

  .card-action-btn,
  .sold-out-btn,
  .state-action-btn {
    min-height: 46px;
  }
}

@media (max-width: 600px) {
  .mainpage-container {
    padding-inline: 14px !important;
  }

  .hero-copy {
    text-align: left;
  }

  .hero-title {
    font-size: clamp(1.8rem, 8vw, 2.4rem);
  }

  .hero-subtitle {
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .section-header {
    gap: 12px;
  }

  .section-actions {
    width: 100%;
  }

  .section-toggle-btn {
    width: 100%;
    justify-content: center;
  }

  .meta-row {
    font-size: 0.9rem;
    align-items: flex-start;
  }

  .card-title {
    font-size: 1rem;
  }

  .context-menu-list :deep(.v-list-item) {
    min-height: 48px;
  }
}

@media (max-width: 960px) {
  .section-header {
    align-items: flex-start;
  }

  .section-shell::before {
    width: 74px;
  }

  .hero-accent-primary {
    right: -24px;
  }
}

@media (max-width: 600px) {
  .mainpage-container {
    padding-top: 18px;
    padding-bottom: 40px;
  }

  .hero-section {
    border-radius: 22px;
  }

  .hero-section-minimal {
    padding: 20px;
  }

  .hero-accent-primary,
  .hero-accent-secondary {
    opacity: 0.72;
  }

  .section-title {
    font-size: 1.35rem;
  }

  .card-media-overlay {
    opacity: 1;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.01) 0%, rgba(0, 0, 0, 0.06) 46%, rgba(0, 0, 0, 0.40) 100%);
  }

  .card-media-overlay-content {
    transform: translateY(0);
    padding: 7px 10px;
  }

  .content-card:hover .card-media {
    transform: scale(1.04);
  }
}

.mainpage-app {
  min-height: 100vh;
}

.mainpage-app.theme-light .mainpage-root {
  color: rgba(var(--v-theme-on-surface), 0.96);
}

.mainpage-app.theme-dark .mainpage-root {
  color: rgba(var(--v-theme-on-surface), 0.98);
}

.context-menu-list.theme-light {
  background: rgba(var(--v-theme-surface), 0.98);
  border-color: rgba(var(--v-border-color), 0.14);
}

.context-menu-list.theme-dark {
  background: rgba(var(--v-theme-surface), 0.98);
  border-color: rgba(var(--v-border-color), 0.18);
}

.context-menu-list :deep(.v-list-subheader) {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.context-menu-list :deep(.v-list-item) {
  min-height: 44px;
}

@media (hover: none) and (pointer: coarse) {
  .content-card .card-media-overlay {
    opacity: 1;
  }

  .content-card .card-media-overlay-content {
    transform: translateY(0);
  }
}

</style>