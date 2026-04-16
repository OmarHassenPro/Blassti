<template>
  <AppNavbar />

  <div class="event-page-shell" :class="[browserThemeClass, { 'is-mobile-layout': isMobile, 'is-tablet-layout': isTablet }]">
    <v-container fluid class="event-builder-page pb-10 pt-6">
      <v-row justify="center">
        <v-col cols="12" xxl="10" xl="11">
          <v-card rounded="xl" class="pa-4 pa-md-6 event-main-card">
            <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4 mb-6 page-hero">
              <div class="hero-copy">
                <div class="hero-badge mb-3">
                  <v-icon size="18" class="me-2">mdi-calendar-star</v-icon>
                  Event publishing workspace
                </div>
                <div class="text-h4 font-weight-bold hero-title">Create Event</div>
                <div class="text-medium-emphasis hero-subtitle">
                  Choose one of your reserved venues, add your event details, then publish it.
                </div>
              </div>

              <div class="d-flex ga-3 flex-wrap hero-chip-group">
                <v-chip color="primary" variant="tonal">
                  Reservations found: {{ usableReservations.length }}
                </v-chip>

                <v-chip
                  v-if="selectedReservation"
                  color="success"
                  variant="tonal"
                >
                  Slot locked from reservation
                </v-chip>

                <v-chip
                  color="info"
                  variant="tonal"
                >
                  Step {{ step }} of 2
                </v-chip>
              </div>
            </div>

            <v-stepper v-model="step" alt-labels flat class="bg-transparent clean-stepper page-stepper">
              <v-stepper-header>
                <v-stepper-item :value="1" title="Select venue" />
                <v-divider />
                <v-stepper-item :value="2" title="Event info" />
              </v-stepper-header>
            </v-stepper>

            <div v-show="step === 1" class="mt-8 step-panel">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card
                    rounded="xl"
                    variant="outlined"
                    class="pa-4 pa-md-6 clean-section-card section-card-glow"
                  >
                    <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-map-marker-radius-outline</v-icon><span>Reserved venue slot</span></div>
                    <div class="text-body-2 text-medium-emphasis mb-5">
                      Select a venue reservation you already paid for. The event date and time will be taken from that reservation.
                    </div>

                    <template v-if="usableReservations.length">
                      <div v-if="isMobile" class="mobile-reservation-rail mb-4">
                        <v-card
                          v-for="reservation in usableReservations"
                          :key="`mobile-${reservation.id}`"
                          rounded="xl"
                          variant="outlined"
                          class="reservation-option mobile-reservation-card"
                          :class="{ 'reservation-option--active': selectedReservationId === reservation.id }"
                          @click="selectedReservationId = reservation.id"
                        >
                          <div
                            v-if="getVenueImage(reservationVenueMap[reservation.id])"
                            class="mobile-reservation-card__media"
                          >
                            <img
                              :src="getVenueImage(reservationVenueMap[reservation.id])"
                              :alt="reservationVenueMap[reservation.id]?.title || 'Venue'"
                              class="mobile-reservation-card__image"
                            />
                            <div class="mobile-reservation-card__overlay">
                              <v-chip size="small" color="primary" variant="elevated">
                                {{ Number(reservation.total_price || 0).toFixed(2) }} TND
                              </v-chip>
                            </div>
                          </div>

                          <v-card-text class="pa-4">
                            <div class="d-flex align-start justify-space-between ga-2 mb-2">
                              <div class="mobile-reservation-card__title-wrap">
                                <div class="text-subtitle-1 font-weight-bold mobile-reservation-card__title">
                                  {{ reservationVenueMap[reservation.id]?.title || "Venue" }}
                                </div>
                                <div class="text-caption text-medium-emphasis mobile-reservation-card__location">
                                  {{ getVenueLocationText(reservationVenueMap[reservation.id]) }}
                                </div>
                              </div>

                              <v-avatar
                                size="30"
                                class="mobile-reservation-card__selector"
                                :class="{ 'mobile-reservation-card__selector--active': selectedReservationId === reservation.id }"
                              >
                                <v-icon size="18">
                                  {{ selectedReservationId === reservation.id ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                                </v-icon>
                              </v-avatar>
                            </div>

                            <div class="d-flex flex-wrap ga-2 mb-3">
                              <v-chip size="x-small" variant="outlined" rounded="lg">
                                {{ reservationVenueMap[reservation.id]?.category || "Venue" }}
                              </v-chip>

                              <v-chip size="x-small" variant="outlined" rounded="lg">
                                {{ reservationVenueMap[reservation.id]?.type || "Type" }}
                              </v-chip>

                              <v-chip size="x-small" color="success" variant="tonal" rounded="lg">
                                {{ formatSeatClasses(getSeatClassesForVenue(reservationVenueMap[reservation.id])) }}
                              </v-chip>
                            </div>

                            <div class="mobile-reservation-card__meta">
                              <div class="mobile-meta-pill">
                                <v-icon size="14">mdi-calendar-clock</v-icon>
                                <span>{{ formatReservationWindow(reservation) }}</span>
                              </div>

                              <div class="mobile-meta-pill">
                                <v-icon size="14">mdi-seat</v-icon>
                                <span>{{ getVenueCapacity(reservationVenueMap[reservation.id]) }} seats</span>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>

                      <v-radio-group
                        v-model="selectedReservationId"
                        color="primary"
                        class="reservation-radio-group"
                        :class="{ 'd-none': isMobile }"
                      >
                        <v-card
                          v-for="reservation in usableReservations"
                          :key="reservation.id"
                          rounded="xl"
                          variant="outlined"
                          class="mb-4 reservation-option"
                          :class="{ 'reservation-option--active': selectedReservationId === reservation.id }"
                          @click="selectedReservationId = reservation.id"
                        >
                          <v-card-text class="pa-4 pa-md-5">
                            <div class="d-flex align-start justify-space-between ga-3 flex-wrap">
                              <div class="d-flex ga-3">
                                <v-radio
                                  :value="reservation.id"
                                  class="mt-1"
                                  @click.stop
                                />

                                <div>
                                  <div class="text-h6 font-weight-bold mb-1">
                                    {{ reservationVenueMap[reservation.id]?.title || "Venue" }}
                                  </div>

                                  <div class="text-body-2 text-medium-emphasis mb-2">
                                    {{ getVenueLocationText(reservationVenueMap[reservation.id]) }}
                                  </div>

                                  <div class="d-flex flex-wrap ga-2 mb-2">
                                    <v-chip size="small" variant="outlined" rounded="lg">
                                      {{ reservationVenueMap[reservation.id]?.category || "Venue" }}
                                    </v-chip>

                                    <v-chip size="small" variant="outlined" rounded="lg">
                                      {{ reservationVenueMap[reservation.id]?.type || "Type" }}
                                    </v-chip>

                                    <v-chip size="small" color="success" variant="tonal" rounded="lg">
                                      {{ formatSeatClasses(getSeatClassesForVenue(reservationVenueMap[reservation.id])) }}
                                    </v-chip>
                                  </div>

                                  <div class="text-body-2">
                                    <strong>Reserved slot:</strong>
                                    {{ formatReservationWindow(reservation) }}
                                  </div>

                                  <div class="text-body-2 mt-1">
                                    <strong>Capacity:</strong>
                                    {{ getVenueCapacity(reservationVenueMap[reservation.id]) }}
                                  </div>
                                </div>
                              </div>

                              <div class="d-flex flex-column align-end ga-2">
                                <v-chip size="small" color="primary" variant="tonal">
                                  {{ Number(reservation.total_price || 0).toFixed(2) }} TND paid
                                </v-chip>

                                <v-chip
                                  v-if="isReservationAlreadyUsed(reservation.id)"
                                  size="small"
                                  color="warning"
                                  variant="tonal"
                                >
                                  Already used
                                </v-chip>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-radio-group>
                    </template>

                    <template v-else>
                      <v-alert type="warning" variant="tonal" rounded="lg" class="mb-4">
                        You need to have a venue reservation first before creating an event.
                      </v-alert>

                      <div class="text-body-2 text-medium-emphasis">
                        Reserve a venue first, then come back here to publish your event.
                      </div>
                    </template>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4" v-if="!isMobile">
                  <v-card
                    rounded="xl"
                    variant="outlined"
                    class="pa-4 pa-md-6 clean-section-card section-card-glow h-100 sticky-preview-card"
                  >
                    <div class="section-title mb-4 d-flex align-center ga-2"><v-icon size="18">mdi-eye-outline</v-icon><span>Selected reservation preview</span></div>

                    <template v-if="selectedReservation && selectedVenue">
                      <div class="preview-box mb-4" v-if="getVenueImage(selectedVenue)">
                        <img :src="getVenueImage(selectedVenue)" class="preview-image" :alt="selectedVenue.title" />
                      </div>

                      <div class="text-h6 font-weight-bold">
                        {{ selectedVenue.title }}
                      </div>

                      <div class="text-body-2 text-medium-emphasis mb-3">
                        {{ getVenueLocationText(selectedVenue) }}
                      </div>

                      <div class="d-flex ga-2 flex-wrap mb-3">
                        <v-chip size="small" color="primary" variant="tonal">
                          {{ selectedVenue.category || "Venue" }}
                        </v-chip>

                        <v-chip size="small" variant="outlined">
                          {{ selectedVenue.type || "Type" }}
                        </v-chip>
                      </div>

                      <div class="info-row">
                        <span class="label">Date</span>
                        <span>{{ formatDateOnly(selectedReservation.start_datetime || selectedReservation.start_date) }}</span>
                      </div>

                      <div class="info-row">
                        <span class="label">Time</span>
                        <span>{{ formatTimeRange(selectedReservation.start_datetime || selectedReservation.start_date, selectedReservation.end_datetime || selectedReservation.end_date) }}</span>
                      </div>

                      <div class="info-row">
                        <span class="label">Seat types</span>
                        <span>{{ formatSeatClasses(selectedSeatClasses) }}</span>
                      </div>

                      <div class="info-row">
                        <span class="label">Capacity</span>
                        <span>{{ getVenueCapacity(selectedVenue) }}</span>
                      </div>
                    </template>

                    <template v-else>
                      <v-sheet
                        rounded="xl"
                        class="empty-preview d-flex align-center justify-center text-center"
                      >
                        <div>
                          <v-icon size="42" class="mb-3 text-medium-emphasis">
                            mdi-calendar-search
                          </v-icon>
                          <div class="text-body-1 font-weight-medium">No reservation selected yet</div>
                          <div class="text-body-2 text-medium-emphasis mt-1">
                            Pick one of your reserved venue slots to continue.
                          </div>
                        </div>
                      </v-sheet>
                    </template>
                  </v-card>
                </v-col>
              </v-row>

              <v-card
                v-if="isMobile"
                rounded="xl"
                variant="outlined"
                class="pa-4 mt-4 clean-section-card section-card-glow mobile-inline-preview"
              >
                <div class="d-flex align-center justify-space-between ga-3 mb-3">
                  <div class="section-title d-flex align-center ga-2">
                    <v-icon size="18">mdi-eye-outline</v-icon>
                    <span>Selection preview</span>
                  </div>

                  <v-chip size="small" color="info" variant="tonal">
                    {{ selectedReservation ? 'Ready to continue' : 'Choose one slot' }}
                  </v-chip>
                </div>

                <template v-if="selectedReservation && selectedVenue">
                  <div class="mobile-inline-preview__top">
                    <div class="mobile-inline-preview__copy">
                      <div class="text-subtitle-1 font-weight-bold">{{ selectedVenue.title }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ getVenueLocationText(selectedVenue) }}
                      </div>
                    </div>

                    <v-chip size="small" color="primary" variant="tonal">
                      {{ formatSeatClasses(selectedSeatClasses) }}
                    </v-chip>
                  </div>

                  <div class="mobile-inline-preview__stats mt-3">
                    <div class="mobile-stat-card">
                      <span class="mobile-stat-card__label">Date</span>
                      <strong>{{ formatDateOnly(selectedReservation.start_datetime || selectedReservation.start_date) }}</strong>
                    </div>
                    <div class="mobile-stat-card">
                      <span class="mobile-stat-card__label">Time</span>
                      <strong>{{ formatTimeRange(selectedReservation.start_datetime || selectedReservation.start_date, selectedReservation.end_datetime || selectedReservation.end_date) }}</strong>
                    </div>
                    <div class="mobile-stat-card">
                      <span class="mobile-stat-card__label">Capacity</span>
                      <strong>{{ getVenueCapacity(selectedVenue) }}</strong>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="text-body-2 text-medium-emphasis">
                    Pick a reserved venue card above to unlock the event form.
                  </div>
                </template>
              </v-card>

              <v-divider class="my-6" />

              <div class="d-flex justify-space-between flex-wrap ga-3 action-bar" :class="{ 'mobile-sticky-action-bar': isMobile }">
                <v-btn
                  variant="outlined"
                  rounded="lg"
                  prepend-icon="mdi-store-search-outline"
                  @click="browseVenues"
                  @contextmenu.prevent="openRouteContextMenu($event, '/venueBrowsing', 'Browse venues')"
                  @touchstart.passive="startLongPressContextMenu($event, '/venueBrowsing', 'Browse venues')"
                  @touchend="cancelLongPressContextMenu"
                  @touchmove="cancelLongPressContextMenu"
                  @touchcancel="cancelLongPressContextMenu"
                  class="action-btn"
                >
                  Browse venues
                </v-btn>

                <v-btn
                  color="primary"
                  rounded="lg"
                  append-icon="mdi-arrow-right"
                  :disabled="!selectedReservation || isReservationAlreadyUsed(selectedReservationId)"
                  @click="goNext"
                  class="action-btn action-btn--primary"
                >
                  Continue
                </v-btn>
              </div>
            </div>

            <div v-show="step === 2" class="mt-8 step-panel">
              <div v-if="isMobile" class="mobile-editor-shell">
                <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-editor-hero mb-4">
                  <div class="d-flex align-start justify-space-between ga-3 mb-3">
                    <div>
                      <div class="section-title d-flex align-center ga-2 mb-1"><v-icon size="18">mdi-pencil-ruler</v-icon><span>Event builder</span></div>
                      <div class="text-body-2 text-medium-emphasis">
                        Fill each section in a cleaner mobile flow, then preview and publish.
                      </div>
                    </div>

                    <v-chip size="small" color="primary" variant="tonal">
                      {{ mobileEditorTab === 'preview' ? 'Final review' : 'In progress' }}
                    </v-chip>
                  </div>

                  <div class="mobile-inline-preview__top mb-3">
                    <div class="mobile-inline-preview__copy">
                      <div class="text-subtitle-1 font-weight-bold">{{ selectedVenue?.title || "Venue locked" }}</div>
                      <div class="text-caption text-medium-emphasis">{{ getVenueLocationText(selectedVenue) }}</div>
                    </div>

                    <v-chip size="small" color="success" variant="tonal">
                      {{ formatSeatClasses(selectedSeatClasses) }}
                    </v-chip>
                  </div>

                  <div class="mobile-inline-preview__stats mobile-editor-hero__stats">
                    <div class="mobile-stat-card">
                      <span class="mobile-stat-card__label">Date</span>
                      <strong>{{ lockedEventDate || "Date locked" }}</strong>
                    </div>
                    <div class="mobile-stat-card">
                      <span class="mobile-stat-card__label">Time</span>
                      <strong>{{ lockedStartTime && lockedEndTime ? `${lockedStartTime} - ${lockedEndTime}` : "Time locked" }}</strong>
                    </div>
                    <div class="mobile-stat-card">
                      <span class="mobile-stat-card__label">Capacity</span>
                      <strong>{{ getVenueCapacity(selectedVenue) }}</strong>
                    </div>
                  </div>
                </v-card>

                <div class="mobile-editor-tabs mb-4">
                  <v-btn
                    rounded="pill"
                    variant="flat"
                    class="mobile-editor-tab"
                    :class="{ 'mobile-editor-tab--active': mobileEditorTab === 'details' }"
                    @click="mobileEditorTab = 'details'"
                  >
                    Details
                  </v-btn>

                  <v-btn
                    rounded="pill"
                    variant="flat"
                    class="mobile-editor-tab"
                    :class="{ 'mobile-editor-tab--active': mobileEditorTab === 'media' }"
                    @click="mobileEditorTab = 'media'"
                  >
                    Media
                  </v-btn>

                  <v-btn
                    rounded="pill"
                    variant="flat"
                    class="mobile-editor-tab"
                    :class="{ 'mobile-editor-tab--active': mobileEditorTab === 'tickets' }"
                    @click="mobileEditorTab = 'tickets'"
                  >
                    Tickets
                  </v-btn>

                  <v-btn
                    rounded="pill"
                    variant="flat"
                    class="mobile-editor-tab"
                    :class="{ 'mobile-editor-tab--active': mobileEditorTab === 'finance' }"
                    @click="mobileEditorTab = 'finance'"
                  >
                    Finance
                  </v-btn>

                  <v-btn
                    rounded="pill"
                    variant="flat"
                    class="mobile-editor-tab"
                    :class="{ 'mobile-editor-tab--active': mobileEditorTab === 'preview' }"
                    @click="mobileEditorTab = 'preview'"
                  >
                    Preview
                  </v-btn>
                </div>

                <v-window v-model="mobileEditorTab" class="mobile-editor-window" :touch="false">
                  <v-window-item value="details">
                    <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-editor-card">
                      <div class="section-title mb-4 d-flex align-center ga-2"><v-icon size="18">mdi-form-select</v-icon><span>Basic event details</span></div>

                      <div class="d-flex flex-wrap ga-2 mb-4 quick-meta-row">
                        <v-chip size="small" color="primary" variant="tonal">
                          <v-icon start size="16">mdi-office-building</v-icon>
                          {{ selectedVenue?.title || "Venue locked" }}
                        </v-chip>
                        <v-chip size="small" color="success" variant="tonal">
                          <v-icon start size="16">mdi-calendar-check-outline</v-icon>
                          {{ lockedEventDate || "Date locked" }}
                        </v-chip>
                        <v-chip size="small" color="info" variant="tonal">
                          <v-icon start size="16">mdi-clock-outline</v-icon>
                          {{ lockedStartTime && lockedEndTime ? `${lockedStartTime} - ${lockedEndTime}` : "Time locked" }}
                        </v-chip>
                      </div>

                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="form.title"
                            label="Event title"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-select
                            v-model="form.type"
                            :items="eventTypeOptions"
                            label="Event category"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="6">
                          <v-text-field
                            :model-value="lockedEventDate"
                            label="Event date"
                            variant="outlined"
                            rounded="lg"
                            readonly
                          />
                        </v-col>

                        <v-col cols="6">
                          <v-text-field
                            :model-value="lockedStartTime && lockedEndTime ? `${lockedStartTime} - ${lockedEndTime}` : ''"
                            label="Time"
                            variant="outlined"
                            rounded="lg"
                            readonly
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-select
                            v-model="form.age_restriction"
                            :items="ageRestrictionOptions"
                            label="Age restriction"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            :model-value="selectedVenue?.title || ''"
                            label="Venue"
                            variant="outlined"
                            rounded="lg"
                            readonly
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            :model-value="getVenueCity(selectedVenue)"
                            label="City"
                            variant="outlined"
                            rounded="lg"
                            readonly
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-textarea
                            v-model="form.description"
                            label="Event description"
                            rows="5"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-window-item>

                  <v-window-item value="media">
                    <div class="mobile-editor-stack">
                      <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-editor-card">
                        <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-image-outline</v-icon><span>Event images</span></div>
                        <div class="text-caption text-medium-emphasis mb-4">
                          One profile image is required. You can also add up to 3 extra images.
                        </div>

                        <v-row>
                          <v-col cols="12">
                            <v-file-input
                              ref="coverImageInput"
                              accept="image/*"
                              label="Event profile image"
                              variant="outlined"
                              rounded="lg"
                              prepend-icon="mdi-camera"
                              show-size
                              @update:modelValue="handleCoverImage"
                            />
                          </v-col>

                          <v-col cols="12" v-if="form.image">
                            <div class="preview-box">
                              <img :src="form.image" class="preview-image" alt="Event cover" />
                            </div>
                          </v-col>

                          <v-col cols="12">
                            <v-file-input
                              ref="extraImagesInput"
                              accept="image/*"
                              label="Extra event images (max 3)"
                              variant="outlined"
                              rounded="lg"
                              prepend-icon="mdi-image-multiple"
                              show-size
                              multiple
                              @update:modelValue="handleExtraImages"
                            />
                          </v-col>

                          <v-col cols="12" v-if="form.extra_images.length">
                            <div class="mobile-extra-images-grid">
                              <v-card
                                v-for="(image, index) in form.extra_images"
                                :key="`mobile-extra-${index}`"
                                rounded="xl"
                                variant="outlined"
                                class="pa-2"
                              >
                                <v-img :src="image" height="132" cover class="rounded-lg" />
                                <div class="d-flex justify-end mt-2">
                                  <v-btn
                                    color="error"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-delete-outline"
                                    @click="removeExtraImage(index)"
                                  >
                                    Remove
                                  </v-btn>
                                </div>
                              </v-card>
                            </div>
                          </v-col>
                        </v-row>
                      </v-card>
                    </div>
                  </v-window-item>

                  <v-window-item value="tickets">
                    <div class="mobile-editor-stack">
                      <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-editor-card">
                        <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-ticket-confirmation-outline</v-icon><span>Ticket pricing by seat type</span></div>
                        <div class="text-caption text-medium-emphasis mb-4">
                          Only the seat categories that exist in the selected venue are shown.
                        </div>

                        <v-row>
                          <v-col cols="12" v-if="hasSeatClass('Regular')">
                            <v-text-field
                              v-model.number="form.ticket_prices.regular"
                              type="number"
                              min="0"
                              label="Regular ticket price (TND)"
                              variant="outlined"
                              rounded="lg"
                            />
                          </v-col>

                          <v-col cols="12" v-if="hasSeatClass('Special')">
                            <v-text-field
                              v-model.number="form.ticket_prices.special"
                              type="number"
                              min="0"
                              label="Special ticket price (TND)"
                              variant="outlined"
                              rounded="lg"
                            />
                          </v-col>

                          <v-col cols="12" v-if="hasSeatClass('VIP')">
                            <v-text-field
                              v-model.number="form.ticket_prices.vip"
                              type="number"
                              min="0"
                              label="VIP ticket price (TND)"
                              variant="outlined"
                              rounded="lg"
                            />
                          </v-col>
                        </v-row>
                      </v-card>

                      <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-editor-card">
                        <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-account-music-outline</v-icon><span>Linked users</span></div>
                        <div class="text-caption text-medium-emphasis mb-4">
                          Link any user on the platform. Once the event is published, linked users are automatically treated as artists and they will receive a notification.
                        </div>

                        <v-autocomplete
                          v-model="form.featured_artist_ids"
                          :items="artistUserOptions"
                          item-title="label"
                          item-value="value"
                          label="Select linked user(s)"
                          variant="outlined"
                          rounded="lg"
                          chips
                          closable-chips
                          multiple
                          clearable
                        />

                        <div v-if="selectedArtistUsers.length" class="mt-4 d-flex flex-wrap ga-2">
                          <v-chip
                            v-for="artist in selectedArtistUsers"
                            :key="artist.id"
                            color="primary"
                            variant="tonal"
                            rounded="lg"
                          >
                            {{ artist.full_name }}
                          </v-chip>
                        </div>
                      </v-card>
                    </div>
                  </v-window-item>

                  <v-window-item value="finance">
                    <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-editor-card">
                      <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-bank-outline</v-icon><span>Organizer banking info</span></div>
                      <div class="text-caption text-medium-emphasis mb-4">
                        This banking info is stored privately so you can receive money later from event sales.
                      </div>

                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="form.bank_account_info.account_holder_name"
                            label="Account holder full name"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            v-model="form.bank_account_info.bank_name"
                            label="Bank name"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            v-model="form.bank_account_info.account_number"
                            label="Account number"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            v-model="form.bank_account_info.rib"
                            label="RIB"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            v-model="form.bank_account_info.iban"
                            label="IBAN"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-text-field
                            v-model="form.bank_account_info.swift"
                            label="SWIFT / BIC"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-window-item>

                  <v-window-item value="preview">
                    <div class="mobile-editor-stack">
                      <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-inline-preview mobile-editor-card">
                        <div class="section-title mb-3 d-flex align-center ga-2"><v-icon size="18">mdi-calendar-clock-outline</v-icon><span>Venue slot snapshot</span></div>

                        <div class="mobile-inline-preview__top">
                          <div class="mobile-inline-preview__copy">
                            <div class="text-subtitle-1 font-weight-bold">
                              {{ selectedVenue?.title || "No venue" }}
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              {{ getVenueLocationText(selectedVenue) }}
                            </div>
                          </div>
                          <v-chip size="small" color="primary" variant="tonal">
                            {{ formatSeatClasses(selectedSeatClasses) }}
                          </v-chip>
                        </div>

                        <div class="mobile-inline-preview__stats mt-3">
                          <div class="mobile-stat-card">
                            <span class="mobile-stat-card__label">Date</span>
                            <strong>{{ lockedEventDate }}</strong>
                          </div>
                          <div class="mobile-stat-card">
                            <span class="mobile-stat-card__label">Time</span>
                            <strong>{{ lockedStartTime }} - {{ lockedEndTime }}</strong>
                          </div>
                          <div class="mobile-stat-card">
                            <span class="mobile-stat-card__label">Capacity</span>
                            <strong>{{ getVenueCapacity(selectedVenue) }}</strong>
                          </div>
                        </div>
                      </v-card>

                      <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-inline-preview mobile-editor-card">
                        <div class="section-title mb-3 d-flex align-center ga-2"><v-icon size="18">mdi-monitor-eye</v-icon><span>Live event preview</span></div>

                        <div class="mobile-event-preview">
                          <div class="mobile-event-preview__media" v-if="form.image">
                            <img :src="form.image" class="mobile-event-preview__image" alt="Preview image" />
                          </div>

                          <div class="mobile-event-preview__body">
                            <div class="text-subtitle-1 font-weight-bold">
                              {{ form.title || "Untitled event" }}
                            </div>

                            <div class="text-caption text-medium-emphasis mb-2">
                              {{ selectedVenue?.title || "Venue not selected" }}
                            </div>

                            <div class="d-flex ga-2 flex-wrap mb-3">
                              <v-chip size="small" color="primary" variant="tonal">
                                {{ form.type || "Category" }}
                              </v-chip>

                              <v-chip size="small" variant="outlined">
                                {{ form.age_restriction || "Age restriction" }}
                              </v-chip>
                            </div>

                            <div class="text-body-2 preview-description mb-3">
                              {{ form.description || "No description yet." }}
                            </div>

                            <div class="mobile-price-row">
                              <v-chip v-if="hasSeatClass('Regular')" size="small" color="info" variant="tonal">
                                Regular: {{ numberOrDash(form.ticket_prices.regular) }} TND
                              </v-chip>

                              <v-chip v-if="hasSeatClass('Special')" size="small" color="error" variant="tonal">
                                Special: {{ numberOrDash(form.ticket_prices.special) }} TND
                              </v-chip>

                              <v-chip v-if="hasSeatClass('VIP')" size="small" color="warning" variant="tonal">
                                VIP: {{ numberOrDash(form.ticket_prices.vip) }} TND
                              </v-chip>
                            </div>
                          </div>
                        </div>
                      </v-card>
                    </div>
                  </v-window-item>
                </v-window>
              </div>

              <v-row v-if="!isMobile" class="ga-md-0 ga-2 step-two-layout">
                <v-col cols="12" md="7" lg="8">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card section-card-glow">
                    <div class="section-title mb-4 d-flex align-center ga-2"><v-icon size="18">mdi-form-select</v-icon><span>Basic event details</span></div>

                    <div class="d-flex flex-wrap ga-2 mb-4 quick-meta-row">
                      <v-chip size="small" color="primary" variant="tonal">
                        <v-icon start size="16">mdi-office-building</v-icon>
                        {{ selectedVenue?.title || "Venue locked" }}
                      </v-chip>
                      <v-chip size="small" color="success" variant="tonal">
                        <v-icon start size="16">mdi-calendar-check-outline</v-icon>
                        {{ lockedEventDate || "Date locked" }}
                      </v-chip>
                      <v-chip size="small" color="info" variant="tonal">
                        <v-icon start size="16">mdi-clock-outline</v-icon>
                        {{ lockedStartTime && lockedEndTime ? `${lockedStartTime} - ${lockedEndTime}` : "Time locked" }}
                      </v-chip>
                    </div>

                    <v-card
                      v-if="isMobile"
                      rounded="xl"
                      variant="outlined"
                      class="pa-3 mb-4 mobile-inline-preview mobile-form-summary"
                    >
                      <div class="d-flex align-center justify-space-between ga-3 mb-3">
                        <div class="text-subtitle-2 font-weight-bold">Locked venue slot</div>
                        <v-chip size="small" color="success" variant="tonal">Reservation linked</v-chip>
                      </div>

                      <div class="mobile-inline-preview__stats">
                        <div class="mobile-stat-card">
                          <span class="mobile-stat-card__label">Venue</span>
                          <strong>{{ selectedVenue?.title || "Venue locked" }}</strong>
                        </div>
                        <div class="mobile-stat-card">
                          <span class="mobile-stat-card__label">Date</span>
                          <strong>{{ lockedEventDate || "Date locked" }}</strong>
                        </div>
                        <div class="mobile-stat-card">
                          <span class="mobile-stat-card__label">Time</span>
                          <strong>{{ lockedStartTime && lockedEndTime ? `${lockedStartTime} - ${lockedEndTime}` : "Time locked" }}</strong>
                        </div>
                      </div>
                    </v-card>

                    <v-row>
                      <v-col cols="12" md="7">
                        <v-text-field
                          v-model="form.title"
                          label="Event title"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="5">
                        <v-select
                          v-model="form.type"
                          :items="eventTypeOptions"
                          label="Event category"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="lockedEventDate"
                          label="Event date"
                          variant="outlined"
                          rounded="lg"
                          readonly
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                          :model-value="lockedStartTime"
                          label="Start time"
                          variant="outlined"
                          rounded="lg"
                          readonly
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                          :model-value="lockedEndTime"
                          label="End time"
                          variant="outlined"
                          rounded="lg"
                          readonly
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-select
                          v-model="form.age_restriction"
                          :items="ageRestrictionOptions"
                          label="Age restriction"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          :model-value="selectedVenue?.title || ''"
                          label="Venue"
                          variant="outlined"
                          rounded="lg"
                          readonly
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          :model-value="getVenueCity(selectedVenue)"
                          label="City"
                          variant="outlined"
                          rounded="lg"
                          readonly
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-textarea
                          v-model="form.description"
                          label="Event description"
                          rows="5"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                    </v-row>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 mt-4 clean-section-card section-card-glow">
                    <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-image-outline</v-icon><span>Event images</span></div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      One profile image is required. You can also add up to 3 extra images. Images are compressed hard before saving to reduce local storage usage.
                    </div>

                    <v-row>
                      <v-col cols="12">
                        <v-file-input
                          ref="coverImageInput"
                          accept="image/*"
                          label="Event profile image"
                          variant="outlined"
                          rounded="lg"
                          prepend-icon="mdi-camera"
                          show-size
                          @update:modelValue="handleCoverImage"
                        />
                      </v-col>

                      <v-col cols="12" v-if="form.image">
                        <div class="preview-box">
                          <img :src="form.image" class="preview-image" alt="Event cover" />
                        </div>
                      </v-col>

                      <v-col cols="12">
                        <v-file-input
                          ref="extraImagesInput"
                          accept="image/*"
                          label="Extra event images (max 3)"
                          variant="outlined"
                          rounded="lg"
                          prepend-icon="mdi-image-multiple"
                          show-size
                          multiple
                          @update:modelValue="handleExtraImages"
                        />
                      </v-col>

                      <v-col cols="12" v-if="form.extra_images.length">
                        <v-row>
                          <v-col
                            v-for="(image, index) in form.extra_images"
                            :key="`extra-${index}`"
                            cols="12"
                            sm="6"
                            md="4"
                          >
                            <v-card rounded="xl" variant="outlined" class="pa-2">
                              <v-img :src="image" height="140" cover class="rounded-lg" />
                              <div class="d-flex justify-end mt-2">
                                <v-btn
                                  color="error"
                                  variant="text"
                                  size="small"
                                  prepend-icon="mdi-delete-outline"
                                  @click="removeExtraImage(index)"
                                >
                                  Remove
                                </v-btn>
                              </div>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 mt-4 clean-section-card section-card-glow">
                    <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-ticket-confirmation-outline</v-icon><span>Ticket pricing by seat type</span></div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      Only the seat categories that exist in the selected venue are shown.
                    </div>

                    <v-row>
                      <v-col cols="12" md="4" v-if="hasSeatClass('Regular')">
                        <v-text-field
                          v-model.number="form.ticket_prices.regular"
                          type="number"
                          min="0"
                          label="Regular ticket price (TND)"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4" v-if="hasSeatClass('Special')">
                        <v-text-field
                          v-model.number="form.ticket_prices.special"
                          type="number"
                          min="0"
                          label="Special ticket price (TND)"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4" v-if="hasSeatClass('VIP')">
                        <v-text-field
                          v-model.number="form.ticket_prices.vip"
                          type="number"
                          min="0"
                          label="VIP ticket price (TND)"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                    </v-row>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 mt-4 clean-section-card section-card-glow">
                    <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-bank-outline</v-icon><span>Organizer banking info</span></div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      This banking info is stored privately so you can receive money later from event sales.
                    </div>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.account_holder_name"
                          label="Account holder full name"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.bank_name"
                          label="Bank name"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.account_number"
                          label="Account number"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.rib"
                          label="RIB"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.iban"
                          label="IBAN"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.swift"
                          label="SWIFT / BIC"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                    </v-row>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 mt-4 clean-section-card section-card-glow">
                    <div class="section-title mb-2 d-flex align-center ga-2"><v-icon size="18">mdi-account-music-outline</v-icon><span>Linked users</span></div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      Link any user on the platform. Once the event is published, linked users are automatically treated as artists and they will receive a notification.
                    </div>

                    <v-autocomplete
                      v-model="form.featured_artist_ids"
                      :items="artistUserOptions"
                      item-title="label"
                      item-value="value"
                      label="Select linked user(s)"
                      variant="outlined"
                      rounded="lg"
                      chips
                      closable-chips
                      multiple
                      clearable
                    />

                    <div v-if="selectedArtistUsers.length" class="mt-4 d-flex flex-wrap ga-2">
                      <v-chip
                        v-for="artist in selectedArtistUsers"
                        :key="artist.id"
                        color="primary"
                        variant="tonal"
                        rounded="lg"
                      >
                        {{ artist.full_name }}
                      </v-chip>
                    </div>
                  </v-card>

                  <div v-if="isMobile" class="mobile-preview-stack mt-4">
                    <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-inline-preview">
                      <div class="section-title mb-3 d-flex align-center ga-2"><v-icon size="18">mdi-calendar-clock-outline</v-icon><span>Venue slot snapshot</span></div>

                      <div class="mobile-inline-preview__top">
                        <div class="mobile-inline-preview__copy">
                          <div class="text-subtitle-1 font-weight-bold">
                            {{ selectedVenue?.title || "No venue" }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ getVenueLocationText(selectedVenue) }}
                          </div>
                        </div>
                        <v-chip size="small" color="primary" variant="tonal">
                          {{ formatSeatClasses(selectedSeatClasses) }}
                        </v-chip>
                      </div>

                      <div class="mobile-inline-preview__stats mt-3">
                        <div class="mobile-stat-card">
                          <span class="mobile-stat-card__label">Date</span>
                          <strong>{{ lockedEventDate }}</strong>
                        </div>
                        <div class="mobile-stat-card">
                          <span class="mobile-stat-card__label">Time</span>
                          <strong>{{ lockedStartTime }} - {{ lockedEndTime }}</strong>
                        </div>
                        <div class="mobile-stat-card">
                          <span class="mobile-stat-card__label">Capacity</span>
                          <strong>{{ getVenueCapacity(selectedVenue) }}</strong>
                        </div>
                      </div>
                    </v-card>

                    <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card section-card-glow mobile-inline-preview">
                      <div class="section-title mb-3 d-flex align-center ga-2"><v-icon size="18">mdi-monitor-eye</v-icon><span>Live event preview</span></div>

                      <div class="mobile-event-preview">
                        <div class="mobile-event-preview__media" v-if="form.image">
                          <img :src="form.image" class="mobile-event-preview__image" alt="Preview image" />
                        </div>

                        <div class="mobile-event-preview__body">
                          <div class="text-subtitle-1 font-weight-bold">
                            {{ form.title || "Untitled event" }}
                          </div>

                          <div class="text-caption text-medium-emphasis mb-2">
                            {{ selectedVenue?.title || "Venue not selected" }}
                          </div>

                          <div class="d-flex ga-2 flex-wrap mb-3">
                            <v-chip size="small" color="primary" variant="tonal">
                              {{ form.type || "Category" }}
                            </v-chip>

                            <v-chip size="small" variant="outlined">
                              {{ form.age_restriction || "Age restriction" }}
                            </v-chip>
                          </div>

                          <div class="text-body-2 preview-description mb-3">
                            {{ form.description || "No description yet." }}
                          </div>

                          <div class="mobile-price-row">
                            <v-chip v-if="hasSeatClass('Regular')" size="small" color="info" variant="tonal">
                              Regular: {{ numberOrDash(form.ticket_prices.regular) }} TND
                            </v-chip>

                            <v-chip v-if="hasSeatClass('Special')" size="small" color="error" variant="tonal">
                              Special: {{ numberOrDash(form.ticket_prices.special) }} TND
                            </v-chip>

                            <v-chip v-if="hasSeatClass('VIP')" size="small" color="warning" variant="tonal">
                              VIP: {{ numberOrDash(form.ticket_prices.vip) }} TND
                            </v-chip>
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-col>

                <v-col cols="12" md="5" lg="4" v-if="!isMobile">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card section-card-glow mb-4 sticky-preview-card">
                    <div class="section-title mb-4 d-flex align-center ga-2"><v-icon size="18">mdi-calendar-clock-outline</v-icon><span>Selected venue slot</span></div>

                    <div class="preview-box mb-4" v-if="getVenueImage(selectedVenue)">
                      <img :src="getVenueImage(selectedVenue)" class="preview-image" :alt="selectedVenue?.title || 'Venue'" />
                    </div>

                    <div class="text-h6 font-weight-bold">
                      {{ selectedVenue?.title || "No venue" }}
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-3">
                      {{ getVenueLocationText(selectedVenue) }}
                    </div>

                    <div class="info-row">
                      <span class="label">Date</span>
                      <span>{{ lockedEventDate }}</span>
                    </div>

                    <div class="info-row">
                      <span class="label">Time</span>
                      <span>{{ lockedStartTime }} - {{ lockedEndTime }}</span>
                    </div>

                    <div class="info-row">
                      <span class="label">Seat types</span>
                      <span>{{ formatSeatClasses(selectedSeatClasses) }}</span>
                    </div>

                    <div class="info-row">
                      <span class="label">Capacity</span>
                      <span>{{ getVenueCapacity(selectedVenue) }}</span>
                    </div>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card section-card-glow">
                    <div class="section-title mb-4 d-flex align-center ga-2"><v-icon size="18">mdi-monitor-eye</v-icon><span>Event preview</span></div>

                    <div class="preview-box mb-4" v-if="form.image">
                      <img :src="form.image" class="preview-image" alt="Preview image" />
                    </div>

                    <div class="text-h6 font-weight-bold">
                      {{ form.title || "Untitled event" }}
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-2">
                      {{ selectedVenue?.title || "Venue not selected" }}
                    </div>

                    <div class="d-flex ga-2 flex-wrap mb-3">
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ form.type || "Category" }}
                      </v-chip>

                      <v-chip size="small" variant="outlined">
                        {{ form.age_restriction || "Age restriction" }}
                      </v-chip>
                    </div>

                    <div class="text-body-2 mb-4 preview-description">
                      {{ form.description || "No description yet." }}
                    </div>

                    <div class="d-flex flex-column ga-2">
                      <v-chip v-if="hasSeatClass('Regular')" size="small" color="info" variant="tonal">
                        Regular: {{ numberOrDash(form.ticket_prices.regular) }} TND
                      </v-chip>

                      <v-chip v-if="hasSeatClass('Special')" size="small" color="error" variant="tonal">
                        Special: {{ numberOrDash(form.ticket_prices.special) }} TND
                      </v-chip>

                      <v-chip v-if="hasSeatClass('VIP')" size="small" color="warning" variant="tonal">
                        VIP: {{ numberOrDash(form.ticket_prices.vip) }} TND
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <div class="d-flex justify-space-between flex-wrap ga-3 action-bar" :class="{ 'mobile-sticky-action-bar': isMobile }">
                <v-btn
                  variant="outlined"
                  rounded="lg"
                  prepend-icon="mdi-arrow-left"
                  @click="step = 1"
                  class="action-btn"
                >
                  Previous
                </v-btn>

                <div class="d-flex ga-2 flex-wrap">
                  <v-btn
                    variant="outlined"
                    rounded="lg"
                    prepend-icon="mdi-store-search-outline"
                    @click="browseVenues"
                    @contextmenu.prevent="openRouteContextMenu($event, '/venueBrowsing', 'Browse venues')"
                    @touchstart.passive="startLongPressContextMenu($event, '/venueBrowsing', 'Browse venues')"
                    @touchend="cancelLongPressContextMenu"
                    @touchmove="cancelLongPressContextMenu"
                    @touchcancel="cancelLongPressContextMenu"
                    class="action-btn"
                  >
                    Browse venues
                  </v-btn>

                  <v-btn
                    color="primary"
                    rounded="lg"
                    prepend-icon="mdi-send"
                    @click="publishEvent"
                    class="action-btn action-btn--primary"
                  >
                    Publish event
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        location="bottom right"
        rounded="pill"
        timeout="3500"
        class="floating-snackbar"
      >
        {{ snackbar.text }}
      </v-snackbar>

      <v-dialog v-model="publishDialog" :max-width="isMobile ? undefined : 540" :fullscreen="isMobile" class="publish-dialog">
        <v-card rounded="xl" class="publish-dialog-card">
          <v-card-title class="text-h6 font-weight-bold">
            Event published 🎉
          </v-card-title>

          <v-card-text>
            Your event is now live on Blassti and linked users were notified.
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="closePublishDialog">Close</v-btn>
            <v-btn color="primary" rounded="lg" @click="goToPublishedEvent"
              @contextmenu.prevent="openRouteContextMenu($event, publishedEventRoute, 'Open event page')"
              @touchstart.passive="startLongPressContextMenu($event, publishedEventRoute, 'Open event page')"
              @touchend="cancelLongPressContextMenu"
              @touchmove="cancelLongPressContextMenu"
              @touchcancel="cancelLongPressContextMenu">
              Open event page
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-menu
        v-model="linkContextMenu.show"
        :target="[linkContextMenu.x, linkContextMenu.y]"
        location="end top"
        absolute
        scrim="false"
        class="route-context-menu"
      >
        <v-list rounded="xl" class="context-menu-list">
          <v-list-subheader>{{ linkContextMenu.label || "Open link" }}</v-list-subheader>
          <v-list-item prepend-icon="mdi-open-in-new" title="Open in new tab" @click="handleContextMenuAction('tab')" />
          <v-list-item prepend-icon="mdi-monitor-share" title="Open in new window" @click="handleContextMenuAction('window')" />
          <v-list-item prepend-icon="mdi-content-copy" title="Copy link" @click="handleContextMenuAction('copy')" />
        </v-list>
      </v-menu>

    </v-container>
  </div>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useDisplay, useTheme } from "vuetify"
import { useRouter } from "vue-router"
import { fileToDataUrl, loadImageElement } from "@/utils/imageUtils"
import { get_Current_User, get_All_Users, create_Event_For_User } from "@/dataModel/user"
import { get_Reservations_By_User_Id } from "@/dataModel/venue_reservation"
import { get_Venue_By_Id } from "@/dataModel/venue"
import { add_Notification } from "@/dataModel/notification"

const router = useRouter()
const display = useDisplay()
const theme = useTheme()

const THEME_STORAGE_KEY = "blassti-theme"
const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})
const browserThemeClass = computed(() => currentTheme.value === "dark" ? "event-page-shell--dark" : "event-page-shell--light")
const isMobile = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)
const publishedEventRoute = computed(() => {
  return publishedEventId.value ? `/o_eventinfo?id=${publishedEventId.value}` : "/o_eventinfo"
})

const linkContextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  href: "",
  label: "",
})

let longPressTimer = null

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
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === "light" || savedTheme === "dark") {
      theme.global.name.value = savedTheme
      document.documentElement.setAttribute("data-app-theme", savedTheme)
      document.documentElement.style.colorScheme = savedTheme
    }
  }
}

function openRouteContextMenu(event, path, label = "Open link") {
  const href = router.resolve(path).href
  const point = Array.isArray(event?.changedTouches) ? event.changedTouches[0] : event

  linkContextMenu.x = Number(point?.clientX || window.innerWidth / 2)
  linkContextMenu.y = Number(point?.clientY || window.innerHeight / 2)
  linkContextMenu.href = href
  linkContextMenu.label = label
  linkContextMenu.show = true
}

function startLongPressContextMenu(event, path, label) {
  if (!isMobile.value) return
  cancelLongPressContextMenu()
  longPressTimer = window.setTimeout(() => {
    openRouteContextMenu(event, path, label)
  }, 520)
}

function cancelLongPressContextMenu() {
  if (longPressTimer) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

async function handleContextMenuAction(action) {
  const href = linkContextMenu.href
  if (!href) return

  if (action === "copy") {
    try {
      const absoluteHref = new URL(href, window.location.origin).href
      await navigator.clipboard.writeText(absoluteHref)
      notify("Link copied.", "success")
    } catch (error) {
      console.error("Copy link failed:", error)
      notify("Failed to copy link.", "error")
    } finally {
      linkContextMenu.show = false
    }
    return
  }

  const absoluteHref = new URL(href, window.location.origin).href

  if (action === "window") {
    window.open(absoluteHref, "_blank", "noopener,noreferrer")
  } else {
    window.open(absoluteHref, "_blank", "noopener,noreferrer")
  }

  linkContextMenu.show = false
}

const step = ref(1)
const publishDialog = ref(false)
const publishedEventId = ref("")

const coverImageInput = ref(null)
const extraImagesInput = ref(null)

const EVENT_PRIVATE_META_KEY = "blassti_event_private_meta_v3"

const MAX_SINGLE_UPLOAD_MB = 8
const COVER_SIZE = 640
const EXTRA_SIZE = 480
const COVER_QUALITY = 0.68
const EXTRA_QUALITY = 0.62
const EMERGENCY_COVER_SIZE = 480
const EMERGENCY_COVER_QUALITY = 0.52

const eventTypeOptions = [
  "Concerts",
  "Sports",
  "Shows",
  "Festivals",
  "Movies",
  "Exhibitions",
  "Education",
  "Stand-up Comedy",
  "Business",
  "Other",
]

const ageRestrictionOptions = [
  "All ages",
  "15+",
  "18+",
]

const snackbar = reactive({
  show: false,
  text: "",
  color: "primary",
})

const selectedReservationId = ref("")
const mobileEditorTab = ref("details")

const form = reactive({
  title: "",
  type: "",
  description: "",
  image: "",
  extra_images: [],
  age_restriction: "All ages",
  featured_artist_ids: [],
  ticket_prices: {
    regular: 0,
    special: 0,
    vip: 0,
  },
  bank_account_info: {
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    rib: "",
    iban: "",
    swift: "",
  },
})

const currentUser = computed(() => get_Current_User())
const allUsers = computed(() => get_All_Users())

const artistUserOptions = computed(() => {
  return allUsers.value
    .map(user => ({
      label: `${user.full_name} — ${user.email}`,
      value: user.id,
    }))
})

const selectedArtistUsers = computed(() => {
  const ids = Array.isArray(form.featured_artist_ids) ? form.featured_artist_ids : []
  return allUsers.value.filter(user => ids.includes(user.id))
})

const myReservations = computed(() => {
  if (!currentUser.value?.id) return []

  return get_Reservations_By_User_Id(currentUser.value.id)
    .filter(reservation => {
      const status = String(reservation.status || "").toLowerCase()
      const endValue = reservation.end_datetime || reservation.end_date
      const endTime = new Date(endValue).getTime()

      return (
        status !== "cancelled" &&
        reservation.venue_id &&
        Number.isFinite(endTime) &&
        endTime > Date.now()
      )
    })
    .sort((a, b) => {
      const aTime = new Date(a.start_datetime || a.start_date).getTime()
      const bTime = new Date(b.start_datetime || b.start_date).getTime()
      return aTime - bTime
    })
})

const reservationVenueMap = computed(() => {
  const map = {}

  myReservations.value.forEach(reservation => {
    map[reservation.id] = safeVenue(get_Venue_By_Id(reservation.venue_id))
  })

  return map
})

const usableReservations = computed(() => {
  return myReservations.value.filter(reservation => {
    const venue = reservationVenueMap.value[reservation.id]
    return venue && !isReservationAlreadyUsed(reservation.id)
  })
})

const selectedReservation = computed(() => {
  if (!selectedReservationId.value) return null
  return myReservations.value.find(reservation => reservation.id === selectedReservationId.value) || null
})

const selectedVenue = computed(() => {
  if (!selectedReservation.value?.venue_id) return null
  return safeVenue(get_Venue_By_Id(selectedReservation.value.venue_id))
})

const selectedSeatClasses = computed(() => getSeatClassesForVenue(selectedVenue.value))

const lockedEventDate = computed(() => {
  const value = selectedReservation.value?.start_datetime || selectedReservation.value?.start_date
  return value ? formatDateOnly(value) : ""
})

const lockedStartTime = computed(() => {
  const value = selectedReservation.value?.start_datetime || selectedReservation.value?.start_date
  return value ? formatTimeOnly(value) : ""
})

const lockedEndTime = computed(() => {
  const value = selectedReservation.value?.end_datetime || selectedReservation.value?.end_date
  return value ? formatTimeOnly(value) : ""
})

onMounted(() => {
  loadSavedTheme()
  window.addEventListener("storage", handleWindowStorage)
})

onBeforeUnmount(() => {
  cancelLongPressContextMenu()
  window.removeEventListener("storage", handleWindowStorage)
})

function notify(text, color = "primary") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function safeVenue(venue) {
  if (!venue || typeof venue !== "object") return null
  return venue
}

function getVenueImage(venue) {
  if (!venue) return ""
  return venue.image || ""
}

function getVenueCapacity(venue) {
  if (!venue) return 0
  const n = Number(venue.capacity)
  return Number.isFinite(n) ? n : 0
}

function getVenueCity(venue) {
  if (!venue) return ""
  return venue.location || ""
}

function getVenueLocationText(venue) {
  if (!venue) return "-"
  const parts = [venue.location, venue.exact_address].filter(Boolean)
  return parts.length ? parts.join(" · ") : "-"
}

function numberOrDash(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : "-"
}

function browseVenues() {
  router.push("/venueBrowsing")
}

function normalizeFilesInput(input) {
  if (!input) return []
  if (input instanceof File) return [input]
  if (Array.isArray(input)) return input.filter(file => file instanceof File)
  if (typeof FileList !== "undefined" && input instanceof FileList) return Array.from(input)
  return []
}

function validateImageFileSize(file) {
  const fileSizeMb = Number(file?.size || 0) / (1024 * 1024)
  return fileSizeMb <= MAX_SINGLE_UPLOAD_MB
}

async function convertImageToJpegDataUrl(file, options = {}) {
  const rawDataUrl = await fileToDataUrl(file)
  const img = await loadImageElement(rawDataUrl)

  const size = Number(options.size ?? 512)
  const quality = Number(options.quality ?? 0.7)

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext("2d")

  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)

  ctx.drawImage(
    img,
    sx,
    sy,
    side,
    side,
    0,
    0,
    size,
    size
  )

  return canvas.toDataURL("image/jpeg", quality)
}

async function handleCoverImage(input) {
  const files = normalizeFilesInput(input)
  const file = files[0] || null
  if (!file) return

  if (!validateImageFileSize(file)) {
    notify(`Cover image is too large. Maximum allowed size is ${MAX_SINGLE_UPLOAD_MB} MB.`, "error")
    return
  }

  try {
    form.image = await convertImageToJpegDataUrl(file, {
      size: COVER_SIZE,
      quality: COVER_QUALITY,
    })
    notify("Event profile image added.", "success")
  } catch (error) {
    console.error("Cover image upload failed:", error)
    notify("Failed to upload image.", "error")
  }
}

async function handleExtraImages(input) {
  const fileList = normalizeFilesInput(input)
  if (!fileList.length) return

  const availableSlots = 3 - form.extra_images.length

  if (availableSlots <= 0) {
    notify("You can only upload up to 3 extra images.", "error")
    return
  }

  const oversizedFile = fileList.find(file => !validateImageFileSize(file))
  if (oversizedFile) {
    notify(`One of the extra images is too large. Maximum allowed size is ${MAX_SINGLE_UPLOAD_MB} MB.`, "error")
    return
  }

  const limitedFiles = fileList.slice(0, availableSlots)

  if (fileList.length > availableSlots) {
    notify(`Only ${availableSlots} more extra image(s) can be added.`, "warning")
  }

  try {
    const encoded = await Promise.all(
      limitedFiles.map(file =>
        convertImageToJpegDataUrl(file, {
          size: EXTRA_SIZE,
          quality: EXTRA_QUALITY,
        })
      )
    )
    form.extra_images.push(...encoded)
    notify("Extra event images added.", "success")
  } catch (error) {
    console.error("Extra image upload failed:", error)
    notify("Failed to upload extra images.", "error")
  }
}

function removeExtraImage(index) {
  form.extra_images.splice(index, 1)
}

function getSeatClassesForVenue(venue) {
  if (!venue) return ["Regular"]

  const classSet = new Set()

  const directSeatClasses = Array.isArray(venue.seat_classes) ? venue.seat_classes : []
  directSeatClasses.forEach(item => {
    const normalized = normalizeSeatClass(item)
    if (normalized) classSet.add(normalized)
  })

  const designSeats = Array.isArray(venue?.design?.seats) ? venue.design.seats : []
  designSeats.forEach(seat => {
    const normalized = normalizeSeatClass(seat?.seat_class || seat?.type || seat?.category)
    if (normalized) classSet.add(normalized)
  })

  const nestedLayouts = [
    venue?.layout?.seats,
    venue?.designer?.seats,
    venue?.seating?.seats,
    venue?.venue_design?.seats,
  ]

  nestedLayouts.forEach(seatArray => {
    if (!Array.isArray(seatArray)) return

    seatArray.forEach(seat => {
      const normalized = normalizeSeatClass(seat?.seat_class || seat?.type || seat?.category)
      if (normalized) classSet.add(normalized)
    })
  })

  if (!classSet.size) {
    classSet.add("Regular")
  }

  return Array.from(classSet).sort((a, b) => {
    const order = { Regular: 1, Special: 2, VIP: 3 }
    return (order[a] || 99) - (order[b] || 99)
  })
}

function normalizeSeatClass(value) {
  const text = String(value || "").trim().toLowerCase()
  if (!text) return null
  if (text === "regular" || text === "normal") return "Regular"
  if (text === "special") return "Special"
  if (text === "vip") return "VIP"
  return null
}

function hasSeatClass(seatClass) {
  return selectedSeatClasses.value.includes(seatClass)
}

function formatSeatClasses(classes) {
  if (!Array.isArray(classes) || !classes.length) return "Regular"
  return classes.join(" / ")
}

function formatDateOnly(value) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatTimeOnly(value) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

function formatTimeRange(startValue, endValue) {
  return `${formatTimeOnly(startValue)} - ${formatTimeOnly(endValue)}`
}

function formatReservationWindow(reservation) {
  const start = reservation.start_datetime || reservation.start_date
  const end = reservation.end_datetime || reservation.end_date
  return `${formatDateOnly(start)} · ${formatTimeOnly(start)} - ${formatTimeOnly(end)}`
}

function loadPrivateEventMeta() {
  try {
    const saved = localStorage.getItem(EVENT_PRIVATE_META_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error("Failed to parse private event meta.", error)
    return {}
  }
}

function savePrivateEventMeta(map) {
  localStorage.setItem(EVENT_PRIVATE_META_KEY, JSON.stringify(map))
}

function isReservationAlreadyUsed(reservationId) {
  if (!reservationId) return false
  const map = loadPrivateEventMeta()
  return Boolean(map[reservationId]?.event_id)
}

function validateStep1() {
  if (!currentUser.value?.id) return "You need to login first."
  if (!selectedReservation.value) return "Select a reserved venue first."
  if (!selectedVenue.value) return "The selected venue could not be found."
  if (isReservationAlreadyUsed(selectedReservation.value.id)) {
    return "This reservation is already linked to another event."
  }
  return null
}

function validateStep2() {
  if (!form.title.trim()) return "Event title is required."
  if (!form.type.trim()) return "Event category is required."
  if (!form.description.trim()) return "Event description is required."
  if (!form.image) return "Event profile image is required."
  if (!form.bank_account_info.account_holder_name.trim()) return "Account holder name is required."
  if (!form.bank_account_info.bank_name.trim()) return "Bank name is required."
  if (!form.bank_account_info.account_number.trim()) return "Account number is required."

  if (hasSeatClass("Regular") && Number(form.ticket_prices.regular) <= 0) {
    return "Regular ticket price must be greater than 0."
  }

  if (hasSeatClass("Special") && Number(form.ticket_prices.special) <= 0) {
    return "Special ticket price must be greater than 0."
  }

  if (hasSeatClass("VIP") && Number(form.ticket_prices.vip) <= 0) {
    return "VIP ticket price must be greater than 0."
  }

  return null
}

function goNext() {
  const error = validateStep1()
  if (error) {
    notify(error, "error")
    return
  }
  step.value = 2
}

function toEventDateString(dateValue) {
  const date = new Date(dateValue)
  if (!Number.isFinite(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function toEventTimeString(dateValue) {
  const date = new Date(dateValue)
  if (!Number.isFinite(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

function getTicketPriceForSeatClass(seatClass) {
  const normalized = normalizeSeatClass(seatClass)

  if (normalized === "VIP") {
    return Number(form.ticket_prices.vip || 0)
  }

  if (normalized === "Special") {
    return Number(form.ticket_prices.special || 0)
  }

  return Number(form.ticket_prices.regular || 0)
}

function buildEventSeatLayoutFromVenue(venue) {
  if (!venue?.seat_layout || typeof venue.seat_layout !== "object") {
    return null
  }

  return {
    ...JSON.parse(JSON.stringify(venue.seat_layout)),
    seats: Array.isArray(venue.seat_layout.seats)
      ? venue.seat_layout.seats.map((seat, index) => {
          const normalizedSeatClass = normalizeSeatClass(
            seat?.seat_class || seat?.type || seat?.category || "Regular"
          )

          return {
            ...JSON.parse(JSON.stringify(seat)),
            id: seat?.id ?? `event-seat-${index + 1}`,
            seat_class: normalizedSeatClass,
            price: getTicketPriceForSeatClass(normalizedSeatClass),
          }
        })
      : [],
  }
}

function buildEventPayload(preGeneratedId, options = {}) {
  const reservation = selectedReservation.value
  const venue = selectedVenue.value

  if (!reservation || !venue) {
    throw new Error("Reservation or venue is missing.")
  }

  const startValue = reservation.start_datetime || reservation.start_date
  const endValue = reservation.end_datetime || reservation.end_date

  const useExtraImages = options.useExtraImages ?? true
  const coverImageOverride = options.coverImageOverride ?? form.image
  const eventSeatLayout = buildEventSeatLayoutFromVenue(venue)
  const eventCapacity = Array.isArray(eventSeatLayout?.seats) && eventSeatLayout.seats.length
    ? eventSeatLayout.seats.length
    : Number(venue.capacity || 0)

  return {
    id: preGeneratedId,
    title: form.title.trim(),
    date: toEventDateString(startValue),
    time: toEventTimeString(startValue),
    end_time: toEventTimeString(endValue),
    venue: venue.title || "",
    venue_id: venue.id ?? null,
    city: venue.location || "",
    type: form.type,
    description: form.description.trim(),
    image: coverImageOverride,
    images: useExtraImages ? [coverImageOverride, ...form.extra_images.slice(0, 3)].filter(Boolean) : [coverImageOverride].filter(Boolean),
    featured_artist_ids: [...new Set(form.featured_artist_ids)],
    age_restriction: form.age_restriction,
    tickets_sold: 0,
    capacity: eventCapacity,
    featured: false,
    last_call: false,
    accessible_seats: Boolean(venue.accessible_seats),
    review_rating: 0,
    seat_classes: selectedSeatClasses.value.map(seatClass =>
      seatClass === "Regular" ? "Normal" : seatClass
    ),
    seat_layout: eventSeatLayout,
    sound_quality: 2,
    route_path: `/o_eventinfo?id=${preGeneratedId}`,
  }
}

function storePrivateEventData(eventId) {
  const reservation = selectedReservation.value
  const venue = selectedVenue.value
  const map = loadPrivateEventMeta()

  map[reservation.id] = {
    event_id: eventId,
    reservation_id: reservation.id,
    venue_id: venue?.id ?? null,
    organizer_user_id: currentUser.value?.id ?? null,
    ticket_prices: {
      regular: hasSeatClass("Regular") ? Number(form.ticket_prices.regular || 0) : null,
      special: hasSeatClass("Special") ? Number(form.ticket_prices.special || 0) : null,
      vip: hasSeatClass("VIP") ? Number(form.ticket_prices.vip || 0) : null,
    },
    bank_account_info: {
      account_holder_name: form.bank_account_info.account_holder_name || "",
      bank_name: form.bank_account_info.bank_name || "",
      account_number: form.bank_account_info.account_number || "",
      rib: form.bank_account_info.rib || "",
      iban: form.bank_account_info.iban || "",
      swift: form.bank_account_info.swift || "",
    },
    created_at: new Date().toISOString(),
    start_datetime: reservation.start_datetime || reservation.start_date,
    end_datetime: reservation.end_datetime || reservation.end_date,
  }

  savePrivateEventMeta(map)
}

function notifyArtists(eventId, eventTitle, artistIds = []) {
  const uniqueIds = [...new Set(artistIds)].filter(Boolean)

  uniqueIds.forEach(userId => {
    if (userId === currentUser.value?.id) return

    add_Notification({
      user_id: userId,
      title: "You were linked to an event",
      subtitle: `You were linked to ${eventTitle}. You are now considered an artist for this event. Tap to view it.`,
      icon: "mdi-microphone-variant",
      path: `/o_eventinfo?id=${eventId}`,
      related_event_id: eventId,
      related_user_id: currentUser.value?.id ?? null,
      type: "user_linked_to_event",
    })
  })
}

function isQuotaError(error) {
  const message = String(error?.message || "").toLowerCase()
  return (
    error?.name === "QuotaExceededError" ||
    message.includes("quota") ||
    message.includes("storage") ||
    message.includes("exceeded")
  )
}

async function buildEmergencyCover() {
  if (!form.image) return ""
  const img = await loadImageElement(form.image)

  const canvas = document.createElement("canvas")
  canvas.width = EMERGENCY_COVER_SIZE
  canvas.height = EMERGENCY_COVER_SIZE

  const ctx = canvas.getContext("2d")

  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, EMERGENCY_COVER_SIZE, EMERGENCY_COVER_SIZE)

  ctx.drawImage(
    img,
    sx,
    sy,
    side,
    side,
    0,
    0,
    EMERGENCY_COVER_SIZE,
    EMERGENCY_COVER_SIZE
  )

  return canvas.toDataURL("image/jpeg", EMERGENCY_COVER_QUALITY)
}

function tryCreateEvent(userId, payload) {
  return create_Event_For_User(userId, payload)
}

async function publishEvent() {
  if (!currentUser.value?.id) {
    notify("You are not logged in.", "error")
    return
  }

  const step1Error = validateStep1()
  const step2Error = validateStep2()
  const firstError = step1Error || step2Error

  if (firstError) {
    notify(firstError, "error")
    return
  }

  const eventId = crypto.randomUUID()

  try {
    let result

    try {
      result = tryCreateEvent(
        currentUser.value.id,
        buildEventPayload(eventId, { useExtraImages: true })
      )
    } catch (error) {
      if (!isQuotaError(error)) throw error

      notify("Storage is tight. Retrying with fewer images...", "warning")

      try {
        result = tryCreateEvent(
          currentUser.value.id,
          buildEventPayload(eventId, { useExtraImages: false })
        )
      } catch (secondError) {
        if (!isQuotaError(secondError)) throw secondError

        notify("Still too large. Retrying with a smaller cover image...", "warning")

        const emergencyCover = await buildEmergencyCover()

        result = tryCreateEvent(
          currentUser.value.id,
          buildEventPayload(eventId, {
            useExtraImages: false,
            coverImageOverride: emergencyCover || form.image,
          })
        )
      }
    }

    if (!result?.success || !result?.event) {
      notify(result?.message || "Failed to publish event.", "error")
      return
    }

    storePrivateEventData(result.event.id)
    notifyArtists(result.event.id, result.event.title, form.featured_artist_ids)

    publishedEventId.value = result.event.id
    publishDialog.value = true
    notify("Event published successfully.", "success")
    resetForm()
    step.value = 1
    selectedReservationId.value = ""
  } catch (error) {
    console.error("Publish event error:", error)

    if (isQuotaError(error)) {
      notify("Local storage is already too full. You may need to clear old saved app data first.", "error")
      return
    }

    notify("Something went wrong while publishing the event.", "error")
  }
}

function resetForm() {
  form.title = ""
  form.type = ""
  form.description = ""
  form.image = ""
  form.extra_images.splice(0, form.extra_images.length)
  form.age_restriction = "All ages"
  form.featured_artist_ids.splice(0, form.featured_artist_ids.length)
  form.ticket_prices.regular = 0
  form.ticket_prices.special = 0
  form.ticket_prices.vip = 0
  form.bank_account_info.account_holder_name = ""
  form.bank_account_info.bank_name = ""
  form.bank_account_info.account_number = ""
  form.bank_account_info.rib = ""
  form.bank_account_info.iban = ""
  form.bank_account_info.swift = ""

  if (coverImageInput.value) coverImageInput.value = null
  if (extraImagesInput.value) extraImagesInput.value = null
}

function closePublishDialog() {
  publishDialog.value = false
}

function goToPublishedEvent() {
  publishDialog.value = false
  if (publishedEventId.value) {
    router.push(publishedEventRoute.value)
  }
}
</script>

<style scoped>
.event-page-shell {
  min-height: 100vh;
  padding-top: 12px;
  transition: background 0.28s ease, color 0.28s ease;
}

.event-page-shell--dark {
  background:
    radial-gradient(circle at top center, rgba(58, 123, 213, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(0, 188, 212, 0.08), transparent 20%),
    linear-gradient(180deg, rgba(10, 12, 18, 0.98), rgba(12, 14, 22, 1));
}

.event-page-shell--light {
  background:
    radial-gradient(circle at top center, rgba(25, 118, 210, 0.10), transparent 24%),
    radial-gradient(circle at top right, rgba(0, 188, 212, 0.10), transparent 22%),
    linear-gradient(180deg, #f5f8fe 0%, #eef3fb 100%);
}

.event-builder-page {
  position: relative;
  z-index: 1;
}

.event-main-card {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease;
}

.event-page-shell--dark .event-main-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 0.98), rgba(14, 16, 24, 0.98)) !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.32);
}

.event-page-shell--light .event-main-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 251, 255, 0.96)) !important;
  border: 1px solid rgba(25, 118, 210, 0.12);
  box-shadow: 0 20px 55px rgba(30, 41, 59, 0.10);
}

.event-main-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.32), transparent);
  pointer-events: none;
}

.page-hero {
  position: relative;
  padding: 18px 18px 20px;
  border-radius: 24px;
  margin-bottom: 8px;
  overflow: hidden;
}

.event-page-shell--dark .page-hero {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(76, 175, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.event-page-shell--light .page-hero {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(227, 242, 253, 0.95));
  border: 1px solid rgba(25, 118, 210, 0.10);
}

.page-hero::after {
  content: "";
  position: absolute;
  right: -30px;
  top: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(33, 150, 243, 0.22), transparent 68%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.event-page-shell--dark .hero-badge {
  background: rgba(76, 175, 255, 0.12);
  color: rgba(203, 231, 255, 0.98);
  border: 1px solid rgba(76, 175, 255, 0.20);
}

.event-page-shell--light .hero-badge {
  background: rgba(25, 118, 210, 0.08);
  color: #0f4fa8;
  border: 1px solid rgba(25, 118, 210, 0.14);
}

.hero-title {
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 720px;
  font-size: 0.98rem;
}

.hero-chip-group {
  position: relative;
  z-index: 1;
}

.clean-stepper {
  background: transparent !important;
}

.page-stepper {
  padding: 8px 4px 0;
}

.section-card-glow {
  position: relative;
}

.clean-section-card {
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.event-page-shell--dark .clean-section-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.event-page-shell--light .clean-section-card {
  background: rgba(255, 255, 255, 0.82) !important;
  border-color: rgba(25, 118, 210, 0.12) !important;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
}

.clean-section-card:hover {
  transform: translateY(-1px);
}

.section-card-glow::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(76, 175, 255, 0.18), transparent 35%, transparent 65%, rgba(0, 188, 212, 0.18));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.65;
}

.section-title {
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.quick-meta-row :deep(.v-chip) {
  font-weight: 600;
}

.reservation-radio-group :deep(.v-selection-control) {
  align-items: flex-start;
}

.reservation-option {
  cursor: pointer;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
}

.event-page-shell--dark .reservation-option {
  border-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(255, 255, 255, 0.015);
}

.event-page-shell--light .reservation-option {
  border-color: rgba(25, 118, 210, 0.10) !important;
  background: rgba(255, 255, 255, 0.88);
}

.reservation-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.08);
}

.event-page-shell--dark .reservation-option:hover {
  border-color: rgba(76, 175, 255, 0.25) !important;
}

.event-page-shell--light .reservation-option:hover {
  border-color: rgba(25, 118, 210, 0.24) !important;
}

.reservation-option--active {
  box-shadow: 0 0 0 1px rgba(76, 175, 255, 0.2) inset, 0 12px 28px rgba(33, 150, 243, 0.10);
}

.event-page-shell--dark .reservation-option--active {
  border-color: rgba(76, 175, 255, 0.45) !important;
  background: rgba(76, 175, 255, 0.05);
}

.event-page-shell--light .reservation-option--active {
  border-color: rgba(25, 118, 210, 0.35) !important;
  background: rgba(227, 242, 253, 0.82);
}

.preview-box {
  overflow: hidden;
  border-radius: 18px;
  transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.event-page-shell--dark .preview-box {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.event-page-shell--light .preview-box {
  border: 1px solid rgba(25, 118, 210, 0.12);
  background: rgba(255, 255, 255, 0.92);
}

.preview-box:hover {
  transform: translateY(-1px);
}

.preview-image {
  display: block;
  width: 100%;
  height: 210px;
  object-fit: cover;
}

.preview-description {
  line-height: 1.75;
}

.empty-preview {
  min-height: 240px;
}

.event-page-shell--dark .empty-preview {
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.015);
}

.event-page-shell--light .empty-preview {
  border: 1px dashed rgba(25, 118, 210, 0.18);
  background: rgba(248, 251, 255, 0.92);
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px dashed;
  font-size: 0.95rem;
}

.event-page-shell--dark .info-row {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.event-page-shell--light .info-row {
  border-bottom-color: rgba(15, 23, 42, 0.08);
}

.info-row:last-child {
  border-bottom: none;
}

.event-page-shell--dark .info-row .label {
  color: rgba(255, 255, 255, 0.65);
}

.event-page-shell--light .info-row .label {
  color: rgba(15, 23, 42, 0.60);
}

.action-bar {
  align-items: center;
}

.action-btn {
  min-width: 142px;
  letter-spacing: 0.01em;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn--primary {
  box-shadow: 0 12px 24px rgba(33, 150, 243, 0.18);
}

.sticky-preview-card {
  top: 18px;
}

.floating-snackbar {
  backdrop-filter: blur(10px);
}

.publish-dialog-card {
  overflow: hidden;
}

.event-page-shell--dark .publish-dialog-card {
  background: linear-gradient(180deg, rgba(18, 20, 29, 0.98), rgba(14, 16, 24, 0.98)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.event-page-shell--light .publish-dialog-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.98)) !important;
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.step-panel {
  animation: fadeSlideUp 0.28s ease;
}

:deep(.v-field) {
  border-radius: 18px !important;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease !important;
}

.event-page-shell--dark :deep(.v-field) {
  background: rgba(255, 255, 255, 0.018);
}

.event-page-shell--light :deep(.v-field) {
  background: rgba(255, 255, 255, 0.92);
}

:deep(.v-field:hover) {
  box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.10);
}

:deep(.v-field.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.12);
}

:deep(.v-stepper-item--selected .v-stepper-item__avatar) {
  box-shadow: 0 10px 24px rgba(33, 150, 243, 0.22);
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 700;
}

:deep(.v-chip) {
  letter-spacing: 0.01em;
}

.event-page-shell--light :deep(.text-medium-emphasis) {
  color: rgba(15, 23, 42, 0.68) !important;
}

.event-page-shell--light :deep(.v-card-title),
.event-page-shell--light :deep(.section-title),
.event-page-shell--light :deep(.text-h4),
.event-page-shell--light :deep(.text-h6),
.event-page-shell--light :deep(.text-body-1),
.event-page-shell--light :deep(.text-body-2),
.event-page-shell--light :deep(.text-caption) {
  color: #132033;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 960px) {
  .sticky-preview-card {
    position: sticky;
  }
}

@media (max-width: 960px) {
  .step-two-layout {
    align-items: start;
  }

  .preview-image {
    height: 190px;
  }

  .page-hero {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .hero-chip-group {
    width: 100%;
  }

  .hero-chip-group :deep(.v-chip) {
    max-width: 100%;
  }

  .action-btn {
    width: auto;
  }
}

.mobile-reservation-rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(280px, 84vw);
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}

.mobile-reservation-rail::-webkit-scrollbar {
  display: none;
}

.mobile-reservation-card {
  overflow: hidden;
  scroll-snap-align: start;
}

.mobile-reservation-card__media {
  position: relative;
  height: 146px;
  overflow: hidden;
}

.mobile-reservation-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mobile-reservation-card__overlay {
  position: absolute;
  inset: 12px 12px auto auto;
}

.mobile-reservation-card__title-wrap {
  min-width: 0;
  flex: 1;
}

.mobile-reservation-card__location {
  display: -webkit-box;
    line-clamp: 2;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-reservation-card__selector {
  flex-shrink: 0;
  background: rgba(33, 150, 243, 0.08);
}

.mobile-reservation-card__selector--active {
  background: rgba(33, 150, 243, 0.18);
  color: rgb(33, 150, 243);
}

.mobile-reservation-card__meta,
.mobile-inline-preview__stats {
  display: grid;
  gap: 10px;
}

.mobile-meta-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 0.8rem;
  line-height: 1.35;
}

.event-page-shell--dark .mobile-meta-pill,
.event-page-shell--dark .mobile-stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.event-page-shell--light .mobile-meta-pill,
.event-page-shell--light .mobile-stat-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(25, 118, 210, 0.10);
}

.mobile-inline-preview__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mobile-inline-preview__copy {
  min-width: 0;
}

.mobile-stat-card {
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-stat-card__label {
  font-size: 0.73rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.72;
}

.mobile-form-summary {
  border-style: dashed;
}

.mobile-editor-shell {
  display: grid;
  gap: 16px;
}

.mobile-editor-hero {
  overflow: hidden;
}

.mobile-editor-hero__stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mobile-editor-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.mobile-editor-tabs::-webkit-scrollbar {
  display: none;
}

.mobile-editor-tab {
  min-width: 108px;
}

.event-page-shell--dark .mobile-editor-tab {
  background: rgba(255, 255, 255, 0.04) !important;
  color: rgba(255, 255, 255, 0.82) !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.event-page-shell--light .mobile-editor-tab {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #16304f !important;
  border: 1px solid rgba(25, 118, 210, 0.10);
}

.mobile-editor-tab--active {
  box-shadow: 0 10px 24px rgba(33, 150, 243, 0.16);
}

.event-page-shell--dark .mobile-editor-tab--active {
  background: rgba(76, 175, 255, 0.16) !important;
  border-color: rgba(76, 175, 255, 0.30);
}

.event-page-shell--light .mobile-editor-tab--active {
  background: rgba(227, 242, 253, 0.95) !important;
  border-color: rgba(25, 118, 210, 0.22);
}

.mobile-editor-window {
  overflow: visible;
}

.mobile-editor-card {
  overflow: hidden;
}

.mobile-editor-stack {
  display: grid;
  gap: 16px;
}

.mobile-extra-images-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mobile-preview-stack {
  display: grid;
  gap: 16px;
}

.mobile-event-preview {
  display: grid;
  gap: 14px;
}

.mobile-event-preview__media {
  overflow: hidden;
  border-radius: 18px;
}

.mobile-event-preview__image {
  width: 100%;
  height: 184px;
  object-fit: cover;
  display: block;
}

.mobile-price-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.route-context-menu :deep(.v-overlay__content) {
  min-width: 230px;
}

.context-menu-list {
  backdrop-filter: blur(14px);
  overflow: hidden;
}

.event-page-shell--dark .context-menu-list {
  background: rgba(18, 20, 29, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.event-page-shell--light .context-menu-list {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.event-page-shell--dark :deep(.context-menu-list .v-list-item:hover) {
  background: rgba(76, 175, 255, 0.08);
}

.event-page-shell--light :deep(.context-menu-list .v-list-item:hover) {
  background: rgba(227, 242, 253, 0.92);
}

.event-page-shell.is-mobile-layout .event-builder-page {
  padding-top: 18px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
}

.event-page-shell.is-mobile-layout .event-main-card {
  border-radius: 22px !important;
}

.event-page-shell.is-mobile-layout .page-hero {
  padding: 16px;
  border-radius: 20px;
}

.event-page-shell.is-mobile-layout .hero-title {
  font-size: clamp(1.7rem, 5.4vw, 2.05rem) !important;
  line-height: 1.08;
}

.event-page-shell.is-mobile-layout .hero-subtitle {
  max-width: 100%;
  font-size: 0.94rem;
}

.event-page-shell.is-mobile-layout .hero-chip-group {
  width: 100%;
  gap: 8px !important;
  align-items: center;
}

.event-page-shell.is-mobile-layout .hero-chip-group :deep(.v-chip) {
  min-height: 32px;
  max-width: 100%;
}

.event-page-shell.is-mobile-layout .reservation-option {
  border-radius: 20px !important;
}

.event-page-shell.is-mobile-layout .reservation-option .v-card-text {
  padding: 16px !important;
}

.event-page-shell.is-mobile-layout .reservation-radio-group :deep(.v-selection-control) {
  min-height: 32px;
}

.event-page-shell.is-mobile-layout .info-row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.event-page-shell.is-mobile-layout .info-row span:last-child {
  text-align: right;
}

.event-page-shell.is-mobile-layout .preview-image {
  height: 196px;
}

.event-page-shell.is-mobile-layout .sticky-preview-card {
  position: static;
  top: auto;
}

.event-page-shell.is-mobile-layout .action-bar {
  width: 100%;
  align-items: stretch;
}

.event-page-shell.is-mobile-layout .mobile-sticky-action-bar {
  position: sticky;
  bottom: 10px;
  z-index: 15;
  padding: 12px;
  margin-top: 2px;
  border-radius: 20px;
  backdrop-filter: blur(16px);
}

.event-page-shell--dark.is-mobile-layout .mobile-sticky-action-bar {
  background: rgba(10, 12, 18, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.event-page-shell--light.is-mobile-layout .mobile-sticky-action-bar {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(25, 118, 210, 0.10);
}

.event-page-shell.is-mobile-layout .action-bar > div {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: auto;
}

.event-page-shell.is-mobile-layout .action-btn {
  width: auto;
  min-width: 0;
  min-height: 42px;
  flex: 1 1 0;
}

.event-page-shell.is-mobile-layout :deep(.v-btn) {
  min-height: 42px;
}

.event-page-shell.is-mobile-layout :deep(.v-field) {
  border-radius: 16px !important;
}

.event-page-shell.is-mobile-layout :deep(.v-field__input) {
  min-height: 48px;
}

.event-page-shell.is-mobile-layout :deep(textarea.v-field__input) {
  min-height: 126px;
}

.event-page-shell.is-mobile-layout :deep(.v-file-input .v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-header) {
  flex-wrap: nowrap;
  column-gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-header::-webkit-scrollbar) {
  display: none;
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-item) {
  flex: 1 1 0;
  min-width: 132px;
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-item__content) {
  overflow: hidden;
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-item__title) {
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
  font-size: 0.86rem;
}

.event-page-shell.is-mobile-layout :deep(.v-dialog > .v-overlay__content) {
  margin: 0 !important;
  max-width: 100% !important;
  max-height: 100% !important;
}

.event-page-shell.is-mobile-layout .page-hero,
.event-page-shell.is-mobile-layout .clean-section-card,
.event-page-shell.is-mobile-layout .reservation-option,
.event-page-shell.is-mobile-layout .publish-dialog-card {
  box-shadow: none;
}

.event-page-shell.is-mobile-layout .hero-subtitle,
.event-page-shell.is-mobile-layout .text-body-2,
.event-page-shell.is-mobile-layout .text-caption {
  line-height: 1.5;
}

.event-page-shell.is-mobile-layout .section-title {
  font-size: 1rem;
}

.event-page-shell.is-mobile-layout .quick-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px !important;
}

.event-page-shell.is-mobile-layout .preview-description {
  line-height: 1.65;
}

.event-page-shell.is-mobile-layout .page-stepper {
  padding-top: 2px;
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-item__avatar) {
  transform: scale(0.94);
}

.event-page-shell.is-mobile-layout :deep(.v-stepper-item__title) {
  font-weight: 600;
}

.event-page-shell.is-mobile-layout :deep(.v-chip) {
  font-size: 0.79rem;
}

.event-page-shell.is-mobile-layout :deep(.v-field__field) {
  align-items: center;
}

.event-page-shell.is-mobile-layout :deep(.v-label) {
  font-size: 0.93rem;
}

.event-page-shell.is-mobile-layout :deep(.v-row) {
  margin-left: -6px;
  margin-right: -6px;
}

.event-page-shell.is-mobile-layout :deep(.v-row > .v-col),
.event-page-shell.is-mobile-layout :deep(.v-row > [class*="v-col-"]) {
  padding: 6px;
}

.event-page-shell.is-mobile-layout .mobile-inline-preview__stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.event-page-shell.is-mobile-layout .mobile-meta-pill span,
.event-page-shell.is-mobile-layout .mobile-stat-card strong {
  word-break: break-word;
}

.event-page-shell.is-mobile-layout .mobile-event-preview__image {
  height: 170px;
}

.event-page-shell.is-tablet-layout .page-hero {
  padding: 20px 22px;
}

.event-page-shell.is-tablet-layout .step-two-layout {
  align-items: start;
}

.event-page-shell.is-tablet-layout .quick-meta-row {
  gap: 10px !important;
}

.event-page-shell.is-tablet-layout .clean-section-card {
  border-radius: 24px !important;
}

.event-page-shell.is-tablet-layout .sticky-preview-card {
  top: 12px;
}

@media (hover: none) and (pointer: coarse) {
  .clean-section-card:hover,
  .reservation-option:hover,
  .preview-box:hover,
  .action-btn:hover {
    transform: none;
  }
}

@media (max-width: 960px) {
  .event-main-card {
    border-radius: 24px !important;
  }

  .page-stepper {
    padding-top: 4px;
  }

  .section-title {
    font-size: 1rem;
  }

  .sticky-preview-card {
    position: static;
    top: auto;
  }
}

@media (max-width: 760px) {
  .event-builder-page {
    padding-bottom: 84px !important;
  }

  .page-hero::after {
    right: -60px;
    top: -50px;
    width: 150px;
    height: 150px;
  }

  .quick-meta-row {
    gap: 8px !important;
  }
}

@media (max-width: 600px) {
  .mobile-editor-hero__stats,
  .mobile-extra-images-grid {
    grid-template-columns: 1fr;
  }

  .mobile-editor-tab {
    min-width: 94px;
  }

  .event-main-card {
    padding: 16px !important;
  }

  .clean-section-card {
    border-radius: 20px !important;
  }

  .mobile-reservation-rail {
    grid-auto-columns: minmax(262px, 88vw);
  }

  .mobile-inline-preview__top {
    flex-direction: column;
    align-items: stretch;
  }

  .event-page-shell.is-mobile-layout .mobile-inline-preview__stats {
    grid-template-columns: 1fr;
  }

  .mobile-event-preview__image,
  .preview-image {
    height: 172px;
  }

  .empty-preview {
    min-height: 190px;
  }

  .floating-snackbar :deep(.v-snackbar__wrapper) {
    width: calc(100vw - 24px);
    margin: 0 12px 12px;
  }
}
</style>
