<template>
  <AppNavbar />

  <div
    class="bundle-builder-shell"
    :class="[
      browserThemeClass,
      `theme-${currentTheme}`,
      { 'bundle-builder-mobile': isMobile, 'bundle-builder-tablet': isTablet },
    ]"
  >
    <v-container class="page-main px-4 px-sm-6 px-md-8 py-6 py-md-8">
      <v-card rounded="xl" class="hero-card pa-5 pa-md-7 mb-6" elevation="0">
        <div class="hero-glow hero-glow--one" />
        <div class="hero-glow hero-glow--two" />

        <div class="hero-center position-relative">
          <div class="hero-copy hero-copy--centered mx-auto text-center">
            <div class="hero-badge mb-4">
              <v-icon size="18">mdi-timeline-plus-outline</v-icon>
              <span>{{ editingExisting ? 'Edit bundle' : 'Create bundle' }}</span>
            </div>

            <div class="text-h4 text-sm-h3 font-weight-black mb-3 hero-title">
              Turn a date range into a clean event timeline.
            </div>

            <div class="text-body-1 text-medium-emphasis hero-subtitle mx-auto">
              Choose your days, tap each timeline slot, then fill it with the event you want for that date.
              When you are ready, save it or buy the whole bundle with one payment.
            </div>

            <div class="d-flex flex-wrap justify-center ga-2 mt-5 hero-chip-row">
              <v-chip rounded="pill" variant="tonal" class="hero-chip">
                <v-icon start size="16">mdi-calendar-range</v-icon>
                Up to 7 days
              </v-chip>
              <v-chip rounded="pill" variant="tonal" class="hero-chip">
                <v-icon start size="16">mdi-ticket-percent-outline</v-icon>
                10% bundle discount
              </v-chip>
              <v-chip rounded="pill" variant="tonal" class="hero-chip">
                <v-icon start size="16">mdi-image-multiple-outline</v-icon>
                Timeline preview
              </v-chip>
              <v-chip rounded="pill" variant="tonal" class="hero-chip">
                <v-icon start size="16">mdi-seat-outline</v-icon>
                Random seats on checkout
              </v-chip>
            </div>
          </div>
        </div>
      </v-card>

      <template v-if="!currentUser">
        <v-card rounded="xl" class="login-card pa-7 text-center" elevation="0">
          <div class="empty-icon mb-4">
            <v-icon size="34">mdi-lock-outline</v-icon>
          </div>
          <div class="text-h6 font-weight-bold mb-2">Login required</div>
          <div class="text-medium-emphasis mb-5">
            You need to log in before creating or buying a bundle.
          </div>
          <v-btn color="primary" rounded="lg" size="large" class="action-btn" @click="router.push('/O_login')">
            <v-icon start>mdi-login</v-icon>
            Go to login
          </v-btn>
        </v-card>
      </template>

      <template v-else>
        <v-row class="mb-6">
          <v-col cols="12" xl="4">
            <v-card rounded="xl" class="panel-card pa-4 pa-md-5 h-100" elevation="0">
              <div class="panel-header mb-4">
                <div>
                  <div class="text-h6 font-weight-bold">Bundle setup</div>
                  <div class="text-medium-emphasis">Name it, pick the range, then fine-tune the timeline.</div>
                </div>
              </div>

              <v-text-field
                v-model="bundleTitle"
                label="Bundle title"
                placeholder="Weekend combo, summer sprint, cinema run..."
                variant="outlined"
                density="comfortable"
                rounded="xl"
                prepend-inner-icon="mdi-format-title"
                class="mb-4"
              />

              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="startDate"
                    type="date"
                    label="Start date"
                    variant="outlined"
                    density="comfortable"
                    rounded="xl"
                    prepend-inner-icon="mdi-calendar-start"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="endDate"
                    type="date"
                    label="End date"
                    variant="outlined"
                    density="comfortable"
                    rounded="xl"
                    prepend-inner-icon="mdi-calendar-end"
                  />
                </v-col>
              </v-row>

              <v-alert
                v-if="rangeWarning"
                type="warning"
                variant="tonal"
                rounded="xl"
                class="mb-4"
              >
                {{ rangeWarning }}
              </v-alert>

              <v-alert
                v-if="requiresDateSelection"
                type="info"
                variant="tonal"
                rounded="xl"
                class="mb-4"
              >
                Your range has {{ allRangeDates.length }} days. Bundles support up to 7, so choose the exact days you want below.
              </v-alert>

              <div v-if="allRangeDates.length" class="mb-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">Days in this range</div>
                <div class="date-chip-wrap">
                  <v-chip
                    v-for="dateKey in allRangeDates"
                    :key="dateKey"
                    rounded="pill"
                    :variant="isDateSelected(dateKey) ? 'flat' : 'outlined'"
                    :color="isDateSelected(dateKey) ? 'primary' : undefined"
                    class="date-chip"
                    @click="toggleDate(dateKey)"
                  >
                    <v-icon start size="14">{{ isDateSelected(dateKey) ? 'mdi-check' : 'mdi-calendar-blank-outline' }}</v-icon>
                    {{ formatChipDate(dateKey) }}
                  </v-chip>
                </div>
              </div>

              <v-textarea
                v-model="bundleNotes"
                label="Notes (optional)"
                placeholder="Add a quick note for yourself..."
                variant="outlined"
                rounded="xl"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-note-text-outline"
                class="mb-4"
              />

              <div class="setup-summary">
                <div class="summary-row">
                  <span>Selected range</span>
                  <strong>{{ selectedRangeLabel }}</strong>
                </div>
                <div class="summary-row">
                  <span>Days on timeline</span>
                  <strong>{{ timelineDates.length }}</strong>
                </div>
                <div class="summary-row">
                  <span>Events added</span>
                  <strong>{{ filledTimelineCount }}</strong>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" xl="8">
            <v-card rounded="xl" class="panel-card pa-4 pa-md-5 h-100" elevation="0">
              <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3 mb-5">
                <div>
                  <div class="text-h6 font-weight-bold">Interactive timeline</div>
                  <div class="text-medium-emphasis">
                    Click a slot or the circle to pick an event for that day.
                  </div>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-btn variant="outlined" rounded="lg" class="text-none" @click="resetTimeline">
                    <v-icon start>mdi-refresh</v-icon>
                    Reset draft
                  </v-btn>
                  <v-btn color="primary" rounded="lg" class="text-none" @click="saveBundleDraft">
                    <v-icon start>mdi-content-save-outline</v-icon>
                    Save bundle
                  </v-btn>
                  <v-btn color="success" rounded="lg" class="text-none" :disabled="!filledTimelineCount" @click="openPaymentDialog">
                    <v-icon start>mdi-credit-card-outline</v-icon>
                    Save & buy
                  </v-btn>
                </div>
              </div>

              <div v-if="!timelineDates.length" class="timeline-empty text-center py-10">
                <div class="empty-icon mb-4">
                  <v-icon size="34">mdi-timeline-alert-outline</v-icon>
                </div>
                <div class="text-h6 font-weight-bold mb-2">Your timeline is waiting</div>
                <div class="text-medium-emphasis mx-auto timeline-empty-copy">
                  Pick a valid start and end date first. Once dates are ready, the timeline will appear here automatically.
                </div>
              </div>

              <div v-else class="timeline-shell">
                <div class="timeline-scroll">
                  <div class="timeline-track" :style="timelineTrackStyle">
                    <div class="timeline-line" />

                    <div
                      v-for="(entry, index) in timelineEntriesView"
                      :key="entry.date_key"
                      class="timeline-slot"
                    >
                      <div
                        class="timeline-card-wrap"
                        :class="isTopCard(index) ? 'timeline-card-wrap--top' : 'timeline-card-wrap--bottom'"
                      >
                        <v-card
                          rounded="xl"
                          class="timeline-event-card"
                          :class="{ 'timeline-event-card--empty': !entry.event }"
                          elevation="0"
                          @click="entry.event ? openEventDetails(entry, index) : openEventPicker(entry, index)"
                        >
                          <template v-if="entry.event">
                            <v-img :src="entry.event.image || entry.event.images?.[0]" height="120" cover class="timeline-card-image">
                              <template #placeholder>
                                <div class="w-100 h-100 d-flex align-center justify-center placeholder-surface">
                                  <v-icon size="28">mdi-image-outline</v-icon>
                                </div>
                              </template>
                            </v-img>

                            <div class="pa-3">
                              <div class="text-subtitle-2 font-weight-bold text-truncate mb-1">
                                {{ entry.event.title }}
                              </div>
                              <div class="text-caption text-medium-emphasis mb-2 text-truncate">
                                {{ entry.event.time }} • {{ entry.event.city }}
                              </div>
                              <v-chip size="x-small" rounded="pill" variant="tonal" class="timeline-chip">
                                <v-icon start size="12">mdi-shape-outline</v-icon>
                                {{ entry.event.type }}
                              </v-chip>
                            </div>
                          </template>

                          <template v-else>
                            <div class="timeline-empty-card pa-4">
                              <div class="timeline-empty-icon mb-3">
                                <v-icon size="26">mdi-help</v-icon>
                              </div>
                              <div class="font-weight-bold mb-1">Choose an event</div>
                              <div class="text-caption text-medium-emphasis mb-3">
                                Pick from every event happening on this date.
                              </div>
                              <v-btn size="small" rounded="pill" variant="outlined" class="text-none">
                                <v-icon start size="14">mdi-plus</v-icon>
                                Select
                              </v-btn>
                            </div>
                          </template>
                        </v-card>
                      </div>

                      <div
                        class="timeline-date"
                        :class="isTopCard(index) ? 'timeline-date--bottom' : 'timeline-date--top'"
                      >
                        {{ formatTimelineDate(entry.date_key) }}
                      </div>

                      <button type="button" class="timeline-circle" @click="openEventPicker(entry, index)">
                        <v-icon size="28">{{ entry.icon }}</v-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="7">
            <v-card rounded="xl" class="panel-card pa-4 pa-md-5 h-100" elevation="0">
              <div class="d-flex align-start justify-space-between ga-3 mb-4">
                <div>
                  <div class="text-h6 font-weight-bold">Current bundle pricing</div>
                  <div class="text-medium-emphasis">Live estimate with the bundle discount already applied.</div>
                </div>
                <v-chip rounded="pill" color="success" variant="tonal">
                  <v-icon start size="14">mdi-sale</v-icon>
                  -{{ Math.round(BUNDLE_DISCOUNT_RATE * 100) }}%
                </v-chip>
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-card rounded="xl" class="price-card price-card--economy pa-4" elevation="0">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="font-weight-bold">Economy</div>
                      <v-icon size="20">mdi-ticket-outline</v-icon>
                    </div>
                    <div class="text-h5 font-weight-black mb-2">{{ formatMoney(draftEconomy.total_amount) }}</div>
                    <div class="text-caption text-medium-emphasis mb-3">Regular seats bundle-wide</div>
                    <div class="price-mini-row"><span>Events</span><strong>{{ draftEconomy.event_count }}</strong></div>
                    <div class="price-mini-row"><span>Discount</span><strong>-{{ formatMoney(draftEconomy.discount_amount) }}</strong></div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card rounded="xl" class="price-card price-card--special pa-4" elevation="0">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="font-weight-bold">Special</div>
                      <v-icon size="20">mdi-ticket-confirmation-outline</v-icon>
                    </div>
                    <div class="text-h5 font-weight-black mb-2">{{ formatMoney(draftSpecial.total_amount) }}</div>
                    <div class="text-caption text-medium-emphasis mb-3">Special seats with smart fallback</div>
                    <div class="price-mini-row"><span>Events</span><strong>{{ draftSpecial.event_count }}</strong></div>
                    <div class="price-mini-row"><span>Discount</span><strong>-{{ formatMoney(draftSpecial.discount_amount) }}</strong></div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card rounded="xl" class="price-card price-card--luxury pa-4" elevation="0">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="font-weight-bold">Luxury</div>
                      <v-icon size="20">mdi-crown-outline</v-icon>
                    </div>
                    <div class="text-h5 font-weight-black mb-2">{{ formatMoney(draftLuxury.total_amount) }}</div>
                    <div class="text-caption text-medium-emphasis mb-3">VIP-first pricing</div>
                    <div class="price-mini-row"><span>Events</span><strong>{{ draftLuxury.event_count }}</strong></div>
                    <div class="price-mini-row"><span>Discount</span><strong>-{{ formatMoney(draftLuxury.discount_amount) }}</strong></div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" lg="5">
            <v-card rounded="xl" class="panel-card pa-4 pa-md-5 h-100" elevation="0">
              <div class="text-h6 font-weight-bold mb-4">Selected events</div>

              <div v-if="selectedTimelineEvents.length" class="selected-events-list">
                <v-card
                  v-for="entry in selectedTimelineEvents"
                  :key="entry.date_key"
                  rounded="xl"
                  class="selected-event-row pa-3"
                  elevation="0"
                  @click="openEventDetails(entry, timelineEntryIndex(entry.date_key))"
                >
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="60" rounded="lg">
                      <v-img :src="entry.event.image || entry.event.images?.[0]" cover />
                    </v-avatar>

                    <div class="flex-grow-1 min-w-0">
                      <div class="font-weight-bold text-truncate">{{ entry.event.title }}</div>
                      <div class="text-caption text-medium-emphasis text-truncate">
                        {{ formatTimelineDate(entry.date_key) }} • {{ entry.event.time }} • {{ entry.event.city }}
                      </div>
                    </div>

                    <v-chip size="small" rounded="pill" variant="tonal">{{ entry.event.type }}</v-chip>
                  </div>
                </v-card>
              </div>

              <div v-else class="timeline-empty text-center py-8">
                <div class="empty-icon mb-4">
                  <v-icon size="30">mdi-calendar-remove-outline</v-icon>
                </div>
                <div class="font-weight-bold mb-2">No events picked yet</div>
                <div class="text-medium-emphasis">Add events to the timeline and they will appear here too.</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>

  <v-dialog v-model="dateSelectionDialog" max-width="760">
    <v-card rounded="xl" class="dialog-card pa-2" :class="currentTheme === 'light' ? 'dialog-card--light' : 'dialog-card--dark'">
      <v-card-title class="px-6 pt-6 pb-3 d-flex align-center ga-3">
        <v-avatar size="46" class="dialog-avatar dialog-avatar--primary">
          <v-icon size="20">mdi-calendar-multiple</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Choose up to 7 days</div>
          <div class="text-body-2 text-medium-emphasis">Your range is longer than the bundle limit, so pick the exact days you want.</div>
        </div>
      </v-card-title>

      <v-card-text class="px-6 pb-2">
        <div class="date-chip-wrap">
          <v-chip
            v-for="dateKey in allRangeDates"
            :key="`dialog-${dateKey}`"
            rounded="pill"
            :variant="isDateSelected(dateKey) ? 'flat' : 'outlined'"
            :color="isDateSelected(dateKey) ? 'primary' : undefined"
            class="date-chip"
            @click="toggleDate(dateKey)"
          >
            <v-icon start size="14">{{ isDateSelected(dateKey) ? 'mdi-check' : 'mdi-calendar-blank-outline' }}</v-icon>
            {{ formatChipDate(dateKey) }}
          </v-chip>
        </div>

        <div class="text-caption text-medium-emphasis mt-4">
          Selected {{ manualSelectedDates.length }}/7 days.
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-3 d-flex flex-wrap ga-2 justify-end">
        <v-btn variant="outlined" rounded="lg" class="text-none" @click="applyFirstSevenDates">Use first 7</v-btn>
        <v-btn color="primary" rounded="lg" class="text-none" @click="dateSelectionDialog = false">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="pickerDialog.show" max-width="1260">
    <v-card rounded="xl" class="dialog-card dialog-card--large pa-2" :class="currentTheme === 'light' ? 'dialog-card--light' : 'dialog-card--dark'">
      <v-card-title class="px-6 pt-6 pb-3 d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3">
        <div class="d-flex align-center ga-3">
          <v-avatar size="46" class="dialog-avatar dialog-avatar--primary">
            <v-icon size="20">mdi-calendar-search-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">Pick an event for {{ formatTimelineDate(pickerDialog.dateKey) }}</div>
            <div class="text-body-2 text-medium-emphasis">Filter by category, city, or search by title.</div>
          </div>
        </div>

        <v-btn icon variant="text" size="small" @click="pickerDialog.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-6">
        <v-row class="mb-2">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="pickerDialog.search"
              label="Search events"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              rounded="xl"
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="3.5">
            <v-select
              v-model="pickerDialog.category"
              :items="pickerCategoryItems"
              label="Category"
              variant="outlined"
              density="comfortable"
              rounded="xl"
              prepend-inner-icon="mdi-shape-outline"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3.5">
            <v-select
              v-model="pickerDialog.city"
              :items="pickerCityItems"
              label="Location"
              variant="outlined"
              density="comfortable"
              rounded="xl"
              prepend-inner-icon="mdi-map-marker-outline"
            />
          </v-col>
        </v-row>

        <v-row v-if="filteredPickerEvents.length">
          <v-col
            v-for="event in filteredPickerEvents"
            :key="event.id"
            cols="12"
            md="6"
            xl="4"
          >
            <v-card rounded="xl" class="picker-event-card h-100" elevation="0">
              <v-img :src="event.image || event.images?.[0]" height="190" cover>
                <template #placeholder>
                  <div class="w-100 h-100 d-flex align-center justify-center placeholder-surface">
                    <v-icon size="28">mdi-image-outline</v-icon>
                  </div>
                </template>
              </v-img>

              <div class="pa-4">
                <div class="text-h6 font-weight-bold mb-2 text-truncate">{{ event.title }}</div>
                <div class="text-body-2 text-medium-emphasis mb-3 picker-description">
                  {{ event.description }}
                </div>

                <div class="d-flex flex-wrap ga-2 mb-3">
                  <v-chip size="small" rounded="pill" variant="tonal">
                    <v-icon start size="14">mdi-clock-outline</v-icon>
                    {{ event.time }}
                  </v-chip>
                  <v-chip size="small" rounded="pill" variant="tonal">
                    <v-icon start size="14">mdi-map-marker-outline</v-icon>
                    {{ event.city }}
                  </v-chip>
                  <v-chip size="small" rounded="pill" variant="tonal">
                    <v-icon start size="14">mdi-shape-outline</v-icon>
                    {{ event.type }}
                  </v-chip>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-btn color="primary" rounded="lg" class="text-none flex-grow-1" @click="selectEventForSlot(event)">
                    <v-icon start>mdi-check-circle-outline</v-icon>
                    Select event
                  </v-btn>
                  <v-btn variant="outlined" rounded="lg" class="text-none" @click="previewEventInDialog(event)">
                    <v-icon start>mdi-eye-outline</v-icon>
                    Preview
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div v-else class="timeline-empty text-center py-10">
          <div class="empty-icon mb-4">
            <v-icon size="32">mdi-calendar-remove-outline</v-icon>
          </div>
          <div class="font-weight-bold mb-2">No events found for this day</div>
          <div class="text-medium-emphasis">Try another filter or leave the slot empty for now.</div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="eventDialog.show" max-width="980">
    <v-card rounded="xl" class="dialog-card dialog-card--large pa-2" :class="currentTheme === 'light' ? 'dialog-card--light' : 'dialog-card--dark'">
      <v-card-title class="px-6 pt-6 pb-3 d-flex align-center justify-space-between ga-3">
        <div class="d-flex align-center ga-3">
          <v-avatar size="46" class="dialog-avatar dialog-avatar--primary">
            <v-icon size="20">mdi-ticket-confirmation-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ eventDialog.event?.title || 'Event details' }}</div>
            <div class="text-body-2 text-medium-emphasis">Open details for the selected timeline item.</div>
          </div>
        </div>

        <v-btn icon variant="text" size="small" @click="eventDialog.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text v-if="eventDialog.event" class="px-6 pb-6">
        <v-row>
          <v-col cols="12" md="6">
            <v-img :src="eventDialog.event.image || eventDialog.event.images?.[0]" height="300" cover class="rounded-xl mb-4">
              <template #placeholder>
                <div class="w-100 h-100 d-flex align-center justify-center placeholder-surface">
                  <v-icon size="34">mdi-image-outline</v-icon>
                </div>
              </template>
            </v-img>

            <v-sheet rounded="xl" class="description-panel pa-4">
              <div class="text-body-2 text-medium-emphasis">
                {{ eventDialog.event.description }}
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="6">
            <div class="detail-stack">
              <div class="detail-row"><span>Date</span><strong>{{ eventDialog.event.date }}</strong></div>
              <div class="detail-row"><span>Time</span><strong>{{ eventDialog.event.time }}<template v-if="eventDialog.event.end_time"> - {{ eventDialog.event.end_time }}</template></strong></div>
              <div class="detail-row"><span>Category</span><strong>{{ eventDialog.event.type }}</strong></div>
              <div class="detail-row"><span>Venue</span><strong>{{ eventDialog.event.venue }}</strong></div>
              <div class="detail-row"><span>City</span><strong>{{ eventDialog.event.city }}</strong></div>
              <div class="detail-row"><span>Age restriction</span><strong>{{ eventDialog.event.age_restriction }}</strong></div>
              <div class="detail-row"><span>Seats left</span><strong>{{ Math.max(0, Number(eventDialog.event.capacity || 0) - Number(eventDialog.event.tickets_sold || 0)) }}</strong></div>
            </div>

            <div class="d-flex flex-wrap ga-2 mt-4 mb-4">
              <v-chip
                v-for="seatClass in eventDialog.event.seat_classes || []"
                :key="seatClass"
                rounded="pill"
                variant="tonal"
              >
                <v-icon start size="14">mdi-seat-outline</v-icon>
                {{ seatClass }}
              </v-chip>
            </div>

            <div class="detail-stack">
              <div class="detail-row"><span>Economy</span><strong>{{ formatMoney(eventTierPrice(eventDialog.event, 'economy')) }}</strong></div>
              <div class="detail-row"><span>Special</span><strong>{{ formatMoney(eventTierPrice(eventDialog.event, 'special')) }}</strong></div>
              <div class="detail-row"><span>Luxury</span><strong>{{ formatMoney(eventTierPrice(eventDialog.event, 'luxury')) }}</strong></div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-3 d-flex flex-wrap ga-2 justify-space-between">
        <v-btn variant="outlined" rounded="lg" class="text-none" @click="eventDialog.show = false">Close</v-btn>
        <div class="d-flex flex-wrap ga-2">
          <v-btn variant="outlined" rounded="lg" class="text-none" @click="selectCurrentPreviewedEvent">
            <v-icon start>mdi-check-circle-outline</v-icon>
            Use this event
          </v-btn>
          <v-btn color="error" rounded="lg" class="text-none" :disabled="eventDialog.entryIndex < 0" @click="removeEventFromTimeline(eventDialog.entryIndex)">
            <v-icon start>mdi-delete-outline</v-icon>
            Delete selection
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="paymentDialog.show" max-width="1180">
    <v-card rounded="xl" class="dialog-card dialog-card--large pa-2" :class="currentTheme === 'light' ? 'dialog-card--light' : 'dialog-card--dark'">
      <v-card-title class="px-6 pt-6 pb-3 d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3">
        <div class="d-flex align-center ga-3">
          <v-avatar size="46" class="dialog-avatar dialog-avatar--success">
            <v-icon size="20">mdi-credit-card-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">Buy this bundle</div>
            <div class="text-body-2 text-medium-emphasis">Choose your ticket tier, quantity, and payment details.</div>
          </div>
        </div>

        <v-btn icon variant="text" size="small" @click="paymentDialog.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-6">
        <v-row>
          <v-col cols="12" lg="7">
            <div class="text-subtitle-1 font-weight-bold mb-3">Ticket options</div>
            <v-row>
              <v-col v-for="option in BUNDLE_TIER_OPTIONS" :key="option.key" cols="12" md="4">
                <v-card
                  rounded="xl"
                  class="tier-card pa-4 h-100"
                  :class="{ 'tier-card--active': paymentDialog.tier === option.key }"
                  elevation="0"
                  @click="paymentDialog.tier = option.key"
                >
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="font-weight-bold">{{ option.label }}</div>
                    <v-icon size="20">{{ option.icon }}</v-icon>
                  </div>
                  <div class="text-h5 font-weight-black mb-2">{{ formatMoney(activeEstimateFor(option.key).total_amount) }}</div>
                  <div class="text-caption text-medium-emphasis mb-3">{{ option.description }}</div>
                  <div class="price-mini-row"><span>Events</span><strong>{{ activeEstimateFor(option.key).event_count }}</strong></div>
                  <div class="price-mini-row"><span>Discount</span><strong>-{{ formatMoney(activeEstimateFor(option.key).discount_amount) }}</strong></div>
                </v-card>
              </v-col>
            </v-row>

            <div class="text-subtitle-1 font-weight-bold mb-3 mt-6">Payment details</div>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="paymentDialog.cardName"
                  label="Cardholder name"
                  variant="outlined"
                  density="comfortable"
                  rounded="xl"
                  prepend-inner-icon="mdi-account-outline"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="paymentDialog.quantity"
                  type="number"
                  min="1"
                  label="How many bundle copies?"
                  variant="outlined"
                  density="comfortable"
                  rounded="xl"
                  prepend-inner-icon="mdi-counter"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="paymentDialog.cardNumber"
                  label="Card number"
                  maxlength="19"
                  variant="outlined"
                  density="comfortable"
                  rounded="xl"
                  prepend-inner-icon="mdi-credit-card-outline"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="paymentDialog.expiry"
                  label="Expiry"
                  placeholder="MM/YY"
                  maxlength="5"
                  variant="outlined"
                  density="comfortable"
                  rounded="xl"
                  prepend-inner-icon="mdi-calendar-outline"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="paymentDialog.cvv"
                  label="CVV"
                  maxlength="4"
                  variant="outlined"
                  density="comfortable"
                  rounded="xl"
                  prepend-inner-icon="mdi-shield-outline"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" lg="5">
            <v-card rounded="xl" class="summary-card pa-4 pa-md-5 h-100" elevation="0">
              <div class="d-flex align-center justify-space-between ga-3 mb-4">
                <div>
                  <div class="text-overline hero-side-label">Checkout summary</div>
                  <div class="text-h6 font-weight-bold">{{ activeEstimate.label }}</div>
                </div>
                <v-chip rounded="pill" variant="tonal" color="success">
                  {{ activeEstimate.quantity }}x
                </v-chip>
              </div>

              <div class="summary-stack mb-4">
                <div class="summary-row"><span>Events included</span><strong>{{ activeEstimate.event_count }}</strong></div>
                <div class="summary-row"><span>Subtotal</span><strong>{{ formatMoney(activeEstimate.subtotal_before_discount) }}</strong></div>
                <div class="summary-row"><span>Bundle discount</span><strong>-{{ formatMoney(activeEstimate.discount_amount) }}</strong></div>
                <div class="summary-row"><span>Ticket fee estimate</span><strong>{{ formatMoney(activeEstimate.fee_amount) }}</strong></div>
                <div class="summary-row summary-row--total"><span>Total</span><strong>{{ formatMoney(activeEstimate.total_amount) }}</strong></div>
              </div>

              <div class="summary-list mb-4">
                <div v-for="item in activeEstimate.items" :key="item.event_id" class="summary-list-item">
                  <div class="min-w-0">
                    <div class="font-weight-bold text-truncate">{{ item.title }}</div>
                    <div class="text-caption text-medium-emphasis text-truncate">
                      {{ item.seat_class }} • {{ item.quantity }} ticket{{ item.quantity === 1 ? '' : 's' }}
                    </div>
                  </div>
                  <strong>{{ formatMoney(item.total_amount) }}</strong>
                </div>
              </div>

              <v-btn
                block
                color="success"
                rounded="lg"
                size="large"
                class="action-btn"
                :loading="paymentDialog.processing"
                @click="checkoutBundle"
              >
                <v-icon start>mdi-lock-check-outline</v-icon>
                Pay now
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="confirmationDialog.show" max-width="720">
    <v-card rounded="xl" class="dialog-card pa-2" :class="currentTheme === 'light' ? 'dialog-card--light' : 'dialog-card--dark'">
      <v-card-title class="px-6 pt-6 pb-3 d-flex align-center ga-3">
        <v-avatar size="48" class="dialog-avatar dialog-avatar--success">
          <v-icon size="22">mdi-check-circle-outline</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Bundle purchased</div>
          <div class="text-body-2 text-medium-emphasis">Your bundle was saved and all tickets were booked.</div>
        </div>
      </v-card-title>

      <v-card-text class="px-6 pb-2">
        <div class="summary-stack">
          <div class="summary-row"><span>Bundle</span><strong>{{ confirmationDialog.bundleTitle }}</strong></div>
          <div class="summary-row"><span>Tier</span><strong>{{ confirmationDialog.tierLabel }}</strong></div>
          <div class="summary-row"><span>Reservations created</span><strong>{{ confirmationDialog.reservationCount }}</strong></div>
          <div class="summary-row summary-row--total"><span>Total paid</span><strong>{{ formatMoney(confirmationDialog.totalAmount) }}</strong></div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-4 d-flex flex-wrap ga-2 justify-end">
        <v-btn variant="outlined" rounded="lg" class="text-none" @click="goToBundles">Back to bundles</v-btn>
        <v-btn color="primary" rounded="lg" class="text-none" @click="goToBookings">
          <v-icon start>mdi-ticket-confirmation-outline</v-icon>
          Open my bookings
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="feedback.show" :color="feedback.color" timeout="2800" location="bottom right">
    {{ feedback.text }}
  </v-snackbar>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import {
  BUNDLE_DISCOUNT_RATE,
  BUNDLE_TIER_OPTIONS,
  estimate_Bundle_Price,
  get_Bundle_By_Id,
  get_Events_For_Bundle_Date,
  purchase_Bundle,
  upsert_Bundle,
} from "@/dataModel/bundle"
import { get_Current_User } from "@/dataModel/user"
import { get_Event_By_Id } from "@/dataModel/event"

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const display = useDisplay()

const currentUser = ref(get_Current_User())
const prefersDark = ref(false)
const currentTheme = ref("light")
const isMobile = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)

const bundleTitle = ref("")
const bundleNotes = ref("")
const startDate = ref("")
const endDate = ref("")
const manualSelectedDates = ref([])
const timelineEntries = ref([])
const loadedBundleId = ref("")
const hydrationDone = ref(false)

const dateSelectionDialog = ref(false)
const pickerDialog = ref({
  show: false,
  dateKey: "",
  entryIndex: -1,
  search: "",
  category: "All categories",
  city: "All locations",
})
const eventDialog = ref({
  show: false,
  event: null,
  entryIndex: -1,
})
const paymentDialog = ref({
  show: false,
  tier: "economy",
  quantity: 1,
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  processing: false,
})
const confirmationDialog = ref({
  show: false,
  bundleTitle: "",
  tierLabel: "",
  reservationCount: 0,
  totalAmount: 0,
})
const feedback = ref({
  show: false,
  text: "",
  color: "primary",
})

let storageThemeInterval = null
let currentUserInterval = null

function readStoredTheme() {
  if (typeof window === "undefined") return "light"
  const savedTheme = window.localStorage.getItem("blassti-theme")
  return savedTheme === "dark" ? "dark" : "light"
}

function applyStoredTheme() {
  const savedTheme = readStoredTheme()
  currentTheme.value = savedTheme
  prefersDark.value = savedTheme === "dark"
  theme.global.name.value = savedTheme
}

function handleStorageThemeChange(event) {
  if (event.key === "blassti-theme") {
    applyStoredTheme()
  }
}

onMounted(() => {
  applyStoredTheme()
  loadExistingBundleIfNeeded()

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageThemeChange)

    storageThemeInterval = window.setInterval(() => {
      const savedTheme = readStoredTheme()
      if (savedTheme !== currentTheme.value) {
        applyStoredTheme()
      }
    }, 250)

    currentUserInterval = window.setInterval(() => {
      currentUser.value = get_Current_User()
    }, 400)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("storage", handleStorageThemeChange)
  }

  if (storageThemeInterval) window.clearInterval(storageThemeInterval)
  if (currentUserInterval) window.clearInterval(currentUserInterval)
})

const browserThemeClass = computed(() => {
  return prefersDark.value ? "browser-theme-dark" : "browser-theme-light"
})

const editingExisting = computed(() => Boolean(loadedBundleId.value))

const allRangeDates = computed(() => {
  if (!startDate.value || !endDate.value) return []

  const start = new Date(`${startDate.value}T12:00:00`)
  const end = new Date(`${endDate.value}T12:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return []
  }

  const output = []
  const cursor = new Date(start)

  while (cursor <= end) {
    output.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return output
})

const requiresDateSelection = computed(() => allRangeDates.value.length > 7)

const timelineDates = computed(() => {
  if (!allRangeDates.value.length) return []

  if (!requiresDateSelection.value) {
    return allRangeDates.value
  }

  return [...manualSelectedDates.value].sort().slice(0, 7)
})

const filledTimelineCount = computed(() => timelineEntries.value.filter(entry => entry?.event_id).length)

const timelineEntriesView = computed(() => {
  return timelineEntries.value.map(entry => {
    const event = get_Event_By_Id(entry.event_id)
    return {
      ...entry,
      event,
      icon: event ? slotIconForEvent(event) : "mdi-help",
    }
  })
})

const selectedTimelineEvents = computed(() => {
  return timelineEntriesView.value.filter(entry => entry.event)
})

const selectedRangeLabel = computed(() => {
  if (!timelineDates.value.length) return "No range yet"
  const first = timelineDates.value[0]
  const last = timelineDates.value[timelineDates.value.length - 1]
  return `${formatChipDate(first)} → ${formatChipDate(last)}`
})

const rangeWarning = computed(() => {
  if (!startDate.value || !endDate.value) return ""
  if (allRangeDates.value.length === 0) return "Your end date must be after the start date."
  if (requiresDateSelection.value && manualSelectedDates.value.length === 0) {
    return "Select up to 7 days from the range before building the bundle."
  }
  if (requiresDateSelection.value && manualSelectedDates.value.length > 7) {
    return "A bundle can only keep 7 dates."
  }
  return ""
})

const draftBundle = computed(() => {
  return {
    id: loadedBundleId.value || undefined,
    user_id: currentUser.value?.id || null,
    title: safeBundleTitle.value,
    start_date: timelineDates.value[0] || startDate.value || "",
    end_date: timelineDates.value[timelineDates.value.length - 1] || endDate.value || "",
    selected_dates: timelineDates.value,
    timeline_entries: timelineEntries.value,
    notes: bundleNotes.value,
    purchase_history: get_Bundle_By_Id(loadedBundleId.value)?.purchase_history || [],
  }
})

const safeBundleTitle = computed(() => {
  if (bundleTitle.value?.trim()) return bundleTitle.value.trim()
  if (!timelineDates.value.length) return "Untitled bundle"
  return `Bundle • ${selectedRangeLabel.value}`
})

const draftEconomy = computed(() => estimate_Bundle_Price(draftBundle.value, "economy", 1))
const draftSpecial = computed(() => estimate_Bundle_Price(draftBundle.value, "special", 1))
const draftLuxury = computed(() => estimate_Bundle_Price(draftBundle.value, "luxury", 1))

const pickerDayEvents = computed(() => {
  if (!pickerDialog.value.dateKey) return []
  return get_Events_For_Bundle_Date(pickerDialog.value.dateKey)
})

const pickerCategoryItems = computed(() => {
  const categories = Array.from(new Set(pickerDayEvents.value.map(event => event.type).filter(Boolean))).sort()
  return ["All categories", ...categories]
})

const pickerCityItems = computed(() => {
  const cities = Array.from(new Set(pickerDayEvents.value.map(event => event.city).filter(Boolean))).sort()
  return ["All locations", ...cities]
})

const filteredPickerEvents = computed(() => {
  return pickerDayEvents.value.filter(event => {
    const matchesSearch =
      !pickerDialog.value.search ||
      event.title.toLowerCase().includes(pickerDialog.value.search.toLowerCase()) ||
      event.venue.toLowerCase().includes(pickerDialog.value.search.toLowerCase()) ||
      event.city.toLowerCase().includes(pickerDialog.value.search.toLowerCase())

    const matchesCategory =
      pickerDialog.value.category === "All categories" ||
      event.type === pickerDialog.value.category

    const matchesCity =
      pickerDialog.value.city === "All locations" ||
      event.city === pickerDialog.value.city

    return matchesSearch && matchesCategory && matchesCity
  })
})

const activeEstimate = computed(() => {
  const estimate = estimate_Bundle_Price(
    draftBundle.value,
    paymentDialog.value.tier,
    Math.max(1, Number(paymentDialog.value.quantity || 1))
  )

  return {
    ...estimate,
    label: BUNDLE_TIER_OPTIONS.find(option => option.key === paymentDialog.value.tier)?.label || "Economy",
  }
})

const timelineTrackStyle = computed(() => {
  const width = Math.max(timelineDates.value.length * (isMobile.value ? 190 : 240), isMobile.value ? 240 : 720)
  return { width: `${width}px` }
})

watch(
  () => [startDate.value, endDate.value, requiresDateSelection.value, JSON.stringify(manualSelectedDates.value)],
  () => {
    if (!hydrationDone.value) return
    syncTimelineEntries()
  }
)

watch(
  () => [route.query.id, route.query.buy],
  () => {
    loadExistingBundleIfNeeded()

    if (String(route.query.buy || "") === "1" && filledTimelineCount.value) {
      paymentDialog.value.show = true
    }
  }
)

watch(
  () => allRangeDates.value,
  dates => {
    if (!hydrationDone.value) return

    if (!requiresDateSelection.value) {
      manualSelectedDates.value = [...dates]
      dateSelectionDialog.value = false
      return
    }

    const filtered = manualSelectedDates.value.filter(date => dates.includes(date))
    if (!filtered.length) {
      manualSelectedDates.value = dates.slice(0, 7)
    } else {
      manualSelectedDates.value = filtered.slice(0, 7)
    }

    if (requiresDateSelection.value) {
      dateSelectionDialog.value = true
    }
  },
  { deep: true }
)

function loadExistingBundleIfNeeded() {
  const id = String(route.query.id || "").trim()
  const bundle = id ? get_Bundle_By_Id(id) : null

  if (bundle && currentUser.value?.id && bundle.user_id === currentUser.value.id) {
    loadedBundleId.value = bundle.id
    bundleTitle.value = bundle.title || ""
    bundleNotes.value = bundle.notes || ""
    startDate.value = bundle.start_date || ""
    endDate.value = bundle.end_date || ""
    manualSelectedDates.value = [...(bundle.selected_dates || [])]
    timelineEntries.value = (bundle.timeline_entries || []).map(entry => ({
      date_key: entry.date_key,
      event_id: entry.event_id || null,
    }))
  } else {
    loadedBundleId.value = ""
    if (!bundleTitle.value) bundleTitle.value = ""
  }

  hydrationDone.value = true
  syncTimelineEntries(bundle?.timeline_entries || [])

  if (String(route.query.buy || "") === "1" && (bundle?.timeline_entries || []).some(entry => entry?.event_id)) {
    paymentDialog.value.show = true
  }
}

function toDateKey(value) {
  const parsed = typeof value === "string" ? new Date(value) : new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function syncTimelineEntries(existingEntries = timelineEntries.value) {
  const map = new Map((existingEntries || []).map(entry => [entry.date_key, entry.event_id || null]))
  timelineEntries.value = timelineDates.value.map(dateKey => ({
    date_key: dateKey,
    event_id: map.get(dateKey) || null,
  }))
}

function applyFirstSevenDates() {
  manualSelectedDates.value = allRangeDates.value.slice(0, 7)
}

function toggleDate(dateKey) {
  if (!requiresDateSelection.value) return

  const alreadySelected = manualSelectedDates.value.includes(dateKey)

  if (alreadySelected) {
    manualSelectedDates.value = manualSelectedDates.value.filter(item => item !== dateKey)
    return
  }

  if (manualSelectedDates.value.length >= 7) {
    pushFeedback("A bundle can only keep 7 days.", "warning")
    return
  }

  manualSelectedDates.value = [...manualSelectedDates.value, dateKey].sort()
}

function isDateSelected(dateKey) {
  return timelineDates.value.includes(dateKey)
}

function formatChipDate(dateKey) {
  const parsed = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateKey
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatTimelineDate(dateKey) {
  const parsed = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateKey
  return parsed.toLocaleDateString(undefined, { weekday: isMobile.value ? "short" : "long", month: "short", day: "numeric" })
}

function formatMoney(value) {
  return `${Number(value || 0).toFixed(2)} TND`
}

function isTopCard(index) {
  return index % 2 === 0
}

function slotIconForEvent(event) {
  const hour = Number(String(event?.time || "00:00").split(":")[0] || 0)
  if (hour >= 18 || hour < 6) return "mdi-weather-night"
  if (hour >= 12) return "mdi-weather-partly-cloudy"
  return "mdi-white-balance-sunny"
}

function openEventPicker(entry, index) {
  pickerDialog.value = {
    show: true,
    dateKey: entry.date_key,
    entryIndex: index,
    search: "",
    category: "All categories",
    city: "All locations",
  }
}

function selectEventForSlot(event) {
  if (pickerDialog.value.entryIndex < 0) return
  timelineEntries.value[pickerDialog.value.entryIndex].event_id = event.id
  pickerDialog.value.show = false
  pushFeedback(`${event.title} added to the bundle.`, "success")
}

function previewEventInDialog(event) {
  eventDialog.value = {
    show: true,
    event,
    entryIndex: pickerDialog.value.entryIndex,
  }
}

function openEventDetails(entry, index) {
  if (!entry?.event) return

  eventDialog.value = {
    show: true,
    event: entry.event,
    entryIndex: index,
  }
}

function selectCurrentPreviewedEvent() {
  if (!eventDialog.value.event || eventDialog.value.entryIndex < 0) return
  timelineEntries.value[eventDialog.value.entryIndex].event_id = eventDialog.value.event.id
  eventDialog.value.show = false
  pickerDialog.value.show = false
  pushFeedback(`${eventDialog.value.event.title} selected.`, "success")
}

function removeEventFromTimeline(index) {
  if (index < 0 || !timelineEntries.value[index]) return
  timelineEntries.value[index].event_id = null
  eventDialog.value.show = false
  pushFeedback("Event removed from the timeline.", "info")
}

function timelineEntryIndex(dateKey) {
  return timelineEntries.value.findIndex(entry => entry.date_key === dateKey)
}

function resetTimeline() {
  timelineEntries.value = timelineDates.value.map(dateKey => ({
    date_key: dateKey,
    event_id: null,
  }))
  pushFeedback("Bundle timeline reset.", "info")
}

function validateDraft() {
  if (!currentUser.value?.id) {
    pushFeedback("Login first to save this bundle.", "warning")
    return false
  }

  if (!timelineDates.value.length) {
    pushFeedback("Choose a valid date range first.", "warning")
    return false
  }

  if (requiresDateSelection.value && timelineDates.value.length === 0) {
    pushFeedback("Pick up to 7 dates from the selected range.", "warning")
    return false
  }

  return true
}

function saveBundleDraft({ silent = false } = {}) {
  if (!validateDraft()) return null

  const saved = upsert_Bundle({
    ...draftBundle.value,
    title: safeBundleTitle.value,
  })

  loadedBundleId.value = saved.id

  if (route.query.id !== saved.id) {
    router.replace({ path: "/bundle_builder", query: { id: saved.id } })
  }

  if (!silent) {
    pushFeedback("Bundle saved successfully.", "success")
  }

  return saved
}

function openPaymentDialog() {
  if (!filledTimelineCount.value) {
    pushFeedback("Add at least one event before buying this bundle.", "warning")
    return
  }

  paymentDialog.value.show = true
}

function activeEstimateFor(tierKey) {
  return estimate_Bundle_Price(
    draftBundle.value,
    tierKey,
    Math.max(1, Number(paymentDialog.value.quantity || 1))
  )
}

function inferCardBrand(cardNumber) {
  const digits = String(cardNumber || "").replace(/\D/g, "")
  if (digits.startsWith("4")) return "Visa"
  if (/^5[1-5]/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "Amex"
  return "Card"
}

function eventTierPrice(event, tier) {
  return estimate_Bundle_Price({
    selected_dates: [toDateKey(new Date())],
    timeline_entries: [{ date_key: toDateKey(new Date()), event_id: event.id }],
  }, tier, 1).total_amount
}

async function checkoutBundle() {
  const savedBundle = saveBundleDraft({ silent: true })
  if (!savedBundle) return

  const quantity = Math.max(1, Math.floor(Number(paymentDialog.value.quantity || 1)))
  const cardNumber = String(paymentDialog.value.cardNumber || "").replace(/\s/g, "")

  if (cardNumber.length < 4) {
    pushFeedback("Please enter a valid card number.", "warning")
    return
  }

  paymentDialog.value.processing = true

  try {
    const response = purchase_Bundle({
      bundle_id: savedBundle.id,
      user_id: currentUser.value.id,
      tier: paymentDialog.value.tier,
      quantity,
      payment_method: "card",
      payment_brand: inferCardBrand(cardNumber),
      card_last4: cardNumber.slice(-4),
    })

    if (!response?.success) {
      pushFeedback(response?.message || "Bundle purchase failed.", "error")
      return
    }

    paymentDialog.value.show = false
    confirmationDialog.value = {
      show: true,
      bundleTitle: safeBundleTitle.value,
      tierLabel: BUNDLE_TIER_OPTIONS.find(option => option.key === paymentDialog.value.tier)?.label || "Economy",
      reservationCount: response.reservations?.length || 0,
      totalAmount: response.summary?.total_amount || 0,
    }
    paymentDialog.value.cardName = ""
    paymentDialog.value.cardNumber = ""
    paymentDialog.value.expiry = ""
    paymentDialog.value.cvv = ""
    paymentDialog.value.quantity = 1
    loadExistingBundleIfNeeded()
  } finally {
    paymentDialog.value.processing = false
  }
}

function goToBundles() {
  confirmationDialog.value.show = false
  router.push("/bundle")
}

function goToBookings() {
  confirmationDialog.value.show = false
  router.push("/K_mybookings")
}

function pushFeedback(text, color = "primary") {
  feedback.value = {
    show: true,
    text,
    color,
  }
}
</script>

<style scoped>
.bundle-builder-shell {
  min-height: 100vh;
  transition: background 0.25s ease, color 0.25s ease;
}

.page-main {
  max-width: 1540px;
}

.position-relative {
  position: relative;
}

.hero-card,
.panel-card,
.login-card,
.dialog-card,
.tier-card,
.summary-card,
.price-card,
.timeline-event-card,
.picker-event-card,
.selected-event-row {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(14px);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease;
}

.hero-card:hover,
.panel-card:hover,
.price-card:hover,
.timeline-event-card:hover,
.picker-event-card:hover,
.selected-event-row:hover,
.tier-card:hover {
  transform: translateY(-4px);
}

.hero-card {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 30%),
    radial-gradient(circle at right center, rgba(6, 182, 212, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.84), rgba(30, 41, 59, 0.78));
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.58;
  pointer-events: none;
}

.hero-glow--one {
  width: 220px;
  height: 220px;
  top: -70px;
  right: 9%;
  background: rgba(99, 102, 241, 0.28);
}

.hero-glow--two {
  width: 180px;
  height: 180px;
  bottom: -58px;
  left: 22%;
  background: rgba(6, 182, 212, 0.22);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-copy {
  max-width: 760px;
}

.hero-center {
  display: flex;
  justify-content: center;
}

.hero-copy--centered {
  max-width: 920px;
}

.hero-copy--centered .hero-subtitle {
  max-width: 760px;
}

.hero-title {
  line-height: 1.08;
}

.hero-subtitle {
  max-width: 720px;
}

.hero-chip {
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.hero-side {
  max-width: 390px;
}

.hero-side-mobile {
  max-width: 100%;
}

.hero-side-card {
  background: rgba(255, 255, 255, 0.06);
}

.hero-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-side-label {
  letter-spacing: 0.08em;
  font-weight: 700;
}

.hero-stat-box {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stat-box span {
  font-size: 0.76rem;
  opacity: 0.82;
}

.hero-stat-box strong {
  font-size: 1.1rem;
}

.metric-icon,
.dialog-avatar,
.empty-icon,
.timeline-empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
}

.empty-icon,
.timeline-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.metric-icon--primary,
.dialog-avatar--primary {
  background: rgba(99, 102, 241, 0.18);
}

.dialog-avatar--success {
  background: rgba(34, 197, 94, 0.18);
}

.panel-card,
.login-card,
.dialog-card,
.summary-card,
.price-card,
.timeline-event-card,
.picker-event-card,
.selected-event-row,
.tier-card {
  background: rgba(255, 255, 255, 0.04);
}

.setup-summary,
.summary-stack,
.detail-stack {
  display: grid;
  gap: 10px;
}

.summary-row,
.detail-row,
.price-mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.summary-row--total {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.24);
}

.timeline-shell {
  overflow: hidden;
}

.timeline-scroll {
  overflow-x: auto;
  padding-bottom: 10px;
}

.timeline-track {
  position: relative;
  min-height: 520px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  align-items: stretch;
}

.timeline-line {
  position: absolute;
  left: 30px;
  right: 30px;
  top: 50%;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.24), rgba(6, 182, 212, 0.24));
  transform: translateY(-50%);
}

.timeline-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 520px;
}

.timeline-circle {
  position: relative;
  z-index: 2;
  width: 92px;
  height: 92px;
  border-radius: 999px;
  border: 3px solid rgba(99, 102, 241, 0.3);
  background: rgba(15, 23, 42, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.18);
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
  cursor: pointer;
}

.timeline-circle:hover {
  transform: scale(1.04);
  border-color: rgba(99, 102, 241, 0.55);
}

.timeline-date {
  position: absolute;
  z-index: 2;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.83rem;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.88);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.timeline-date--top {
  top: 108px;
}

.timeline-date--bottom {
  bottom: 108px;
}

.timeline-card-wrap {
  position: absolute;
  width: 86%;
  max-width: 220px;
}

.timeline-card-wrap--top {
  top: 10px;
}

.timeline-card-wrap--bottom {
  bottom: 10px;
}

.timeline-event-card {
  cursor: pointer;
}

.timeline-event-card--empty {
  border-style: dashed;
}

.timeline-empty-card {
  min-height: 206px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.timeline-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  margin-bottom: 0;
}

.timeline-chip {
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.timeline-empty-copy {
  max-width: 420px;
}

.placeholder-surface {
  background: rgba(148, 163, 184, 0.12);
}

.date-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-chip {
  cursor: pointer;
}

.selected-events-list,
.summary-list {
  display: grid;
  gap: 12px;
}

.selected-event-row {
  cursor: pointer;
}

.summary-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.min-w-0 {
  min-width: 0;
}

.description-panel {
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.detail-row span,
.summary-row span,
.price-mini-row span {
  opacity: 0.8;
}

.detail-row strong,
.summary-row strong,
.price-mini-row strong {
  text-align: right;
}

.price-card--economy {
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.18), transparent 38%),
    linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(217, 119, 6, 0.08));
  border-color: rgba(245, 158, 11, 0.24);
}

.price-card--special {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 38%),
    linear-gradient(135deg, rgba(226, 232, 240, 0.22), rgba(148, 163, 184, 0.08));
  border-color: rgba(203, 213, 225, 0.28);
}

.price-card--luxury {
  background:
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.2), transparent 38%),
    linear-gradient(135deg, rgba(253, 224, 71, 0.2), rgba(234, 179, 8, 0.08));
  border-color: rgba(250, 204, 21, 0.26);
}

.price-card--economy .price-mini-row {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(245, 158, 11, 0.16);
}

.price-card--special .price-mini-row {
  background: rgba(226, 232, 240, 0.12);
  border-color: rgba(203, 213, 225, 0.18);
}

.price-card--luxury .price-mini-row {
  background: rgba(253, 224, 71, 0.12);
  border-color: rgba(250, 204, 21, 0.18);
}

.tier-card {
  cursor: pointer;
}

.tier-card--active {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 16px 34px rgba(99, 102, 241, 0.12);
  background: rgba(99, 102, 241, 0.12);
}

.summary-card {
  background:
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 30%),
    rgba(255, 255, 255, 0.04);
}

.picker-description {
  min-height: 64px;
  display: -webkit-box;
    line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dialog-card {
  backdrop-filter: blur(6px);
  box-shadow: 0 24px 60px rgba(2, 8, 23, 0.24);
}

.dialog-card--dark {
  background: rgba(15, 23, 42, 0.96);
  color: rgba(241, 245, 249, 0.96);
}

.dialog-card--light {
  background: rgba(255, 255, 255, 0.995);
  color: #0f172a;
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 60px rgba(148, 163, 184, 0.18);
}

.dialog-card--large {
  max-height: 92vh;
}

.action-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: none;
}

.browser-theme-dark {
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.12), transparent 28%),
    linear-gradient(180deg, #07111f 0%, #0b1220 48%, #0f172a 100%);
  color: rgba(241, 245, 249, 0.96);
}

.browser-theme-light {
  background:
    radial-gradient(circle at top, rgba(125, 211, 252, 0.22), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 54%, #e8eef7 100%);
  color: #0f172a;
}

.browser-theme-light .hero-card {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 30%),
    radial-gradient(circle at right center, rgba(6, 182, 212, 0.1), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.browser-theme-light .panel-card,
.browser-theme-light .login-card,
.browser-theme-light .summary-card,
.browser-theme-light .price-card,
.browser-theme-light .timeline-event-card,
.browser-theme-light .picker-event-card,
.browser-theme-light .selected-event-row,
.browser-theme-light .tier-card,
.browser-theme-light .hero-side-card {
  background: rgba(255, 255, 255, 0.9);
}

.browser-theme-light .dialog-card {
  background: rgba(255, 255, 255, 0.995);
}

.browser-theme-light .hero-badge,
.browser-theme-light .hero-stat-box,
.browser-theme-light .summary-row,
.browser-theme-light .detail-row,
.browser-theme-light .price-mini-row,
.browser-theme-light .summary-list-item,
.browser-theme-light .description-panel,
.browser-theme-light .date-chip,
.browser-theme-light .timeline-date,
.browser-theme-light .timeline-circle {
  border-color: rgba(99, 102, 241, 0.14);
}

.browser-theme-light .hero-badge,
.browser-theme-light .hero-stat-box,
.browser-theme-light .summary-row,
.browser-theme-light .detail-row,
.browser-theme-light .price-mini-row,
.browser-theme-light .summary-list-item,
.browser-theme-light .description-panel {
  background: rgba(99, 102, 241, 0.05);
}

.browser-theme-light .timeline-circle,
.browser-theme-light .timeline-date {
  background: rgba(255, 255, 255, 0.96);
}

.browser-theme-light .empty-icon,
.browser-theme-light .timeline-empty-icon {
  background: rgba(99, 102, 241, 0.1);
}

.browser-theme-light .price-card--economy {
  background:
    radial-gradient(circle at top right, rgba(253, 230, 138, 0.22), transparent 40%),
    linear-gradient(135deg, rgba(255, 251, 235, 0.995), rgba(254, 243, 199, 0.72));
}

.browser-theme-light .price-card--special {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 40%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.995), rgba(241, 245, 249, 0.82));
}

.browser-theme-light .price-card--luxury {
  background:
    radial-gradient(circle at top right, rgba(253, 224, 71, 0.24), transparent 42%),
    linear-gradient(135deg, rgba(254, 252, 232, 0.995), rgba(253, 240, 138, 0.68));
}

.timeline-scroll::-webkit-scrollbar,
.date-chip-wrap::-webkit-scrollbar,
.selected-events-list::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.timeline-scroll::-webkit-scrollbar-thumb,
.date-chip-wrap::-webkit-scrollbar-thumb,
.selected-events-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.34);
  border-radius: 999px;
}

.bundle-builder-mobile .page-main {
  padding-top: 18px !important;
}

.bundle-builder-mobile .hero-card {
  padding: 26px 18px !important;
}

.bundle-builder-mobile .hero-title {
  font-size: 2rem !important;
}


.bundle-builder-mobile .timeline-scroll {
  margin-inline: -8px;
  padding-inline: 8px;
}

.bundle-builder-mobile .timeline-track {
  min-width: max-content;
  grid-template-columns: none;
  grid-auto-flow: column;
  grid-auto-columns: minmax(168px, 182px);
  min-height: 430px;
}

.bundle-builder-mobile .timeline-slot {
  min-height: 430px;
}

.bundle-builder-mobile .timeline-circle {
  width: 82px;
  height: 82px;
}

.bundle-builder-mobile .timeline-card-wrap {
  width: 160px;
  max-width: 160px;
}

.bundle-builder-mobile .timeline-card-wrap--top {
  top: 24px;
}

.bundle-builder-mobile .timeline-card-wrap--bottom {
  bottom: 24px;
}

.bundle-builder-mobile .timeline-date--top {
  top: 96px;
}

.bundle-builder-mobile .timeline-date--bottom {
  bottom: 96px;
}

@media (max-width: 960px) {
  .timeline-track {
    min-height: 460px;
  }
}
</style>
