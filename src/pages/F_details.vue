<template>
  <v-app :theme="currentThemeName" class="profile-page-app" :class="[`theme-${currentThemeName}`, { 'is-mobile': isMobile, 'is-phone': isPhone, 'is-tablet': isTablet }]">
    <AppNavbar />

    <v-main>
      <v-container class="profile-page-shell" :class="{ 'shell-mobile': isPhone, 'shell-tablet': isTablet }">
        <v-fade-transition appear>
          <div>
            <!-- HEADER -->
            <v-sheet
              class="profile-hero profile-hero-spacing"
              rounded="xl"
              elevation="0"
            >
              <v-row align="center" class="ga-0 profile-hero-row">
                <v-col cols="12" md="2" class="d-flex justify-center justify-md-start mb-4 mb-md-0 profile-avatar-column">
                  <div class="avatar-shell">
                    <v-avatar size="128" color="grey-lighten-3" class="profile-avatar">
                      <v-img
                        v-if="viewedUser?.profile_picture"
                        :src="viewedUser.profile_picture"
                        cover
                      />
                      <v-icon v-else size="62">mdi-account</v-icon>
                    </v-avatar>
                  </div>
                </v-col>

                <v-col cols="12" md="7" class="profile-main-column">
                  <div class="d-flex flex-wrap align-center ga-2 mb-2">
                    <div class="text-h5 text-md-h4 font-weight-bold profile-name">
                      {{ displayedFullName }}
                    </div>

                    <v-chip
                      v-if="viewedUser?.is_admin"
                      color="deep-purple"
                      variant="flat"
                      size="small"
                      class="font-weight-medium"
                    >
                      Admin
                    </v-chip>

                    <v-chip
                      v-else-if="viewedUser?.is_moderator"
                      color="indigo"
                      variant="flat"
                      size="small"
                      class="font-weight-medium"
                    >
                      Moderator
                    </v-chip>

                    <v-chip
                      v-if="viewedUser?.suspension?.is_active"
                      color="error"
                      variant="flat"
                      size="small"
                      class="font-weight-medium"
                    >
                      Suspended
                    </v-chip>
                  </div>

                  <div class="text-body-2 text-medium-emphasis mb-2 d-flex align-center ga-2 flex-wrap">
                    <v-icon size="16" icon="mdi-account-heart-outline" />
                    <span>{{ viewedUser?.subscribers_count || 0 }} subscribers</span>
                  </div>

                  <div class="text-body-1 font-weight-medium mb-3">
                    {{ viewedUser?.is_artist ? viewedUser.artist_type : "User" }}
                  </div>

                  <div
                    v-if="viewedUser?.suspension?.is_active"
                    class="text-caption text-error d-flex align-center ga-2 suspension-inline"
                  >
                    <v-icon size="16" icon="mdi-alert-circle-outline" />
                    <span>Suspended until {{ suspensionUntilText }}</span>
                  </div>

                  <div class="d-flex flex-wrap ga-3 mt-4 profile-quick-stats">
                    <v-sheet rounded="lg" class="mini-stat px-4 py-3" variant="tonal" color="primary">
                      <div class="text-caption text-medium-emphasis">Role</div>
                      <div class="text-body-2 font-weight-bold">
                        {{
                          viewedUser?.is_admin
                            ? "Administrator"
                            : viewedUser?.is_moderator
                              ? "Moderator"
                              : viewedUser?.is_artist
                                ? viewedUser.artist_type || "Artist"
                                : "User"
                        }}
                      </div>
                    </v-sheet>

                    <v-sheet rounded="lg" class="mini-stat px-4 py-3" variant="tonal" color="secondary">
                      <div class="text-caption text-medium-emphasis">Profile type</div>
                      <div class="text-body-2 font-weight-bold">
                        {{ viewedUser?.is_artist ? "Artist Profile" : "Standard Profile" }}
                      </div>
                    </v-sheet>
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                  class="d-flex justify-end align-center flex-wrap action-column mt-4 mt-md-0 action-column-shell"
                >
                  <template v-if="isOwnProfile">
                    <v-btn
                      color="primary"
                      variant="flat"
                      rounded="lg"
                      class="mr-2 mb-2 text-none action-btn touch-btn"
                      prepend-icon="mdi-cog-outline"
                      @click="goToSettings"
                    >
                      Profile Settings
                    </v-btn>
                  </template>

                  <template v-else>
                    <v-btn
                      v-if="viewedUser?.is_artist && !isSubscribed"
                      color="primary"
                      variant="outlined"
                      rounded="lg"
                      class="mr-2 mb-2 text-none action-btn touch-btn"
                      prepend-icon="mdi-bell-plus-outline"
                      @click="subscribe"
                    >
                      Subscribe
                    </v-btn>

                    <template v-else-if="viewedUser?.is_artist && isSubscribed">
                      <v-btn
                        variant="flat"
                        color="success"
                        rounded="lg"
                        class="mr-2 mb-2 text-none action-btn touch-btn"
                        prepend-icon="mdi-check-circle-outline"
                        @click="subscribedNoticeDialog = true"
                      >
                        Subscribed
                      </v-btn>

                      <v-btn
                        variant="text"
                        color="error"
                        class="mr-2 mb-2 text-none action-btn touch-btn"
                        prepend-icon="mdi-bell-remove-outline"
                        @click="unsubscribeDialog = true"
                      >
                        Unsubscribe
                      </v-btn>
                    </template>
                  </template>

                  <!-- Moderator delete -->
                  <v-btn
                    v-if="canDeleteAccount"
                    color="error"
                    variant="outlined"
                    rounded="lg"
                    class="mr-2 mb-2 text-none action-btn touch-btn"
                    prepend-icon="mdi-delete-outline"
                    @click="deleteAccountDialog = true"
                  >
                    Delete Account
                  </v-btn>

                  <!-- Admin moderator controls -->
                  <v-btn
                    v-if="canToggleModerator"
                    color="indigo"
                    variant="outlined"
                    rounded="lg"
                    class="mr-2 mb-2 text-none action-btn touch-btn"
                    :prepend-icon="viewedUser?.is_moderator ? 'mdi-shield-off-outline' : 'mdi-shield-account-outline'"
                    @click="moderatorToggleDialog = true"
                  >
                    {{ viewedUser?.is_moderator ? "Remove Moderator" : "Make Moderator" }}
                  </v-btn>

                  <!-- Moderator/Admin suspension -->
                  <v-btn
                    v-if="canSuspend"
                    color="warning"
                    variant="outlined"
                    rounded="lg"
                    class="mr-2 mb-2 text-none action-btn touch-btn"
                    prepend-icon="mdi-account-cancel-outline"
                    @click="suspendDialog = true"
                  >
                    Suspend
                  </v-btn>

                  <v-btn
                    v-if="canUnsuspend"
                    color="success"
                    variant="outlined"
                    rounded="lg"
                    class="mr-2 mb-2 text-none action-btn touch-btn"
                    prepend-icon="mdi-account-check-outline"
                    @click="unsuspendViewedUser"
                  >
                    Remove Suspension
                  </v-btn>

                  <v-menu :location="isMobile ? 'bottom' : 'bottom end'" transition="scale-transition">
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        v-bind="props"
                        class="mb-2 dots-btn touch-icon-btn"
                        variant="tonal"
                      >
                        <v-icon>mdi-dots-horizontal</v-icon>
                      </v-btn>
                    </template>
                    <v-list rounded="lg" class="menu-list">
                      <v-list-item
                        title="Share"
                        prepend-icon="mdi-share-variant-outline"
                        @click="shareProfileDialog = true"
                      />
                      <v-list-item
                        v-if="canReport"
                        title="Report"
                        prepend-icon="mdi-flag-outline"
                        @click="openReportDialog"
                      />
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>
            </v-sheet>
          </div>
        </v-fade-transition>

        <v-divider class="my-6 section-divider" />

        <!-- TABS -->
        <v-row align="center" justify="center" class="tabs-row">
          <v-col cols="12" md="8" class="d-flex justify-center">
            <v-sheet rounded="pill" class="tabs-shell pa-1 w-100" :class="{ 'tabs-shell-mobile': isPhone }">
              <div v-if="isPhone" class="tabs-mobile-hint px-2 pt-1 pb-2 text-caption text-medium-emphasis d-flex align-center ga-2">
                <v-icon size="14" icon="mdi-gesture-swipe-horizontal" />
                <span>Swipe to switch sections</span>
              </div>
              <v-tabs
                v-model="tab"
                color="primary"
                :align-tabs="isPhone ? 'start' : 'center'"
                class="profile-tabs"
                slider-color="primary"
                direction="horizontal"
                show-arrows
              >
                <v-tab value="upcoming" class="text-none">
                  <v-icon start size="18">mdi-calendar-clock-outline</v-icon>
                  Upcoming
                </v-tab>
                <v-tab value="past" class="text-none">
                  <v-icon start size="18">mdi-history</v-icon>
                  Past Events
                </v-tab>
                <v-tab value="details" class="text-none">
                  <v-icon start size="18">mdi-card-account-details-outline</v-icon>
                  Details
                </v-tab>
              </v-tabs>
            </v-sheet>
          </v-col>
        </v-row>

        <!-- CONTENT -->
        <v-row class="mt-6 mt-md-8 content-grid">
          <!-- LEFT -->
          <v-col cols="12" md="8">
            <div v-if="!viewedUser">
              <v-alert
                type="error"
                variant="tonal"
                border="start"
                rounded="xl"
                class="soft-alert"
              >
                User not found.
              </v-alert>
            </div>

            <div v-else-if="tab === 'details'">
              <v-card rounded="xl" elevation="0" class="content-card details-card">
                <v-card-text class="pa-4 pa-md-6">
                  <div class="d-flex flex-wrap align-center ga-2 mb-2">
                    <div class="text-h6 font-weight-bold">{{ displayedFullName }}</div>

                    <v-chip
                      v-if="viewedUser?.is_admin"
                      color="deep-purple"
                      variant="flat"
                      size="small"
                    >
                      Admin
                    </v-chip>

                    <v-chip
                      v-else-if="viewedUser?.is_moderator"
                      color="indigo"
                      variant="flat"
                      size="small"
                    >
                      Moderator
                    </v-chip>
                  </div>

                  <div class="section-title d-flex align-center ga-2 mb-3">
                    <v-icon size="20" icon="mdi-text-box-outline" />
                    <span>Description</span>
                  </div>

                  <v-sheet variant="outlined" rounded="xl" class="pa-4 pa-md-5 mb-6 details-surface">
                    <div class="text-body-1 profile-description">
                      {{ viewedUser.description || "No description available." }}
                    </div>
                  </v-sheet>

                  <div v-if="viewedUser?.suspension?.is_active" class="mb-6">
                    <div class="section-title d-flex align-center ga-2 mb-3">
                      <v-icon size="20" icon="mdi-alert-octagon-outline" />
                      <span>Account Status</span>
                    </div>

                    <v-sheet variant="outlined" rounded="xl" class="pa-4 pa-md-5 status-sheet">
                      <div class="d-flex align-center ga-2 font-weight-bold text-error mb-3">
                        <v-icon icon="mdi-alert-circle" />
                        <span>Suspended</span>
                      </div>
                      <div class="mb-2">
                        <strong>Reason:</strong> {{ suspensionReasonText }}
                      </div>
                      <div>
                        <strong>Until:</strong> {{ suspensionUntilText }}
                      </div>
                    </v-sheet>
                  </div>

                  <div class="section-title d-flex align-center ga-2 mb-3">
                    <v-icon size="20" icon="mdi-card-account-phone-outline" />
                    <span>Contact Info</span>
                  </div>

                  <v-sheet variant="outlined" rounded="xl" class="pa-2 pa-md-3 details-surface">
                    <v-list density="comfortable" bg-color="transparent" class="contact-list">
                      <template v-if="contactEntries.length > 0">
                        <v-list-item
                          v-for="([key, value], index) in contactEntries"
                          :key="`${key}-${index}`"
                          :prepend-icon="icons[key] || 'mdi-card-account-details-outline'"
                          :title="value"
                          rounded="lg"
                          class="contact-item"
                        />
                      </template>

                      <v-list-item
                        v-else
                        prepend-icon="mdi-information-outline"
                        title="No contact information available"
                        rounded="lg"
                        class="contact-item"
                      />
                    </v-list>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </div>

            <div v-else>
              <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ tab === "upcoming" ? "Upcoming Performances" : "Past Performances" }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{
                      tab === "upcoming"
                        ? "See the artist's scheduled and upcoming events."
                        : "Browse previously completed events."
                    }}
                  </div>
                </div>

                <v-chip
                  variant="tonal"
                  color="primary"
                  rounded="pill"
                  class="font-weight-medium"
                >
                  {{ filteredEvents.length }}
                  {{ filteredEvents.length === 1 ? "event" : "events" }}
                </v-chip>
              </div>

              <template v-if="isPhone && filteredEvents.length > 0">
                <div class="mobile-events-shell mb-2">
                  <div class="mobile-events-track">
                    <v-card
                      v-for="event in filteredEvents"
                      :key="event.id"
                      class="mobile-event-card interactive-card event-card-clickable"
                      rounded="xl"
                      elevation="0"
                      variant="outlined"
                      role="link"
                      tabindex="0"
                      @click="openEvent(event)"
                      @keydown.enter.prevent="openEvent(event)"
                      @keydown.space.prevent="openEvent(event)"
                    >
                      <v-img
                        :src="event.image"
                        height="210"
                        cover
                        class="event-image"
                        gradient="to top, rgba(0,0,0,.45), rgba(0,0,0,.05)"
                      />

                      <v-card-text class="pa-4">
                        <div class="d-flex justify-space-between align-start ga-3 mb-2">
                          <div class="text-h6 font-weight-bold event-title mobile-event-title">
                            {{ event.title }}
                          </div>

                          <v-chip
                            v-if="event.tickets_sold >= event.capacity"
                            size="small"
                            color="error"
                            variant="flat"
                            rounded="pill"
                            class="flex-shrink-0"
                          >
                            Sold out
                          </v-chip>
                        </div>

                        <div class="mobile-event-meta-grid mb-3">
                          <div class="mobile-meta-pill">
                            <v-icon size="16" icon="mdi-calendar-month-outline" />
                            <span>{{ event.date }}</span>
                          </div>
                          <div class="mobile-meta-pill">
                            <v-icon size="16" icon="mdi-clock-outline" />
                            <span>{{ event.time }}</span>
                          </div>
                          <div class="mobile-meta-pill mobile-meta-pill-wide">
                            <v-icon size="16" icon="mdi-map-marker-outline" />
                            <span>{{ event.venue }} • {{ event.city }}</span>
                          </div>
                        </div>

                        <div class="text-body-2 event-description mobile-event-description mb-4">
                          {{ event.description }}
                        </div>

                        <div class="d-flex flex-wrap ga-2 mb-4">
                          <v-chip size="small" variant="outlined" rounded="pill">
                            {{ event.tickets_sold }} / {{ event.capacity }} sold
                          </v-chip>
                          <v-chip size="small" variant="tonal" color="primary" rounded="pill">
                            {{ event.ticket_types?.length || 0 }} ticket types
                          </v-chip>
                        </div>

                        <div class="event-cta">
                          <span>Open event details</span>
                          <v-icon size="18" icon="mdi-arrow-right" />
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </template>

              <template v-else-if="isTablet && filteredEvents.length > 0">
                <v-row class="tablet-events-grid" dense>
                  <v-col
                    v-for="event in filteredEvents"
                    :key="event.id"
                    cols="12"
                    sm="6"
                    class="d-flex"
                  >
                    <v-card
                      class="event-card tablet-event-card interactive-card flex-grow-1 event-card-clickable"
                      rounded="xl"
                      elevation="0"
                      variant="outlined"
                      role="link"
                      tabindex="0"
                      @click="openEvent(event)"
                      @keydown.enter.prevent="openEvent(event)"
                      @keydown.space.prevent="openEvent(event)"
                    >
                      <v-img
                        :src="event.image"
                        height="220"
                        cover
                        class="event-image"
                        gradient="to top, rgba(0,0,0,.45), rgba(0,0,0,.05)"
                      />

                      <v-card-text class="pa-4 pa-sm-5">
                        <div class="d-flex justify-space-between align-start ga-3 flex-wrap">
                          <div>
                            <div class="text-h6 font-weight-bold event-title">
                              {{ event.title }}
                            </div>

                            <div class="text-body-2 text-medium-emphasis mt-2 d-flex flex-wrap ga-3">
                              <span class="d-inline-flex align-center ga-1">
                                <v-icon size="16" icon="mdi-calendar-month-outline" />
                                {{ event.date }}
                              </span>
                              <span class="d-inline-flex align-center ga-1">
                                <v-icon size="16" icon="mdi-clock-outline" />
                                {{ event.time }}
                              </span>
                            </div>

                            <div class="text-body-2 text-medium-emphasis mt-1 d-flex flex-wrap ga-1">
                              <v-icon size="16" icon="mdi-map-marker-outline" />
                              <span>{{ event.venue }} • {{ event.city }}</span>
                            </div>
                          </div>

                          <v-chip
                            v-if="event.tickets_sold >= event.capacity"
                            size="small"
                            color="error"
                            variant="flat"
                            rounded="pill"
                          >
                            Sold out
                          </v-chip>
                        </div>

                        <div class="text-body-2 mt-4 event-description">
                          {{ event.description }}
                        </div>

                        <div class="mt-4 d-flex flex-wrap ga-2 mb-4">
                          <v-chip size="small" variant="outlined" rounded="pill">
                            {{ event.tickets_sold }} / {{ event.capacity }} sold
                          </v-chip>
                          <v-chip size="small" variant="tonal" color="primary" rounded="pill">
                            {{ event.ticket_types?.length || 0 }} ticket types
                          </v-chip>
                        </div>

                        <div class="event-cta">
                          <span>Open event details</span>
                          <v-icon size="18" icon="mdi-arrow-right" />
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </template>

              <v-slide-y-transition v-else group>
                <v-card
                  v-for="event in filteredEvents"
                  :key="event.id"
                  class="mb-4 event-card interactive-card event-card-clickable"
                  rounded="xl"
                  elevation="0"
                  variant="outlined"
                  role="link"
                  tabindex="0"
                  @click="openEvent(event)"
                  @keydown.enter.prevent="openEvent(event)"
                  @keydown.space.prevent="openEvent(event)"
                >
                  <v-row align="stretch" class="ma-0">
                    <v-col cols="12" sm="4" md="3" class="pa-0">
                      <v-img
                        :src="event.image"
                        height="100%"
                        min-height="180"
                        cover
                        class="event-image"
                        gradient="to top, rgba(0,0,0,.45), rgba(0,0,0,.05)"
                      />
                    </v-col>

                    <v-col cols="12" sm="8" md="9" class="event-content-column">
                      <div class="d-flex justify-space-between align-start ga-3 flex-wrap">
                        <div>
                          <div class="text-h6 font-weight-bold event-title">
                            {{ event.title }}
                          </div>

                          <div class="text-body-2 text-medium-emphasis mt-2 d-flex flex-wrap ga-3">
                            <span class="d-inline-flex align-center ga-1">
                              <v-icon size="16" icon="mdi-calendar-month-outline" />
                              {{ event.date }}
                            </span>
                            <span class="d-inline-flex align-center ga-1">
                              <v-icon size="16" icon="mdi-clock-outline" />
                              {{ event.time }}
                            </span>
                          </div>

                          <div class="text-body-2 text-medium-emphasis mt-1 d-flex flex-wrap ga-1">
                            <v-icon size="16" icon="mdi-map-marker-outline" />
                            <span>{{ event.venue }} • {{ event.city }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="text-body-2 mt-4 event-description">
                        {{ event.description }}
                      </div>

                      <div class="mt-4 d-flex flex-wrap ga-2 mb-4">
                        <v-chip size="small" variant="outlined" rounded="pill">
                          {{ event.type }}
                        </v-chip>

                        <v-chip
                          size="small"
                          variant="tonal"
                          rounded="pill"
                          :color="tab === 'upcoming' ? 'primary' : 'grey'"
                        >
                          {{ tab === "upcoming" ? "Will perform" : "Performed" }}
                        </v-chip>

                        <v-chip
                          v-if="event.last_call && tab === 'upcoming'"
                          size="small"
                          color="warning"
                          variant="flat"
                          rounded="pill"
                        >
                          Last call
                        </v-chip>

                        <v-chip
                          v-if="event.tickets_sold >= event.capacity"
                          size="small"
                          color="error"
                          variant="flat"
                          rounded="pill"
                        >
                          Sold out
                        </v-chip>
                      </div>

                      <div class="event-cta">
                        <span>Open event details</span>
                        <v-icon size="18" icon="mdi-arrow-right" />
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-slide-y-transition>

              <v-sheet
                v-if="filteredEvents.length === 0"
                rounded="xl"
                variant="outlined"
                class="empty-state pa-8 text-center"
              >
                <v-icon size="42" class="mb-3" icon="mdi-calendar-remove-outline" />
                <div class="text-h6 font-weight-bold mb-1">
                  {{
                    tab === "upcoming"
                      ? "No upcoming events found"
                      : "No past events found"
                  }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{
                    tab === "upcoming"
                      ? "Nothing is scheduled here yet."
                      : "Past performances will appear here once available."
                  }}
                </div>
              </v-sheet>
            </div>
          </v-col>

          <!-- RIGHT -->
          <v-col cols="12" md="4">
            <div class="sticky-side">
              <v-card rounded="xl" elevation="0" class="content-card side-card mb-4">
                <v-card-text class="pa-4">
                  <div class="text-subtitle-1 font-weight-bold mb-4">
                    Quick Actions
                  </div>

                  <div class="d-flex flex-wrap align-center ga-3 quick-actions-wrap">
                    <v-btn
                      color="primary"
                      variant="tonal"
                      rounded="lg"
                      prepend-icon="mdi-share-variant-outline"
                      class="text-none side-action-btn touch-btn"
                      @click="shareProfileDialog = true"
                    >
                      Share
                    </v-btn>
                    <v-btn
                      v-if="canReport"
                      color="error"
                      variant="tonal"
                      rounded="lg"
                      prepend-icon="mdi-flag-outline"
                      class="text-none side-action-btn touch-btn"
                      @click="openReportDialog"
                    >
                      Report
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <v-card rounded="xl" elevation="0" class="content-card side-card overflow-hidden">
                <v-card-text class="pa-4">
                  <div class="text-subtitle-1 font-weight-bold mb-4">
                    Profile Preview
                  </div>

                  <v-sheet
                    variant="outlined"
                    rounded="xl"
                    height="320"
                    class="d-flex align-center justify-center profile-preview interactive-card"
                  >
                    <v-img
                      v-if="viewedUser?.profile_picture"
                      :src="viewedUser.profile_picture"
                      cover
                      height="320"
                      class="profile-preview-img"
                    />
                    <div v-else class="text-center text-medium-emphasis">
                      <v-icon size="40" icon="mdi-image-outline" class="mb-2" />
                      <div>No profile image</div>
                    </div>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Subscribe blocked dialog -->
    <v-dialog v-model="subscribeBlockedDialog" max-width="420" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="warning" icon="mdi-alert-outline" />
          <span>Action unavailable</span>
        </v-card-title>

        <v-card-text>
          You can't subscribe to your own profile.
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn color="primary" variant="flat" rounded="lg" @click="subscribeBlockedDialog = false">
            Got it
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Already subscribed dialog -->
    <v-dialog v-model="subscribedNoticeDialog" max-width="420" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="success" icon="mdi-check-circle-outline" />
          <span>Already subscribed</span>
        </v-card-title>

        <v-card-text>
          You are already subscribed to this profile.
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn color="primary" variant="flat" rounded="lg" @click="subscribedNoticeDialog = false">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Unsubscribe confirm dialog -->
    <v-dialog v-model="unsubscribeDialog" max-width="430" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="error" icon="mdi-bell-remove-outline" />
          <span>Unsubscribe</span>
        </v-card-title>

        <v-card-text>
          Are you sure you want to unsubscribe from {{ displayedFullName }}?
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn variant="text" @click="unsubscribeDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="confirmUnsubscribe">
            Unsubscribe
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Share dialog -->
    <v-dialog v-model="shareProfileDialog" max-width="460" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary" icon="mdi-share-variant-outline" />
          <span>Share Profile</span>
        </v-card-title>

        <v-card-text>
          Copy this profile link?
          <v-sheet rounded="lg" variant="tonal" class="mt-3 pa-3 share-link-box">
            <div class="text-body-2 text-medium-emphasis break-link">
              {{ profileLink }}
            </div>
          </v-sheet>
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn variant="text" @click="shareProfileDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" @click="copyProfileLink">
            Copy Link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Report dialog -->
    <v-dialog v-model="reportDialog" max-width="520" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="error" icon="mdi-flag-outline" />
          <span>Report User</span>
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Report {{ displayedFullName }} by selecting a reason below.
          </div>

          <v-select
            v-model="reportReason"
            :items="reportReasons"
            label="Reason"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          />

          <v-textarea
            v-model="reportOtherReason"
            :label="reportReason === 'Other' ? 'Type the reason' : 'Additional details (optional)'"
            variant="outlined"
            rows="4"
            auto-grow
            rounded="lg"
          />
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn variant="text" @click="reportDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="submitReport">
            Submit Report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Report success dialog -->
    <v-dialog v-model="reportSuccessDialog" max-width="420" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="success" icon="mdi-check-circle-outline" />
          <span>Report submitted</span>
        </v-card-title>

        <v-card-text>
          User reported successfully.
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn color="primary" variant="flat" rounded="lg" @click="reportSuccessDialog = false">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Login required dialog -->
    <v-dialog v-model="loginRequiredDialog" max-width="430" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary" icon="mdi-login-variant" />
          <span>Login Required</span>
        </v-card-title>

        <v-card-text>
          Please log in first to continue.
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn color="primary" variant="flat" rounded="lg" @click="loginRequiredDialog = false">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Account -->
    <v-dialog v-model="deleteAccountDialog" max-width="430" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="error" icon="mdi-delete-outline" />
          <span>Delete Account</span>
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete {{ displayedFullName }}'s account?
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn variant="text" @click="deleteAccountDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="confirmDeleteAccount">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Moderator Toggle -->
    <v-dialog v-model="moderatorToggleDialog" max-width="460" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="indigo" :icon="viewedUser?.is_moderator ? 'mdi-shield-off-outline' : 'mdi-shield-account-outline'" />
          <span>{{ viewedUser?.is_moderator ? "Remove Moderator" : "Make Moderator" }}</span>
        </v-card-title>

        <v-card-text>
          Are you sure you want to
          {{ viewedUser?.is_moderator ? "remove moderator access from" : "make" }}
          {{ displayedFullName }}
          {{ viewedUser?.is_moderator ? "" : "a moderator" }}?
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn variant="text" @click="moderatorToggleDialog = false">
            Cancel
          </v-btn>
          <v-btn color="indigo" variant="flat" rounded="lg" @click="confirmModeratorToggle">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Suspend -->
    <v-dialog v-model="suspendDialog" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="warning" icon="mdi-account-cancel-outline" />
          <span>Suspend Account</span>
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="suspensionReason"
            :items="suspensionReasons"
            label="Reason"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          />

          <v-textarea
            v-if="suspensionReason === 'Other'"
            v-model="suspensionOtherReason"
            label="Custom reason"
            variant="outlined"
            rows="3"
            auto-grow
            rounded="lg"
            class="mb-4"
          />

          <v-select
            v-model="suspensionDays"
            :items="suspensionDurationOptions"
            item-title="title"
            item-value="value"
            label="Duration"
            variant="outlined"
            density="comfortable"
            rounded="lg"
          />
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-5">
          <v-btn variant="text" @click="suspendDialog = false">
            Cancel
          </v-btn>
          <v-btn color="warning" variant="flat" rounded="lg" @click="confirmSuspendAccount">
            Suspend
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="2500"
      rounded="lg"
      location="bottom right"
      class="profile-snackbar"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import { get_All_Events } from "@/dataModel/event"
import {
  delete_User,
  get_User_By_Id,
  get_Current_User,
  is_Admin,
  is_Moderator,
  set_User_Moderator_Status,
  subscribe_To_Artist,
  suspend_User,
  unsubscribe_From_Artist,
  unsuspend_User,
  is_Subscribed_To_Artist,
} from "@/dataModel/user"
import { add_User_Report } from "@/dataModel/report"

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"

const tab = ref("details")
const events = get_All_Events()

const currentUser = ref(get_Current_User())
const viewedUser = ref(null)

const subscribeBlockedDialog = ref(false)
const subscribedNoticeDialog = ref(false)
const unsubscribeDialog = ref(false)
const shareProfileDialog = ref(false)
const reportDialog = ref(false)
const reportSuccessDialog = ref(false)
const loginRequiredDialog = ref(false)
const deleteAccountDialog = ref(false)
const moderatorToggleDialog = ref(false)
const suspendDialog = ref(false)

const suspensionReason = ref("Spam")
const suspensionOtherReason = ref("")
const suspensionDays = ref(7)

const reportReason = ref("Spam")
const reportOtherReason = ref("")

const isMobile = computed(() => display.mdAndDown.value)
const isPhone = computed(() => display.xs.value)
const isTablet = computed(() => display.sm.value || display.md.value)

function getStoredThemeChoice() {
  if (typeof window === "undefined") return "dark"
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return savedTheme === "light" ? "light" : "dark"
}

if (theme?.global?.name) {
  theme.global.name.value = getStoredThemeChoice()
}

const currentThemeName = computed(() => {
  return theme?.global?.name?.value === "light" ? "light" : "dark"
})

const reportReasons = [
  "Spam",
  "Harassment",
  "Hate speech",
  "Impersonation",
  "Scam or fraud",
  "Inappropriate content",
  "Other",
]

const suspensionReasons = [
  "Spam",
  "Harassment",
  "Fake account",
  "Scam activity",
  "Inappropriate content",
  "Policy violation",
  "Other",
]

const suspensionDurationOptions = [
  { title: "1 day", value: 1 },
  { title: "3 days", value: 3 },
  { title: "7 days", value: 7 },
  { title: "14 days", value: 14 },
  { title: "30 days", value: 30 },
]

const snackbar = ref({
  show: false,
  text: "",
})

function syncCurrentUser() {
  currentUser.value = get_Current_User()
}

function resolveViewedUser() {
  const routeId = String(route.query.id || "").trim()

  if (routeId) {
    const foundUser = get_User_By_Id(routeId)
    if (foundUser) {
      viewedUser.value = foundUser
      return
    }
  }

  const fallbackCurrent = get_Current_User()
  viewedUser.value = fallbackCurrent || null
}

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"

  if (theme?.global?.name) {
    theme.global.name.value = normalizedTheme
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
  }
}

function loadSavedTheme() {
  applyThemeChoice(getStoredThemeChoice())
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    const savedTheme = getStoredThemeChoice()

    if (theme?.global?.name) {
      theme.global.name.value = savedTheme
    }

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-app-theme", savedTheme)
      document.documentElement.style.colorScheme = savedTheme
    }
  }

  if (!event.key || event.key === "currentUser") {
    syncCurrentUser()
    resolveViewedUser()
  }
}

function handleWindowFocus() {
  loadSavedTheme()
  syncCurrentUser()
  resolveViewedUser()
}

watch(
  () => route.query.id,
  () => {
    resolveViewedUser()
    syncCurrentUser()
  },
  { immediate: true }
)

onMounted(() => {
  loadSavedTheme()

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleWindowStorage)
    window.addEventListener("focus", handleWindowFocus)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleWindowStorage)
    window.removeEventListener("focus", handleWindowFocus)
  }
})

const displayedFullName = computed(() => {
  if (!viewedUser.value) return "Unknown User"

  return (
    viewedUser.value.full_name ||
    `${viewedUser.value.first_name || ""} ${viewedUser.value.last_name || ""}`.trim() ||
    "Unknown User"
  )
})

const viewedUserId = computed(() => {
  return viewedUser.value?.id ? String(viewedUser.value.id) : ""
})

const isOwnProfile = computed(() => {
  if (!currentUser.value || !viewedUser.value) return false
  return String(currentUser.value.id) === String(viewedUser.value.id)
})

const isSubscribed = computed(() => {
  if (!currentUser.value || !viewedUser.value || isOwnProfile.value) return false
  return is_Subscribed_To_Artist(currentUser.value.id, viewedUserId.value)
})

const canDeleteAccount = computed(() => {
  if (!currentUser.value || !viewedUser.value) return false
  if (!is_Moderator(currentUser.value)) return false
  if (isOwnProfile.value) return false
  if (viewedUser.value.is_admin) return false
  return true
})

const canToggleModerator = computed(() => {
  if (!currentUser.value || !viewedUser.value) return false
  if (!is_Admin(currentUser.value)) return false
  if (isOwnProfile.value) return false
  if (viewedUser.value.is_admin) return false
  return true
})

const canSuspend = computed(() => {
  if (!currentUser.value || !viewedUser.value) return false
  if (!is_Moderator(currentUser.value)) return false
  if (isOwnProfile.value) return false
  if (viewedUser.value.is_admin) return false
  return true
})

const canUnsuspend = computed(() => {
  return canSuspend.value && Boolean(viewedUser.value?.suspension?.is_active)
})

const canReport = computed(() => {
  if (!currentUser.value || !viewedUser.value) return false
  if (isOwnProfile.value) return false
  return true
})

const contactEntries = computed(() => {
  const contacts = viewedUser.value?.contacts
  if (!contacts || typeof contacts !== "object") return []
  return Object.entries(contacts).filter(([, value]) => value)
})

const profileLink = computed(() => {
  return `${window.location.origin}/f_details?id=${viewedUserId.value}`
})

const suspensionReasonText = computed(() => {
  if (!viewedUser.value?.suspension) return "—"

  if (
    viewedUser.value.suspension.reason === "Other" &&
    viewedUser.value.suspension.custom_reason
  ) {
    return viewedUser.value.suspension.custom_reason
  }

  return viewedUser.value.suspension.reason || "Policy violation"
})

const suspensionUntilText = computed(() => {
  const value = viewedUser.value?.suspension?.suspended_until
  if (!value) return "Unknown"
  return new Date(value).toLocaleString()
})

const icons = {
  instagram: "mdi-instagram",
  youtube: "mdi-youtube",
  twitter: "mdi-twitter",
  website: "mdi-web",
  email: "mdi-email-outline",
  phone: "mdi-phone-outline",
  facebook: "mdi-facebook",
  tiktok: "mdi-music-note",
  linkedin: "mdi-linkedin",
  soundcloud: "mdi-soundcloud",
}

function parseEventDate(dateString) {
  if (!dateString) return null

  const parts = String(dateString).trim().split(" ")
  if (parts.length !== 3) return null

  const [day, monthText, year] = parts
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
    dec: 11,
  }

  const monthIndex = months[monthText.slice(0, 3).toLowerCase()]
  if (monthIndex === undefined) return null

  return new Date(Number(year), monthIndex, Number(day), 23, 59, 59)
}

const artistEvents = computed(() => {
  if (!viewedUser.value?.id || !viewedUser.value?.is_artist) return []

  return events
    .filter(event => Array.isArray(event.featured_artist_ids) && event.featured_artist_ids.includes(viewedUser.value.id))
    .sort((a, b) => {
      const dateA = parseEventDate(a.date)?.getTime() ?? 0
      const dateB = parseEventDate(b.date)?.getTime() ?? 0
      return dateA - dateB
    })
})

const upcomingEvents = computed(() => {
  const now = new Date()
  return artistEvents.value.filter(event => {
    const eventDate = parseEventDate(event.date)
    return eventDate && eventDate >= now
  })
})

const pastEvents = computed(() => {
  const now = new Date()
  return artistEvents.value
    .filter(event => {
      const eventDate = parseEventDate(event.date)
      return eventDate && eventDate < now
    })
    .sort((a, b) => {
      const dateA = parseEventDate(a.date)?.getTime() ?? 0
      const dateB = parseEventDate(b.date)?.getTime() ?? 0
      return dateB - dateA
    })
})

const filteredEvents = computed(() => {
  if (!viewedUser.value?.is_artist) return []

  if (tab.value === "upcoming") {
    return upcomingEvents.value
  }

  if (tab.value === "past") {
    return pastEvents.value
  }

  return []
})

function getEventRoute(event) {
  if (!event) return null

  const rawPath = String(event.route_path || "").trim()
  if (rawPath) return rawPath

  const eventId = String(event.id || "").trim()
  if (!eventId) return null

  return `/o_eventinfo?id=${encodeURIComponent(eventId)}`
}

function openEvent(event) {
  const target = getEventRoute(event)
  if (!target) return
  router.push(target)
}

function subscribe() {
  if (!currentUser.value) {
    loginRequiredDialog.value = true
    return
  }

  if (!viewedUser.value) return

  if (isOwnProfile.value) {
    subscribeBlockedDialog.value = true
    return
  }

  subscribe_To_Artist(currentUser.value.id, viewedUserId.value)
  syncCurrentUser()
  resolveViewedUser()

  snackbar.value = {
    show: true,
    text: `Subscribed to ${displayedFullName.value}.`,
  }
}

function confirmUnsubscribe() {
  if (!currentUser.value) {
    loginRequiredDialog.value = true
    return
  }

  if (!viewedUser.value) return

  unsubscribe_From_Artist(currentUser.value.id, viewedUserId.value)
  syncCurrentUser()
  resolveViewedUser()
  unsubscribeDialog.value = false

  snackbar.value = {
    show: true,
    text: `Unsubscribed from ${displayedFullName.value}.`,
  }
}

function goToSettings() {
  router.push("/Setting")
}

async function copyProfileLink() {
  try {
    await navigator.clipboard.writeText(profileLink.value)
    shareProfileDialog.value = false
    snackbar.value = {
      show: true,
      text: "Profile link copied!",
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: "Could not copy link.",
    }
  }
}

function openReportDialog() {
  if (!currentUser.value?.id) {
    loginRequiredDialog.value = true
    return
  }

  if (!canReport.value) return

  reportReason.value = "Spam"
  reportOtherReason.value = ""
  reportDialog.value = true
}

function submitReport() {
  if (!currentUser.value?.id || !viewedUser.value?.id) {
    loginRequiredDialog.value = true
    return
  }

  const trimmedOtherReason = reportOtherReason.value.trim()

  if (reportReason.value === "Other" && !trimmedOtherReason) {
    snackbar.value = {
      show: true,
      text: "Please type the report reason.",
    }
    return
  }

  add_User_Report({
    reported_user_id: viewedUser.value.id,
    reported_by_user_id: currentUser.value.id,
    reason: reportReason.value,
    details: trimmedOtherReason,
  })

  reportDialog.value = false
  reportSuccessDialog.value = true
}

function confirmDeleteAccount() {
  if (!viewedUser.value) return

  delete_User(viewedUser.value.id)
  deleteAccountDialog.value = false

  snackbar.value = {
    show: true,
    text: "Account deleted successfully.",
  }

  router.push("/n_mainpage")
}

function confirmModeratorToggle() {
  if (!viewedUser.value) return

  const makingModerator = !viewedUser.value.is_moderator
  set_User_Moderator_Status(viewedUser.value.id, makingModerator, currentUser.value?.id || null)

  moderatorToggleDialog.value = false
  resolveViewedUser()

  snackbar.value = {
    show: true,
    text: makingModerator
      ? `${displayedFullName.value} is now a moderator.`
      : `Moderator access removed.`,
  }
}

function confirmSuspendAccount() {
  if (!viewedUser.value) return

  suspend_User(viewedUser.value.id, {
    reason: suspensionReason.value,
    custom_reason: suspensionOtherReason.value,
    duration_days: suspensionDays.value,
    suspended_by_user_id: currentUser.value?.id || null,
  })

  suspendDialog.value = false
  resolveViewedUser()

  snackbar.value = {
    show: true,
    text: "Account suspended successfully.",
  }
}

function unsuspendViewedUser() {
  if (!viewedUser.value) return

  unsuspend_User(viewedUser.value.id)
  resolveViewedUser()

  snackbar.value = {
    show: true,
    text: "Suspension removed successfully.",
  }
}
</script>

<style scoped>
.profile-page-app {
  background:
    radial-gradient(circle at 10% 6%, rgba(var(--v-theme-primary), 0.05), transparent 24%),
    radial-gradient(circle at 86% 10%, rgba(var(--v-theme-secondary), 0.045), transparent 22%),
    linear-gradient(180deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-surface), 0.985));
}

.profile-page-app.theme-light {
  background:
    radial-gradient(circle at 12% 7%, rgba(var(--v-theme-primary), 0.055), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(var(--v-theme-secondary), 0.05), transparent 22%),
    radial-gradient(circle at 52% 0%, rgba(148, 163, 184, 0.035), transparent 26%),
    linear-gradient(180deg, #f8fafc 0%, #f8fafc 28%, rgba(255,255,255,0.995) 100%);
}

.profile-page-app.theme-dark {
  background:
    radial-gradient(circle at 12% 8%, rgba(var(--v-theme-primary), 0.09), transparent 25%),
    radial-gradient(circle at 84% 12%, rgba(var(--v-theme-secondary), 0.07), transparent 23%),
    linear-gradient(180deg, rgba(var(--v-theme-background), 1), rgba(var(--v-theme-surface), 0.985));
}

.profile-page-shell {
  max-width: 1320px;
  padding: 20px 16px 28px;
}

.shell-mobile {
  padding-inline: 12px;
}

.shell-tablet {
  padding-inline: 18px;
}

.profile-hero-spacing {
  padding: 20px;
  margin-bottom: 20px;
}

.profile-main-column {
  text-align: center;
}

.action-column-shell {
  width: 100%;
}

.event-content-column {
  padding: 16px;
}

.profile-hero-row {
  row-gap: 12px;
}

.profile-hero,
.content-card,
.tabs-shell,
.dialog-card {
  backdrop-filter: blur(10px);
}

.profile-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.965), rgba(var(--v-theme-surface), 0.94));
  box-shadow:
    0 20px 48px rgba(15, 23, 42, 0.07),
    0 1px 0 rgba(255,255,255,0.5) inset;
}

.profile-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 18%, rgba(var(--v-theme-primary), 0.055), transparent 22%),
    radial-gradient(circle at 86% 14%, rgba(var(--v-theme-secondary), 0.05), transparent 20%),
    radial-gradient(circle at 52% 78%, rgba(148, 163, 184, 0.04), transparent 26%);
  pointer-events: none;
}

.profile-hero::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.18), transparent 16%, transparent 84%, rgba(255,255,255,0.12));
  opacity: 0.55;
  pointer-events: none;
}

.avatar-shell {
  position: relative;
  display: inline-flex;
  padding: 7px;
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.16), rgba(var(--v-theme-secondary), 0.11));
  box-shadow:
    0 16px 34px rgba(15, 23, 42, 0.09),
    0 1px 0 rgba(255,255,255,0.45) inset;
}

.profile-avatar {
  border: 4px solid rgba(var(--v-theme-surface), 0.9);
}

.profile-name {
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.profile-main-column > .text-body-1,
.profile-main-column > .text-body-2 {
  position: relative;
  z-index: 1;
}

.profile-quick-stats {
  row-gap: 10px;
}

.mini-stat {
  min-width: 160px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.9), rgba(var(--v-theme-surface), 0.82)) !important;
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.05),
    0 1px 0 rgba(255,255,255,0.28) inset;
}

.action-column {
  gap: 0;
}

.action-btn {
  transition: transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
}

.touch-btn {
  min-height: 44px;
}

.touch-icon-btn {
  min-width: 44px;
  min-height: 44px;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.dots-btn {
  transition: transform 0.2s ease;
}

.dots-btn:hover {
  transform: scale(1.04);
}

.menu-list {
  min-width: 180px;
}

.interactive-card {
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.section-divider {
  opacity: 0.65;
}

.tabs-row {
  position: relative;
  z-index: 2;
}

.tabs-mobile-hint {
  opacity: 0.82;
}

.profile-tabs {
  width: 100%;
}

.tabs-shell {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgba(var(--v-theme-surface), 0.92);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.profile-tabs :deep(.v-tab) {
  min-height: 46px;
  font-weight: 600;
  border-radius: 999px;
  transition: background-color 0.22s ease, transform 0.22s ease;
  padding-inline: 16px;
}

.profile-tabs :deep(.v-tab:hover) {
  transform: translateY(-1px);
}

.profile-hero,
.content-card,
.event-card,
.mobile-event-card,
.tabs-shell,
.mini-stat {
  will-change: transform, box-shadow;
}

.profile-hero-row,
.profile-main-column,
.action-column-shell {
  position: relative;
  z-index: 1;
}

.content-card {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgba(var(--v-theme-surface), 0.95);
  box-shadow:
    0 14px 30px rgba(15, 23, 42, 0.05),
    0 1px 0 rgba(255,255,255,0.22) inset;
}

.details-card,
.side-card {
  overflow: hidden;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.details-surface {
  border-color: rgba(var(--v-border-color), 0.08) !important;
  background: rgba(var(--v-theme-surface-variant), 0.22);
}

.profile-description {
  white-space: pre-wrap;
  line-height: 1.8;
}

.status-sheet {
  border-color: rgba(var(--v-theme-error), 0.2) !important;
  background: rgba(var(--v-theme-error), 0.04);
}

.contact-list {
  padding: 4px;
}

.contact-item {
  margin-bottom: 6px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.contact-item:hover {
  transform: translateX(2px);
  background: rgba(var(--v-theme-primary), 0.04);
}

.event-card {
  overflow: hidden;
  border-color: rgba(var(--v-border-color), 0.08) !important;
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.97), rgba(var(--v-theme-surface), 0.93));
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
  box-shadow:
    0 14px 28px rgba(15, 23, 42, 0.045),
    0 1px 0 rgba(255,255,255,0.18) inset;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.18) !important;
}

.event-card:hover :deep(.v-img__img) {
  transform: scale(1.04);
}

.event-image {
  height: 100%;
}

.event-card :deep(.v-img__img) {
  transition: transform 0.5s ease;
}

.event-title {
  line-height: 1.2;
}

.event-description {
  line-height: 1.7;
}

.mobile-events-shell {
  position: relative;
}

.mobile-events-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(290px, 86vw);
  gap: 14px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}

.mobile-event-card {
  overflow: hidden;
  border-color: rgba(var(--v-border-color), 0.08) !important;
  background: rgba(var(--v-theme-surface), 0.96);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
  scroll-snap-align: start;
}

.mobile-event-title {
  font-size: 1.05rem;
  line-height: 1.25;
}

.mobile-event-description {
  display: -webkit-box;
    line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-event-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mobile-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.28);
  color: rgba(var(--v-theme-on-surface), 0.82);
  font-size: 0.88rem;
}

.mobile-meta-pill-wide {
  grid-column: 1 / -1;
}

.tablet-events-grid {
  margin: -6px;
}

.tablet-event-card {
  min-height: 100%;
}

.empty-state {
  border-style: dashed !important;
  border-color: rgba(var(--v-border-color), 0.12) !important;
  background: rgba(var(--v-theme-surface-variant), 0.18);
}

.sticky-side {
  position: sticky;
  top: 88px;
}

.side-action-btn {
  min-width: 120px;
}

.profile-preview {
  overflow: hidden;
  border-color: rgba(var(--v-border-color), 0.08) !important;
  background: rgba(var(--v-theme-surface-variant), 0.18);
}

.profile-preview-img {
  transition: transform 0.5s ease;
}

.profile-preview:hover .profile-preview-img {
  transform: scale(1.03);
}

.soft-alert {
  border-radius: 24px;
}

.dialog-card {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
}

.share-link-box {
  border: 1px dashed rgba(var(--v-theme-primary), 0.2);
}

.break-link {
  word-break: break-all;
}

.suspension-inline {
  line-height: 1.6;
}

.profile-snackbar :deep(.v-snackbar__wrapper) {
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.16);
}


.event-card-clickable {
  cursor: pointer;
}

.event-card-clickable:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.8);
  outline-offset: 3px;
}

.event-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgb(var(--v-theme-primary));
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.11), rgba(var(--v-theme-secondary), 0.06));
  border: 1px solid rgba(var(--v-theme-primary), 0.14);
  transition: transform 0.24s ease, box-shadow 0.24s ease, background-color 0.24s ease;
}

.event-card:hover .event-cta,
.mobile-event-card:hover .event-cta {
  transform: translateX(4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.profile-page-app.theme-light .profile-hero {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.935));
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow:
    0 22px 48px rgba(15, 23, 42, 0.06),
    0 1px 0 rgba(255,255,255,0.84) inset;
}

.profile-page-app.theme-light .profile-hero::before {
  background:
    radial-gradient(circle at 12% 18%, rgba(99, 102, 241, 0.06), transparent 21%),
    radial-gradient(circle at 86% 15%, rgba(45, 212, 191, 0.055), transparent 20%),
    radial-gradient(circle at 54% 86%, rgba(191, 219, 254, 0.09), transparent 24%);
}

.profile-page-app.theme-light .content-card,
.profile-page-app.theme-light .tabs-shell,
.profile-page-app.theme-light .mobile-event-card,
.profile-page-app.theme-light .event-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.975), rgba(248,250,252,0.955));
  border-color: rgba(148, 163, 184, 0.14) !important;
  box-shadow:
    0 16px 34px rgba(15, 23, 42, 0.05),
    0 1px 0 rgba(255,255,255,0.88) inset;
}

.profile-page-app.theme-light .details-surface,
.profile-page-app.theme-light .profile-preview,
.profile-page-app.theme-light .empty-state {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,245,249,0.88));
  border-color: rgba(148, 163, 184, 0.14) !important;
}

.profile-page-app.theme-light .mini-stat {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.86)) !important;
  border-color: rgba(148, 163, 184, 0.16) !important;
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.045),
    0 1px 0 rgba(255,255,255,0.9) inset;
}

.profile-page-app.theme-light .mobile-meta-pill {
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,245,249,0.86));
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.profile-page-app.theme-light .event-cta {
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(45, 212, 191, 0.055));
  border-color: rgba(99, 102, 241, 0.1);
}

.profile-page-app.theme-light .event-card:hover,
.profile-page-app.theme-light .mobile-event-card:hover {
  box-shadow:
    0 20px 42px rgba(15, 23, 42, 0.075),
    0 8px 24px rgba(99, 102, 241, 0.05);
}

.profile-page-app.theme-dark .event-cta {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.18), rgba(var(--v-theme-secondary), 0.10));
  border-color: rgba(var(--v-theme-primary), 0.18);
}


@media (min-width: 960px) {
  .profile-page-shell {
    padding: 24px 24px 40px;
  }

  .profile-hero-spacing {
    padding: 24px;
    margin-bottom: 24px;
  }

  .profile-main-column {
    text-align: left;
  }

  .action-column-shell {
    width: auto;
  }

  .event-content-column {
    padding: 20px;
  }
}

@media (max-width: 959px) {
  .sticky-side {
    position: static;
    top: auto;
  }

  .profile-page-shell {
    max-width: 100%;
  }

  .content-grid {
    row-gap: 14px;
  }

  .action-column {
    justify-content: flex-start !important;
  }

  .action-column .touch-btn {
    flex: 1 1 calc(50% - 8px);
    min-width: 170px;
    margin-right: 0 !important;
  }

  .mini-stat {
    min-width: 145px;
  }

  .quick-actions-wrap .touch-btn {
    flex: 1 1 180px;
  }

  .profile-preview {
    min-height: 260px;
  }

  .side-card {
    border-radius: 24px !important;
  }
}

@media (max-width: 600px) {
  .profile-page-shell {
    padding-top: 14px;
    padding-bottom: 22px;
  }

  .profile-hero {
    padding: 18px !important;
    border-radius: 24px !important;
  }

  .profile-hero-spacing {
    margin-bottom: 14px;
  }

  .profile-main-column {
    text-align: center;
  }

  .profile-avatar-column {
    margin-bottom: 6px !important;
  }

  .profile-quick-stats {
    justify-content: center;
  }

  .mini-stat {
    min-width: 100%;
  }

  .profile-name {
    font-size: 1.75rem !important;
  }

  .tabs-shell {
    border-radius: 24px !important;
  }

  .tabs-shell-mobile {
    padding-top: 10px !important;
  }

  .profile-tabs :deep(.v-slide-group__content) {
    gap: 6px;
    justify-content: flex-start;
    padding-inline: 2px;
  }

  .profile-tabs :deep(.v-tab) {
    min-width: max-content;
    padding-inline: 14px;
  }

  .event-card {
    border-radius: 24px !important;
  }

  .event-image {
    min-height: 190px;
  }

  .side-action-btn {
    flex: 1 1 auto;
  }

  .action-column {
    gap: 8px;
  }

  .action-column .touch-btn,
  .quick-actions-wrap .touch-btn {
    flex: 1 1 100%;
    width: 100%;
  }

  .quick-actions-wrap {
    flex-direction: column;
    align-items: stretch !important;
  }

  .profile-preview {
    min-height: 220px;
  }

  .dots-btn {
    margin-left: auto;
  }
}

@media (hover: none) {
  .action-btn:hover,
  .dots-btn:hover,
  .profile-tabs :deep(.v-tab:hover),
  .contact-item:hover,
  .event-card:hover,
  .profile-preview:hover .profile-preview-img {
    transform: none;
  }

  .contact-item:hover,
  .event-card:hover {
    background: inherit;
    box-shadow: inherit;
  }

  .profile-preview:hover .profile-preview-img,
  .event-card:hover :deep(.v-img__img) {
    transform: none;
  }
}
</style>