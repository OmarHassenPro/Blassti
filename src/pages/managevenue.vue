<template>
  <AppNavbar />

  <div class="manage-page-shell" :class="`theme-${currentTheme}`" :style="themeCssVars">
    <v-container fluid class="py-6 py-md-8 manage-page">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="pa-4 pa-md-6 mb-6 hero-card surface-card">
          <div class="d-flex flex-column flex-lg-row align-start align-lg-center justify-space-between ga-4">
            <div class="hero-copy">
              <div class="hero-badge mb-3">
                <v-icon size="18" class="me-2">mdi-store-cog-outline</v-icon>
                Venue management workspace
              </div>
              <div class="text-h4 font-weight-bold hero-title">Manage My Venues</div>
              <div class="text-medium-emphasis hero-subtitle">
                Edit venue pricing, manage timetable slots, update pictures, and keep your venue information clean.
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap hero-chip-group">
              <v-chip color="primary" variant="tonal" class="hero-stat-chip">
                <v-icon start size="16">mdi-domain</v-icon>
                Venues: {{ managedVenues.length }}
              </v-chip>
              <v-chip color="success" variant="tonal" v-if="workingVenue" class="hero-stat-chip">
                <v-icon start size="16">mdi-check-decagram-outline</v-icon>
                {{ workingVenue.title }}
              </v-chip>
              <v-chip color="info" variant="tonal" class="hero-stat-chip" v-if="currentUser">
                <v-icon start size="16">mdi-account-circle-outline</v-icon>
                {{ currentUser.name || currentUser.username || currentUser.email || "Current user" }}
              </v-chip>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!currentUser">
      <v-card rounded="xl" class="pa-6 surface-card empty-state-card">
        <div class="d-flex align-center ga-3 mb-2"><div class="empty-state-icon"><v-icon size="24">mdi-lock-outline</v-icon></div><div class="text-h6 font-weight-bold">Login required</div></div>
        <div class="text-medium-emphasis mb-4">
          You need to login first to manage your venues.
        </div>
        <v-btn color="primary" rounded="lg" @click="router.push('/O_login')">
          Go to login
        </v-btn>
      </v-card>
    </div>

    <div v-else-if="!managedVenues.length">
      <v-card rounded="xl" class="pa-6 surface-card empty-state-card">
        <div class="d-flex align-center ga-3 mb-2"><div class="empty-state-icon"><v-icon size="24">mdi-domain-off</v-icon></div><div class="text-h6 font-weight-bold">No venues to manage</div></div>
        <div class="text-medium-emphasis mb-4">
          You currently do not own any venues to manage.
        </div>
        <v-btn color="primary" rounded="lg" @click="router.push('/o_CreateVenue')">
          Add venue
        </v-btn>
      </v-card>
    </div>

    <div v-else>
      <div v-if="!workingVenue">
        <v-row>
          <v-col cols="12">
            <v-card rounded="xl" class="pa-3 pa-md-4 sidebar-card surface-card venue-browser-card">
              <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3 mb-4">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Choose a venue to manage</div>
                  <div class="text-medium-emphasis">
                    Pick one of your venues to open the full management workspace.
                  </div>
                </div>

                <v-chip color="primary" variant="tonal" class="browser-hint-chip">
                  <v-icon start size="16">mdi-arrow-collapse-right</v-icon>
                  Workspace expands after selection
                </v-chip>
              </div>

              <v-text-field
                v-model="venueSearch"
                prepend-inner-icon="mdi-magnify"
                label="Search venue"
                density="comfortable"
                variant="outlined"
                hide-details
                class="mb-4"
              />

              <v-row>
                <v-col
                  v-for="venue in filteredManagedVenues"
                  :key="venue.id"
                  cols="12"
                  md="6"
                  xl="4"
                >
                  <v-card
                    rounded="xl"
                    class="h-100 venue-pick-card venue-browser-grid-card surface-card"
                    @click="selectVenue(venue.id)"
                  >
                    <v-img
                      :src="venue.image"
                      height="220"
                      cover
                      class="venue-pick-image"
                    >
                      <div class="venue-overlay pa-4 d-flex flex-column justify-end fill-height">
                        <div class="text-h6 font-weight-bold">
                          {{ venue.title }}
                        </div>
                        <div class="text-body-2">
                          {{ venue.location }} • {{ venue.category }}
                        </div>
                      </div>
                    </v-img>

                    <div class="pa-4">
                      <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-2">
                        <v-chip size="small" color="primary" variant="tonal">
                          {{ formatMoney(venue.price_per_hour) }}/hr
                        </v-chip>
                        <v-chip size="small" color="success" variant="tonal">
                          {{ formatMoney(venue.price_per_day) }}/day
                        </v-chip>
                      </div>

                      <div class="text-body-2 text-medium-emphasis mb-4">
                        {{ venue.owner_user_id ? "Owned by you" : "Ownerless venue you can manage" }}
                      </div>

                      <v-btn
                        color="primary"
                        rounded="lg"
                        block
                        append-icon="mdi-arrow-right"
                        @click.stop="selectVenue(venue.id)"
                      >
                        Open workspace
                      </v-btn>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-expand-transition>
                <v-card
                  v-if="!filteredManagedVenues.length"
                  rounded="xl"
                  variant="tonal"
                  class="pa-6 mt-2 clean-section-card text-center"
                >
                  <div class="text-subtitle-1 font-weight-bold mb-2">No venues match this search</div>
                  <div class="text-medium-emphasis">
                    Try another keyword to find the venue you want to manage.
                  </div>
                </v-card>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div v-else>
        <v-row class="manage-workspace-row" :class="{ 'manage-workspace-row--focused': sidebarCollapsed }">
          <v-col
            cols="12"
            :lg="sidebarCollapsed ? 1 : 4"
            :xl="sidebarCollapsed ? 1 : 3"
            class="workspace-sidebar-col"
          >
            <transition name="sidebar-swap" mode="out-in">
              <div v-if="!sidebarCollapsed" key="sidebar-open">
                <v-card rounded="xl" class="pa-3 sidebar-card sticky-panel surface-card">
                  <div class="d-flex align-center justify-space-between ga-2 px-2 py-2">
                    <div class="text-subtitle-1 font-weight-bold">Your venues</div>

                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      class="sidebar-toggle-btn"
                      @click="closeVenueBrowser"
                    >
                      <v-icon size="20">mdi-dock-left</v-icon>
                      <v-tooltip activator="parent" location="bottom">Collapse venue list</v-tooltip>
                    </v-btn>
                  </div>

                  <v-text-field
                    v-model="venueSearch"
                    prepend-inner-icon="mdi-magnify"
                    label="Search venue"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    class="mb-3"
                  />

                  <div class="venue-list">
                    <v-card
                      v-for="venue in filteredManagedVenues"
                      :key="venue.id"
                      rounded="xl"
                      class="mb-3 venue-pick-card surface-card"
                      :class="{ 'venue-pick-card--active': selectedVenueId === venue.id }"
                      @click="selectVenue(venue.id)"
                    >
                      <v-img
                        :src="venue.image"
                        height="140"
                        cover
                        class="venue-pick-image"
                      >
                        <div class="venue-overlay pa-3 d-flex flex-column justify-end fill-height">
                          <div class="text-subtitle-1 font-weight-bold">
                            {{ venue.title }}
                          </div>
                          <div class="text-caption">
                            {{ venue.location }} • {{ venue.category }}
                          </div>
                        </div>
                      </v-img>

                      <div class="pa-3">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <v-chip size="small" color="primary" variant="tonal">
                            {{ formatMoney(venue.price_per_hour) }}/hr
                          </v-chip>
                          <v-chip size="small" color="success" variant="tonal">
                            {{ formatMoney(venue.price_per_day) }}/day
                          </v-chip>
                        </div>

                        <div class="text-caption text-medium-emphasis">
                          {{ venue.owner_user_id ? "Owned by you" : "Ownerless venue you can manage" }}
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-card>
              </div>

              <div v-else key="sidebar-collapsed" class="sticky-panel collapsed-sidebar-rail">
                <v-card rounded="xl" class="surface-card collapsed-sidebar-card">
                  <div class="collapsed-sidebar-inner">
                    <v-btn
                      icon
                      color="primary"
                      variant="tonal"
                      size="large"
                      class="mb-3"
                      @click="openVenueBrowser"
                    >
                      <v-icon size="22">mdi-dock-left</v-icon>
                      <v-tooltip activator="parent" location="right">Open venue list</v-tooltip>
                    </v-btn>

                    <div class="collapsed-sidebar-label">
                      <span>Venues</span>
                    </div>

                    <v-avatar
                      size="48"
                      rounded="lg"
                      class="collapsed-sidebar-avatar mt-3"
                    >
                      <v-img :src="workingVenue?.image" cover />
                    </v-avatar>

                    <div class="collapsed-sidebar-mini-title mt-3">
                      {{ workingVenue?.title }}
                    </div>
                  </div>
                </v-card>
              </div>
            </transition>
          </v-col>

          <v-col
            cols="12"
            :lg="sidebarCollapsed ? 11 : 8"
            :xl="sidebarCollapsed ? 11 : 9"
            class="workspace-main-col"
          >
            <v-card v-if="workingVenue" rounded="xl" class="pa-4 pa-md-6 surface-card main-editor-card">
              <div class="d-flex flex-column flex-xl-row justify-space-between align-start ga-4 mb-6">
                <div class="d-flex align-start ga-3">
                  <v-btn
                    icon
                    variant="tonal"
                    color="primary"
                    class="workspace-sidebar-reveal d-none d-md-inline-flex"
                    @click="openVenueBrowser"
                  >
                    <v-icon size="20">mdi-menu-open</v-icon>
                    <v-tooltip activator="parent" location="bottom">Show venue list</v-tooltip>
                  </v-btn>

                  <div>
                    <div class="text-h5 font-weight-bold section-title">{{ workingVenue.title }}</div>
                    <div class="text-medium-emphasis mb-3">
                      {{ workingVenue.location }} • {{ workingVenue.exact_address }}
                    </div>
                    <div class="d-flex ga-2 flex-wrap">
                      <v-chip size="small" color="primary" variant="tonal">
                        <v-icon start size="14">mdi-currency-usd</v-icon>
                        {{ formatMoney(workingVenue.price_per_hour) }}/hr
                      </v-chip>
                      <v-chip size="small" color="success" variant="tonal">
                        <v-icon start size="14">mdi-currency-usd</v-icon>
                        {{ formatMoney(workingVenue.price_per_day) }}/day
                      </v-chip>
                      <v-chip size="small" color="secondary" variant="tonal">
                        <v-icon start size="14">mdi-account-group-outline</v-icon>
                        Capacity: {{ workingVenue.capacity || 0 }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap">
                  <v-chip color="info" variant="tonal" class="workspace-state-chip">
                    <v-icon start size="15">mdi-arrow-expand-horizontal</v-icon>
                    {{ sidebarCollapsed ? "Focused workspace" : "Split workspace" }}
                  </v-chip>
                  <v-chip color="error" variant="tonal">
                    Unsaved: {{ isDirty ? "Yes" : "No" }}
                  </v-chip>
                  <v-btn
                    color="error"
                    variant="outlined"
                    rounded="lg"
                    prepend-icon="mdi-delete-outline"
                    @click="deleteDialog = true"
                  >
                    Delete venue
                  </v-btn>
                </div>
              </div>

              <v-tabs v-model="tab" color="primary" class="mb-6 polished-tabs" grow>
                <v-tab value="pricing"><v-icon start size="18">mdi-cash-multiple</v-icon>Pricing</v-tab>
                <v-tab value="timeline"><v-icon start size="18">mdi-calendar-clock-outline</v-icon>Timetable</v-tab>
                <v-tab value="images"><v-icon start size="18">mdi-image-multiple-outline</v-icon>Pictures</v-tab>
                <v-tab value="info"><v-icon start size="18">mdi-information-outline</v-icon>Info</v-tab>
              </v-tabs>

              <v-window v-model="tab">
              <!-- PRICING -->
              <v-window-item value="pricing">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                      <div class="text-subtitle-1 font-weight-bold mb-4">Venue pricing</div>

                      <v-text-field
                        v-model.number="workingVenue.price_per_hour"
                        type="number"
                        min="0"
                        label="Price per hour (TND)"
                        variant="outlined"
                        density="comfortable"
                        class="mb-3"
                      />

                      <v-text-field
                        v-model.number="workingVenue.price_per_day"
                        type="number"
                        min="0"
                        label="Price per day (TND)"
                        variant="outlined"
                        density="comfortable"
                        class="mb-3"
                      />

                      <v-text-field
                        v-model.number="workingVenue.capacity"
                        type="number"
                        min="0"
                        label="Capacity"
                        variant="outlined"
                        density="comfortable"
                      />
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                      <div class="text-subtitle-1 font-weight-bold mb-4">Pricing notes</div>

                      <v-alert type="info" variant="tonal" rounded="lg" class="mb-3">
                        Venue owners can edit venue booking prices here.
                      </v-alert>

                      <v-alert type="warning" variant="tonal" rounded="lg" class="mb-3">
                        Seat ticket pricing is controlled on the event side, not on the venue side.
                      </v-alert>

                      <div class="text-body-2 text-medium-emphasis">
                        This page only manages the venue itself, its images, and its availability timeline.
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- TIMELINE -->
              <v-window-item value="timeline">
                <v-row>
                  <v-col cols="12" lg="9">
                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 clean-section-card mb-4">
                      <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4">
                        <div>
                          <div class="text-h6 font-weight-bold">Availability timeline</div>
                          <div class="text-body-2 text-medium-emphasis">
                            Same timeline view as venue booking. Double-click an administration or reservation slot to manage it. Click and drag to select multiple cells.
                          </div>
                        </div>

                        <div class="d-flex ga-2 flex-wrap">
                          <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-arrow-left" @click="scrollTimeline(-1200)">
                            Previous days
                          </v-btn>
                          <v-btn color="primary" rounded="lg" append-icon="mdi-arrow-right" @click="scrollTimeline(1200)">
                            Next days
                          </v-btn>
                        </div>
                      </div>

                      <v-row class="mb-4">
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="jumpToDate"
                            type="date"
                            label="Go to exact date"
                            variant="outlined"
                            rounded="lg"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="6" class="d-flex align-center">
                          <v-btn color="primary" rounded="lg" class="mr-2" @click="scrollToExactDate">
                            Go to date
                          </v-btn>
                          <v-btn variant="outlined" rounded="lg" @click="jumpToDate = ''">
                            Clear
                          </v-btn>
                        </v-col>
                      </v-row>

                      <div
                        ref="timelineScroller"
                        class="timeline-scroller"
                        @mouseleave="endSelection"
                      >
                        <div class="timeline-grid" :style="timelineGridStyle">
                          <div class="timeline-corner sticky-corner"></div>

                          <div
                            v-for="(day, dayIndex) in days"
                            :key="day.key + '-header'"
                            class="day-header"
                            :data-day-index="dayIndex"
                          >
                            <div class="font-weight-bold">{{ day.label }}</div>
                            <div class="text-caption text-medium-emphasis">{{ day.sub }}</div>
                          </div>

                          <template v-for="slot in timeSlots" :key="slot.label">
                            <div class="time-label">{{ slot.label }}</div>

                            <button
                              v-for="day in days"
                              :key="day.key + '-' + slot.hour"
                              type="button"
                              class="slot-cell manage-slot-cell"
                              :class="[
                                slotClass(day.date, slot.hour),
                                { selected: isCellSelected(day.date, slot.hour) }
                              ]"
                              @mousedown.prevent="handleCellMouseDown(day.date, slot.hour)"
                              @mouseenter="continueCellSelection(day.date, slot.hour)"
                              @mouseup.prevent="endSelection"
                              @dblclick.prevent="openSlotMenu($event, day.date, slot.hour)"
                              @contextmenu.prevent="handleDesktopSlotContextMenu($event, day.date, slot.hour)"
                              @touchstart.passive="handleCellTouchStart($event, day.date, slot.hour)"
                              @touchmove.passive="handleCellTouchMove"
                              @touchend.prevent="handleCellTouchEnd(day.date, slot.hour)"
                              @touchcancel="cancelCellTouchInteraction"
                            >
                              <span v-if="isEventSlot(day.date, slot.hour)">Event</span>
                              <span v-else-if="isAdministrationSlot(day.date, slot.hour)">Administration</span>
                              <span v-else-if="isBookedSlot(day.date, slot.hour)">Booked</span>
                              <span v-else>Free</span>
                            </button>
                          </template>
                        </div>
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="3">
                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 clean-section-card sticky-panel mb-4">
                      <div class="text-h6 font-weight-bold mb-4">Add administration slot</div>

                      <v-select
                        v-model="slotForm.mode"
                        :items="slotModes"
                        label="Add method"
                        variant="outlined"
                        rounded="lg"
                        class="mb-3"
                      />

                      <v-text-field
                        v-model="slotForm.label"
                        label="Label"
                        variant="outlined"
                        rounded="lg"
                        class="mb-3"
                      />

                      <v-select
                        v-model="slotForm.type"
                        :items="slotTypes"
                        label="Type"
                        variant="outlined"
                        rounded="lg"
                        class="mb-3"
                      />

                      <template v-if="slotForm.mode === 'single'">
                        <v-text-field
                          v-model="slotForm.singleDate"
                          type="date"
                          label="Date"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="slotForm.singleStart"
                          type="time"
                          label="Start time"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="slotForm.singleEnd"
                          type="time"
                          label="End time"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                      </template>

                      <template v-else-if="slotForm.mode === 'range'">
                        <v-text-field
                          v-model="slotForm.rangeStart"
                          type="datetime-local"
                          label="Range start"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="slotForm.rangeEnd"
                          type="datetime-local"
                          label="Range end"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                      </template>

                      <template v-else>
                        <v-text-field
                          v-model="slotForm.dailyStart"
                          type="time"
                          label="Daily start"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="slotForm.dailyEnd"
                          type="time"
                          label="Daily end"
                          variant="outlined"
                          rounded="lg"
                          class="mb-3"
                        />
                      </template>

                      <v-textarea
                        v-model="slotForm.notes"
                        label="Notes"
                        variant="outlined"
                        rounded="lg"
                        rows="3"
                        auto-grow
                        class="mb-4"
                      />

                      <v-btn
                        block
                        color="primary"
                        rounded="lg"
                        prepend-icon="mdi-plus"
                        class="mb-2"
                        @click="addAdministrationSlot"
                      >
                        Add slot
                      </v-btn>

                      <v-divider class="my-4" />

                      <div class="text-subtitle-2 font-weight-bold mb-3">
                        Selected cells: {{ selectedCells.length }}
                      </div>

                      <v-btn
                        block
                        color="primary"
                        variant="tonal"
                        rounded="lg"
                        class="mb-2"
                        prepend-icon="mdi-selection-drag"
                        :disabled="!hasSelectedFreeCells"
                        @click="applySelectedCellsAsAdministration"
                      >
                        Apply selection as administration
                      </v-btn>

                      <v-btn
                        block
                        color="error"
                        variant="tonal"
                        rounded="lg"
                        class="mb-2"
                        prepend-icon="mdi-delete-sweep-outline"
                        :disabled="!hasSelectedAdminCells"
                        @click="deleteSelectedAdministration"
                      >
                        Delete selected administration
                      </v-btn>

                      <v-btn
                        block
                        color="error"
                        variant="outlined"
                        rounded="lg"
                        class="mb-2"
                        prepend-icon="mdi-delete-alert-outline"
                        :disabled="!hasAnyAdministrationBlocks"
                        @click="deleteAllAdministrationBlocks"
                      >
                        Delete all administration
                      </v-btn>

                      <v-btn
                        block
                        variant="outlined"
                        rounded="lg"
                        prepend-icon="mdi-close-circle-outline"
                        :disabled="!selectedCells.length"
                        @click="clearSelectedCells"
                      >
                        Clear selection
                      </v-btn>

                      <div class="text-subtitle-2 font-weight-bold mt-6 mb-2">Legend</div>
                      <div class="legend-list">
                        <div class="legend-item"><span class="legend-dot free"></span> Free slot</div>
                        <div class="legend-item"><span class="legend-dot admin"></span> Administration</div>
                        <div class="legend-item"><span class="legend-dot booked"></span> Venue reservation</div>
                        <div class="legend-item"><span class="legend-dot event"></span> Existing event</div>
                        <div class="legend-item"><span class="legend-dot selected"></span> Selected</div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- IMAGES -->
              <v-window-item value="images">
                <v-row>
                  <v-col cols="12" xl="6">
                    <v-card rounded="xl" variant="outlined" class="pa-4 mb-4">
                      <div class="text-subtitle-1 font-weight-bold mb-4">Cover image</div>

                      <v-img
                        :src="workingVenue.image"
                        height="280"
                        cover
                        rounded="xl"
                        class="mb-4"
                      />

                      <v-file-input
                        accept="image/*"
                        label="Replace cover image"
                        prepend-icon="mdi-image-edit-outline"
                        variant="outlined"
                        density="comfortable"
                        show-size
                        @update:modelValue="handleCoverUpload"
                      />

                      <div class="text-caption text-medium-emphasis mt-2">
                        Image is cropped to a clean square before saving.
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" xl="6">
                    <v-card rounded="xl" variant="outlined" class="pa-4">
                      <div class="d-flex align-center justify-space-between mb-4">
                        <div class="text-subtitle-1 font-weight-bold">Extra images</div>
                        <v-chip size="small" variant="tonal">
                          {{ workingVenue.extra_images?.length || 0 }}/3
                        </v-chip>
                      </div>

                      <v-row>
                        <v-col
                          v-for="(img, index) in extraImageSlots"
                          :key="`extra-image-${index}`"
                          cols="12"
                          md="4"
                        >
                          <v-card rounded="lg" variant="outlined" class="pa-2 image-slot-card">
                            <v-img
                              :src="img || placeholderExtraImage"
                              height="150"
                              cover
                              rounded="lg"
                              class="mb-2"
                            />

                            <v-file-input
                              accept="image/*"
                              :label="`Image ${index + 1}`"
                              variant="outlined"
                              density="compact"
                              hide-details
                              prepend-icon=""
                              @update:modelValue="handleExtraImageUpload(index, $event)"
                            />

                            <v-btn
                              v-if="img"
                              block
                              class="mt-2"
                              color="error"
                              variant="text"
                              size="small"
                              @click="removeExtraImage(index)"
                            >
                              Remove
                            </v-btn>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- INFO -->
              <v-window-item value="info">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="workingVenue.title"
                      label="Venue title"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      :model-value="workingVenue.location"
                      label="City"
                      variant="outlined"
                      density="comfortable"
                      readonly
                      class="mb-3"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      :model-value="workingVenue.exact_address"
                      label="Exact address"
                      variant="outlined"
                      density="comfortable"
                      readonly
                      class="mb-3"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="workingVenue.description"
                      label="Description"
                      variant="outlined"
                      rows="5"
                      auto-grow
                    />
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>

            <v-divider class="my-6" />

            <div class="d-flex flex-column flex-md-row justify-end ga-3 action-footer">
              <v-btn
                variant="outlined"
                rounded="lg"
                prepend-icon="mdi-backup-restore"
                @click="resetEditor"
              >
                Reset changes
              </v-btn>

              <v-btn
                color="primary"
                rounded="lg"
                prepend-icon="mdi-content-save"
                :disabled="!isDirty"
                @click="saveVenueChanges"
              >
                Save
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
      </div>
    </div>

    <!-- Slot context menu -->
    <v-menu
      v-model="slotMenu.show"
      :style="{ position: 'fixed', left: `${slotMenu.x}px`, top: `${slotMenu.y}px`, zIndex: 9999 }"
      absolute
      :close-on-content-click="true"
    >
      <v-list class="slot-menu-list" :style="themeCssVars">
        <v-list-item
          v-if="slotMenu.slot?.canDelete"
          prepend-icon="mdi-delete-outline"
          title="Delete"
          @click="deleteSlotFromMenu"
        />
        <v-list-item
          v-if="slotMenu.slot?.canRepeat"
          prepend-icon="mdi-repeat"
          title="Repeat daily"
          @click="repeatSlotFromMenu('daily')"
        />
        <v-list-item
          v-if="slotMenu.slot?.canRepeat"
          prepend-icon="mdi-repeat-variant"
          title="Repeat weekly"
          @click="repeatSlotFromMenu('weekly')"
        />
        <v-list-item
          v-if="slotMenu.slot?.canRepeat"
          prepend-icon="mdi-calendar-sync"
          title="Repeat monthly"
          @click="repeatSlotFromMenu('monthly')"
        />
      </v-list>
    </v-menu>

    <!-- Save/discard dialog -->
    <v-dialog v-model="leaveDialog.show" max-width="500" persistent>
      <v-card rounded="xl" class="surface-card themed-dialog-card" :style="themeCssVars">
        <v-card-title class="d-flex align-center ga-2">
          <v-icon>mdi-content-save-alert-outline</v-icon>
          Unsaved changes
        </v-card-title>

        <v-card-text>
          You have unsaved venue changes. Do you want to save them before leaving this page?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="discardAndContinue">Discard</v-btn>
          <v-btn variant="outlined" @click="stayOnPage">Stay</v-btn>
          <v-btn color="primary" variant="flat" @click="saveAndContinue">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete venue dialog -->
    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card rounded="xl" class="surface-card themed-dialog-card" :style="themeCssVars">
        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="error">mdi-delete-alert-outline</v-icon>
          Delete venue
        </v-card-title>

        <v-card-text>
          <div class="mb-3">
            This will delete <strong>{{ workingVenue?.title }}</strong> and remove its venue reservations.
          </div>
          <div class="text-medium-emphasis">
            This action cannot be undone.
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDeleteVenue">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :timeout="2600" rounded="lg" :class="[`theme-snackbar`, `theme-snackbar--${currentTheme}`]">
      {{ snackbar.text }}
    </v-snackbar>
      </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue"
import { useDisplay, useTheme } from "vuetify"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import AppNavbar from "@/components/AppNavbar.vue"
import { cropAndResizeImage, fileToDataUrl } from "@/utils/imageUtils"
import {
  can_User_Manage_Venue,
  delete_Venue,
  get_All_Venues,
  get_Venue_By_Id,
  update_Venue,
} from "@/dataModel/venue"
import {
  delete_Reservations_By_Venue_Id,
  delete_Venue_Reservation,
  get_Reservations_By_Venue_Id,
} from "@/dataModel/venue_reservation"
import { get_All_Events } from "@/dataModel/event"
import { get_Current_User, is_Moderator } from "@/dataModel/user"

const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"
const isMobile = computed(() => display.mdAndDown.value)
const currentTheme = computed(() => (theme.global.name.value === "light" ? "light" : "dark"))

const themeCssVars = computed(() => {
  if (currentTheme.value === "light") {
    return {
      "--page-bg": "radial-gradient(circle at top left, rgba(25, 118, 210, 0.08), transparent 28%), linear-gradient(180deg, #f6f8fc 0%, #eef2f7 100%)",
      "--surface-bg": "rgba(255, 255, 255, 0.88)",
      "--surface-border": "rgba(15, 23, 42, 0.08)",
      "--surface-shadow": "0 16px 40px rgba(15, 23, 42, 0.08)",
      "--surface-secondary": "rgba(255, 255, 255, 0.68)",
      "--surface-strong": "rgba(255, 255, 255, 0.96)",
      "--timeline-header": "rgba(255, 255, 255, 0.96)",
      "--timeline-soft": "rgba(15, 23, 42, 0.04)",
      "--text-strong": "#102033",
      "--slot-free": "rgba(71, 85, 105, 0.12)",
      "--slot-free-text": "#263445",
      "--overlay-bg": "linear-gradient(to top, rgba(10, 17, 30, 0.8), rgba(10, 17, 30, 0.16) 58%)",
      "--hero-badge-bg": "rgba(25, 118, 210, 0.1)",
      "--hero-badge-color": "#145ea8",
    }
  }

  return {
    "--page-bg": "radial-gradient(circle at top left, rgba(66, 165, 245, 0.12), transparent 26%), linear-gradient(180deg, #0c1018 0%, #121826 100%)",
    "--surface-bg": "rgba(18, 18, 24, 0.88)",
    "--surface-border": "rgba(255, 255, 255, 0.08)",
    "--surface-shadow": "0 18px 46px rgba(0, 0, 0, 0.34)",
    "--surface-secondary": "rgba(255, 255, 255, 0.03)",
    "--surface-strong": "rgba(16, 16, 22, 0.98)",
    "--timeline-header": "rgba(16, 16, 22, 0.98)",
    "--timeline-soft": "rgba(255, 255, 255, 0.06)",
    "--text-strong": "#ffffff",
    "--slot-free": "rgba(55, 65, 81, 0.18)",
    "--slot-free-text": "rgba(255,255,255,0.85)",
    "--overlay-bg": "linear-gradient(to top, rgba(0,0,0,0.72), transparent 58%)",
    "--hero-badge-bg": "rgba(87, 163, 255, 0.14)",
    "--hero-badge-color": "#b9d8ff",
  }
})

const tab = ref("pricing")
const venueSearch = ref("")
const currentUser = ref(null)
const selectedVenueId = ref(null)
const sidebarCollapsed = ref(false)
const workingVenue = ref(null)
const originalVenueSnapshot = ref("")
const snackbar = ref({ show: false, text: "" })
const deleteDialog = ref(false)

const leaveDialog = ref({
  show: false,
  next: null,
})

const slotMenu = ref({
  show: false,
  x: 0,
  y: 0,
  slot: null,
})

const timelineScroller = ref(null)
const jumpToDate = ref("")
const selectedCells = ref([])
const isDraggingSelection = ref(false)
const dragMode = ref("add")
let cellLongPressTimer = null
let cellLongPressTriggered = false
let cellTouchMoved = false

const placeholderExtraImage =
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop"

const slotModes = [
  { title: "Single date", value: "single" },
  { title: "Date range", value: "range" },
  { title: "Daily recurring", value: "daily" },
]

const slotTypes = [
  { title: "Administration", value: "administration" },
  { title: "Maintenance", value: "maintenance" },
  { title: "Inspection", value: "inspection" },
  { title: "Renovation", value: "renovation" },
]

const slotForm = ref(defaultSlotForm())

function defaultSlotForm() {
  const today = formatDateInput(new Date())
  return {
    mode: "single",
    label: "Administration",
    type: "administration",
    notes: "",
    singleDate: today,
    singleStart: "09:00",
    singleEnd: "12:00",
    rangeStart: `${today}T09:00`,
    rangeEnd: `${today}T12:00`,
    dailyStart: "21:00",
    dailyEnd: "08:00",
  }
}

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value))
}

function formatMoney(value) {
  return `${Number(value || 0).toFixed(2)} TND`
}

function showSnack(text) {
  snackbar.value = { show: true, text }
}

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

function syncCurrentUser() {
  currentUser.value = get_Current_User()
}

watch(currentTheme, value => {
  document.documentElement.setAttribute("data-app-theme", value)
  document.documentElement.style.colorScheme = value
}, { immediate: true })

onMounted(() => {
  loadSavedTheme()
  syncCurrentUser()

  if (!managedVenues.value.length) {
    selectedVenueId.value = null
    workingVenue.value = null
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", syncCurrentUser)
  window.addEventListener("mouseup", endSelection)
})

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload)
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", syncCurrentUser)
  window.removeEventListener("mouseup", endSelection)
  cancelCellTouchInteraction()
})

const allVenues = computed(() => get_All_Venues())

const managedVenues = computed(() => {
  const user = currentUser.value
  if (!user) return []

  return allVenues.value.filter(venue => {
    if (venue.owner_user_id === user.id) return true
    if (is_Moderator(user) && !venue.owner_user_id) return true
    return false
  })
})

const filteredManagedVenues = computed(() => {
  const q = venueSearch.value.trim().toLowerCase()
  if (!q) return managedVenues.value

  return managedVenues.value.filter(venue =>
    venue.title.toLowerCase().includes(q) ||
    String(venue.location || "").toLowerCase().includes(q) ||
    String(venue.category || "").toLowerCase().includes(q)
  )
})

const isVenueFocused = computed(() => Boolean(workingVenue.value))

function toggleVenueSidebar(forceValue = null) {
  if (typeof forceValue === "boolean") {
    sidebarCollapsed.value = forceValue
    return
  }

  sidebarCollapsed.value = !sidebarCollapsed.value
}

function openVenueBrowser() {
  toggleVenueSidebar(false)
}

function closeVenueBrowser() {
  if (workingVenue.value) {
    toggleVenueSidebar(true)
  }
}

function selectVenue(venueId) {
  if (selectedVenueId.value === venueId && workingVenue.value) {
    closeVenueBrowser()
    return
  }

  if (isDirty.value) {
    leaveDialog.value = {
      show: true,
      next: () => {
        forceSelectVenue(venueId)
        closeVenueBrowser()
      },
    }
    return
  }

  forceSelectVenue(venueId)
  closeVenueBrowser()
}

function forceSelectVenue(venueId) {
  const venue = get_Venue_By_Id(venueId)
  if (!venue) return

  selectedVenueId.value = venueId
  workingVenue.value = cloneDeep(venue)
  workingVenue.value.extra_images = Array.isArray(workingVenue.value.extra_images)
    ? workingVenue.value.extra_images.slice(0, 3)
    : []
  originalVenueSnapshot.value = JSON.stringify(workingVenue.value)
  slotMenu.value.show = false
  clearSelectedCells()
}

const isDirty = computed(() => {
  if (!workingVenue.value) return false
  return JSON.stringify(workingVenue.value) !== originalVenueSnapshot.value
})

function resetEditor() {
  if (!selectedVenueId.value) return
  forceSelectVenue(selectedVenueId.value)
  showSnack("Changes reset.")
}

const extraImageSlots = computed(() => {
  const images = Array.isArray(workingVenue.value?.extra_images)
    ? workingVenue.value.extra_images
    : []

  return [images[0] || "", images[1] || "", images[2] || ""]
})

async function handleCoverUpload(fileOrFiles) {
  const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
  if (!file) return

  try {
    const dataUrl = await fileToDataUrl(file)
    const cropped = await cropAndResizeImage(dataUrl, { size: 1200 })
    workingVenue.value.image = cropped
    showSnack("Cover image updated.")
  } catch (error) {
    console.error(error)
    showSnack("Failed to update cover image.")
  }
}

async function handleExtraImageUpload(index, fileOrFiles) {
  const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
  if (!file) return

  try {
    const dataUrl = await fileToDataUrl(file)
    const cropped = await cropAndResizeImage(dataUrl, { size: 1200 })
    const nextImages = Array.isArray(workingVenue.value.extra_images)
      ? [...workingVenue.value.extra_images]
      : []

    nextImages[index] = cropped
    workingVenue.value.extra_images = nextImages.filter(Boolean).slice(0, 3)
    showSnack(`Extra image ${index + 1} updated.`)
  } catch (error) {
    console.error(error)
    showSnack("Failed to update extra image.")
  }
}

function removeExtraImage(index) {
  const nextImages = Array.isArray(workingVenue.value.extra_images)
    ? [...workingVenue.value.extra_images]
    : []

  nextImages.splice(index, 1)
  workingVenue.value.extra_images = nextImages.slice(0, 3)
  showSnack("Extra image removed.")
}

function saveVenueChanges() {
  if (!workingVenue.value || !selectedVenueId.value) return

  update_Venue(selectedVenueId.value, cloneDeep(workingVenue.value))
  originalVenueSnapshot.value = JSON.stringify(workingVenue.value)
  showSnack("Venue saved successfully.")
}

function confirmDeleteVenue() {
  if (!workingVenue.value || !selectedVenueId.value || !currentUser.value) return

  const realVenue = get_Venue_By_Id(selectedVenueId.value)
  if (!can_User_Manage_Venue(currentUser.value, realVenue)) {
    showSnack("You cannot delete this venue.")
    deleteDialog.value = false
    return
  }

  delete_Reservations_By_Venue_Id(selectedVenueId.value)
  delete_Venue(selectedVenueId.value)

  deleteDialog.value = false
  showSnack("Venue deleted.")

  const remaining = managedVenues.value.filter(v => v.id !== selectedVenueId.value)
  selectedVenueId.value = null
  workingVenue.value = null
  originalVenueSnapshot.value = ""
  clearSelectedCells()

  if (remaining.length) {
    forceSelectVenue(remaining[0].id)
  } else {
    router.push("/reserved_venues")
  }
}

function handleBeforeUnload(event) {
  if (!isDirty.value) return
  event.preventDefault()
  event.returnValue = ""
}

onBeforeRouteLeave((to, from, next) => {
  if (!isDirty.value) {
    next()
    return
  }

  leaveDialog.value = {
    show: true,
    next,
  }
})

function discardAndContinue() {
  leaveDialog.value.show = false
  const next = leaveDialog.value.next
  leaveDialog.value.next = null

  if (typeof next === "function") {
    next()
  }
}

function stayOnPage() {
  leaveDialog.value.show = false
  const next = leaveDialog.value.next
  leaveDialog.value.next = null

  if (typeof next === "function") {
    next(false)
  }
}

function saveAndContinue() {
  saveVenueChanges()
  discardAndContinue()
}

function formatDateInput(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function buildDate(dayDate, hour) {
  const d = new Date(dayDate)
  d.setHours(hour, 0, 0, 0)
  return d
}

function parseEventDateTime(eventItem) {
  const start = new Date(`${eventItem.date} ${eventItem.time}`)
  const end = new Date(`${eventItem.date} ${eventItem.end_time || eventItem.time}`)

  if (eventItem.end_time && end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1)
  }

  return { start, end }
}

const days = computed(() => {
  const out = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < 112; i += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    out.push({
      date: day,
      key: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString([], { weekday: "long" }),
      sub: day.toLocaleDateString([], { day: "2-digit", month: "short" }),
    })
  }

  return out
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour += 1) {
    slots.push({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
    })
  }
  return slots
})

const timelineGridStyle = computed(() => ({
  gridTemplateColumns: `110px repeat(${days.value.length}, ${sidebarCollapsed.value ? 246 : 210}px)`,
}))

const venueReservations = computed(() => {
  if (!workingVenue.value?.id) return []
  return get_Reservations_By_Venue_Id(workingVenue.value.id)
})

function getTimelineRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 113)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function getLocalAdministrationBlocksForRange(venue, rangeStartIso, rangeEndIso) {
  if (!venue) return []

  const rangeStart = new Date(rangeStartIso)
  const rangeEnd = new Date(rangeEndIso)

  if (!Number.isFinite(rangeStart.getTime()) || !Number.isFinite(rangeEnd.getTime())) {
    return []
  }

  const blocks = Array.isArray(venue.administration_blocks) ? venue.administration_blocks : []
  const output = []

  blocks.forEach(block => {
    if (block?.is_recurring_daily) {
      const current = new Date(rangeStart)
      current.setHours(0, 0, 0, 0)

      while (current <= rangeEnd) {
        const blockStart = new Date(current)
        blockStart.setHours(Number(block.daily_start_hour || 0), 0, 0, 0)

        const blockEnd = new Date(current)
        blockEnd.setHours(Number(block.daily_end_hour || 0), 0, 0, 0)

        if (Number(block.daily_end_hour) <= Number(block.daily_start_hour)) {
          blockEnd.setDate(blockEnd.getDate() + 1)
        }

        if (blockStart < rangeEnd && blockEnd > rangeStart) {
          output.push({
            ...block,
            occurrence_start: blockStart.toISOString(),
            occurrence_end: blockEnd.toISOString(),
          })
        }

        current.setDate(current.getDate() + 1)
      }
    } else {
      const start = new Date(block.start_datetime)
      const end = new Date(block.end_datetime)

      if (
        Number.isFinite(start.getTime()) &&
        Number.isFinite(end.getTime()) &&
        start < rangeEnd &&
        end > rangeStart
      ) {
        output.push({
          ...block,
          occurrence_start: block.start_datetime,
          occurrence_end: block.end_datetime,
        })
      }
    }
  })

  return output.sort((a, b) => {
    return new Date(a.occurrence_start).getTime() - new Date(b.occurrence_start).getTime()
  })
}

const administrationBlocks = computed(() => {
  if (!workingVenue.value?.id) return []

  const { start, end } = getTimelineRange()

  return getLocalAdministrationBlocksForRange(
    workingVenue.value,
    start.toISOString(),
    end.toISOString()
  )
})

const hasAnyAdministrationBlocks = computed(() => {
  const blocks = Array.isArray(workingVenue.value?.administration_blocks)
    ? workingVenue.value.administration_blocks
    : []
  return blocks.length > 0
})

const venueEvents = computed(() => {
  if (!workingVenue.value) return []

  return get_All_Events().filter(eventItem => {
    const venueIdMatch = String(eventItem.venue_id || "") === String(workingVenue.value.id || "")
    const venueTitleMatch =
      String(eventItem.venue || "").trim().toLowerCase() ===
      String(workingVenue.value.title || "").trim().toLowerCase()

    return venueIdMatch || venueTitleMatch
  })
})

function isEventSlot(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return venueEvents.value.some(eventItem => {
    const eventRange = parseEventDateTime(eventItem)
    return start < eventRange.end && end > eventRange.start
  })
}

function isAdministrationSlot(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return administrationBlocks.value.some(block => {
    const blockStart = new Date(block.occurrence_start || block.start_datetime)
    const blockEnd = new Date(block.occurrence_end || block.end_datetime)
    return start < blockEnd && end > blockStart
  })
}

function isBookedSlot(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return venueReservations.value
    .filter(item => item.status !== "Cancelled")
    .some(item => {
      const reservationStart = new Date(item.start_datetime || item.start_date)
      const reservationEnd = new Date(item.end_datetime || item.end_date)
      return start < reservationEnd && end > reservationStart
    })
}

function slotClass(dayDate, hour) {
  if (isEventSlot(dayDate, hour)) return "event"
  if (isAdministrationSlot(dayDate, hour)) return "admin"
  if (isBookedSlot(dayDate, hour)) return "booked"
  return "free"
}

function scrollTimeline(amount) {
  timelineScroller.value?.scrollBy({ left: amount, behavior: "smooth" })
}

function scrollToExactDate() {
  if (!jumpToDate.value || !timelineScroller.value) return

  const dayIndex = days.value.findIndex(day => day.key === jumpToDate.value)
  if (dayIndex === -1) {
    showSnack("That date is not inside the current 16-week timeline.")
    return
  }

  const leftOffset = 110 + dayIndex * 210
  timelineScroller.value.scrollTo({
    left: Math.max(0, leftOffset - 220),
    behavior: "smooth",
  })
}

function getAdministrationBlockAt(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return administrationBlocks.value.find(block => {
    const blockStart = new Date(block.occurrence_start || block.start_datetime)
    const blockEnd = new Date(block.occurrence_end || block.end_datetime)
    return start < blockEnd && end > blockStart
  }) || null
}

function getReservationAt(dayDate, hour) {
  const start = buildDate(dayDate, hour)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return venueReservations.value
    .filter(item => item.status !== "Cancelled")
    .find(item => {
      const reservationStart = new Date(item.start_datetime || item.start_date)
      const reservationEnd = new Date(item.end_datetime || item.end_date)
      return start < reservationEnd && end > reservationStart
    }) || null
}


function toggleCellSelection(dayDate, hour) {
  if (isEventSlot(dayDate, hour)) return

  if (isCellSelected(dayDate, hour)) {
    removeCellSelection(dayDate, hour)
  } else {
    addCellSelection(dayDate, hour)
  }
}

function clearCellLongPressTimer() {
  if (cellLongPressTimer) {
    clearTimeout(cellLongPressTimer)
    cellLongPressTimer = null
  }
}

function cancelCellTouchInteraction() {
  clearCellLongPressTimer()
  cellLongPressTriggered = false
  cellTouchMoved = false
  endSelection()
}

function handleCellMouseDown(dayDate, hour) {
  if (isMobile.value) return
  startCellSelection(dayDate, hour)
}

function handleDesktopSlotContextMenu(event, dayDate, hour) {
  if (isMobile.value) return
  openSlotMenu(event, dayDate, hour)
}

function handleCellTouchStart(event, dayDate, hour) {
  if (!isMobile.value) return

  cellLongPressTriggered = false
  cellTouchMoved = false

  clearCellLongPressTimer()
  cellLongPressTimer = window.setTimeout(() => {
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    const pointEvent = {
      clientX: touch?.clientX ?? window.innerWidth / 2,
      clientY: touch?.clientY ?? window.innerHeight / 2,
    }

    cellLongPressTriggered = true
    openSlotMenu(pointEvent, dayDate, hour)

    if (navigator.vibrate) {
      navigator.vibrate(15)
    }
  }, 520)
}

function handleCellTouchMove() {
  if (!isMobile.value) return
  cellTouchMoved = true
  clearCellLongPressTimer()
}

function handleCellTouchEnd(dayDate, hour) {
  if (!isMobile.value) return

  clearCellLongPressTimer()

  if (!cellLongPressTriggered && !cellTouchMoved) {
    toggleCellSelection(dayDate, hour)
  }

  cellLongPressTriggered = false
  cellTouchMoved = false
}

function openSlotMenu(event, dayDate, hour) {
  const adminBlock = getAdministrationBlockAt(dayDate, hour)
  const reservation = getReservationAt(dayDate, hour)

  let slot = null

  if (adminBlock) {
    slot = {
      kind: "admin",
      title: adminBlock.label || "Administration",
      start: new Date(adminBlock.occurrence_start || adminBlock.start_datetime),
      end: new Date(adminBlock.occurrence_end || adminBlock.end_datetime),
      sourceId: adminBlock.id,
      raw: adminBlock,
      canDelete: true,
      canRepeat: true,
      clickedDayKey: formatDateInput(new Date(dayDate)),
      clickedHour: hour,
    }
  } else if (reservation) {
    slot = {
      kind: "reservation",
      title: "Venue reservation",
      start: new Date(reservation.start_datetime || reservation.start_date),
      end: new Date(reservation.end_datetime || reservation.end_date),
      sourceId: reservation.id,
      raw: reservation,
      canDelete: true,
      canRepeat: false,
      clickedDayKey: formatDateInput(new Date(dayDate)),
      clickedHour: hour,
    }
  }

  if (!slot) return

  slotMenu.value = {
    show: false,
    x: event.clientX,
    y: event.clientY,
    slot,
  }

  requestAnimationFrame(() => {
    slotMenu.value.show = true
  })
}

function deleteSlotFromMenu() {
  const slot = slotMenu.value.slot
  slotMenu.value.show = false

  if (!slot) return

  if (slot.kind === "admin") {
    deleteAdministrationByCellKeys([`${slot.clickedDayKey}-${String(slot.clickedHour).padStart(2, "0")}`])
    showSnack("Administration cell deleted.")
    return
  }

  if (slot.kind === "reservation") {
    delete_Venue_Reservation(slot.sourceId)
    showSnack("Venue reservation deleted.")
  }
}

function repeatSlotFromMenu(mode) {
  const slot = slotMenu.value.slot
  slotMenu.value.show = false

  if (!slot || slot.kind !== "admin") return

  const start = new Date(slot.start)
  const end = new Date(slot.end)
  const duration = end.getTime() - start.getTime()

  const blocks = Array.isArray(workingVenue.value.administration_blocks)
    ? [...workingVenue.value.administration_blocks]
    : []

  const clones = []

  for (let i = 1; i <= 8; i += 1) {
    const nextStart = new Date(start)
    const nextEnd = new Date(end)

    if (mode === "daily") {
      nextStart.setDate(nextStart.getDate() + i)
      nextEnd.setTime(nextStart.getTime() + duration)
    } else if (mode === "weekly") {
      nextStart.setDate(nextStart.getDate() + i * 7)
      nextEnd.setTime(nextStart.getTime() + duration)
    } else {
      nextStart.setMonth(nextStart.getMonth() + i)
      nextEnd.setTime(nextStart.getTime() + duration)
    }

    clones.push({
      id: crypto.randomUUID(),
      label: slot.title || "Administration",
      type: slot.raw?.type || "administration",
      color: "error",
      start_datetime: nextStart.toISOString(),
      end_datetime: nextEnd.toISOString(),
      notes: slot.raw?.notes || `Repeated ${mode} block`,
      is_recurring_daily: false,
    })
  }

  workingVenue.value.administration_blocks = [...blocks, ...clones]
  showSnack(`Slot repeated ${mode}.`)
}

function toIsoSafe(localValue) {
  if (!localValue) return ""
  const date = new Date(localValue)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

function addAdministrationSlot() {
  if (!workingVenue.value) return

  const blocks = Array.isArray(workingVenue.value.administration_blocks)
    ? [...workingVenue.value.administration_blocks]
    : []

  if (slotForm.value.mode === "single") {
    if (!slotForm.value.singleDate || !slotForm.value.singleStart || !slotForm.value.singleEnd) {
      showSnack("Please fill date and times.")
      return
    }

    const start = new Date(`${slotForm.value.singleDate}T${slotForm.value.singleStart}`)
    const end = new Date(`${slotForm.value.singleDate}T${slotForm.value.singleEnd}`)

    if (end <= start) {
      end.setDate(end.getDate() + 1)
    }

    blocks.push({
      id: crypto.randomUUID(),
      label: slotForm.value.label || "Administration",
      type: slotForm.value.type || "administration",
      color: "error",
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      notes: slotForm.value.notes || "",
      is_recurring_daily: false,
    })
  } else if (slotForm.value.mode === "range") {
    const startIso = toIsoSafe(slotForm.value.rangeStart)
    const endIso = toIsoSafe(slotForm.value.rangeEnd)

    if (!startIso || !endIso || new Date(endIso) <= new Date(startIso)) {
      showSnack("Please provide a valid range.")
      return
    }

    blocks.push({
      id: crypto.randomUUID(),
      label: slotForm.value.label || "Administration",
      type: slotForm.value.type || "administration",
      color: "error",
      start_datetime: startIso,
      end_datetime: endIso,
      notes: slotForm.value.notes || "",
      is_recurring_daily: false,
    })
  } else {
    const [startHourText] = String(slotForm.value.dailyStart || "").split(":")
    const [endHourText] = String(slotForm.value.dailyEnd || "").split(":")

    const startHour = Number(startHourText)
    const endHour = Number(endHourText)

    if (!Number.isFinite(startHour) || !Number.isFinite(endHour)) {
      showSnack("Please provide valid daily hours.")
      return
    }

    blocks.push({
      id: crypto.randomUUID(),
      label: slotForm.value.label || "Administration",
      type: slotForm.value.type || "administration",
      color: "error",
      is_recurring_daily: true,
      daily_start_hour: startHour,
      daily_end_hour: endHour,
      notes: slotForm.value.notes || "",
    })
  }

  workingVenue.value.administration_blocks = blocks
  slotForm.value = defaultSlotForm()
  showSnack("Administration slot added.")
}

/* =========================
   MULTI SELECTION
========================= */

function cellKey(dayDate, hour) {
  return `${formatDateInput(new Date(dayDate))}-${String(hour).padStart(2, "0")}`
}

function isCellSelected(dayDate, hour) {
  const key = cellKey(dayDate, hour)
  return selectedCells.value.some(item => item.key === key)
}

function clearSelectedCells() {
  selectedCells.value = []
}

function addCellSelection(dayDate, hour) {
  if (isEventSlot(dayDate, hour)) return

  const key = cellKey(dayDate, hour)
  if (selectedCells.value.some(item => item.key === key)) return

  selectedCells.value.push({
    key,
    dayKey: formatDateInput(new Date(dayDate)),
    hour,
  })
}

function removeCellSelection(dayDate, hour) {
  const key = cellKey(dayDate, hour)
  selectedCells.value = selectedCells.value.filter(item => item.key !== key)
}

function startCellSelection(dayDate, hour) {
  if (isEventSlot(dayDate, hour)) return

  isDraggingSelection.value = true
  dragMode.value = isCellSelected(dayDate, hour) ? "remove" : "add"

  if (dragMode.value === "add") {
    addCellSelection(dayDate, hour)
  } else {
    removeCellSelection(dayDate, hour)
  }
}

function continueCellSelection(dayDate, hour) {
  if (!isDraggingSelection.value) return
  if (isEventSlot(dayDate, hour)) return

  if (dragMode.value === "add") {
    addCellSelection(dayDate, hour)
  } else {
    removeCellSelection(dayDate, hour)
  }
}

function endSelection() {
  isDraggingSelection.value = false
}

const hasSelectedAdminCells = computed(() => {
  return selectedCells.value.some(item => {
    const dayDate = new Date(`${item.dayKey}T00:00:00`)
    return isAdministrationSlot(dayDate, item.hour)
  })
})

const hasSelectedFreeCells = computed(() => {
  return selectedCells.value.some(item => {
    const dayDate = new Date(`${item.dayKey}T00:00:00`)
    return !isAdministrationSlot(dayDate, item.hour) && !isBookedSlot(dayDate, item.hour) && !isEventSlot(dayDate, item.hour)
  })
})

function applySelectedCellsAsAdministration() {
  if (!workingVenue.value || !selectedCells.value.length) {
    showSnack("Select cells first.")
    return
  }

  const freeCells = selectedCells.value
    .filter(item => {
      const dayDate = new Date(`${item.dayKey}T00:00:00`)
      return !isAdministrationSlot(dayDate, item.hour) && !isBookedSlot(dayDate, item.hour) && !isEventSlot(dayDate, item.hour)
    })
    .sort((a, b) => {
      if (a.dayKey === b.dayKey) return a.hour - b.hour
      return a.dayKey.localeCompare(b.dayKey)
    })

  if (!freeCells.length) {
    showSnack("No free cells selected.")
    return
  }

  const grouped = {}

  freeCells.forEach(cell => {
    if (!grouped[cell.dayKey]) grouped[cell.dayKey] = []
    grouped[cell.dayKey].push(cell.hour)
  })

  const blocks = Array.isArray(workingVenue.value.administration_blocks)
    ? [...workingVenue.value.administration_blocks]
    : []

  Object.entries(grouped).forEach(([dayKey, hours]) => {
    const sortedHours = [...new Set(hours)].sort((a, b) => a - b)

    let rangeStart = sortedHours[0]
    let prev = sortedHours[0]

    for (let i = 1; i <= sortedHours.length; i += 1) {
      const current = sortedHours[i]

      if (current === prev + 1) {
        prev = current
        continue
      }

      const start = new Date(`${dayKey}T${String(rangeStart).padStart(2, "0")}:00:00`)
      const end = new Date(`${dayKey}T${String(prev + 1).padStart(2, "0")}:00:00`)

      blocks.push({
        id: crypto.randomUUID(),
        label: slotForm.value.label || "Administration",
        type: slotForm.value.type || "administration",
        color: "error",
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        notes: slotForm.value.notes || "",
        is_recurring_daily: false,
      })

      rangeStart = current
      prev = current
    }
  })

  workingVenue.value.administration_blocks = blocks
  showSnack("Selected cells turned into administration slots.")
  clearSelectedCells()
}

function expandAdministrationOccurrencesToHourCells() {
  const cellsMap = new Map()

  administrationBlocks.value.forEach(block => {
    const start = new Date(block.occurrence_start || block.start_datetime)
    const end = new Date(block.occurrence_end || block.end_datetime)

    const cursor = new Date(start)
    cursor.setMinutes(0, 0, 0)

    while (cursor < end) {
      const key = `${formatDateInput(cursor)}-${String(cursor.getHours()).padStart(2, "0")}`
      if (!cellsMap.has(key)) {
        cellsMap.set(key, {
          key,
          dayKey: formatDateInput(cursor),
          hour: cursor.getHours(),
          label: block.label || "Administration",
          type: block.type || "administration",
          notes: block.notes || "",
          color: block.color || "error",
        })
      }
      cursor.setHours(cursor.getHours() + 1)
    }
  })

  return [...cellsMap.values()].sort((a, b) => {
    if (a.dayKey === b.dayKey) return a.hour - b.hour
    return a.dayKey.localeCompare(b.dayKey)
  })
}

function rebuildAdministrationBlocksFromHourCells(hourCells) {
  const grouped = {}

  hourCells.forEach(cell => {
    const signature = JSON.stringify({
      label: cell.label || "Administration",
      type: cell.type || "administration",
      notes: cell.notes || "",
      color: cell.color || "error",
      dayKey: cell.dayKey,
    })

    if (!grouped[signature]) {
      grouped[signature] = []
    }

    grouped[signature].push(cell.hour)
  })

  const rebuilt = []

  Object.entries(grouped).forEach(([signature, hours]) => {
    const meta = JSON.parse(signature)
    const sortedHours = [...new Set(hours)].sort((a, b) => a - b)

    let rangeStart = sortedHours[0]
    let prev = sortedHours[0]

    for (let i = 1; i <= sortedHours.length; i += 1) {
      const current = sortedHours[i]

      if (current === prev + 1) {
        prev = current
        continue
      }

      const start = new Date(`${meta.dayKey}T${String(rangeStart).padStart(2, "0")}:00:00`)
      const end = new Date(`${meta.dayKey}T${String(prev + 1).padStart(2, "0")}:00:00`)

      rebuilt.push({
        id: crypto.randomUUID(),
        label: meta.label,
        type: meta.type,
        color: meta.color,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        notes: meta.notes,
        is_recurring_daily: false,
      })

      rangeStart = current
      prev = current
    }
  })

  return rebuilt
}

function deleteAdministrationByCellKeys(keysToDelete) {
  if (!workingVenue.value) return

  const deleteSet = new Set(keysToDelete)
  const currentHourCells = expandAdministrationOccurrencesToHourCells()
  const remainingHourCells = currentHourCells.filter(cell => !deleteSet.has(cell.key))
  const rebuiltBlocks = rebuildAdministrationBlocksFromHourCells(remainingHourCells)

  workingVenue.value.administration_blocks = rebuiltBlocks
}

function deleteSelectedAdministration() {
  if (!workingVenue.value || !selectedCells.value.length) {
    showSnack("Select administration cells first.")
    return
  }

  const selectedAdminCellKeys = selectedCells.value
    .filter(item => {
      const dayDate = new Date(`${item.dayKey}T00:00:00`)
      return isAdministrationSlot(dayDate, item.hour)
    })
    .map(item => item.key)

  if (!selectedAdminCellKeys.length) {
    showSnack("No administration cells selected.")
    return
  }

  deleteAdministrationByCellKeys(selectedAdminCellKeys)
  clearSelectedCells()
  showSnack("Selected administration cells deleted.")
}

function deleteAllAdministrationBlocks() {
  if (!workingVenue.value) return
  workingVenue.value.administration_blocks = []
  clearSelectedCells()
  showSnack("All administration blocks deleted.")
}

watch(tab, () => {
  slotMenu.value.show = false
})

watch(selectedVenueId, () => {
  slotMenu.value.show = false
})

watch(workingVenue, value => {
  if (!value) {
    toggleVenueSidebar(false)
  }
})
</script>

<style scoped>
.manage-page-shell {
  min-height: 100vh;
  transition: background 0.25s ease, color 0.25s ease;
}

.manage-page-shell.theme-light {
  --page-bg: radial-gradient(circle at top left, rgba(25, 118, 210, 0.08), transparent 28%), linear-gradient(180deg, #f6f8fc 0%, #eef2f7 100%);
  --surface-bg: rgba(255, 255, 255, 0.88);
  --surface-border: rgba(15, 23, 42, 0.08);
  --surface-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  --surface-secondary: rgba(255, 255, 255, 0.68);
  --surface-strong: rgba(255, 255, 255, 0.96);
  --timeline-header: rgba(255, 255, 255, 0.96);
  --timeline-soft: rgba(15, 23, 42, 0.04);
  --text-strong: #102033;
  --slot-free: rgba(71, 85, 105, 0.12);
  --slot-free-text: #263445;
  --overlay-bg: linear-gradient(to top, rgba(10, 17, 30, 0.8), rgba(10, 17, 30, 0.16) 58%);
  --hero-badge-bg: rgba(25, 118, 210, 0.1);
  --hero-badge-color: #145ea8;
}

.manage-page-shell.theme-dark {
  --page-bg: radial-gradient(circle at top left, rgba(66, 165, 245, 0.12), transparent 26%), linear-gradient(180deg, #0c1018 0%, #121826 100%);
  --surface-bg: rgba(18, 18, 24, 0.88);
  --surface-border: rgba(255, 255, 255, 0.08);
  --surface-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
  --surface-secondary: rgba(255, 255, 255, 0.03);
  --surface-strong: rgba(16, 16, 22, 0.98);
  --timeline-header: rgba(16, 16, 22, 0.98);
  --timeline-soft: rgba(255, 255, 255, 0.06);
  --text-strong: #ffffff;
  --slot-free: rgba(55, 65, 81, 0.18);
  --slot-free-text: rgba(255,255,255,0.85);
  --overlay-bg: linear-gradient(to top, rgba(0,0,0,0.72), transparent 58%);
  --hero-badge-bg: rgba(87, 163, 255, 0.14);
  --hero-badge-color: #b9d8ff;
}

.manage-page {
  min-height: 100vh;
  background: var(--page-bg);
  transition: background 0.25s ease;
}

.surface-card {
  background: var(--surface-bg) !important;
  border: 1px solid var(--surface-border);
  box-shadow: var(--surface-shadow);
  backdrop-filter: blur(14px);
}

.hero-card {
  overflow: hidden;
  position: relative;
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(25, 118, 210, 0.14), transparent 30%),
    radial-gradient(circle at bottom left, rgba(76, 175, 80, 0.12), transparent 28%);
  pointer-events: none;
}

.hero-copy,
.hero-chip-group {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--hero-badge-bg);
  color: var(--hero-badge-color);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-title {
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 760px;
  line-height: 1.65;
}

.hero-stat-chip {
  min-height: 38px;
  font-weight: 700;
}

.empty-state-card {
  max-width: 760px;
}

.empty-state-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--hero-badge-bg);
  color: var(--hero-badge-color);
}


.venue-browser-card {
  position: relative;
  overflow: hidden;
}

.venue-browser-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top right, rgba(25, 118, 210, 0.09), transparent 24%),
    radial-gradient(circle at bottom left, rgba(76, 175, 80, 0.08), transparent 22%);
}

.browser-hint-chip {
  font-weight: 700;
}

.venue-browser-grid-card {
  border-width: 1px;
}

.manage-workspace-row {
  align-items: stretch;
}

.workspace-sidebar-col,
.workspace-main-col {
  transition: all 0.28s ease;
}

.workspace-main-col {
  position: relative;
}

.collapsed-sidebar-rail {
  height: 100%;
}

.collapsed-sidebar-card {
  min-height: calc(100vh - 154px);
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
}

.collapsed-sidebar-inner {
  width: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 18px 10px;
  gap: 6px;
}

.collapsed-sidebar-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--hero-badge-color);
  opacity: 0.9;
}

.collapsed-sidebar-avatar {
  border: 1px solid var(--surface-border);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

.collapsed-sidebar-mini-title {
  max-width: 70px;
  text-align: center;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-strong);
}

.workspace-sidebar-reveal {
  flex-shrink: 0;
}

.workspace-state-chip {
  font-weight: 700;
}

.sidebar-toggle-btn {
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.sidebar-toggle-btn:hover {
  transform: translateX(-1px);
}

.sidebar-swap-enter-active,
.sidebar-swap-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.sidebar-swap-enter-from,
.sidebar-swap-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.main-editor-card {
  position: relative;
  overflow: hidden;
}

.main-editor-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}

.section-title {
  letter-spacing: -0.015em;
}

.polished-tabs :deep(.v-slide-group__content) {
  gap: 8px;
}

.polished-tabs :deep(.v-tab) {
  border-radius: 14px;
  min-height: 48px;
  text-transform: none;
  font-weight: 700;
}

.polished-tabs :deep(.v-tab--selected) {
  background: rgba(25, 118, 210, 0.12);
}

.action-footer {
  padding-top: 4px;
}


.sidebar-card {
  background: var(--surface-bg);
}

.sticky-panel {
  position: sticky;
  top: 96px;
}

.venue-list {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  padding-right: 4px;
}

.venue-pick-card {
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  border: 1px solid var(--surface-border);
}

.venue-pick-card:hover {
  transform: translateY(-2px);
  border-color: rgba(87, 163, 255, 0.34);
}

.venue-pick-card--active {
  border-color: rgba(87, 163, 255, 0.65);
  box-shadow: 0 0 0 1px rgba(87, 163, 255, 0.18), var(--surface-shadow);
}

.venue-overlay {
  background: var(--overlay-bg);
  color: white;
}

.image-slot-card {
  height: 100%;
}

.slot-menu-list {
  min-width: 220px;
  background: var(--surface-strong);
  border: 1px solid var(--surface-border);
}

.clean-section-card {
  background: var(--surface-secondary);
}

.timeline-scroller {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  border-radius: 20px;
  border: 1px solid var(--surface-border);
  background: linear-gradient(180deg, var(--surface-secondary), rgba(255,255,255,0.01));
}

.timeline-grid {
  display: grid;
  min-width: max-content;
}

.timeline-corner {
  position: sticky;
  left: 0;
  top: 0;
  z-index: 4;
  min-height: 64px;
  background: var(--timeline-header);
  border-right: 1px solid var(--surface-border);
  border-bottom: 1px solid var(--surface-border);
}

.sticky-corner {
  backdrop-filter: blur(10px);
}

.day-header {
  position: sticky;
  top: 0;
  z-index: 3;
  min-height: 64px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background: var(--timeline-header);
  border-right: 1px solid var(--surface-border);
  border-bottom: 1px solid var(--surface-border);
}

.time-label {
  position: sticky;
  left: 0;
  z-index: 2;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--timeline-header);
  border-right: 1px solid var(--surface-border);
  border-bottom: 1px solid var(--timeline-soft);
  font-weight: 700;
}

.slot-cell {
  min-height: 56px;
  border: none;
  border-right: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid var(--timeline-soft);
  font-weight: 700;
  font-size: 0.82rem;
  transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}

.manage-slot-cell:hover {
  transform: scale(0.985);
}

.slot-cell.free {
  background: var(--slot-free);
  color: var(--slot-free-text);
}

.slot-cell.admin {
  background: linear-gradient(135deg, #c62828, #8e1111);
  color: white;
}

.slot-cell.booked {
  background: linear-gradient(135deg, #1976d2, #0b4da2);
  color: white;
}

.slot-cell.event {
  background: linear-gradient(135deg, #f59e0b, #c77800);
  color: white;
}

.slot-cell.selected {
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.95);
  outline: 2px solid rgba(135, 206, 250, 0.95);
  outline-offset: -2px;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  display: inline-block;
}

.legend-dot.free {
  background: var(--slot-free);
}

.legend-dot.admin {
  background: #c62828;
}

.legend-dot.booked {
  background: #1976d2;
}

.legend-dot.event {
  background: #f59e0b;
}

.legend-dot.selected {
  background: #ffffff;
  border: 2px solid #7dd3fc;
}

.venue-pick-image :deep(img),
.image-slot-card :deep(img),
.main-editor-card :deep(.v-img__img),
.surface-card :deep(.v-img__img) {
  transition: transform 0.35s ease;
}

.venue-pick-card:hover .venue-pick-image :deep(img),
.image-slot-card:hover :deep(img) {
  transform: scale(1.035);
}

.timeline-scroller::-webkit-scrollbar,
.venue-list::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.timeline-scroller::-webkit-scrollbar-thumb,
.venue-list::-webkit-scrollbar-thumb {
  background: rgba(128, 144, 170, 0.45);
  border-radius: 999px;
}

.timeline-scroller::-webkit-scrollbar-track,
.venue-list::-webkit-scrollbar-track {
  background: transparent;
}


.themed-dialog-card {
  color: var(--text-strong);
}

.theme-snackbar {
  backdrop-filter: blur(14px);
}

:deep(.theme-snackbar--light .v-snackbar__wrapper) {
  background: rgba(255, 255, 255, 0.94) !important;
  color: #102033 !important;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

:deep(.theme-snackbar--dark .v-snackbar__wrapper) {
  background: rgba(18, 18, 24, 0.94) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
}

.manage-page-shell {
  overflow-x: hidden;
}

.hero-card,
.venue-browser-card,
.main-editor-card,
.sidebar-card,
.clean-section-card,
.empty-state-card {
  animation: pageEntrance 0.24s ease-out;
}

@keyframes pageEntrance {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1279px) {
  .sticky-panel {
    position: static;
    top: auto;
  }

  .collapsed-sidebar-card {
    min-height: 100%;
  }
}

@media (max-width: 1280px) {
  .workspace-sidebar-col,
  .workspace-main-col {
    transition: none;
  }
}


@media (max-width: 959px) {
  .manage-page {
    padding-left: 4px;
    padding-right: 4px;
  }

  .hero-copy,
  .hero-chip-group {
    width: 100%;
  }

  .hero-chip-group {
    justify-content: flex-start;
  }

  .hero-stat-chip {
    min-height: 40px;
  }

  .venue-list {
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }

  .slot-cell {
    min-height: 60px;
    font-size: 0.8rem;
  }

  .day-header,
  .timeline-corner {
    min-height: 68px;
  }

  .time-label {
    min-height: 60px;
    min-width: 74px;
    padding-inline: 8px;
  }
}

@media (max-width: 599px) {
  .hero-title {
    font-size: 1.55rem !important;
    line-height: 1.18;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .hero-badge {
    padding: 7px 12px;
    font-size: 0.82rem;
  }

  .collapsed-sidebar-card {
    min-height: auto;
  }

  .action-footer :deep(.v-btn) {
    width: 100%;
  }
}

@media (max-width: 959px) {
  .collapsed-sidebar-rail {
    display: none;
  }

  .workspace-sidebar-reveal {
    display: inline-flex !important;
  }

  .hero-title {
    font-size: 1.9rem !important;
  }

  .timeline-grid {
    font-size: 0.92rem;
  }
}
</style>