<template>
  <v-app>
    <AppNavbar />

    <v-main class="mainpage-root">
      <v-container class="mainpage-container">
        <div class="page-top-glow"></div>

        <section class="hero-section hero-section-minimal mb-8">
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
                v-for="event in recommendedPreview"
                :key="event.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="content-card event-card"
                  rounded="xl"
                  elevation="0"
                  style="cursor: pointer;"
                  @click="openEvent(event.id)"
                  @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
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
                    v-for="event in recommendedExtra"
                    :key="event.id"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-card
                      class="content-card event-card"
                      rounded="xl"
                      elevation="0"
                      style="cursor: pointer;"
                      @click="openEvent(event.id)"
                      @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
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
              v-for="venue in featuredVenuesPreview"
              :key="venue.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="content-card venue-card"
                rounded="xl"
                elevation="0"
                style="cursor: pointer;"
                @click="openVenue(venue.id)"
                @contextmenu.prevent="openVenueContextMenu($event, venue.id, venue.title)"
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
                  v-for="venue in featuredVenuesExtra"
                  :key="venue.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    class="content-card venue-card"
                    rounded="xl"
                    elevation="0"
                    style="cursor: pointer;"
                    @click="openVenue(venue.id)"
                    @contextmenu.prevent="openVenueContextMenu($event, venue.id, venue.title)"
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
              v-for="event in lastCallEventsPreview"
              :key="event.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="content-card event-card last-call-card"
                rounded="xl"
                elevation="0"
                style="cursor: pointer;"
                @click="openEvent(event.id)"
                @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
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
                  v-for="event in lastCallEventsExtra"
                  :key="event.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    class="content-card event-card last-call-card"
                    rounded="xl"
                    elevation="0"
                    style="cursor: pointer;"
                    @click="openEvent(event.id)"
                    @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
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
              v-for="event in soldOutEventsPreview"
              :key="event.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="content-card event-card sold-out-card"
                rounded="xl"
                elevation="0"
                style="cursor: pointer;"
                @click="openEvent(event.id)"
                @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
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
                  v-for="event in soldOutEventsExtra"
                  :key="event.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    class="content-card event-card sold-out-card"
                    rounded="xl"
                    elevation="0"
                    style="cursor: pointer;"
                    @click="openEvent(event.id)"
                    @contextmenu.prevent="openEventContextMenu($event, event.id, event.title)"
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
      class="context-menu-shell"
    >
      <v-list min-width="240" rounded="xl" class="context-menu-list">
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

const prefersDarkMode = ref(false)
let darkModeMediaQuery = null

function applyBrowserThemePreference(isDark) {
  prefersDarkMode.value = isDark

  if (theme?.global?.name) {
    theme.global.name.value = isDark ? "dark" : "light"
  }
}

function handleBrowserThemeChange(event) {
  applyBrowserThemePreference(event.matches)
}

onMounted(() => {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    applyBrowserThemePreference(darkModeMediaQuery.matches)

    if (typeof darkModeMediaQuery.addEventListener === "function") {
      darkModeMediaQuery.addEventListener("change", handleBrowserThemeChange)
    } else if (typeof darkModeMediaQuery.addListener === "function") {
      darkModeMediaQuery.addListener(handleBrowserThemeChange)
    }
  }
})

onBeforeUnmount(() => {
  if (!darkModeMediaQuery) return

  if (typeof darkModeMediaQuery.removeEventListener === "function") {
    darkModeMediaQuery.removeEventListener("change", handleBrowserThemeChange)
  } else if (typeof darkModeMediaQuery.removeListener === "function") {
    darkModeMediaQuery.removeListener(handleBrowserThemeChange)
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

.hero-section {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-surface), 0.96)),
    rgba(var(--v-theme-surface), 0.96);
  backdrop-filter: blur(12px);
  border-radius: 28px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.hero-section-minimal {
  padding: 28px 32px;
  min-height: unset;
}

.hero-copy {
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
}

.section-divider {
  opacity: 0.65;
}

.section-shell {
  position: relative;
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
}

.state-card {
  border: 1px solid rgba(var(--v-border-color), 0.16);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.98), rgba(var(--v-theme-surface), 0.92));
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
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
    border-color 0.28s ease;
}

.content-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 44px rgba(0, 0, 0, 0.14);
  border-color: rgba(var(--v-theme-primary), 0.24);
}

.card-media-wrap {
  position: relative;
  overflow: hidden;
}

.card-media {
  transition: transform 0.5s ease;
}

.content-card:hover .card-media {
  transform: scale(1.03);
}

.media-overlay-top {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
}

.card-badge {
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  font-weight: 700;
}

.card-title {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.3;
  padding-bottom: 10px;
}

.meta-row {
  display: flex;
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 0.94rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.card-action-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 42px;
}

.sold-out-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 42px;
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

@media (max-width: 1264px) {
  .hero-section-minimal {
    padding: 24px 28px;
  }
}

@media (max-width: 960px) {
  .section-header {
    align-items: flex-start;
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

  .section-title {
    font-size: 1.35rem;
  }
}
</style>