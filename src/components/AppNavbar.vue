<template>
  <v-app-bar
    elevation="0"
    :height="isMobile ? 70 : 76"
    class="px-3 pl-5 navbar-glass app-navbar"
    :class="[`theme-${currentTheme}`, { 'navbar-mobile': isMobile }]"
  >
    <div
      class="d-flex align-center ga-5 brand-block"
      @click="goHome"
      @contextmenu.prevent="openRouteContextMenu($event, '/n_mainpage', 'Blassti Home')"
    >
      <v-avatar size="60" rounded="0" class="logo-avatar">
        <v-img :src="logoSrc" alt="Blassti Logo" contain />
      </v-avatar>

      <div class="d-flex align-center">
        <div class="text-h5 font-weight-bold brand-title">
          Blassti
        </div>

        <span class="brand-divider">|</span>
      </div>
    </div>

    <v-spacer />

    <div v-if="!isMobile" class="desktop-nav-shell d-flex align-center">
      <div class="search-wrapper mr-4">
        <v-autocomplete
          v-model="selectedUser"
          v-model:search="userSearch"
          :items="filteredUserSearchItems"
          item-title="title"
          item-value="id"
          return-object
          variant="outlined"
          density="comfortable"
          rounded="xl"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search users..."
          hide-details
          hide-no-data
          clearable
          no-filter
          menu-icon=""
          class="user-search"
          @update:modelValue="goToUserDetails"
        >
          <template #prepend-inner>
            <v-icon size="18" class="search-leading-icon">mdi-magnify</v-icon>
          </template>

          <template #append-inner>
            <v-fade-transition>
              <v-chip
                v-if="userSearch && filteredUserSearchItems.length"
                size="x-small"
                variant="tonal"
                color="primary"
                class="search-chip"
              >
                {{ filteredUserSearchItems.length }}
              </v-chip>
            </v-fade-transition>
          </template>

          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              class="dropdown-item fast-dropdown-item user-search-item"
              @contextmenu.prevent="openUserProfileContextMenu($event, item.raw)"
            >
              <template #prepend>
                <v-avatar size="36" class="search-result-avatar">
                  <v-img :src="item.raw.avatar" cover />
                </v-avatar>
              </template>

              <v-list-item-title class="search-result-title">
                {{ item.raw.title }}
              </v-list-item-title>

              <v-list-item-subtitle class="search-result-subtitle">
                {{ item.raw.subtitle }}
              </v-list-item-subtitle>

              <template #append>
                <v-icon size="18" class="search-result-open-icon">
                  mdi-open-in-new
                </v-icon>
              </template>
            </v-list-item>
          </template>

          <template #selection="{ item }">
            <div
              class="d-flex align-center ga-2 selected-user-pill"
              @contextmenu.prevent="openUserProfileContextMenu($event, item.raw)"
            >
              <v-avatar size="24" class="selected-user-avatar">
                <v-img :src="item.raw.avatar" cover />
              </v-avatar>
              <span>{{ item.raw.title }}</span>
            </div>
          </template>

          <template #no-data>
            <div class="search-empty-state">
              <v-icon size="22" class="mb-2">mdi-account-search-outline</v-icon>
              <div class="text-body-2 font-weight-medium">No users found</div>
              <div class="text-caption text-medium-emphasis">
                Try another name, city, or role.
              </div>
            </div>
          </template>
        </v-autocomplete>
      </div>

      <!-- Events -->
      <v-menu open-on-hover transition="slide-y-transition" offset="12">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="nav-btn"
            :class="{ 'nav-active': isActiveGroup(['/', '/n_mainpage', '/N_Event_Browsing', '/K_mybookings']) }"
          >
            Events
            <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list class="dropdown-list fast-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`">
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Browse events"
            prepend-icon="mdi-calendar-star"
            @click="navigateTo('/N_Event_Browsing')"
            @contextmenu.prevent="openRouteContextMenu($event, '/N_Event_Browsing', 'Browse events')"
          />
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="My bookings"
            prepend-icon="mdi-ticket-confirmation-outline"
            @click="goProtected('/K_mybookings')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/K_mybookings', 'My bookings')"
          />
        </v-list>
      </v-menu>

      <!-- Venue -->
      <v-menu open-on-hover transition="slide-y-transition" offset="12">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="nav-btn"
            :class="{ 'nav-active': isActiveGroup(['/venueBrowsing', '/O_venueinfo', '/reservations', '/reserved_venues']) }"
          >
            Venue
            <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list class="dropdown-list fast-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`">
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Browse venues"
            prepend-icon="mdi-map-search-outline"
            @click="navigateTo('/venueBrowsing')"
            @contextmenu.prevent="openRouteContextMenu($event, '/venueBrowsing', 'Browse venues')"
          />
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="My venues"
            prepend-icon="mdi-domain"
            @click="goProtected('/reserved_venues')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/reserved_venues', 'My venues')"
          />
        </v-list>
      </v-menu>

      <!-- Carpools -->
      <v-menu open-on-hover transition="slide-y-transition" offset="12">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="nav-btn"
            :class="{ 'nav-active': isActiveGroup(['/O_CurrentCarpools', '/F_CarpoolCreate']) }"
          >
            Carpools
            <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list class="dropdown-list fast-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`">
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Current"
            prepend-icon="mdi-car-multiple"
            @click="goProtected('/O_CurrentCarpools')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/O_CurrentCarpools', 'Current carpools')"
          />
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Search/Create"
            prepend-icon="mdi-car-search"
            @click="goProtected('/F_CarpoolCreate')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/F_CarpoolCreate', 'Search/Create carpools')"
          />
        </v-list>
      </v-menu>

      <!-- Manage -->
      <v-menu open-on-hover transition="slide-y-transition" offset="12">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="nav-btn"
            :class="{ 'nav-active': isActiveGroup(['/o_CreateVenue', '/CreateEvent', '/venueRequest', '/stastistics', '/manageVenue', '/payments']) || route.path === '/CreateEvent' || reportsDialog }"
          >
            Manage
            <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list class="dropdown-list fast-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`">
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Create event"
            prepend-icon="mdi-calendar-plus"
            @click="goProtected('/CreateEvent')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/CreateEvent', 'Create event')"
          />
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Add venue"
            prepend-icon="mdi-store-plus-outline"
            @click="goProtected('/o_CreateVenue')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/o_CreateVenue', 'Add venue')"
          />
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Manage my venues"
            prepend-icon="mdi-store-edit-outline"
            @click="goProtected('/manageVenue')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/manageVenue', 'Manage my venues')"
          />
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Manage my payments"
            prepend-icon="mdi-cash-multiple"
            @click="goProtected('/payments')"
            @contextmenu.prevent="openProtectedRouteContextMenu($event, '/payments', 'Manage my payments')"
          />

          <template v-if="canModerate">
            <v-divider class="my-1" />
            <v-list-item
              class="dropdown-item fast-dropdown-item"
              title="Requests"
              prepend-icon="mdi-store-clock-outline"
              @click="navigateTo('/venueRequest')"
              @contextmenu.prevent="openRouteContextMenu($event, '/venueRequest', 'Requests')"
            />
            <v-list-item
              class="dropdown-item fast-dropdown-item"
              title="Statistics"
              prepend-icon="mdi-chart-box-outline"
              @click="navigateTo('/stastistics')"
              @contextmenu.prevent="openRouteContextMenu($event, '/stastistics', 'Statistics')"
            />
            <v-list-item
              class="dropdown-item fast-dropdown-item"
              title="Reports"
              prepend-icon="mdi-flag-outline"
              @click="openReportsDialog"
            />
            <v-list-item
              class="dropdown-item fast-dropdown-item"
              title="Send Notification"
              prepend-icon="mdi-bell-badge-outline"
              @click="openBroadcastDialog"
            />
          </template>
        </v-list>
      </v-menu>

      <v-divider vertical class="mx-3 header-divider" />

    </div>

    <v-btn
      v-else
      icon
      variant="text"
      class="mobile-menu-btn ml-1"
      aria-label="Open navigation menu"
      @click="mobileDrawer = !mobileDrawer"
    >
      <v-icon>{{ mobileDrawer ? "mdi-close" : "mdi-menu" }}</v-icon>
    </v-btn>

    <!-- Notifications -->
    <v-menu
      v-model="notificationsMenu"
      location="bottom end"
      transition="slide-y-transition"
      offset="12"
      :close-on-content-click="false"
    >
      <template #activator="{ props }">
        <v-btn
          icon
          class="notif-btn mr-1"
          :class="{ 'notif-has-items': unreadCount > 0 }"
          v-bind="props"
        >
          <v-badge
            v-if="unreadCount > 0"
            :content="unreadCount > 9 ? '9+' : unreadCount"
            color="primary"
            floating
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>

          <v-icon v-else>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <v-card class="notifications-card fast-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`" rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-4">
          <span class="text-subtitle-1 font-weight-bold">Notifications</span>

          <div class="d-flex ga-2" v-if="notifications.length">
            <v-btn
              size="small"
              variant="text"
              class="text-none"
              @click="markAllAsSeen"
            >
              Mark all as seen
            </v-btn>

            <v-btn
              size="small"
              variant="text"
              class="text-none"
              @click="clearNotifications"
            >
              Clear all
            </v-btn>
          </div>
        </v-card-title>

        <v-divider />

        <div v-if="notifications.length" class="notifications-scroll">
          <v-list class="py-0 notification-list">
            <v-list-item
              v-for="notif in notifications"
              :key="notif.id"
              class="notification-item fast-dropdown-item"
              :class="{ 'notification-unread': !notif.is_read }"
              @click="handleNotificationClick(notif)"
            >
              <template #prepend>
                <v-avatar size="38" class="notification-avatar">
                  <v-icon>{{ notif.icon }}</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ notif.title }}
              </v-list-item-title>

              <v-list-item-subtitle class="notification-subtitle">
                {{ notif.subtitle }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  class="mark-read-btn"
                  @click.stop="markOneAsRead(notif)"
                >
                  <span
                    class="notif-read-dot"
                    :class="{ 'notif-read-dot--seen': notif.is_read }"
                  ></span>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <div v-else class="empty-notifications">
          <v-icon size="30" class="mb-2">mdi-bell-outline</v-icon>
          <div class="text-subtitle-2 font-weight-medium">No new notifications</div>
          <div class="text-caption text-medium-emphasis mt-1">
            You're all caught up.
          </div>
        </div>
      </v-card>
    </v-menu>

    <template v-if="currentUser">
      <v-menu transition="slide-y-transition" offset="12">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon class="profile-btn">
            <v-avatar size="40" class="profile-avatar-ring">
              <v-img :src="profileMenuAvatar" cover />
            </v-avatar>
          </v-btn>
        </template>

        <v-list min-width="228" class="dropdown-list fast-dropdown-list profile-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`">
          <v-list-item
            class="dropdown-item fast-dropdown-item"
            :title="fullNameFromCurrentUser"
            :subtitle="currentUser.email || 'Logged in'"
            @click="goToOwnProfile"
            @contextmenu.prevent="openOwnProfileContextMenu($event)"
          >
            <template #prepend>
              <v-avatar size="34">
                <v-img :src="profileMenuAvatar" cover />
              </v-avatar>
            </template>
          </v-list-item>

          <v-divider />

          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Profile"
            prepend-icon="mdi-account-outline"
            @click="goToOwnProfile"
            @contextmenu.prevent="openOwnProfileContextMenu($event)"
          />

          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Profile Settings"
            prepend-icon="mdi-cog-outline"
            @click="navigateTo('/Setting')"
            @contextmenu.prevent="openRouteContextMenu($event, '/Setting', 'Profile Settings')"
          />

          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Subscribed"
            prepend-icon="mdi-account-heart-outline"
            :subtitle="`${subscribedUsers.length} following`"
            @click="openSubscribedDialog"
          />

          <v-list-item
            class="dropdown-item fast-dropdown-item theme-toggle-item"
            :title="themeToggleTitle"
            :subtitle="themeToggleSubtitle"
            @click.stop="toggleTheme"
          >
            <div
              class="theme-toggle-shell"
              :class="{ 'theme-toggle-shell--dark': isDarkTheme }"
              role="switch"
              :aria-checked="String(isDarkTheme)"
              :aria-label="themeToggleTitle"
            >
              <div class="theme-toggle-track">
                <div class="theme-toggle-knob"></div>

                <div class="theme-toggle-option theme-toggle-option--light" :class="{ 'is-active': !isDarkTheme }">
                  <span>Light</span>
                  <v-icon size="15">mdi-weather-sunny</v-icon>
                </div>

                <div class="theme-toggle-option theme-toggle-option--dark" :class="{ 'is-active': isDarkTheme }">
                  <span>Dark</span>
                  <v-icon size="15">mdi-weather-night</v-icon>
                </div>
              </div>
            </div>
          </v-list-item>

          <v-list-item
            class="dropdown-item fast-dropdown-item"
            title="Logout"
            prepend-icon="mdi-logout"
            @click="logoutDialog = true"
          />
        </v-list>
      </v-menu>
    </template>

    <template v-else>
      <v-btn
        color="primary"
        variant="outlined"
        rounded="xl"
        class="login-top-btn text-none"
        @click="router.push('/O_login')"
      >
        <span class="login-btn-shine"></span>
        <span class="login-btn-text">Login</span>
      </v-btn>
    </template>


    <v-navigation-drawer
      v-model="mobileDrawer"
      temporary
      location="right"
      width="340"
      class="mobile-nav-drawer"
      :class="`theme-${currentTheme}`"
    >
      <div class="mobile-drawer-shell">
        <div class="mobile-drawer-header">
          <div
            class="d-flex align-center ga-3 mobile-drawer-brand"
            @click="goHome"
            @contextmenu.prevent="openRouteContextMenu($event, '/n_mainpage', 'Blassti Home')"
          >
            <v-avatar size="44" rounded="0" class="logo-avatar">
              <v-img :src="logoSrc" alt="Blassti Logo" contain />
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold brand-title">Blassti</div>
              <div class="text-caption text-medium-emphasis">Navigation</div>
            </div>
          </div>

          <v-btn icon variant="text" size="small" @click="mobileDrawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="mobile-drawer-search">
          <v-autocomplete
            v-model="selectedUser"
            v-model:search="userSearch"
            :items="filteredUserSearchItems"
            item-title="title"
            item-value="id"
            return-object
            variant="outlined"
            density="comfortable"
            rounded="xl"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search users..."
            hide-details
            hide-no-data
            clearable
            no-filter
            menu-icon=""
            class="user-search mobile-user-search"
            @update:modelValue="goToUserDetails"
          >
            <template #prepend-inner>
              <v-icon size="18" class="search-leading-icon">mdi-magnify</v-icon>
            </template>

            <template #append-inner>
              <v-fade-transition>
                <v-chip
                  v-if="userSearch && filteredUserSearchItems.length"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="search-chip"
                >
                  {{ filteredUserSearchItems.length }}
                </v-chip>
              </v-fade-transition>
            </template>

            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                class="dropdown-item fast-dropdown-item user-search-item"
                @contextmenu.prevent="openUserProfileContextMenu($event, item.raw)"
              >
                <template #prepend>
                  <v-avatar size="36" class="search-result-avatar">
                    <v-img :src="item.raw.avatar" cover />
                  </v-avatar>
                </template>

                <v-list-item-title class="search-result-title">
                  {{ item.raw.title }}
                </v-list-item-title>

                <v-list-item-subtitle class="search-result-subtitle">
                  {{ item.raw.subtitle }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>

            <template #selection="{ item }">
              <div
                class="d-flex align-center ga-2 selected-user-pill"
                @contextmenu.prevent="openUserProfileContextMenu($event, item.raw)"
              >
                <v-avatar size="24" class="selected-user-avatar">
                  <v-img :src="item.raw.avatar" cover />
                </v-avatar>
                <span>{{ item.raw.title }}</span>
              </div>
            </template>

            <template #no-data>
              <div class="search-empty-state">
                <v-icon size="22" class="mb-2">mdi-account-search-outline</v-icon>
                <div class="text-body-2 font-weight-medium">No users found</div>
                <div class="text-caption text-medium-emphasis">
                  Try another name, city, or role.
                </div>
              </div>
            </template>
          </v-autocomplete>
        </div>

        <v-list class="mobile-nav-list" nav>
          <v-list-subheader class="mobile-nav-subheader">Explore</v-list-subheader>

          <v-list-group value="events">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                class="mobile-nav-item"
                prepend-icon="mdi-calendar-star"
                title="Events"
              />
            </template>

            <v-list-item
              class="mobile-nav-child-item"
              title="Browse events"
              prepend-icon="mdi-calendar-star"
              @click="navigateTo('/N_Event_Browsing')"
              @contextmenu.prevent="openRouteContextMenu($event, '/N_Event_Browsing', 'Browse events')"
            />
            <v-list-item
              class="mobile-nav-child-item"
              title="My bookings"
              prepend-icon="mdi-ticket-confirmation-outline"
              @click="goProtected('/K_mybookings')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/K_mybookings', 'My bookings')"
            />
          </v-list-group>

          <v-list-group value="venues">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                class="mobile-nav-item"
                prepend-icon="mdi-map-search-outline"
                title="Venue"
              />
            </template>

            <v-list-item
              class="mobile-nav-child-item"
              title="Browse venues"
              prepend-icon="mdi-map-search-outline"
              @click="navigateTo('/venueBrowsing')"
              @contextmenu.prevent="openRouteContextMenu($event, '/venueBrowsing', 'Browse venues')"
            />
            <v-list-item
              class="mobile-nav-child-item"
              title="My venues"
              prepend-icon="mdi-domain"
              @click="goProtected('/reserved_venues')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/reserved_venues', 'My venues')"
            />
          </v-list-group>

          <v-list-group value="carpools">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                class="mobile-nav-item"
                prepend-icon="mdi-car-multiple"
                title="Carpools"
              />
            </template>

            <v-list-item
              class="mobile-nav-child-item"
              title="Current"
              prepend-icon="mdi-car-multiple"
              @click="goProtected('/O_CurrentCarpools')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/O_CurrentCarpools', 'Current carpools')"
            />
            <v-list-item
              class="mobile-nav-child-item"
              title="Search/Create"
              prepend-icon="mdi-car-search"
              @click="goProtected('/F_CarpoolCreate')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/F_CarpoolCreate', 'Search/Create carpools')"
            />
          </v-list-group>

          <v-list-group value="manage">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                class="mobile-nav-item"
                prepend-icon="mdi-cog-outline"
                title="Manage"
              />
            </template>

            <v-list-item
              class="mobile-nav-child-item"
              title="Create event"
              prepend-icon="mdi-calendar-plus"
              @click="goProtected('/CreateEvent')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/CreateEvent', 'Create event')"
            />
            <v-list-item
              class="mobile-nav-child-item"
              title="Add venue"
              prepend-icon="mdi-store-plus-outline"
              @click="goProtected('/o_CreateVenue')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/o_CreateVenue', 'Add venue')"
            />
            <v-list-item
              class="mobile-nav-child-item"
              title="Manage my venues"
              prepend-icon="mdi-store-edit-outline"
              @click="goProtected('/manageVenue')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/manageVenue', 'Manage my venues')"
            />
            <v-list-item
              class="mobile-nav-child-item"
              title="Manage my payments"
              prepend-icon="mdi-cash-multiple"
              @click="goProtected('/payments')"
              @contextmenu.prevent="openProtectedRouteContextMenu($event, '/payments', 'Manage my payments')"
            />

            <template v-if="canModerate">
              <v-list-item
                class="mobile-nav-child-item"
                title="Requests"
                prepend-icon="mdi-store-clock-outline"
                @click="navigateTo('/venueRequest')"
                @contextmenu.prevent="openRouteContextMenu($event, '/venueRequest', 'Requests')"
              />
              <v-list-item
                class="mobile-nav-child-item"
                title="Statistics"
                prepend-icon="mdi-chart-box-outline"
                @click="navigateTo('/stastistics')"
                @contextmenu.prevent="openRouteContextMenu($event, '/stastistics', 'Statistics')"
              />
              <v-list-item
                class="mobile-nav-child-item"
                title="Reports"
                prepend-icon="mdi-flag-outline"
                @click="openReportsDialog"
              />
              <v-list-item
                class="mobile-nav-child-item"
                title="Send notification"
                prepend-icon="mdi-bell-badge-outline"
                @click="openBroadcastDialog"
              />
            </template>
          </v-list-group>
        </v-list>
      </div>
    </v-navigation-drawer>

    <!-- Subscribed Dialog -->
    <v-dialog v-model="subscribedDialog" max-width="980">
      <v-card rounded="xl" class="dialog-card subscribed-dialog-card popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3 px-6 py-5">
          <div class="d-flex align-center ga-3">
            <v-avatar size="46" class="subscribed-title-avatar">
              <v-icon size="24">mdi-account-heart-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">Subscribed</div>
              <div class="text-body-2 text-medium-emphasis">
                People you follow and can jump back to anytime.
              </div>
            </div>
          </div>

          <v-btn icon variant="text" size="small" @click="subscribedDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0">
          <div v-if="subscribedUsers.length" class="subscribed-scroll">
            <v-list class="py-0 subscribed-list">
              <v-list-item
                v-for="person in subscribedUsers"
                :key="person.id"
                class="subscribed-item px-5 py-4"
                @click="goToUserProfileById(person.id)"
                @contextmenu.prevent="openUserProfileContextMenu($event, person)"
              >
                <template #prepend>
                  <v-avatar size="58" class="mr-4">
                    <v-img :src="person.profile_picture || fallbackAvatar" cover />
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold text-subtitle-1">
                  {{ person.full_name || `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Unknown user" }}
                </v-list-item-title>

                <v-list-item-subtitle class="subscribed-person-subtitle">
                  {{
                    [
                      person.is_artist ? (person.artist_type || "Artist") : "User",
                      person.city || "Unknown city",
                      `${person.subscribers_count || 0} subscribers`,
                    ].join(" • ")
                  }}
                </v-list-item-subtitle>

                <div
                  v-if="person.description"
                  class="text-body-2 text-medium-emphasis mt-2 subscribed-description"
                >
                  {{ person.description }}
                </div>

                <template #append>
                  <div class="d-flex align-center ga-2 flex-wrap justify-end">
                    <v-btn
                      variant="tonal"
                      color="primary"
                      rounded="lg"
                      class="text-none"
                      prepend-icon="mdi-open-in-new"
                      @click.stop="goToUserProfileById(person.id)"
                    >
                      Open profile
                    </v-btn>

                    <v-btn
                      variant="outlined"
                      color="error"
                      rounded="lg"
                      class="text-none"
                      prepend-icon="mdi-account-remove-outline"
                      @click.stop="unsubscribeFromSubscribedDialog(person.id)"
                    >
                      Unsubscribe
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div v-else class="subscribed-empty-state px-6 py-12 text-center">
            <v-icon size="42" class="mb-3">mdi-account-heart-outline</v-icon>
            <div class="text-h6 font-weight-bold mb-2">No subscriptions yet</div>
            <div class="text-body-2 text-medium-emphasis mx-auto subscribed-empty-copy">
              Once you subscribe to artists or users, they’ll show up here so you can open their profile fast or unsubscribe in one click.
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Reports Dialog -->
    <v-dialog v-model="reportsDialog" max-width="1120">
      <v-card rounded="xl" class="dialog-card subscribed-dialog-card popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3 px-6 py-5">
          <div class="d-flex align-center ga-3 flex-wrap">
            <v-avatar size="46" class="subscribed-title-avatar report-title-avatar">
              <v-icon size="24">mdi-flag-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold d-flex align-center ga-2 flex-wrap">
                <span>Reports</span>
                <v-chip
                  size="small"
                  color="error"
                  variant="tonal"
                  class="report-count-chip"
                >
                  {{ groupedReports.length }} account{{ groupedReports.length === 1 ? '' : 's' }}
                </v-chip>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Review all reported accounts and inspect the full report history for each user.
              </div>
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-btn
              v-if="groupedReports.length"
              variant="tonal"
              color="error"
              rounded="lg"
              class="text-none report-action-btn"
              prepend-icon="mdi-delete-sweep-outline"
              @click="requestClearAllReports"
            >
              Clear all reports
            </v-btn>

            <v-btn icon variant="text" size="small" @click="reportsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0">
          <div v-if="groupedReports.length" class="subscribed-scroll report-scroll-shell">
            <div class="report-summary-strip px-5 pt-5 pb-2">
              <div class="report-summary-card">
                <div class="report-summary-label">Moderation overview</div>
                <div class="report-summary-value">{{ groupedReports.length }}</div>
                <div class="report-summary-caption">reported account{{ groupedReports.length === 1 ? '' : 's' }} waiting for review</div>
              </div>
            </div>

            <v-list class="py-0 subscribed-list report-list-animate">
              <v-list-item
                v-for="group in groupedReports"
                :key="group.reported_user_id"
                class="subscribed-item px-5 py-4 report-group-item"
              >
                <template #prepend>
                  <v-avatar size="58" class="mr-4">
                    <v-img :src="group.reported_user?.profile_picture || fallbackAvatar" cover />
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold text-subtitle-1">
                  {{ group.reported_user?.full_name || `${group.reported_user?.first_name || ""} ${group.reported_user?.last_name || ""}`.trim() || "Deleted user" }}
                </v-list-item-title>

                <v-list-item-subtitle class="subscribed-person-subtitle">
                  {{ [
                    `${group.total_reports} report${group.total_reports > 1 ? 's' : ''}`,
                    group.reported_user?.city || 'Unknown city',
                    group.reported_user?.is_admin ? 'Admin' : group.reported_user?.is_moderator ? 'Moderator' : 'User',
                  ].join(' • ') }}
                </v-list-item-subtitle>

                <div class="text-body-2 text-medium-emphasis mt-2 subscribed-description">
                  Latest report: {{ new Date(group.latest_report_at).toLocaleString() }}
                </div>

                <template #append>
                  <div class="d-flex align-center ga-2 flex-wrap justify-end">
                    <v-btn
                      variant="tonal"
                      color="primary"
                      rounded="lg"
                      class="text-none"
                      prepend-icon="mdi-text-box-search-outline"
                      @click.stop="openReportDetails(group)"
                    >
                      Details
                    </v-btn>

                    <v-btn
                      variant="outlined"
                      color="error"
                      rounded="lg"
                      class="text-none report-action-btn"
                      prepend-icon="mdi-delete-outline"
                      @click.stop="requestClearReportsForUser(group)"
                    >
                      Clear reports
                    </v-btn>

                    <v-btn
                      v-if="group.reported_user?.id"
                      variant="outlined"
                      color="indigo"
                      rounded="lg"
                      class="text-none"
                      prepend-icon="mdi-open-in-new"
                      @click.stop="goToUserProfileById(group.reported_user.id)"
                    >
                      Open account
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div v-else class="subscribed-empty-state px-6 py-12 text-center">
            <v-icon size="42" class="mb-3">mdi-flag-outline</v-icon>
            <div class="text-h6 font-weight-bold mb-2">No reports yet</div>
            <div class="text-body-2 text-medium-emphasis mx-auto subscribed-empty-copy">
              Once users start reporting profiles, they will appear here for moderators and admins.
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Report Details Dialog -->
    <v-dialog :model-value="Boolean(selectedReportGroup)" max-width="980" @update:model-value="value => { if (!value) closeReportDetails() }">
      <v-card rounded="xl" class="dialog-card subscribed-dialog-card popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3 px-6 py-5">
          <div class="d-flex align-center ga-3">
            <v-avatar size="46" class="subscribed-title-avatar">
              <v-img :src="selectedReportGroup?.reported_user?.profile_picture || fallbackAvatar" cover />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">
                {{ selectedReportGroup?.reported_user?.full_name || `${selectedReportGroup?.reported_user?.first_name || ''} ${selectedReportGroup?.reported_user?.last_name || ''}`.trim() || 'Reported account' }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ selectedReportGroup?.total_reports || 0 }} total report{{ (selectedReportGroup?.total_reports || 0) > 1 ? 's' : '' }}
              </div>
            </div>
          </div>

          <v-btn icon variant="text" size="small" @click="closeReportDetails">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="px-6 py-5">
          <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
            <div class="report-details-banner">
              <v-icon size="18">mdi-shield-search-outline</v-icon>
              <span>Inspect each report, then clear the account history when you're done.</span>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-btn
                v-if="selectedReportGroup?.reported_user?.id"
                color="primary"
                variant="tonal"
                rounded="lg"
                prepend-icon="mdi-open-in-new"
                class="text-none"
                @click="goToUserProfileById(selectedReportGroup.reported_user.id)"
              >
                Open reported account
              </v-btn>

              <v-btn
                v-if="selectedReportGroup?.reported_user_id"
                color="error"
                variant="outlined"
                rounded="lg"
                prepend-icon="mdi-delete-outline"
                class="text-none report-action-btn"
                @click="requestClearReportsForUser(selectedReportGroup)"
              >
                Clear this user's reports
              </v-btn>
            </div>
          </div>

          <v-card
            v-for="entry in selectedReportGroup?.reasons || []"
            :key="entry.id"
            class="mb-4 pa-4 report-entry-card"
            variant="outlined"
            rounded="xl"
          >
            <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
              <div class="d-flex align-center ga-2">
                <v-icon size="18">mdi-account-alert-outline</v-icon>
                <span class="font-weight-bold">{{ entry.reason || 'No reason' }}</span>
              </div>
              <span class="text-caption text-medium-emphasis">{{ new Date(entry.created_at).toLocaleString() }}</span>
            </div>

            <div class="text-body-2 mb-2">
              <strong>Reported by:</strong>
              {{ get_User_By_Id(entry.reported_by_user_id)?.full_name || `${get_User_By_Id(entry.reported_by_user_id)?.first_name || ''} ${get_User_By_Id(entry.reported_by_user_id)?.last_name || ''}`.trim() || 'Unknown user' }}
            </div>

            <div class="text-body-2">
              <strong>Details:</strong>
              {{ entry.details || (entry.reason === 'Other' ? 'No extra details provided.' : entry.reason) }}
            </div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Clear Reports Confirm Dialog -->
    <v-dialog v-model="clearReportsDialog" max-width="520">
      <v-card rounded="xl" class="dialog-card popup-decor-card clear-reports-dialog popup-surface" :class="`popup-theme-${currentTheme}`">
        <div class="popup-orb popup-orb--one"></div>
        <div class="popup-orb popup-orb--two"></div>

        <v-card-title class="d-flex align-center justify-space-between px-6 py-5">
          <div class="d-flex align-center ga-3">
            <v-avatar size="48" class="clear-reports-avatar">
              <v-icon size="24">mdi-delete-alert-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">Clear reports</div>
              <div class="text-body-2 text-medium-emphasis">
                This removes saved report records from local storage.
              </div>
            </div>
          </div>

          <v-btn icon variant="text" size="small" @click="closeClearReportsDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 pb-2">
          <div class="clear-reports-warning">
            <v-icon size="18">mdi-alert-circle-outline</v-icon>
            <span>
              {{ clearReportsTarget.type === 'all'
                ? 'Are you sure you want to clear every saved report?'
                : `Are you sure you want to clear all reports for ${clearReportsTarget.label || 'this account'}?` }}
            </span>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end px-6 pb-6 pt-2 ga-2">
          <v-btn variant="text" class="text-none" @click="closeClearReportsDialog">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="text-none report-action-btn"
            prepend-icon="mdi-delete-sweep-outline"
            @click="executeClearReportsAction"
          >
            Confirm clear
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
      <v-list min-width="220" class="dropdown-list fast-dropdown-list popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-list-subheader>{{ linkContextMenu.label || "Open" }}</v-list-subheader>

        <v-list-item
          class="dropdown-item fast-dropdown-item"
          title="Open in new tab"
          prepend-icon="mdi-open-in-new"
          @click="openContextMenuTargetInNewTab"
        />
        <v-list-item
          class="dropdown-item fast-dropdown-item"
          title="Open in new window"
          prepend-icon="mdi-open-in-app"
          @click="openContextMenuTargetInNewWindow"
        />
      </v-list>
    </v-menu>

    <!-- Logout Dialog -->
    <v-dialog v-model="logoutDialog" max-width="430">
      <v-card rounded="xl" class="dialog-card popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon>mdi-logout</v-icon>
          Logout
        </v-card-title>

        <v-card-text>
          Are you sure you wanna logout?
        </v-card-text>

        <v-card-actions class="justify-end pb-4 px-4">
          <v-btn variant="text" @click="logoutDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" @click="logout">
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Login Required -->
    <v-dialog v-model="loginRequiredDialog" max-width="460">
      <v-card rounded="xl" class="dialog-card popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Login Required</span>

          <v-btn icon variant="text" size="small" @click="closeLoginRequiredDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          Please login first to continue.
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeLoginRequiredDialog">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" @click="goToLoginFromDialog">
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Broadcast Notification Dialog -->
    <v-dialog v-model="broadcastDialog" max-width="540">
      <v-card rounded="xl" class="dialog-card popup-surface" :class="`popup-theme-${currentTheme}`">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Send Notification</span>

          <v-btn icon variant="text" size="small" @click="closeBroadcastDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="broadcastForm.title"
            label="Title"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />

          <v-textarea
            v-model="broadcastForm.subtitle"
            label="Message"
            variant="outlined"
            rows="4"
            auto-grow
            class="mb-4"
          />

          <v-text-field
            v-model="broadcastForm.path"
            label="Optional path"
            placeholder="/N_Event_Browsing"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeBroadcastDialog">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" @click="sendBroadcast">
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :timeout="2500"
      rounded="pill"
      location="top right"
      class="app-snackbar"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="18">mdi-check-circle-outline</v-icon>
        <span>{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-app-bar>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useDisplay, useTheme } from "vuetify"
import { useRoute, useRouter } from "vue-router"
import {
  get_All_Users,
  get_Current_User,
  get_User_By_Id,
  is_Moderator,
  unsubscribe_From_Artist,
} from "@/dataModel/user"
import {
  broadcast_Notification,
  clear_Notifications_For_User,
  get_Notifications_For_User,
  get_Unread_Notifications_Count,
  mark_All_Notifications_As_Read,
  mark_Notification_As_Read,
} from "@/dataModel/notification"
import { clear_All_Reports, delete_Reports_For_User, get_Grouped_User_Reports } from "@/dataModel/report"

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"

const logoSrc = new URL("@/assets/blassti-logo.png", import.meta.url).href
const fallbackAvatar = "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=guest-user"

const snackbar = ref({ show: false, text: "" })
const logoutDialog = ref(false)
const loginRequiredDialog = ref(false)
const notificationsMenu = ref(false)
const broadcastDialog = ref(false)
const subscribedDialog = ref(false)
const reportsDialog = ref(false)
const selectedReportGroup = ref(null)
const clearReportsDialog = ref(false)
const clearReportsTarget = ref({ type: "", userId: null, label: "" })

const selectedUser = ref(null)
const userSearch = ref("")
const currentUser = ref(null)
const linkContextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  href: "",
  label: "",
})
const mobileDrawer = ref(false)

const broadcastForm = ref({
  title: "",
  subtitle: "",
  path: "",
})

const users = get_All_Users()

const isMobile = computed(() => display.mdAndDown.value)

const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})

const isDarkTheme = computed(() => currentTheme.value === "dark")

const themeToggleIcon = computed(() => {
  return isDarkTheme.value ? "mdi-weather-sunny" : "mdi-weather-night"
})

const themeToggleTitle = computed(() => {
  return isDarkTheme.value ? "Switch to light mode" : "Switch to dark mode"
})

const themeToggleSubtitle = computed(() => {
  return isDarkTheme.value ? "Dark mode is currently enabled" : "Light mode is currently enabled"
})

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)
  document.documentElement.setAttribute("data-app-theme", normalizedTheme)
  document.documentElement.style.colorScheme = normalizedTheme
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function toggleTheme() {
  applyThemeChoice(isDarkTheme.value ? "light" : "dark")
  snackbar.value = {
    show: true,
    text: `Switched to ${theme.global.name.value} mode.`,
  }
}


function syncCurrentUser() {
  const user = get_Current_User()
  currentUser.value = user || null
}

function handleWindowStorage(event) {
  if (!event.key || event.key === "currentUser") {
    syncCurrentUser()
  }

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
  syncCurrentUser()
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", syncCurrentUser)
})

onBeforeUnmount(() => {
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", syncCurrentUser)
})

watch(() => route.fullPath, () => {
  mobileDrawer.value = false
})

const canModerate = computed(() => {
  return is_Moderator(currentUser.value)
})

const fullNameFromCurrentUser = computed(() => {
  if (!currentUser.value) return "My Profile"
  return (
    currentUser.value.full_name ||
    `${currentUser.value.first_name || ""} ${currentUser.value.last_name || ""}`.trim() ||
    "My Profile"
  )
})

const profileMenuAvatar = computed(() => {
  return currentUser.value?.profile_picture || fallbackAvatar
})

const subscribedUsers = computed(() => {
  const ids = Array.isArray(currentUser.value?.subscribed_artist_ids)
    ? currentUser.value.subscribed_artist_ids
    : []

  return ids
    .map(id => get_User_By_Id(id))
    .filter(Boolean)
})

const groupedReports = computed(() => {
  return get_Grouped_User_Reports()
})

const userSearchItems = computed(() => {
  return users.map(user => ({
    id: String(user.id),
    title:
      user.full_name ||
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      "Unknown User",
    subtitle: [
      user.is_admin ? "Admin" : "",
      !user.is_admin && user.is_moderator ? "Moderator" : "",
      user.is_artist ? (user.artist_type || "Artist") : "",
      user.city || "Unknown city",
    ].filter(Boolean).join(" • "),
    avatar: user.profile_picture || fallbackAvatar,
  }))
})

const filteredUserSearchItems = computed(() => {
  const query = userSearch.value?.trim().toLowerCase()

  if (!query) {
    return userSearchItems.value.slice(0, 8)
  }

  return userSearchItems.value
    .filter(user =>
      user.title.toLowerCase().includes(query) ||
      user.subtitle.toLowerCase().includes(query)
    )
    .slice(0, 8)
})

const notifications = computed(() => {
  if (!currentUser.value?.id) return []
  return get_Notifications_For_User(currentUser.value.id)
})

const unreadCount = computed(() => {
  if (!currentUser.value?.id) return 0
  return get_Unread_Notifications_Count(currentUser.value.id)
})

function isActiveGroup(paths) {
  return paths.some(path => route.path.startsWith(path))
}

function goHome() {
  router.push("/n_mainpage")
}

function getRouteHref(path, query = undefined) {
  return router.resolve({
    path,
    query,
  }).href
}

function navigateTo(path, query = undefined) {
  router.push({
    path,
    query,
  })
}

function openHrefInNewTab(href) {
  window.open(href, "_blank", "noopener,noreferrer")
}

function openHrefInNewWindow(href) {
  window.open(href, "_blank", "noopener,noreferrer,width=1280,height=840")
}

function openRouteInNewTab(path, query = undefined) {
  openHrefInNewTab(getRouteHref(path, query))
}

function openRouteInNewWindow(path, query = undefined) {
  openHrefInNewWindow(getRouteHref(path, query))
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

function openProtectedRouteContextMenu(event, path, label, query = undefined) {
  if (!currentUser.value?.id) {
    loginRequiredDialog.value = true
    return
  }

  openRouteContextMenu(event, path, label, query)
}

function openUserProfileContextMenu(event, user) {
  if (!user?.id) return
  openRouteContextMenu(
    event,
    "/f_details",
    user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Profile",
    { id: String(user.id), t: Date.now().toString() },
  )
}

function openOwnProfileContextMenu(event) {
  if (!currentUser.value?.id) {
    loginRequiredDialog.value = true
    return
  }

  openRouteContextMenu(
    event,
    "/f_details",
    "Profile",
    { id: String(currentUser.value.id), t: Date.now().toString() },
  )
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

function goToUserDetails(userItem) {
  if (!userItem) return

  const targetId = String(userItem.id || userItem.raw?.id || "")
  if (!targetId) return

  selectedUser.value = null
  userSearch.value = ""

  navigateTo("/f_details", {
    id: targetId,
    t: Date.now().toString(),
  })
}

function goToOwnProfile() {
  if (!currentUser.value?.id) {
    router.push("/O_login")
    return
  }

  navigateTo("/f_details", {
    id: String(currentUser.value.id),
    t: Date.now().toString(),
  })
}

function goProtected(path) {
  if (!currentUser.value?.id) {
    loginRequiredDialog.value = true
    return
  }

  navigateTo(path)
}

function goToUserProfileById(userId) {
  if (!userId) return

  subscribedDialog.value = false
  navigateTo("/f_details", {
    id: String(userId),
    t: Date.now().toString(),
  })
}

function openSubscribedDialog() {
  subscribedDialog.value = true
}

function openReportsDialog() {
  if (!canModerate.value) return
  selectedReportGroup.value = null
  reportsDialog.value = true
}

function openReportDetails(group) {
  selectedReportGroup.value = group || null
}

function closeReportDetails() {
  selectedReportGroup.value = null
}

function requestClearReportsForUser(group) {
  if (!group?.reported_user_id) return

  const label =
    group.reported_user?.full_name ||
    `${group.reported_user?.first_name || ""} ${group.reported_user?.last_name || ""}`.trim() ||
    "this account"

  clearReportsTarget.value = {
    type: "user",
    userId: group.reported_user_id,
    label,
  }
  clearReportsDialog.value = true
}

function requestClearAllReports() {
  clearReportsTarget.value = {
    type: "all",
    userId: null,
    label: "",
  }
  clearReportsDialog.value = true
}

function closeClearReportsDialog() {
  clearReportsDialog.value = false
  clearReportsTarget.value = {
    type: "",
    userId: null,
    label: "",
  }
}

function executeClearReportsAction() {
  if (clearReportsTarget.value.type === "all") {
    clear_All_Reports()
    closeReportDetails()
    reportsDialog.value = false
    closeClearReportsDialog()
    snackbar.value = {
      show: true,
      text: "All reports cleared.",
    }
    return
  }

  if (clearReportsTarget.value.type === "user" && clearReportsTarget.value.userId) {
    delete_Reports_For_User(clearReportsTarget.value.userId)

    if (String(selectedReportGroup.value?.reported_user_id || "") === String(clearReportsTarget.value.userId)) {
      closeReportDetails()
    }

    const clearedLabel = clearReportsTarget.value.label || "User"
    closeClearReportsDialog()
    snackbar.value = {
      show: true,
      text: `Reports cleared for ${clearedLabel}.`,
    }
  }
}

function unsubscribeFromSubscribedDialog(userId) {
  if (!currentUser.value?.id || !userId) return

  unsubscribe_From_Artist(currentUser.value.id, userId)
  syncCurrentUser()

  snackbar.value = {
    show: true,
    text: "Subscription removed.",
  }
}

function closeLoginRequiredDialog() {
  loginRequiredDialog.value = false
}

function goToLoginFromDialog() {
  loginRequiredDialog.value = false
  router.push("/O_login")
}

function markOneAsRead(notif) {
  if (!currentUser.value?.id) return
  mark_Notification_As_Read(notif.id, currentUser.value.id)
}

function markAllAsSeen() {
  if (!currentUser.value?.id) return
  mark_All_Notifications_As_Read(currentUser.value.id)
  snackbar.value = {
    show: true,
    text: "All notifications marked as seen.",
  }
}

function handleNotificationClick(notif) {
  if (!currentUser.value?.id) return

  mark_Notification_As_Read(notif.id, currentUser.value.id)
  notificationsMenu.value = false

  if (notif.path) {
    router.push(notif.path)
  }
}

function clearNotifications() {
  if (!currentUser.value?.id) return
  clear_Notifications_For_User(currentUser.value.id)
  snackbar.value = {
    show: true,
    text: "Notifications cleared.",
  }
}

function openBroadcastDialog() {
  if (!canModerate.value) return
  broadcastDialog.value = true
}

function closeBroadcastDialog() {
  broadcastDialog.value = false
  broadcastForm.value = {
    title: "",
    subtitle: "",
    path: "",
  }
}

function sendBroadcast() {
  if (!broadcastForm.value.title.trim() || !broadcastForm.value.subtitle.trim()) {
    snackbar.value = {
      show: true,
      text: "Please fill in the title and message.",
    }
    return
  }

  broadcast_Notification({
    title: broadcastForm.value.title.trim(),
    subtitle: broadcastForm.value.subtitle.trim(),
    icon: "mdi-bell-badge-outline",
    path: broadcastForm.value.path.trim(),
    type: "manual_broadcast",
  })

  closeBroadcastDialog()

  snackbar.value = {
    show: true,
    text: "Notification sent to all users.",
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  currentUser.value = null
  logoutDialog.value = false
  notificationsMenu.value = false

  snackbar.value = {
    show: true,
    text: "Logged out successfully.",
  }

  router.push("/O_login")
}
</script>

<style scoped>
.navbar-glass {
  background:
    linear-gradient(180deg, rgba(14, 18, 28, 0.92), rgba(16, 20, 30, 0.78)) !important;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

.brand-block {
  cursor: pointer;
  transition: transform 0.22s ease, opacity 0.22s ease, filter 0.22s ease;
  border-radius: 20px;
  padding: 4px 8px 4px 0;
}

.brand-block:hover {
  transform: translateY(-1px) scale(1.02);
  filter: brightness(1.03);
}

.logo-avatar {
  background: transparent;
  overflow: visible;
  transition: transform 0.22s ease, filter 0.22s ease;
}

.brand-block:hover .logo-avatar {
  transform: scale(1.03);
  filter: drop-shadow(0 8px 18px rgba(87, 163, 255, 0.2));
}

.brand-title {
  letter-spacing: 0.2px;
  line-height: 1;
  text-shadow: 0 0 16px rgba(87, 163, 255, 0.08);
}

.brand-divider {
  margin-left: 16px;
  margin-right: 8px;
  font-size: 24px;
  opacity: 0.95;
  line-height: 1;
  color: rgba(180, 215, 255, 0.96);
  text-shadow:
    0 0 10px rgba(87, 163, 255, 0.45),
    0 0 20px rgba(87, 163, 255, 0.22);
}

.search-wrapper {
  width: 430px;
  max-width: 36vw;
  transform: translateY(-2px);
}

.user-search {
  min-width: 340px;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.user-search:focus-within {
  transform: scale(1.015);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
}

.search-leading-icon {
  opacity: 0.86;
}

.search-chip {
  font-weight: 700;
  min-width: 28px;
  justify-content: center;
}

.selected-user-pill {
  padding: 2px 4px;
  border-radius: 999px;
  transition: background 0.18s ease;
}

.selected-user-pill:hover {
  background: rgba(255, 255, 255, 0.04);
}

.selected-user-avatar,
.search-result-avatar {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.search-result-title {
  font-weight: 600;
  letter-spacing: 0.1px;
}

.search-result-subtitle {
  opacity: 0.8;
}

.search-result-open-icon {
  opacity: 0.4;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.user-search-item:hover .search-result-open-icon {
  opacity: 0.88;
  transform: translateX(1px);
}

.search-empty-state {
  padding: 18px 14px;
  text-align: center;
  opacity: 0.88;
}

:deep(.user-search .v-field) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, transform 0.22s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

:deep(.user-search .v-field:hover) {
  border-color: rgba(140, 190, 255, 0.24);
}

:deep(.user-search .v-field--focused) {
  border-color: rgba(140, 190, 255, 0.38);
  box-shadow:
    0 0 0 1px rgba(140, 190, 255, 0.12),
    0 8px 24px rgba(87, 163, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

:deep(.user-search .v-field__input) {
  font-weight: 500;
}

:deep(.user-search .v-overlay-container .v-list-item-title) {
  font-weight: 600;
}

.nav-btn {
  position: relative;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92) !important;
  transition: color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  border-radius: 14px;
  min-width: unset;
  padding-inline: 14px;
}

.nav-btn:hover {
  color: rgba(255, 255, 255, 0.98) !important;
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.nav-active {
  color: rgba(255, 255, 255, 0.98) !important;
}

.nav-active::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 6px;
  height: 2px;
  border-radius: 999px;
  background: rgba(87, 163, 255, 0.75);
  box-shadow: 0 0 14px rgba(87, 163, 255, 0.4);
}

.header-divider {
  opacity: 0.18;
}

.notif-btn,
.profile-btn {
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  border-radius: 14px;
}

.notif-btn:hover,
.profile-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.04);
}

.notif-has-items {
  color: rgb(205, 230, 255) !important;
  text-shadow: 0 0 8px rgba(87, 163, 255, 0.22);
  box-shadow: inset 0 0 18px rgba(87, 163, 255, 0.05);
}

.profile-avatar-ring {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 0 0 rgba(87, 163, 255, 0);
  transition: box-shadow 0.22s ease, transform 0.22s ease;
}

.profile-btn:hover .profile-avatar-ring {
  box-shadow:
    0 0 0 1px rgba(170, 214, 255, 0.22),
    0 0 16px rgba(87, 163, 255, 0.18);
  transform: scale(1.03);
}

.login-top-btn {
  position: relative;
  overflow: hidden;
  min-width: 110px;
  font-weight: 700;
  letter-spacing: 0.25px;
  border: 1px solid rgba(66, 153, 255, 0.85) !important;
  background: linear-gradient(
    180deg,
    rgba(10, 18, 30, 0.88),
    rgba(8, 13, 24, 0.96)
  ) !important;
  box-shadow:
    0 0 0 1px rgba(66, 153, 255, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.login-top-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(120, 190, 255, 1) !important;
  box-shadow:
    0 0 0 1px rgba(120, 190, 255, 0.14),
    0 0 18px rgba(87, 163, 255, 0.14),
    0 10px 26px rgba(0, 0, 0, 0.24);
}

.login-btn-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    rgba(255, 255, 255, 0) 20%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: translateX(-140%);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.login-top-btn:hover .login-btn-shine {
  transform: translateX(140%);
}

.login-btn-text {
  position: relative;
  z-index: 1;
}

.dropdown-list {
  background:
    linear-gradient(180deg, rgba(20, 20, 25, 0.98), rgba(18, 18, 22, 0.96));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px !important;
  padding: 8px;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28);
}

.fast-dropdown-list {
  animation: dropdownPopIn 0.16s ease-out;
  transform-origin: top right;
}

.dropdown-item {
  border-radius: 12px;
  transition: background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease;
}

.fast-dropdown-item {
  animation: itemQuickFade 0.16s ease-out;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.notifications-card {
  width: 380px;
  background:
    linear-gradient(180deg, rgba(20, 20, 25, 0.98), rgba(18, 18, 22, 0.97));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28);
}

.notifications-scroll {
  max-height: 430px;
  overflow-y: auto;
}

.notifications-scroll::-webkit-scrollbar,
.subscribed-scroll::-webkit-scrollbar {
  width: 10px;
}

.notifications-scroll::-webkit-scrollbar-thumb,
.subscribed-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.notifications-scroll::-webkit-scrollbar-track,
.subscribed-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list {
  background: transparent;
}

.notification-item {
  min-height: 76px;
  border-radius: 14px;
  margin: 6px 8px;
  transition: background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025);
}

.notification-unread {
  background: rgba(87, 163, 255, 0.06);
}

.notification-avatar {
  background: rgba(87, 163, 255, 0.1);
  color: rgb(166, 210, 255);
}

.notification-subtitle {
  white-space: normal !important;
  line-height: 1.35;
  opacity: 0.82;
}

.mark-read-btn {
  min-width: 22px !important;
  width: 22px;
  height: 22px;
}

.notif-read-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #60a5fa;
  display: inline-block;
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.38);
}

.notif-read-dot--seen {
  background: rgba(255, 255, 255, 0.18);
  opacity: 0.55;
  box-shadow: none;
}

.empty-notifications {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 26px 18px;
  text-align: center;
  opacity: 0.9;
}

.dialog-card {
  background:
    linear-gradient(180deg, rgba(20, 20, 25, 0.985), rgba(18, 18, 22, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.26);
}

.subscribed-dialog-card {
  overflow: hidden;
}

.subscribed-title-avatar {
  background: rgba(87, 163, 255, 0.1);
  color: rgb(166, 210, 255);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.subscribed-scroll {
  max-height: 68vh;
  overflow-y: auto;
}

.subscribed-list {
  background: transparent;
}

.subscribed-item {
  border-radius: 18px;
  margin: 10px 12px;
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.subscribed-item:hover {
  background: rgba(255, 255, 255, 0.035);
  transform: translateY(-1px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.subscribed-person-subtitle {
  margin-top: 3px;
  opacity: 0.84;
}

.subscribed-description {
  max-width: 720px;
  line-height: 1.5;
}

.subscribed-empty-state {
  opacity: 0.92;
}

.subscribed-empty-copy {
  max-width: 460px;
  line-height: 1.55;
}

.report-entry-card {
  background: rgba(255, 255, 255, 0.02);
}

:deep(.v-dialog .v-card-title) {
  letter-spacing: 0.15px;
}

:deep(.v-snackbar__wrapper) {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

@keyframes dropdownPopIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes itemQuickFade {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1280px) {
  .search-wrapper {
    width: 360px;
  }

  .user-search {
    min-width: 280px;
  }
}

@media (max-width: 1160px) {
  .search-wrapper {
    width: 300px;
    max-width: 28vw;
  }

  .brand-divider {
    display: none;
  }

  .nav-btn {
    padding-inline: 10px;
    font-size: 0.84rem;
  }
}


.desktop-nav-shell {
  min-width: 0;
}

.theme-switch {
  margin-inline-start: 12px;
  pointer-events: auto;
}

.theme-toggle-item {
  padding-block: 8px !important;
  cursor: pointer;
}

.theme-toggle-item :deep(.v-list-item__prepend) {
  display: none !important;
}

.theme-toggle-item :deep(.v-list-item__content) {
  overflow: visible;
}

.theme-toggle-item :deep(.v-list-item-title) {
  margin-bottom: 2px;
  font-weight: 700;
}

.theme-toggle-item :deep(.v-list-item-subtitle) {
  opacity: 0.72;
}

.theme-toggle-shell {
  width: 100%;
  margin-top: 10px;
}

.theme-toggle-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 48px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: hidden;
  transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, transform 0.18s ease;
}

.theme-toggle-shell:hover .theme-toggle-track {
  transform: translateY(-1px);
}

.theme-toggle-knob {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(244, 249, 255, 0.98), rgba(223, 236, 255, 0.96));
  border: 1px solid rgba(117, 184, 255, 0.22);
  box-shadow:
    0 10px 22px rgba(32, 92, 181, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  transform: translateX(0%);
  transition:
    transform 0.3s cubic-bezier(.2,.8,.2,1),
    background 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.theme-toggle-shell--dark .theme-toggle-knob {
  transform: translateX(100%);
  background: linear-gradient(180deg, rgba(44, 56, 82, 0.96), rgba(28, 36, 54, 0.98));
  border-color: rgba(126, 167, 255, 0.18);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.theme-toggle-option {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding-inline: 12px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.58);
  transition: color 0.22s ease, opacity 0.22s ease, transform 0.22s ease;
  user-select: none;
  white-space: nowrap;
}

.theme-toggle-option .v-icon {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.theme-toggle-option.is-active {
  color: rgba(255, 255, 255, 0.98);
}

.theme-toggle-option.is-active .v-icon {
  transform: scale(1.05);
}

.theme-toggle-item:hover .theme-toggle-option {
  transform: none;
}

.profile-dropdown-list {
  padding: 6px !important;
}

.profile-dropdown-list .dropdown-item {
  min-height: 44px;
  padding-inline: 10px !important;
}

.profile-dropdown-list .theme-toggle-item {
  min-height: 96px;
  align-items: stretch;
}

.popup-theme-light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.985), rgba(246, 250, 255, 0.975)) !important;
  border: 1px solid rgba(45, 74, 114, 0.1) !important;
  box-shadow: 0 18px 42px rgba(63, 92, 138, 0.12) !important;
  color: rgba(20, 34, 58, 0.98) !important;
}

.popup-theme-dark {
  background: linear-gradient(180deg, rgba(20, 20, 25, 0.98), rgba(18, 18, 22, 0.97)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28) !important;
}

.popup-theme-light .dropdown-item:hover,
.popup-theme-light .notification-item:hover,
.popup-theme-light .subscribed-item:hover,
.popup-theme-light .mobile-nav-item:hover,
.popup-theme-light .mobile-nav-child-item:hover {
  background: rgba(70, 120, 210, 0.06) !important;
  box-shadow: inset 0 0 0 1px rgba(70, 120, 210, 0.05);
}

.popup-theme-light .notification-unread {
  background: rgba(70, 120, 210, 0.08) !important;
}

.popup-theme-light .notification-avatar,
.popup-theme-light .subscribed-title-avatar,
.popup-theme-light .theme-toggle-prepend {
  background: rgba(70, 120, 210, 0.1);
  color: rgba(36, 76, 145, 1);
  border-color: rgba(70, 120, 210, 0.12);
}

.popup-theme-light .theme-toggle-track {
  background: linear-gradient(180deg, rgba(234, 242, 255, 0.96), rgba(220, 232, 250, 0.9));
  border-color: rgba(70, 120, 210, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 6px 18px rgba(63, 92, 138, 0.06);
}

.popup-theme-light .theme-toggle-knob {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(243, 248, 255, 0.98));
  border-color: rgba(70, 120, 210, 0.18);
  box-shadow:
    0 8px 18px rgba(63, 92, 138, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
}

.popup-theme-light .theme-toggle-shell--dark .theme-toggle-knob {
  background: linear-gradient(180deg, rgba(82, 104, 145, 0.96), rgba(58, 77, 114, 0.98));
  border-color: rgba(70, 120, 210, 0.22);
}

.popup-theme-light .theme-toggle-option {
  color: rgba(34, 59, 97, 0.62);
}

.popup-theme-light .theme-toggle-option.is-active {
  color: rgba(18, 43, 84, 0.98);
}

.popup-theme-light .notif-read-dot--seen {
  background: rgba(36, 76, 145, 0.18);
}

.theme-toggle-item :deep(.v-list-item__append) {
  margin-inline-start: 12px;
}

.mobile-menu-btn {
  border-radius: 14px;
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.mobile-menu-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.04);
}

.mobile-nav-drawer :deep(.v-navigation-drawer__content) {
  background: transparent;
}

.mobile-nav-drawer {
  border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background:
    linear-gradient(180deg, rgba(18, 22, 32, 0.98), rgba(14, 18, 28, 0.98)) !important;
  box-shadow: -16px 0 36px rgba(0, 0, 0, 0.22);
}

.mobile-drawer-shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 14px 12px 18px;
}

.mobile-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 4px 12px;
}

.mobile-drawer-brand {
  min-width: 0;
  cursor: pointer;
  border-radius: 18px;
  padding: 6px 8px;
  transition: transform 0.18s ease, background 0.18s ease;
}

.mobile-drawer-brand:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.04);
}

.mobile-drawer-search {
  padding: 4px 4px 10px;
}

.mobile-user-search {
  min-width: 0;
  width: 100%;
}

.mobile-nav-list {
  background: transparent !important;
  padding-top: 4px;
}

.mobile-nav-subheader {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  opacity: 0.7;
}

.mobile-nav-item,
.mobile-nav-child-item {
  border-radius: 16px;
  min-height: 52px;
  margin-bottom: 6px;
  transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
}

.mobile-nav-child-item {
  margin-inline-start: 10px;
}

.mobile-nav-item:hover,
.mobile-nav-child-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(1px);
}

.app-navbar.theme-light {
  background:
    linear-gradient(180deg, rgba(250, 252, 255, 0.92), rgba(243, 247, 255, 0.84)) !important;
  border-bottom: 1px solid rgba(44, 76, 122, 0.12);
  box-shadow:
    0 10px 26px rgba(82, 109, 150, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.35);
}

.app-navbar.theme-light .brand-title,
.app-navbar.theme-light .nav-btn,
.app-navbar.theme-light .notif-btn,
.app-navbar.theme-light .profile-btn,
.app-navbar.theme-light .mobile-menu-btn,
.app-navbar.theme-light .brand-divider {
  color: rgba(19, 34, 58, 0.96) !important;
  text-shadow: none;
}

.app-navbar.theme-light .nav-btn:hover,
.app-navbar.theme-light .mobile-menu-btn:hover,
.app-navbar.theme-light .notif-btn:hover,
.app-navbar.theme-light .profile-btn:hover {
  background: rgba(36, 88, 165, 0.06);
  color: rgba(15, 34, 63, 1) !important;
}

.app-navbar.theme-light .nav-active {
  color: rgba(15, 34, 63, 1) !important;
}

.app-navbar.theme-light .nav-active::after {
  background: rgba(58, 120, 219, 0.8);
  box-shadow: 0 0 12px rgba(58, 120, 219, 0.2);
}

.app-navbar.theme-light :deep(.user-search .v-field) {
  border-color: rgba(45, 74, 114, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 255, 0.94));
  box-shadow:
    0 6px 18px rgba(39, 72, 117, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.app-navbar.theme-light :deep(.user-search .v-field:hover) {
  border-color: rgba(73, 126, 205, 0.22);
}

.app-navbar.theme-light :deep(.user-search .v-field--focused) {
  border-color: rgba(73, 126, 205, 0.35);
  box-shadow:
    0 0 0 1px rgba(73, 126, 205, 0.1),
    0 10px 24px rgba(73, 126, 205, 0.08);
  background: rgba(255, 255, 255, 0.98);
}

.app-navbar.theme-light .dropdown-list,
.app-navbar.theme-light .notifications-card,
.app-navbar.theme-light .dialog-card,
.mobile-nav-drawer.theme-light {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.97));
  border: 1px solid rgba(45, 74, 114, 0.1);
  box-shadow: 0 18px 42px rgba(63, 92, 138, 0.12);
}

.app-navbar.theme-light .dropdown-item:hover,
.app-navbar.theme-light .notification-item:hover,
.app-navbar.theme-light .subscribed-item:hover,
.app-navbar.theme-light .mobile-nav-item:hover,
.app-navbar.theme-light .mobile-nav-child-item:hover {
  background: rgba(70, 120, 210, 0.06);
  box-shadow: inset 0 0 0 1px rgba(70, 120, 210, 0.05);
}

.app-navbar.theme-light .notification-unread {
  background: rgba(70, 120, 210, 0.08);
}

.app-navbar.theme-light .notification-avatar,
.app-navbar.theme-light .subscribed-title-avatar {
  background: rgba(70, 120, 210, 0.1);
  color: rgba(36, 76, 145, 1);
}

.app-navbar.theme-light .login-top-btn {
  background: linear-gradient(
    180deg,
    rgba(250, 252, 255, 0.98),
    rgba(238, 245, 255, 0.96)
  ) !important;
  color: rgba(24, 51, 94, 1) !important;
  border-color: rgba(70, 120, 210, 0.55) !important;
  box-shadow:
    0 0 0 1px rgba(70, 120, 210, 0.08),
    0 10px 26px rgba(63, 92, 138, 0.08);
}

.app-navbar.theme-light .notif-has-items {
  color: rgba(36, 76, 145, 1) !important;
  text-shadow: none;
  box-shadow: inset 0 0 18px rgba(70, 120, 210, 0.05);
}

.app-navbar.theme-light .mobile-nav-drawer {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.985), rgba(246, 250, 255, 0.98)) !important;
  border-left: 1px solid rgba(45, 74, 114, 0.1) !important;
  box-shadow: -16px 0 38px rgba(63, 92, 138, 0.12);
}

.app-navbar.theme-light .mobile-drawer-brand:hover {
  background: rgba(70, 120, 210, 0.06);
}

@media (max-width: 960px) {
  .app-navbar {
    padding-inline: 10px !important;
  }

  .brand-block {
    gap: 12px !important;
    padding-right: 0;
  }

  .brand-title {
    font-size: 1.2rem !important;
  }

  .logo-avatar {
    width: 48px !important;
    height: 48px !important;
  }

  .notif-btn,
  .profile-btn,
  .mobile-menu-btn {
    width: 42px !important;
    height: 42px !important;
  }

  .notifications-card {
    width: min(92vw, 380px);
  }

  .dropdown-list {
    max-width: min(92vw, 320px);
  }
}

@media (max-width: 600px) {
  .app-navbar {
    padding-inline: 6px !important;
  }

  .brand-title {
    font-size: 1.08rem !important;
  }

  .mobile-nav-drawer {
    width: min(92vw, 340px) !important;
  }

  .mobile-drawer-shell {
    padding: 12px 10px 16px;
  }

  .mobile-nav-item,
  .mobile-nav-child-item {
    min-height: 50px;
  }
}

</style>