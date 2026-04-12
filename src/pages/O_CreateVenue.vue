<template>
  <AppNavbar />

  <div class="venue-page-shell" :class="browserThemeClass">
    <v-container fluid class="venue-builder-page pb-10 pt-6">
      <v-row justify="center">
        <v-col cols="12" xxl="10" xl="11">
          <v-card rounded="xl" class="pa-4 pa-md-6 venue-main-card">
            <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4 mb-6 page-hero">
              <div v-if="isMobile" class="mobile-hero-glow"></div>
              <div class="hero-copy">
                <div class="hero-badge mb-3">
                  <v-icon size="18" class="me-2">mdi-home-city-outline</v-icon>
                  Venue publishing workspace
                </div>
                <div class="text-h4 font-weight-bold hero-title">Create Venue</div>
                <div class="text-medium-emphasis hero-subtitle">
                  Build the venue profile, design the layout, and submit it for approval.
                </div>

                <div class="d-flex ga-2 flex-wrap mt-4 hero-mini-stats">
                  <v-chip size="small" variant="tonal" color="primary">
                    Step {{ step }} / 4
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="success">
                    {{ formCompletionPercent }}% form complete
                  </v-chip>
                  <v-chip size="small" variant="outlined">
                    {{ finalSeatCount }} seats planned
                  </v-chip>
                </div>
              </div>

              <div class="d-flex ga-3 flex-wrap hero-chip-group">
                <v-chip color="primary" variant="tonal" class="hero-chip">
                  <v-icon start size="16">mdi-shield-check-outline</v-icon>
                  Pending admin approval
                </v-chip>
                <v-chip color="secondary" variant="outlined" class="hero-chip">
                  <v-icon start size="16">mdi-theme-light-dark</v-icon>
                  {{ browserThemeLabel }} mode
                </v-chip>
              </div>
            </div>

            <div v-if="!isMobile" class="stepper-shell">
              <v-stepper v-model="step" alt-labels flat class="bg-transparent clean-stepper">
                <v-stepper-header>
                  <v-stepper-item :value="1" title="Venue info" />
                  <v-divider />
                  <v-stepper-item :value="2" title="Dimensions" />
                  <v-divider />
                  <v-stepper-item :value="3" title="Design" />
                  <v-divider />
                  <v-stepper-item :value="4" title="Review" />
                </v-stepper-header>
              </v-stepper>
            </div>

            <div v-else class="mobile-stepper-shell mb-6">
              <div class="mobile-stepper-top">
                <div>
                  <div class="mobile-stepper-label">Current step</div>
                  <div class="mobile-stepper-title">{{ currentStepMeta.title }}</div>
                </div>
                <v-chip color="primary" variant="tonal" size="small">
                  {{ step }} / {{ stepItems.length }}
                </v-chip>
              </div>

              <div class="mobile-stepper-progress">
                <div class="mobile-stepper-progress-bar" :style="mobileProgressStyle"></div>
              </div>

              <div class="mobile-stepper-cards">
                <button
                  v-for="item in stepItems"
                  :key="item.value"
                  type="button"
                  class="mobile-step-card"
                  :class="{ active: step === item.value, done: step > item.value }"
                  @click="step = item.value"
                >
                  <span class="mobile-step-card-index">0{{ item.value }}</span>
                  <span class="mobile-step-card-title">{{ item.short }}</span>
                </button>
              </div>
            </div>

            <!-- STEP 1 -->
            <div v-show="step === 1" class="mt-8">
              <v-row class="ga-md-0 ga-2">
                <v-col cols="12" md="8" class="step-one-main-col">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card">
                    <div class="section-title mb-4">Basic venue details</div>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.title"
                          label="Venue title"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                          v-model="form.location"
                          :items="cityOptions"
                          label="City"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          v-model="form.exact_address"
                          label="Exact address"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model.number="form.price_per_hour"
                          label="Price per hour (TND)"
                          type="number"
                          min="0"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model.number="form.price_per_day"
                          label="Price per day (TND)"
                          type="number"
                          min="0"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-select
                          v-model="form.category"
                          :items="categoryOptions"
                          label="Category"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-select
                          v-model="form.type"
                          :items="typeOptions"
                          label="Type"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4" class="d-flex align-center">
                        <v-switch
                          v-model="form.availability"
                          color="primary"
                          label="Available for booking"
                          inset
                          hide-details
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model.number="form.review_rating"
                          label="Preview rating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-textarea
                          v-model="form.description"
                          label="Venue description"
                          rows="5"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                    </v-row>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 mt-4 clean-section-card">
                    <div class="section-title mb-4">Contact info</div>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.contact_info.phone"
                          label="Phone *"
                          variant="outlined"
                          rounded="lg"
                          hint="Required"
                          persistent-hint
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.contact_info.email"
                          label="Email *"
                          variant="outlined"
                          rounded="lg"
                          hint="Required"
                          persistent-hint
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.contact_info.website"
                          label="Website"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.contact_info.instagram"
                          label="Instagram"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                    </v-row>
                  </v-card>

                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 mt-4 clean-section-card">
                    <div class="section-title mb-2">Bank account info</div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      This will be used so you can receive payments when someone books your venue.
                      It is private and should only be visible to you later in your owned venue pages.
                    </div>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.account_holder_name"
                          label="Account holder full name *"
                          variant="outlined"
                          rounded="lg"
                          hint="Required"
                          persistent-hint
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.bank_name"
                          label="Bank name *"
                          variant="outlined"
                          rounded="lg"
                          hint="Required"
                          persistent-hint
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="form.bank_account_info.account_number"
                          label="Account number *"
                          variant="outlined"
                          rounded="lg"
                          hint="Required"
                          persistent-hint
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
                </v-col>

                <v-col cols="12" md="4" class="step-one-media-col">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card media-upload-card">
                    <div class="section-title mb-4">Images</div>

                    <v-file-input
                      v-model="coverImageInput"
                      label="Venue profile image"
                      accept="image/*"
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-camera"
                      clearable
                      show-size
                      @update:modelValue="handleCoverImage"
                    />

                    <div class="preview-box mb-4" v-if="form.image">
                      <img :src="form.image" alt="Venue cover" class="preview-image" />
                    </div>

                    <v-file-input
                      v-model="extraImagesInput"
                      label="Extra venue images (max 3)"
                      accept="image/*"
                      multiple
                      variant="outlined"
                      rounded="lg"
                      prepend-icon="mdi-image-multiple"
                      clearable
                      show-size
                      counter
                      @update:modelValue="handleExtraImages"
                    />

                    <div class="text-caption text-medium-emphasis mb-2">
                      Optional. Up to 3 extra images besides the cover.
                    </div>

                    <v-row v-if="form.extra_images.length" class="mt-2">
                      <v-col
                        v-for="(img, index) in form.extra_images"
                        :key="index"
                        cols="6"
                      >
                        <div class="extra-image-card">
                          <img :src="img" class="preview-image small" />
                          <v-btn
                            icon="mdi-close"
                            size="x-small"
                            color="error"
                            class="remove-extra-btn"
                            @click="removeExtraImage(index)"
                          />
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- STEP 2 -->
            <div v-show="step === 2" class="mt-8">
              <v-row>
                <v-col cols="12" md="7" class="step-two-dimensions-col">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card">
                    <div class="section-title mb-4">Venue dimensions</div>
                    <div class="section-caption mb-4">Set the real-world footprint first so the designer keeps the correct visual ratio.</div>

                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model.number="form.dimensions.width_m"
                          label="Width (meters)"
                          type="number"
                          min="1"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model.number="form.dimensions.height_m"
                          label="Height (meters)"
                          type="number"
                          min="1"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-select
                          v-model="form.dimensions.shape"
                          :items="shapeOptions"
                          label="Area shape"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <div class="text-subtitle-1 font-weight-bold mb-3">Seating setup method</div>

                    <v-radio-group v-model="form.use_designer" inline>
                      <v-radio :value="true" label="Design seats manually" />
                      <v-radio :value="false" label="Specify seat counts manually" />
                    </v-radio-group>

                    <v-expand-transition>
                      <div v-if="!form.use_designer">
                        <v-row class="mt-1">
                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model.number="form.manual_seat_counts.regular"
                              label="Regular seats"
                              type="number"
                              min="0"
                              variant="outlined"
                              rounded="lg"
                            />
                          </v-col>

                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model.number="form.manual_seat_counts.special"
                              label="Special seats"
                              type="number"
                              min="0"
                              variant="outlined"
                              rounded="lg"
                            />
                          </v-col>

                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model.number="form.manual_seat_counts.vip"
                              label="VIP seats"
                              type="number"
                              min="0"
                              variant="outlined"
                              rounded="lg"
                            />
                          </v-col>
                        </v-row>

                        <div class="text-caption text-medium-emphasis">
                          If you do not design seats manually, set how many Regular, Special, and VIP seats the venue has.
                        </div>
                      </div>
                    </v-expand-transition>
                  </v-card>
                </v-col>

                <v-col cols="12" md="5" class="step-two-preview-col">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card ratio-preview-card">
                    <div class="section-title mb-4">Live ratio preview</div>
                    <div class="section-caption mb-4">This updates instantly to reflect the venue shape and layout proportions.</div>

                    <div class="ratio-wrapper">
                      <div
                        class="ratio-preview"
                        :class="`shape-${form.dimensions.shape}`"
                        :style="ratioPreviewStyle"
                      >
                        <div class="ratio-preview-label">
                          {{ form.dimensions.width_m || 0 }}m × {{ form.dimensions.height_m || 0 }}m
                        </div>
                      </div>
                    </div>

                    <div class="text-caption text-medium-emphasis mt-4">
                      The design canvas follows the selected venue shape and the real aspect ratio.
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- STEP 3 -->
            <div v-show="step === 3" class="mt-8">
              <v-row>
                <v-col cols="12" md="3" v-if="form.use_designer && !isMobile">
                  <v-card rounded="xl" variant="outlined" class="pa-4 designer-sidebar sticky-panel clean-section-card">
                    <div class="section-title mb-4">Designer tools</div>
                    <div class="section-caption mb-4">Paint seats, add venue blocks, and keep everything aligned with grid snapping.</div>

                    <v-select
                      v-model="paintMode"
                      :items="paintModes"
                      label="Paint mode"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      class="mb-4"
                    />

                    <v-switch
                      v-model="snapToGrid"
                      label="Snap to grid"
                      color="primary"
                      inset
                      hide-details
                      class="mb-3"
                    />

                    <v-switch
                      v-model="showGridAddresses"
                      label="Show seat address helpers"
                      color="secondary"
                      inset
                      hide-details
                      class="mb-4"
                    />

                    <div class="text-subtitle-2 font-weight-bold mb-3">Quick seat paint</div>

                    <div class="tool-grid mb-6">
                      <v-btn block rounded="lg" prepend-icon="mdi-seat" @click="addSeatButton('Regular')">
                        Regular seat
                      </v-btn>

                      <v-btn block rounded="lg" color="error" variant="outlined" prepend-icon="mdi-seat" @click="addSeatButton('Special')">
                        Special seat
                      </v-btn>

                      <v-btn block rounded="lg" color="warning" variant="outlined" prepend-icon="mdi-seat" @click="addSeatButton('VIP')">
                        VIP seat
                      </v-btn>

                      <v-btn block rounded="lg" variant="outlined" prepend-icon="mdi-format-horizontal-align-center" @click="addSeatRow(20, 'Regular')">
                        Add 20 regular seats
                      </v-btn>

                      <v-btn block rounded="lg" color="error" variant="outlined" prepend-icon="mdi-format-horizontal-align-center" @click="addSeatRow(20, 'Special')">
                        Add 20 special seats
                      </v-btn>

                      <v-btn block rounded="lg" color="warning" variant="outlined" prepend-icon="mdi-format-horizontal-align-center" @click="addSeatRow(20, 'VIP')">
                        Add 20 VIP seats
                      </v-btn>
                    </div>

                    <div class="text-subtitle-2 font-weight-bold mb-3">Venue element library</div>

                    <div class="tool-grid mb-6">
                      <v-btn block rounded="lg" prepend-icon="mdi-podium-gold" @click="addStage">
                        Stage
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-television-play" @click="addScreen">
                        Screen
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-speaker" @click="addAudioSource">
                        Audio source
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-table-furniture" @click="addTable4">
                        Table + 4 chairs
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-table-chair" @click="addTable2">
                        Table + 2 chairs
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-barley" @click="addBarCounter">
                        Bar counter
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-door" @click="addEntrance">
                        Entrance
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-emergency-exit" @click="addExit">
                        Exit
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-food" @click="addBuffet">
                        Buffet / serving zone
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-ticket-confirmation" @click="addTicketDesk">
                        Ticket desk
                      </v-btn>

                      <v-btn block rounded="lg" prepend-icon="mdi-human-male-board-poll" @click="addPodium">
                        Podium
                      </v-btn>
                    </div>

                    <div class="text-subtitle-2 font-weight-bold mb-3">Auto layouts</div>

                    <div class="tool-grid mb-6">
                      <v-btn block rounded="lg" variant="outlined" @click="applyCinemaPreset">
                        Cinema preset
                      </v-btn>
                      <v-btn block rounded="lg" variant="outlined" @click="applyTheatrePreset">
                        Theatre preset
                      </v-btn>
                      <v-btn block rounded="lg" variant="outlined" @click="applyBarPreset">
                        Bar preset
                      </v-btn>
                      <v-btn block rounded="lg" variant="outlined" @click="applyConferencePreset">
                        Conference preset
                      </v-btn>
                    </div>

                    <v-divider class="my-4" />

                    <div class="text-subtitle-2 font-weight-bold mb-3">Selected</div>

                    <div v-if="selectedItems.length === 1">
                      <v-text-field
                        v-model="singleSelectedTitle"
                        label="Label"
                        density="comfortable"
                        variant="outlined"
                        rounded="lg"
                        @update:model-value="updateSingleSelectedTitle"
                      />

                      <v-select
                        v-if="singleSelectedItem?.kind === 'seat'"
                        v-model="singleSelectedItem.seat_class"
                        :items="seatClassOptions"
                        label="Seat class"
                        density="comfortable"
                        variant="outlined"
                        rounded="lg"
                        @update:model-value="syncSelectedSeatColor"
                      />

                      <div class="text-caption text-medium-emphasis mb-3">
                        Seats keep a fixed size for cleaner numbering. Only venue blocks and other elements can be resized.
                      </div>
                    </div>

                    <div v-else-if="selectedItems.length > 1">
                      <div class="text-body-2 mb-3">
                        {{ selectedItems.length }} items selected
                      </div>
                    </div>

                    <div v-else class="text-body-2 text-medium-emphasis">
                      Click one item to edit it, drag a selection box to select many items, or right-click for quick actions.
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" v-if="form.use_designer && isMobile">
                  <v-card rounded="xl" variant="outlined" class="pa-4 clean-section-card mobile-designer-studio">
                    <div class="d-flex align-center justify-space-between ga-3 mb-3">
                      <div>
                        <div class="section-title">Mobile designer studio</div>
                        <div class="section-caption mt-1">Tools are grouped into compact touch-friendly panels so the canvas stays the star.</div>
                      </div>
                      <v-chip size="small" color="primary" variant="tonal">{{ selectedItems.length }} selected</v-chip>
                    </div>

                    <div class="mobile-tool-toggles mb-4">
                      <v-select
                        v-model="paintMode"
                        :items="paintModes"
                        label="Paint mode"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        hide-details
                      />

                      <div class="mobile-switch-grid">
                        <v-switch
                          v-model="snapToGrid"
                          label="Snap"
                          color="primary"
                          inset
                          hide-details
                        />
                        <v-switch
                          v-model="showGridAddresses"
                          label="Labels"
                          color="secondary"
                          inset
                          hide-details
                        />
                      </div>
                    </div>

                    <v-expansion-panels variant="accordion" class="mobile-tool-panels">
                      <v-expansion-panel>
                        <v-expansion-panel-title>Quick seat paint</v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="mobile-pill-grid">
                            <v-btn rounded="xl" prepend-icon="mdi-seat" @click="addSeatButton('Regular')">Regular</v-btn>
                            <v-btn rounded="xl" color="error" variant="outlined" prepend-icon="mdi-seat" @click="addSeatButton('Special')">Special</v-btn>
                            <v-btn rounded="xl" color="warning" variant="outlined" prepend-icon="mdi-seat" @click="addSeatButton('VIP')">VIP</v-btn>
                            <v-btn rounded="xl" variant="outlined" prepend-icon="mdi-format-horizontal-align-center" @click="addSeatRow(20, 'Regular')">+20 Regular</v-btn>
                            <v-btn rounded="xl" color="error" variant="outlined" prepend-icon="mdi-format-horizontal-align-center" @click="addSeatRow(20, 'Special')">+20 Special</v-btn>
                            <v-btn rounded="xl" color="warning" variant="outlined" prepend-icon="mdi-format-horizontal-align-center" @click="addSeatRow(20, 'VIP')">+20 VIP</v-btn>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel>
                        <v-expansion-panel-title>Venue elements</v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="mobile-pill-grid">
                            <v-btn rounded="xl" prepend-icon="mdi-podium-gold" @click="addStage">Stage</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-television-play" @click="addScreen">Screen</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-speaker" @click="addAudioSource">Audio</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-table-furniture" @click="addTable4">Table + 4</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-table-chair" @click="addTable2">Table + 2</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-barley" @click="addBarCounter">Bar</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-door" @click="addEntrance">Entrance</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-emergency-exit" @click="addExit">Exit</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-food" @click="addBuffet">Buffet</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-ticket-confirmation" @click="addTicketDesk">Ticket desk</v-btn>
                            <v-btn rounded="xl" prepend-icon="mdi-human-male-board-poll" @click="addPodium">Podium</v-btn>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel>
                        <v-expansion-panel-title>Auto layouts</v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="mobile-pill-grid compact">
                            <v-btn rounded="xl" variant="outlined" @click="applyCinemaPreset">Cinema</v-btn>
                            <v-btn rounded="xl" variant="outlined" @click="applyTheatrePreset">Theatre</v-btn>
                            <v-btn rounded="xl" variant="outlined" @click="applyBarPreset">Bar</v-btn>
                            <v-btn rounded="xl" variant="outlined" @click="applyConferencePreset">Conference</v-btn>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel>
                        <v-expansion-panel-title>Selected item</v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div v-if="selectedItems.length === 1">
                            <v-text-field
                              v-model="singleSelectedTitle"
                              label="Label"
                              density="comfortable"
                              variant="outlined"
                              rounded="lg"
                              @update:model-value="updateSingleSelectedTitle"
                            />

                            <v-select
                              v-if="singleSelectedItem?.kind === 'seat'"
                              v-model="singleSelectedItem.seat_class"
                              :items="seatClassOptions"
                              label="Seat class"
                              density="comfortable"
                              variant="outlined"
                              rounded="lg"
                              @update:model-value="syncSelectedSeatColor"
                            />
                          </div>
                          <div v-else-if="selectedItems.length > 1" class="text-body-2">
                            {{ selectedItems.length }} items selected
                          </div>
                          <div v-else class="text-body-2 text-medium-emphasis">
                            Tap an item to edit it or long-press the canvas for quick actions.
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card>
                </v-col>

                <v-col :cols="form.use_designer ? 9 : 12">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card">
                    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4">
                      <div>
                        <div class="section-title">Venue design canvas</div>
                        <div class="section-caption mt-1">Dragged seats keep their exact saved coordinates and are auto-organized into seat codes like A1, A2, B1, and more.</div>
                        <div class="text-body-2 text-medium-emphasis">
                          {{ form.dimensions.width_m }}m × {{ form.dimensions.height_m }}m · {{ form.dimensions.shape }}
                        </div>
                      </div>

                      <div class="d-flex ga-2 flex-wrap">
                        <v-btn
                          variant="outlined"
                          rounded="lg"
                          prepend-icon="mdi-undo"
                          :disabled="historyStack.length === 0"
                          @click="undoLastAction"
                        >
                          Undo
                        </v-btn>

                        <v-btn
                          variant="outlined"
                          rounded="lg"
                          color="error"
                          prepend-icon="mdi-delete"
                          :disabled="selectedItems.length === 0"
                          @click="removeSelected"
                        >
                          Delete
                        </v-btn>

                        <v-btn
                          variant="outlined"
                          rounded="lg"
                          prepend-icon="mdi-content-duplicate"
                          :disabled="selectedItems.length === 0"
                          @click="duplicateSelected"
                        >
                          Duplicate
                        </v-btn>

                        <v-btn
                          variant="outlined"
                          rounded="lg"
                          prepend-icon="mdi-refresh"
                          @click="resetDesign"
                        >
                          Reset design
                        </v-btn>
                      </div>
                    </div>

                    <div v-if="form.use_designer">
                      <div class="canvas-stage">
                        <div
                          ref="canvasRef"
                          class="designer-canvas"
                          :class="`shape-${form.dimensions.shape}`"
                          :style="designerCanvasStyle"
                          @mousedown="onCanvasMouseDown"
                          @mousemove="onCanvasMouseMove"
                          @mouseup="onCanvasMouseUp"
                          @mouseleave="onCanvasMouseUp"
                          @contextmenu.prevent="openContextMenu($event)"
                          @touchstart.passive="startLongPress($event)"
                          @touchend="cancelLongPress"
                          @touchcancel="cancelLongPress"
                          @touchmove="cancelLongPress"
                        >
                          <div
                            v-if="selectionBox.visible"
                            class="selection-box"
                            :style="selectionBoxStyle"
                          ></div>

                          <div
                            v-for="item in allCanvasItems"
                            :key="item.id"
                            class="canvas-item"
                            :class="[
                              `item-${item.kind}`,
                              { selected: isSelected(item.id) }
                            ]"
                            :style="getItemStyle(item)"
                            @mousedown.stop="startItemMouseDown($event, item)"
                            @click.stop="onItemClick($event, item)"
                            @contextmenu.prevent.stop="openContextMenu($event, item)"
                            @touchstart.passive.stop="startLongPress($event, item)"
                            @touchend.stop="cancelLongPress"
                            @touchcancel.stop="cancelLongPress"
                            @touchmove.stop="cancelLongPress"
                          >
                            <template v-if="item.kind === 'seat'">
                              <div class="seat-shape" :style="{ backgroundColor: seatBg(item) }">
                                <v-icon size="18">mdi-seat</v-icon>
                              </div>
                              <div v-if="showGridAddresses" class="seat-mini-label">{{ item.location || item.label || "Seat" }}</div>
                            </template>

                            <template v-else>
                              <div class="block" :style="{ background: item.color || '#555' }">
                                <v-icon v-if="item.icon" size="18">{{ item.icon }}</v-icon>
                                <span>{{ item.title || item.kind }}</span>
                              </div>
                            </template>

                            <template v-if="selectedItems.length === 1 && selectedIds.includes(item.id) && canResizeItem(item)">
                              <div class="resize-handle resize-br" @mousedown.stop="startResize($event, item, 'br')"></div>
                            </template>
                          </div>
                        </div>

                        <transition name="context-menu-pop">
                          <div
                            v-if="contextMenu.visible"
                            class="designer-context-menu"
                            :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
                          >
                            <button type="button" class="context-menu-btn" @click="duplicateSelected">
                              <v-icon size="18">mdi-content-duplicate</v-icon>
                              Duplicate selected
                            </button>
                            <button type="button" class="context-menu-btn" @click="removeSelected">
                              <v-icon size="18">mdi-delete-outline</v-icon>
                              Delete selected
                            </button>
                            <button type="button" class="context-menu-btn" @click="undoLastAction">
                              <v-icon size="18">mdi-undo</v-icon>
                              Undo last action
                            </button>
                            <button type="button" class="context-menu-btn" @click="closeContextMenu">
                              <v-icon size="18">mdi-close</v-icon>
                              Close menu
                            </button>
                          </div>
                        </transition>
                      </div>

                      <div class="d-flex flex-wrap ga-4 mt-4 align-center">
                        <v-chip color="secondary" variant="outlined">
                          Fixed seat size: {{ MANUAL_SEAT_SIZE }}px
                        </v-chip>
                        <v-chip color="secondary" variant="outlined">
                          Seat spacing: {{ MANUAL_SEAT_SPACING }}px
                        </v-chip>
                        <v-chip color="primary" variant="tonal">
                          Regular: {{ seatCounts.Regular || 0 }}
                        </v-chip>
                        <v-chip color="error" variant="tonal">
                          Special: {{ seatCounts.Special || 0 }}
                        </v-chip>
                        <v-chip color="warning" variant="tonal">
                          VIP: {{ seatCounts.VIP || 0 }}
                        </v-chip>
                        <v-chip variant="outlined">
                          Total seats: {{ designedSeatCount }}
                        </v-chip>
                        <v-chip variant="outlined">
                          Selected: {{ selectedItems.length }}
                        </v-chip>
                      </div>

                      <div class="text-caption text-medium-emphasis mt-3">
                        Single click selects. Drag on empty space makes a selection box. Seats snap with breathing room, keep a fixed size, and right-click opens quick actions.
                      </div>
                    </div>

                    <div v-else>
                      <v-alert type="info" variant="tonal" rounded="lg">
                        Designer is disabled for this venue. Total seats and seat classes will be taken from the manual Regular, Special, and VIP counts.
                      </v-alert>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- STEP 4 -->
            <div v-show="step === 4" class="mt-8">
              <v-row>
                <v-col cols="12" md="7">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card">
                    <div class="section-title mb-4">Review request</div>
                    <div class="section-caption mb-4">Double-check the operational details before sending the venue to admin review.</div>

                    <div class="d-flex ga-2 flex-wrap mb-4">
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ form.use_designer ? 'Designer layout' : 'Manual seat counts' }}
                      </v-chip>
                      <v-chip size="small" color="success" variant="tonal">
                        Auto seat codes enabled
                      </v-chip>
                      <v-chip size="small" variant="outlined">
                        {{ autoNumberingPreview }}
                      </v-chip>
                    </div>

                    <v-list lines="two" class="bg-transparent review-list">
                      <v-list-item title="Venue title" :subtitle="form.title || '-'" />
                      <v-list-item title="City" :subtitle="form.location || '-'" />
                      <v-list-item title="Exact address" :subtitle="form.exact_address || '-'" />
                      <v-list-item title="Category" :subtitle="form.category || '-'" />
                      <v-list-item title="Type" :subtitle="form.type || '-'" />
                      <v-list-item title="Phone" :subtitle="form.contact_info.phone || '-'" />
                      <v-list-item title="Email" :subtitle="form.contact_info.email || '-'" />
                      <v-list-item title="Account holder" :subtitle="form.bank_account_info.account_holder_name || '-'" />
                      <v-list-item title="Bank name" :subtitle="form.bank_account_info.bank_name || '-'" />
                      <v-list-item title="Account number" :subtitle="form.bank_account_info.account_number || '-'" />
                      <v-list-item title="RIB" :subtitle="form.bank_account_info.rib || '-'" />
                      <v-list-item title="IBAN" :subtitle="form.bank_account_info.iban || '-'" />
                      <v-list-item title="SWIFT / BIC" :subtitle="form.bank_account_info.swift || '-'" />
                      <v-list-item title="Price per hour" :subtitle="`${form.price_per_hour || 0} TND`" />
                      <v-list-item title="Price per day" :subtitle="`${form.price_per_day || 0} TND`" />
                      <v-list-item title="Dimensions" :subtitle="`${form.dimensions.width_m}m × ${form.dimensions.height_m}m · ${form.dimensions.shape}`" />
                      <v-list-item title="Seat source" :subtitle="form.use_designer ? 'Designer layout' : 'Manual seat counts by class'" />
                      <v-list-item title="Regular seats" :subtitle="String(seatCounts.Regular || 0)" />
                      <v-list-item title="Special seats" :subtitle="String(seatCounts.Special || 0)" />
                      <v-list-item title="VIP seats" :subtitle="String(seatCounts.VIP || 0)" />
                      <v-list-item title="Final seat count" :subtitle="String(finalSeatCount)" />
                      <v-list-item title="Extra images" :subtitle="`${form.extra_images.length} / 3`" />
                    </v-list>
                  </v-card>
                </v-col>

                <v-col cols="12" md="5">
                  <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-6 clean-section-card">
                    <div class="section-title mb-4">Preview card</div>
                    <div class="section-caption mb-4">This is the polished summary card feel users will eventually see in your app.</div>

                    <div class="preview-box mb-4" v-if="form.image">
                      <img :src="form.image" class="preview-image" />
                    </div>

                    <div class="text-h6 font-weight-bold">{{ form.title || "Untitled venue" }}</div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ form.location || "No city selected" }}
                    </div>

                    <div class="d-flex ga-2 flex-wrap mt-3 mb-3">
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ form.category || "Category" }}
                      </v-chip>
                      <v-chip size="small" variant="outlined">
                        {{ form.type || "Type" }}
                      </v-chip>
                      <v-chip size="small" color="success" variant="tonal">
                        {{ finalSeatCount }} seats
                      </v-chip>
                    </div>

                    <div class="text-body-2 mb-2">
                      {{ form.description || "No description yet." }}
                    </div>

                    <div class="d-flex ga-2 flex-wrap">
                      <v-chip size="small" color="success" variant="tonal">
                        {{ Number(form.price_per_hour || 0).toFixed(2) }} TND / hour
                      </v-chip>
                      <v-chip size="small" color="secondary" variant="tonal">
                        {{ Number(form.price_per_day || 0).toFixed(2) }} TND / day
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <v-divider class="my-6" />

            <div class="d-flex justify-space-between flex-wrap ga-3 action-bar" :class="{ 'action-bar-mobile': isMobile }">
              <v-btn
                variant="outlined"
                rounded="lg"
                prepend-icon="mdi-arrow-left"
                :disabled="step === 1"
                @click="step--"
              >
                Back
              </v-btn>

              <div class="d-flex ga-2 flex-wrap">
                <v-btn
                  v-if="step < 4"
                  color="primary"
                  rounded="lg"
                  append-icon="mdi-arrow-right"
                  @click="goNext"
                >
                  Continue
                </v-btn>

                <v-btn
                  v-else
                  color="primary"
                  rounded="lg"
                  prepend-icon="mdi-send"
                  @click="submitVenueRequest"
                >
                  Submit venue request
                </v-btn>
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
        timeout="2600"
      >
        {{ snackbar.text }}
      </v-snackbar>

      <v-dialog v-model="submitDialog" max-width="560" persistent content-class="success-dialog-pop">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
            <v-icon color="success">mdi-check-circle</v-icon>
            Request sent successfully
          </v-card-title>

          <v-card-text class="pt-2">
            <div class="text-body-1 mb-2">
              Your venue request was sent successfully and is now waiting for admin approval.
            </div>
            <div class="text-body-2 text-medium-emphasis">
              You will be notified once it is reviewed.
            </div>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="closeSubmitDialog">Stay here</v-btn>
            <v-btn color="primary" rounded="lg" prepend-icon="mdi-home" @click="goHomeAfterSubmit">
              Back to main page
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue"
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import { fileToDataUrl } from "@/utils/imageUtils"
import { get_Current_User } from "@/dataModel/user"
import {
  add_Venue_Request,
  count_Seats_By_Class,
} from "@/dataModel/venue_request"
import { create_Venue_Request_Submitted_Notifications } from "@/dataModel/notification"

const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"
const step = ref(1)
const submitDialog = ref(false)
const canvasRef = ref(null)

const coverImageInput = ref(null)
const extraImagesInput = ref([])

const cityOptions = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Bizerte",
  "Kairouan",
  "Gabès",
]

const categoryOptions = [
  "Cinema",
  "Theatre",
  "Stadium",
  "Bar Scene",
  "Conference Hall",
  "Hotel",
  "Outdoor Space",
  "Other",
]

const typeOptions = ["Indoor", "Outdoor", "Hybrid"]
const seatClassOptions = ["Regular", "Special", "VIP"]
const shapeOptions = ["rectangle", "rounded", "trapezoid", "arena"]
const paintModes = ["Select", "Regular", "Special", "VIP", "Erase"]

const paintMode = ref("Select")
const snapToGrid = ref(true)
const showGridAddresses = ref(true)

const MANUAL_SEAT_SIZE = 32
const MANUAL_SEAT_SPACING = 8
const MANUAL_SEAT_STEP = MANUAL_SEAT_SIZE + MANUAL_SEAT_SPACING
const BLOCK_GRID_SIZE = 24

const snackbar = reactive({
  show: false,
  text: "",
  color: "primary",
})

const historyStack = ref([])
const isMobile = computed(() => display.smAndDown.value)
const isTablet = computed(() => display.md.value)

const stepItems = [
  { value: 1, title: "Venue info", short: "Info" },
  { value: 2, title: "Dimensions", short: "Size" },
  { value: 3, title: "Design", short: "Design" },
  { value: 4, title: "Review", short: "Review" },
]

const currentStepMeta = computed(() => stepItems.find(item => item.value === step.value) || stepItems[0])
const mobileProgressStyle = computed(() => ({ width: `${(step.value / stepItems.length) * 100}%` }))
const isDarkTheme = computed(() => theme.global.name.value === "dark")

const browserThemeClass = computed(() =>
  isDarkTheme.value ? "browser-theme-dark" : "browser-theme-light"
)

const browserThemeLabel = computed(() =>
  isDarkTheme.value ? "Dark" : "Light"
)


const form = reactive({
  title: "",
  location: "",
  exact_address: "",
  availability: true,
  price_per_hour: 0,
  price_per_day: 0,
  capacity: 0,
  status_label: "Pending Review",
  category: "",
  type: "",
  review_rating: 0,
  description: "",
  image: "",
  extra_images: [],
  contact_info: {
    address: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
  },
  bank_account_info: {
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    rib: "",
    iban: "",
    swift: "",
  },
  featured: false,
  dimensions: {
    width_m: 20,
    height_m: 12,
    shape: "rectangle",
  },
  manual_seat_count: 0,
  manual_seat_counts: {
    regular: 0,
    special: 0,
    vip: 0,
  },
  use_designer: true,
  design: {
    seats: [],
    stages: [],
    screens: [],
    audio_sources: [],
    elements: [],
    notes: "",
  },
})

const selectedIds = ref([])

const dragState = reactive({
  active: false,
  mode: null,
  itemId: null,
  handle: null,
  offsetX: 0,
  offsetY: 0,
  startClientX: 0,
  startClientY: 0,
  basePositions: [],
  cloneTrailLastKey: "",
  baseWidth: 0,
  baseHeight: 0,
})

const selectionBox = reactive({
  visible: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
})

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  itemId: null,
})

const longPressTimer = ref(null)
const LONG_PRESS_DELAY = 520

function clearLongPressTimer() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

function startLongPress(event, item = null) {
  if (!isMobile.value) return

  clearLongPressTimer()

  const touch = event?.touches?.[0] || event?.changedTouches?.[0]
  if (!touch) return

  longPressTimer.value = window.setTimeout(() => {
    openContextMenu(
      {
        clientX: touch.clientX,
        clientY: touch.clientY,
      },
      item
    )
  }, LONG_PRESS_DELAY)
}

function cancelLongPress() {
  clearLongPressTimer()
}

const singleSelectedTitle = ref("")

const ratioPreviewStyle = computed(() => {
  const width = Math.max(1, Number(form.dimensions.width_m) || 1)
  const height = Math.max(1, Number(form.dimensions.height_m) || 1)
  const maxWidth = 280
  const maxHeight = 180
  const ratio = Math.min(maxWidth / width, maxHeight / height)

  return {
    width: `${Math.max(90, width * ratio)}px`,
    height: `${Math.max(70, height * ratio)}px`,
  }
})

const designerCanvasStyle = computed(() => {
  const width = Math.max(1, Number(form.dimensions.width_m) || 1)
  const height = Math.max(1, Number(form.dimensions.height_m) || 1)

  return {
    aspectRatio: `${width} / ${height}`,
    width: "100%",
    maxWidth: "1100px",
  }
})

const allCanvasItems = computed(() => [
  ...form.design.seats,
  ...form.design.stages,
  ...form.design.screens,
  ...form.design.audio_sources,
  ...form.design.elements,
])

const tableSeatContribution = computed(() => {
  const result = {
    Regular: 0,
    Special: 0,
    VIP: 0,
  }

  form.design.elements.forEach(element => {
    if (element.kind === "table2") {
      result.Regular += 2
    } else if (element.kind === "table4") {
      result.VIP += 4
    }
  })

  return result
})

const seatCounts = computed(() => {
  if (!form.use_designer) {
    return {
      Regular: Number(form.manual_seat_counts.regular || 0),
      Special: Number(form.manual_seat_counts.special || 0),
      VIP: Number(form.manual_seat_counts.vip || 0),
    }
  }

  const directCounts = count_Seats_By_Class(form.design.seats)
  return {
    Regular: Number(directCounts.Regular || 0) + Number(tableSeatContribution.value.Regular || 0),
    Special: Number(directCounts.Special || 0) + Number(tableSeatContribution.value.Special || 0),
    VIP: Number(directCounts.VIP || 0) + Number(tableSeatContribution.value.VIP || 0),
  }
})

const designedSeatCount = computed(() =>
  Number(seatCounts.value.Regular || 0) +
  Number(seatCounts.value.Special || 0) +
  Number(seatCounts.value.VIP || 0)
)

const finalSeatCount = computed(() =>
  Number(seatCounts.value.Regular || 0) +
  Number(seatCounts.value.Special || 0) +
  Number(seatCounts.value.VIP || 0)
)

const formCompletionPercent = computed(() => {
  const checks = [
    Boolean(form.title.trim()),
    Boolean(form.location.trim()),
    Boolean(form.exact_address.trim()),
    Boolean(form.category.trim()),
    Boolean(form.type.trim()),
    Number(form.price_per_hour || 0) > 0,
    Number(form.price_per_day || 0) > 0,
    Boolean(form.contact_info.phone.trim()),
    Boolean(form.contact_info.email.trim()),
    Boolean(form.bank_account_info.account_holder_name.trim()),
    Boolean(form.bank_account_info.bank_name.trim()),
    Boolean(form.bank_account_info.account_number.trim()),
    Boolean(form.image),
    Number(form.dimensions.width_m || 0) > 0,
    Number(form.dimensions.height_m || 0) > 0,
    form.use_designer ? designedSeatCount.value > 0 : finalSeatCount.value > 0,
  ]

  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
})

const autoNumberingPreview = computed(() => {
  if (!finalSeatCount.value) return "Seat codes will appear after seats are added"

  if (!form.use_designer) {
    return "Manual seats will be saved as A1, B1, C1..."
  }

  const previewSeats = buildNumberedDesignerSeats().slice(0, 4)
  if (!previewSeats.length) return "Seat codes will appear after seats are added"

  return previewSeats.map(seat => seat.location || `${seat.row}${seat.number}`).join(" · ")
})

const selectedItems = computed(() =>
  allCanvasItems.value.filter(item => selectedIds.value.includes(item.id))
)

const singleSelectedItem = computed(() =>
  selectedItems.value.length === 1 ? selectedItems.value[0] : null
)

const selectionBoxStyle = computed(() => {
  const left = Math.min(selectionBox.startX, selectionBox.currentX)
  const top = Math.min(selectionBox.startY, selectionBox.currentY)
  const width = Math.abs(selectionBox.currentX - selectionBox.startX)
  const height = Math.abs(selectionBox.currentY - selectionBox.startY)

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

function notify(text, color = "primary") {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function applySavedTheme() {
  if (typeof window === "undefined") return

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  const normalizedTheme = savedTheme === "light" ? "light" : "dark"
  const availableThemes = theme?.themes?.value ? Object.keys(theme.themes.value) : []

  if (availableThemes.includes(normalizedTheme)) {
    theme.global.name.value = normalizedTheme
  } else {
    theme.global.name.value = normalizedTheme
  }

  document.documentElement.setAttribute("data-app-theme", normalizedTheme)
  document.documentElement.style.colorScheme = normalizedTheme
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    applySavedTheme()
  }
}

function handleAppThemeSync(event) {
  const nextTheme =
    event?.detail === "light" || event?.detail === "dark"
      ? event.detail
      : localStorage.getItem(THEME_STORAGE_KEY)

  const normalizedTheme = nextTheme === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme
  document.documentElement.setAttribute("data-app-theme", normalizedTheme)
  document.documentElement.style.colorScheme = normalizedTheme
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createId() {
  return crypto.randomUUID()
}

function snapshotDesign() {
  return {
    design: deepClone(form.design),
    selectedIds: [...selectedIds.value],
  }
}

function pushHistory() {
  historyStack.value.push(snapshotDesign())
  if (historyStack.value.length > 80) {
    historyStack.value.shift()
  }
}

function restoreDesignSnapshot(snapshot) {
  form.design.seats = snapshot.design.seats || []
  form.design.stages = snapshot.design.stages || []
  form.design.screens = snapshot.design.screens || []
  form.design.audio_sources = snapshot.design.audio_sources || []
  form.design.elements = snapshot.design.elements || []
  form.design.notes = snapshot.design.notes || ""
  selectedIds.value = snapshot.selectedIds || []
}

function undoLastAction() {
  if (!historyStack.value.length) return
  const previous = historyStack.value.pop()
  restoreDesignSnapshot(previous)
  closeContextMenu()
  notify("Last design action undone.", "success")
}

function updateSingleSelectedTitle(value) {
  if (singleSelectedItem.value) {
    singleSelectedItem.value.title = value
  }
}

function seatColor(seatClass) {
  if (seatClass === "VIP") return "#D4A137"
  if (seatClass === "Special") return "#D64545"
  return "#1E88E5"
}

function gridSize() {
  return BLOCK_GRID_SIZE
}

function seatStep() {
  return MANUAL_SEAT_STEP
}

function snap(value, customGrid = gridSize()) {
  return Math.round(value / customGrid) * customGrid
}

function snapSeat(value) {
  return snap(value, seatStep())
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizePoint(x, y, options = {}) {
  if (!canvasRef.value) return { x, y }

  const rect = canvasRef.value.getBoundingClientRect()
  const isSeat = Boolean(options.isSeat)
  const itemWidth = Number(options.width ?? (isSeat ? MANUAL_SEAT_SIZE : 28))
  const itemHeight = Number(options.height ?? (isSeat ? MANUAL_SEAT_SIZE : 28))

  let nx = x
  let ny = y

  nx = clamp(nx, 0, Math.max(0, rect.width - itemWidth))
  ny = clamp(ny, 0, Math.max(0, rect.height - itemHeight))

  if (snapToGrid.value) {
    if (isSeat) {
      nx = snapSeat(nx)
      ny = snapSeat(ny)
    } else {
      nx = snap(nx)
      ny = snap(ny)
    }
  }

  nx = clamp(nx, 0, Math.max(0, rect.width - itemWidth))
  ny = clamp(ny, 0, Math.max(0, rect.height - itemHeight))

  return { x: nx, y: ny }
}

function getCanvasRelativePoint(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function getItemCollisionPadding(item) {
  return item?.kind === "seat" ? MANUAL_SEAT_SPACING : 0
}

function itemsOverlap(a, b, padding = 0) {
  return !((a.x + a.width + padding) <= b.x || (b.x + b.width + padding) <= a.x || (a.y + a.height + padding) <= b.y || (b.y + b.height + padding) <= a.y)
}

function canPlaceSeatAt(x, y, ignoreIds = []) {
  const ignoreSet = new Set(Array.isArray(ignoreIds) ? ignoreIds : [ignoreIds])
  const candidate = {
    x,
    y,
    width: MANUAL_SEAT_SIZE,
    height: MANUAL_SEAT_SIZE,
  }

  return !form.design.seats.some(seat => {
    if (ignoreSet.has(seat.id)) return false
    return itemsOverlap(candidate, seat, MANUAL_SEAT_SPACING)
  })
}

function closeContextMenu() {
  contextMenu.visible = false
  contextMenu.x = 0
  contextMenu.y = 0
  contextMenu.itemId = null
}

function openContextMenu(event, item = null) {
  if (item && !isSelected(item.id)) {
    setSingleSelection(item)
  }

  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    contextMenu.x = clamp(event.clientX - rect.left, 8, Math.max(8, rect.width - 208))
    contextMenu.y = clamp(event.clientY - rect.top, 8, Math.max(8, rect.height - 196))
  } else {
    contextMenu.x = 16
    contextMenu.y = 16
  }

  contextMenu.itemId = item?.id ?? null
  contextMenu.visible = true
}

function handleGlobalPointerDown(event) {
  const menu = event.target?.closest?.(".designer-context-menu")
  const item = event.target?.closest?.(".canvas-item")
  if (!menu && !item) {
    closeContextMenu()
  }
}

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function setSingleSelection(item) {
  selectedIds.value = [item.id]
  singleSelectedTitle.value = item.title || ""
}

function clearSelection() {
  selectedIds.value = []
  singleSelectedTitle.value = ""
  closeContextMenu()
}

function syncSelectedSeatColor() {
  if (!singleSelectedItem.value || singleSelectedItem.value.kind !== "seat") return
  singleSelectedItem.value.color = seatColor(singleSelectedItem.value.seat_class)
}

function normalizeFilesInput(input) {
  if (!input) return []

  if (input instanceof File) return [input]
  if (Array.isArray(input)) return input.filter(file => file instanceof File)
  if (typeof FileList !== "undefined" && input instanceof FileList) return Array.from(input)

  if (input?.target?.files) return Array.from(input.target.files)
  if (input?.dataTransfer?.files) return Array.from(input.dataTransfer.files)
  if (input?.value instanceof File) return [input.value]
  if (Array.isArray(input?.value)) return input.value.filter(file => file instanceof File)

  return []
}

async function handleCoverImage(input) {
  const files = normalizeFilesInput(input)
  const file = files[0] || null

  if (!file) {
    if (!input) {
      form.image = ""
    }
    return
  }

  try {
    form.image = await fileToDataUrl(file)
    notify("Venue cover image added.", "success")
  } catch (error) {
    console.error(error)
    notify("Failed to upload image.", "error")
  }
}

async function handleExtraImages(input) {
  const fileList = normalizeFilesInput(input)

  if (!fileList.length) {
    if (!input) {
      extraImagesInput.value = []
    }
    return
  }

  const availableSlots = 3 - form.extra_images.length

  if (availableSlots <= 0) {
    notify("You can only upload up to 3 extra images.", "error")
    extraImagesInput.value = []
    return
  }

  const limitedFiles = fileList.slice(0, availableSlots)

  if (fileList.length > availableSlots) {
    notify(`Only ${availableSlots} more extra image(s) can be added.`, "warning")
  }

  try {
    const encoded = await Promise.all(limitedFiles.map(file => fileToDataUrl(file)))
    form.extra_images.push(...encoded)
    extraImagesInput.value = []
    notify("Extra images added.", "success")
  } catch (error) {
    console.error(error)
    notify("Failed to upload extra images.", "error")
  }
}

function removeExtraImage(index) {
  form.extra_images.splice(index, 1)
}

function createSeat(x, y, seatClass = "Regular") {
  return {
    id: createId(),
    kind: "seat",
    x,
    y,
    width: MANUAL_SEAT_SIZE,
    height: MANUAL_SEAT_SIZE,
    seat_class: seatClass,
    color: seatColor(seatClass),
    title: "",
    location_key: "",
    location: "",
    seat_number: "",
    row: "",
    number: "",
  }
}

function createBlock({
  kind,
  x,
  y,
  width,
  height,
  title,
  color,
  icon,
}) {
  return {
    id: createId(),
    kind,
    x,
    y,
    width,
    height,
    title,
    color,
    icon,
  }
}

function addSeatAtPosition(x, y, seatClass, skipHistory = false) {
  const p = normalizePoint(x, y, { isSeat: true, width: MANUAL_SEAT_SIZE, height: MANUAL_SEAT_SIZE })
  if (!canPlaceSeatAt(p.x, p.y)) return null

  if (!skipHistory) pushHistory()

  const seat = createSeat(p.x, p.y, seatClass)
  form.design.seats.push(seat)
  return seat
}

function eraseAtPosition(x, y) {
  const p = normalizePoint(x, y, { isSeat: true, width: MANUAL_SEAT_SIZE, height: MANUAL_SEAT_SIZE })
  const index = form.design.seats.findIndex(
    seat => Math.abs(seat.x - p.x) < MANUAL_SEAT_SIZE / 2 && Math.abs(seat.y - p.y) < MANUAL_SEAT_SIZE / 2
  )
  if (index !== -1) {
    pushHistory()
    form.design.seats.splice(index, 1)
  }
}

function addSeatButton(seatClass) {
  const seat = addSeatAtPosition(
    40 + (form.design.seats.length % 12) * MANUAL_SEAT_STEP,
    56 + Math.floor(form.design.seats.length / 12) * MANUAL_SEAT_STEP,
    seatClass
  )
  if (seat) setSingleSelection(seat)
}

function addSeatRow(count = 20, seatClass = "Regular") {
  pushHistory()
  const startX = 80
  const startY = 100 + Math.max(0, Math.floor(form.design.seats.length / 12) * MANUAL_SEAT_STEP)
  const gap = MANUAL_SEAT_STEP
  const ids = []

  for (let i = 0; i < count; i += 1) {
    const seat = addSeatAtPosition(startX + i * gap, startY, seatClass, true)
    if (seat) ids.push(seat.id)
  }

  selectedIds.value = ids
}

function addStage(skipHistory = false) {
  if (!skipHistory) pushHistory()

  const block = createBlock({
    kind: "stage",
    x: 360,
    y: 18,
    width: 220,
    height: 56,
    title: "Stage",
    color: "linear-gradient(135deg, #D4A137, #B8860B)",
    icon: "mdi-podium-gold",
  })
  form.design.stages.push(block)
  setSingleSelection(block)
}

function addScreen(skipHistory = false) {
  if (!skipHistory) pushHistory()

  const block = createBlock({
    kind: "screen",
    x: 390,
    y: 90,
    width: 170,
    height: 44,
    title: "Screen",
    color: "linear-gradient(135deg, #8E24AA, #5E35B1)",
    icon: "mdi-television-play",
  })
  form.design.screens.push(block)
  setSingleSelection(block)
}

function addAudioSource(skipHistory = false) {
  if (!skipHistory) pushHistory()

  const block = createBlock({
    kind: "audio",
    x: 120,
    y: 110,
    width: 95,
    height: 50,
    title: "Audio",
    color: "linear-gradient(135deg, #00897B, #00695C)",
    icon: "mdi-speaker",
  })
  form.design.audio_sources.push(block)
  setSingleSelection(block)
}

function addElement({
  kind,
  x = 100,
  y = 100,
  width = 100,
  height = 50,
  title = "",
  color = "linear-gradient(135deg, #546E7A, #37474F)",
  icon = "",
}, skipHistory = false) {
  if (!skipHistory) pushHistory()

  const block = createBlock({ kind, x, y, width, height, title, color, icon })
  form.design.elements.push(block)
  setSingleSelection(block)
}

function addTable4() {
  addElement({
    kind: "table4",
    x: 120,
    y: 220,
    width: 120,
    height: 120,
    title: "Table 4",
    color: "linear-gradient(135deg, #795548, #5D4037)",
    icon: "mdi-table-furniture",
  })
}

function addTable2() {
  addElement({
    kind: "table2",
    x: 120,
    y: 360,
    width: 96,
    height: 72,
    title: "Table 2",
    color: "linear-gradient(135deg, #8D6E63, #6D4C41)",
    icon: "mdi-table-chair",
  })
}

function addBarCounter() {
  addElement({
    kind: "barcounter",
    x: 620,
    y: 70,
    width: 200,
    height: 60,
    title: "Bar Counter",
    color: "linear-gradient(135deg, #6D4C41, #4E342E)",
    icon: "mdi-barley",
  })
}

function addEntrance() {
  addElement({
    kind: "entrance",
    x: 30,
    y: 30,
    width: 90,
    height: 42,
    title: "Entrance",
    color: "linear-gradient(135deg, #43A047, #2E7D32)",
    icon: "mdi-door",
  })
}

function addExit() {
  addElement({
    kind: "exit",
    x: 840,
    y: 30,
    width: 80,
    height: 42,
    title: "Exit",
    color: "linear-gradient(135deg, #E53935, #C62828)",
    icon: "mdi-emergency-exit",
  })
}

function addBuffet() {
  addElement({
    kind: "buffet",
    x: 660,
    y: 200,
    width: 180,
    height: 52,
    title: "Buffet",
    color: "linear-gradient(135deg, #FB8C00, #EF6C00)",
    icon: "mdi-food",
  })
}

function addTicketDesk() {
  addElement({
    kind: "ticketdesk",
    x: 40,
    y: 110,
    width: 150,
    height: 50,
    title: "Ticket Desk",
    color: "linear-gradient(135deg, #3949AB, #283593)",
    icon: "mdi-ticket-confirmation",
  })
}

function addPodium() {
  addElement({
    kind: "podium",
    x: 420,
    y: 150,
    width: 90,
    height: 58,
    title: "Podium",
    color: "linear-gradient(135deg, #7B1FA2, #6A1B9A)",
    icon: "mdi-human-male-board-poll",
  })
}

function applyCinemaPreset() {
  pushHistory()
  resetDesign(false, true)

  addScreen(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 240
    singleSelectedItem.value.y = 24
    singleSelectedItem.value.width = 360
    singleSelectedItem.value.height = 54
    singleSelectedItem.value.title = "Main Screen"
  }

  addAudioSource(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 120
    singleSelectedItem.value.y = 28
    singleSelectedItem.value.width = 88
    singleSelectedItem.value.height = 46
    singleSelectedItem.value.title = "Left Speaker"
  }

  addAudioSource(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 640
    singleSelectedItem.value.y = 28
    singleSelectedItem.value.width = 88
    singleSelectedItem.value.height = 46
    singleSelectedItem.value.title = "Right Speaker"
  }

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      if (col === 6 || col === 7) continue
      addSeatAtPosition(80 + col * MANUAL_SEAT_STEP, 140 + row * MANUAL_SEAT_STEP, row < 2 ? "VIP" : "Regular", true)
    }
  }

  clearSelection()
  notify("Cinema preset applied with cleaner spacing.", "success")
}

function applyTheatrePreset() {
  pushHistory()
  resetDesign(false, true)

  addStage(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 260
    singleSelectedItem.value.y = 440
    singleSelectedItem.value.width = 320
    singleSelectedItem.value.height = 72
    singleSelectedItem.value.title = "Main Stage"
  }

  addAudioSource(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 170
    singleSelectedItem.value.y = 450
    singleSelectedItem.value.width = 80
    singleSelectedItem.value.height = 46
    singleSelectedItem.value.title = "Front Left"
  }

  addAudioSource(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 590
    singleSelectedItem.value.y = 450
    singleSelectedItem.value.width = 80
    singleSelectedItem.value.height = 46
    singleSelectedItem.value.title = "Front Right"
  }

  for (let row = 0; row < 8; row += 1) {
    const seatClass = row < 2 ? "VIP" : row < 4 ? "Special" : "Regular"

    for (let col = 0; col < 15; col += 1) {
      if (col === 4 || col === 10) continue
      addSeatAtPosition(96 + col * MANUAL_SEAT_STEP, 72 + row * MANUAL_SEAT_STEP, seatClass, true)
    }
  }

  clearSelection()
  notify("Theatre preset applied with stage at the bottom.", "success")
}

function applyBarPreset() {
  pushHistory()
  resetDesign(false, true)
  addBarCounter(true)
  addBuffet(true)
  addEntrance(true)
  addExit(true)

  const layouts = [
    [120, 150], [320, 150], [520, 150],
    [120, 320], [320, 320], [520, 320],
  ]

  layouts.forEach(([x, y], i) => {
    addElement({
      kind: "table4",
      x,
      y,
      width: 120,
      height: 120,
      title: `Lounge Table ${i + 1}`,
      color: "linear-gradient(135deg, #795548, #5D4037)",
      icon: "mdi-table-furniture",
    }, true)
  })

  clearSelection()
  notify("Bar preset polished and applied.", "success")
}

function applyConferencePreset() {
  pushHistory()
  resetDesign(false, true)
  addScreen(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 270
    singleSelectedItem.value.y = 24
    singleSelectedItem.value.width = 300
    singleSelectedItem.value.height = 52
    singleSelectedItem.value.title = "Presentation Screen"
  }

  addStage(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 310
    singleSelectedItem.value.y = 94
    singleSelectedItem.value.width = 220
    singleSelectedItem.value.height = 48
    singleSelectedItem.value.title = "Conference Stage"
  }

  addPodium(true)
  if (singleSelectedItem.value) {
    singleSelectedItem.value.x = 390
    singleSelectedItem.value.y = 154
  }

  addEntrance(true)
  addExit(true)

  for (let row = 0; row < 6; row += 1) {
    const seatClass = row === 0 ? "VIP" : row < 3 ? "Special" : "Regular"
    for (let col = 0; col < 12; col += 1) {
      if (col === 5 || col === 6) continue
      addSeatAtPosition(120 + col * MANUAL_SEAT_STEP, 230 + row * MANUAL_SEAT_STEP, seatClass, true)
    }
  }

  clearSelection()
  notify("Conference preset applied with cleaner structure.", "success")
}

function seatBg(item) {
  return item.color || seatColor(item.seat_class)
}

function getItemStyle(item) {
  return {
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${item.width}px`,
    height: `${item.height}px`,
  }
}

function canResizeItem(item) {
  return item?.kind !== "seat"
}

function findItemById(id) {
  return allCanvasItems.value.find(item => item.id === id) || null
}

function onItemClick(event, item) {
  if (event.ctrlKey || event.metaKey) {
    if (isSelected(item.id)) {
      selectedIds.value = selectedIds.value.filter(id => id !== item.id)
    } else {
      selectedIds.value = [...selectedIds.value, item.id]
    }
  } else if (!isSelected(item.id)) {
    setSingleSelection(item)
  } else if (selectedIds.value.length === 1) {
    setSingleSelection(item)
  }
}

function startItemMouseDown(event, item) {
  if (!isSelected(item.id)) {
    if (event.ctrlKey || event.metaKey) {
      selectedIds.value = [...selectedIds.value, item.id]
    } else {
      setSingleSelection(item)
    }
  }

  const point = getCanvasRelativePoint(event)

  if (item.kind === "seat" && event.detail >= 2) {
    pushHistory()
    dragState.active = true
    dragState.mode = "cloneTrail"
    dragState.itemId = item.id
    dragState.cloneTrailLastKey = ""
    window.addEventListener("mousemove", onWindowMouseMove)
    window.addEventListener("mouseup", stopGlobalDrag)
    cloneTrailAt(point.x, point.y, item)
    return
  }

  dragState.active = true
  dragState.mode = "move"
  dragState.itemId = item.id
  dragState.startClientX = event.clientX
  dragState.startClientY = event.clientY
  dragState.basePositions = selectedItems.value.map(selected => ({
    id: selected.id,
    x: selected.x,
    y: selected.y,
  }))

  window.addEventListener("mousemove", onWindowMouseMove)
  window.addEventListener("mouseup", stopGlobalDrag)
}

function onWindowMouseMove(event) {
  if (!dragState.active || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()

  if (dragState.mode === "move") {
    const dx = event.clientX - dragState.startClientX
    const dy = event.clientY - dragState.startClientY

    dragState.basePositions.forEach(base => {
      const item = findItemById(base.id)
      if (!item) return

      let newX = base.x + dx
      let newY = base.y + dy

      if (item.kind === "seat") {
        const normalized = normalizePoint(newX, newY, { isSeat: true, width: item.width, height: item.height })
        newX = normalized.x
        newY = normalized.y

        if (!canPlaceSeatAt(newX, newY, dragState.basePositions.map(position => position.id))) {
          return
        }
      } else {
        if (snapToGrid.value) {
          newX = snap(newX)
          newY = snap(newY)
        }
        newX = clamp(newX, 0, rect.width - item.width)
        newY = clamp(newY, 0, rect.height - item.height)
      }

      item.x = newX
      item.y = newY
    })
  }

  if (dragState.mode === "resize" && dragState.itemId) {
    const item = findItemById(dragState.itemId)
    if (!item) return

    let newWidth = dragState.baseWidth + (event.clientX - dragState.startClientX)
    let newHeight = dragState.baseHeight + (event.clientY - dragState.startClientY)

    if (snapToGrid.value) {
      newWidth = snap(newWidth)
      newHeight = snap(newHeight)
    }

    item.width = clamp(newWidth, 24, rect.width - item.x)
    item.height = clamp(newHeight, 24, rect.height - item.y)
  }

  if (dragState.mode === "cloneTrail" && dragState.itemId) {
    const source = findItemById(dragState.itemId)
    if (!source) return
    const point = getCanvasRelativePoint(event)
    cloneTrailAt(point.x, point.y, source)
  }
}

function startResize(event, item) {
  if (!canResizeItem(item)) return
  pushHistory()
  dragState.active = true
  dragState.mode = "resize"
  dragState.itemId = item.id
  dragState.startClientX = event.clientX
  dragState.startClientY = event.clientY
  dragState.baseWidth = item.width
  dragState.baseHeight = item.height

  window.addEventListener("mousemove", onWindowMouseMove)
  window.addEventListener("mouseup", stopGlobalDrag)
}

function cloneTrailAt(x, y, sourceSeat) {
  const p = normalizePoint(x, y, { isSeat: true, width: MANUAL_SEAT_SIZE, height: MANUAL_SEAT_SIZE })
  const key = `${p.x}-${p.y}`

  if (dragState.cloneTrailLastKey === key) return
  dragState.cloneTrailLastKey = key

  if (!canPlaceSeatAt(p.x, p.y)) return

  const clone = createSeat(p.x, p.y, sourceSeat.seat_class)
  form.design.seats.push(clone)
  selectedIds.value = [...selectedIds.value, clone.id]
}

function stopGlobalDrag() {
  dragState.active = false
  dragState.mode = null
  dragState.itemId = null
  dragState.handle = null
  dragState.cloneTrailLastKey = ""
  window.removeEventListener("mousemove", onWindowMouseMove)
  window.removeEventListener("mouseup", stopGlobalDrag)
}

function onCanvasMouseDown(event) {
  if (!form.use_designer) return

  const isCanvasSelf = event.target === canvasRef.value
  const point = getCanvasRelativePoint(event)

  if (!isCanvasSelf) return

  if (paintMode.value !== "Select") {
    pushHistory()
    dragState.active = true
    dragState.mode = "paint"
    paintAt(point.x, point.y)
    return
  }

  clearSelection()
  selectionBox.visible = true
  selectionBox.startX = point.x
  selectionBox.startY = point.y
  selectionBox.currentX = point.x
  selectionBox.currentY = point.y
  dragState.active = true
  dragState.mode = "selectBox"
}

function onCanvasMouseMove(event) {
  if (!dragState.active || !canvasRef.value) return

  const point = getCanvasRelativePoint(event)

  if (dragState.mode === "paint") {
    paintAt(point.x, point.y)
  }

  if (dragState.mode === "selectBox") {
    selectionBox.currentX = point.x
    selectionBox.currentY = point.y
    updateSelectionByBox()
  }
}

function onCanvasMouseUp() {
  if (dragState.mode === "paint") {
    dragState.active = false
    dragState.mode = null
  }

  if (dragState.mode === "selectBox") {
    selectionBox.visible = false
    dragState.active = false
    dragState.mode = null
  }
}

function paintAt(x, y) {
  const p = normalizePoint(x, y, { isSeat: true, width: MANUAL_SEAT_SIZE, height: MANUAL_SEAT_SIZE })

  if (paintMode.value === "Regular" || paintMode.value === "Special" || paintMode.value === "VIP") {
    addSeatAtPosition(p.x, p.y, paintMode.value, true)
  } else if (paintMode.value === "Erase") {
    eraseAtPosition(p.x, p.y)
  }
}

function updateSelectionByBox() {
  const left = Math.min(selectionBox.startX, selectionBox.currentX)
  const top = Math.min(selectionBox.startY, selectionBox.currentY)
  const right = Math.max(selectionBox.startX, selectionBox.currentX)
  const bottom = Math.max(selectionBox.startY, selectionBox.currentY)

  selectedIds.value = allCanvasItems.value
    .filter(item => {
      const itemLeft = item.x
      const itemTop = item.y
      const itemRight = item.x + item.width
      const itemBottom = item.y + item.height

      return itemLeft < right && itemRight > left && itemTop < bottom && itemBottom > top
    })
    .map(item => item.id)
}

function duplicateSelected() {
  if (!selectedItems.value.length) return

  pushHistory()
  closeContextMenu()
  const duplicatedIds = []

  selectedItems.value.forEach(item => {
    const duplicate = deepClone(item)
    duplicate.id = createId()
    duplicate.x += 24
    duplicate.y += 24

    if (duplicate.kind === "seat") {
      form.design.seats.push(duplicate)
    } else if (duplicate.kind === "stage") {
      form.design.stages.push(duplicate)
    } else if (duplicate.kind === "screen") {
      form.design.screens.push(duplicate)
    } else if (duplicate.kind === "audio") {
      form.design.audio_sources.push(duplicate)
    } else {
      form.design.elements.push(duplicate)
    }

    duplicatedIds.push(duplicate.id)
  })

  selectedIds.value = duplicatedIds
}

function removeSelected() {
  if (!selectedItems.value.length) return

  pushHistory()
  closeContextMenu()
  const idsToDelete = new Set(selectedIds.value)

  form.design.seats = form.design.seats.filter(item => !idsToDelete.has(item.id))
  form.design.stages = form.design.stages.filter(item => !idsToDelete.has(item.id))
  form.design.screens = form.design.screens.filter(item => !idsToDelete.has(item.id))
  form.design.audio_sources = form.design.audio_sources.filter(item => !idsToDelete.has(item.id))
  form.design.elements = form.design.elements.filter(item => !idsToDelete.has(item.id))

  clearSelection()
}

function resetDesign(showMessage = true, skipHistory = false) {
  const hasAnything =
    form.design.seats.length ||
    form.design.stages.length ||
    form.design.screens.length ||
    form.design.audio_sources.length ||
    form.design.elements.length

  if (hasAnything && !skipHistory) {
    pushHistory()
  }

  form.design.seats = []
  form.design.stages = []
  form.design.screens = []
  form.design.audio_sources = []
  form.design.elements = []
  clearSelection()
  if (showMessage) notify("Designer reset.", "warning")
}

function sortItemsTopLeft(items = []) {
  return [...items].sort((a, b) => {
    const rowDiff = Number(a.y || 0) - Number(b.y || 0)
    if (Math.abs(rowDiff) > 18) return rowDiff
    return Number(a.x || 0) - Number(b.x || 0)
  })
}

function buildSeatRecord({
  x,
  y,
  width = MANUAL_SEAT_SIZE,
  height = MANUAL_SEAT_SIZE,
  seatClass = "Regular",
  sourceType = "manual-seat",
  sourceId = null,
  sourceLabel = "",
  tableSeatIndex = null,
}) {
  return {
    id: createId(),
    kind: "seat",
    source_type: sourceType,
    source_id: sourceId,
    source_label: sourceLabel,
    table_seat_index: tableSeatIndex,
    x: Number(x || 0),
    y: Number(y || 0),
    width: Number(width || MANUAL_SEAT_SIZE),
    height: Number(height || MANUAL_SEAT_SIZE),
    seat_class: seatClass,
    color: seatColor(seatClass),
    title: "",
    row: "",
    number: "",
    seat_number: "",
    location: "",
  }
}

function buildGeneratedSeatsFromTables() {
  const generatedSeats = []

  form.design.elements.forEach(element => {
    if (element.kind === "table2") {
      generatedSeats.push(
        buildSeatRecord({
          x: Number(element.x || 0) + 8,
          y: Number(element.y || 0) + Math.max(8, Number(element.height || 72) / 2 - MANUAL_SEAT_SIZE / 2),
          seatClass: "Regular",
          sourceType: "table2",
          sourceId: element.id,
          sourceLabel: element.title || "Table 2",
          tableSeatIndex: 1,
        }),
        buildSeatRecord({
          x: Number(element.x || 0) + Math.max(8, Number(element.width || 96) - (MANUAL_SEAT_SIZE + 4)),
          y: Number(element.y || 0) + Math.max(8, Number(element.height || 72) / 2 - MANUAL_SEAT_SIZE / 2),
          seatClass: "Regular",
          sourceType: "table2",
          sourceId: element.id,
          sourceLabel: element.title || "Table 2",
          tableSeatIndex: 2,
        }),
      )
    }

    if (element.kind === "table4") {
      const baseX = Number(element.x || 0)
      const baseY = Number(element.y || 0)
      const blockWidth = Number(element.width || 120)
      const blockHeight = Number(element.height || 120)

      generatedSeats.push(
        buildSeatRecord({
          x: baseX + blockWidth / 2 - MANUAL_SEAT_SIZE / 2,
          y: baseY + 6,
          seatClass: "VIP",
          sourceType: "table4",
          sourceId: element.id,
          sourceLabel: element.title || "Table 4",
          tableSeatIndex: 1,
        }),
        buildSeatRecord({
          x: baseX + blockWidth - (MANUAL_SEAT_SIZE + 2),
          y: baseY + blockHeight / 2 - MANUAL_SEAT_SIZE / 2,
          seatClass: "VIP",
          sourceType: "table4",
          sourceId: element.id,
          sourceLabel: element.title || "Table 4",
          tableSeatIndex: 2,
        }),
        buildSeatRecord({
          x: baseX + blockWidth / 2 - MANUAL_SEAT_SIZE / 2,
          y: baseY + blockHeight - (MANUAL_SEAT_SIZE + 2),
          seatClass: "VIP",
          sourceType: "table4",
          sourceId: element.id,
          sourceLabel: element.title || "Table 4",
          tableSeatIndex: 3,
        }),
        buildSeatRecord({
          x: baseX + 6,
          y: baseY + blockHeight / 2 - MANUAL_SEAT_SIZE / 2,
          seatClass: "VIP",
          sourceType: "table4",
          sourceId: element.id,
          sourceLabel: element.title || "Table 4",
          tableSeatIndex: 4,
        }),
      )
    }
  })

  return generatedSeats
}

function buildNumberedDesignerSeats() {
  const manualSeats = form.design.seats.map(seat => ({
    ...deepClone(seat),
    source_type: seat.source_type || "manual-seat",
    source_id: seat.source_id || seat.id,
    source_label: seat.source_label || seat.title || "Seat",
    table_seat_index: seat.table_seat_index ?? null,
  }))

  const combinedSeats = sortItemsTopLeft([
    ...manualSeats,
    ...buildGeneratedSeatsFromTables(),
  ])

  if (!combinedSeats.length) return []

  const rowMap = new Map()
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  // 🔥 group seats by vertical band so nearby seats become same row
  // works better than exact y matching and stays stable after dragging
  const ROW_GROUPING_TOLERANCE = 24

  const sortedByYThenX = [...combinedSeats].sort((a, b) => {
    const yDiff = Number(a.y || 0) - Number(b.y || 0)
    if (Math.abs(yDiff) > 6) return yDiff
    return Number(a.x || 0) - Number(b.x || 0)
  })

  const detectedRows = []

  sortedByYThenX.forEach(seat => {
    const seatY = Number(seat.y || 0)

    let matchedRow = detectedRows.find(rowGroup =>
      Math.abs(rowGroup.anchorY - seatY) <= ROW_GROUPING_TOLERANCE
    )

    if (!matchedRow) {
      matchedRow = {
        anchorY: seatY,
        seats: [],
      }
      detectedRows.push(matchedRow)
    }

    matchedRow.seats.push(seat)

    // keep row anchor stable and smooth
    matchedRow.anchorY =
      matchedRow.seats.reduce((sum, item) => sum + Number(item.y || 0), 0) /
      matchedRow.seats.length
  })

  detectedRows
    .sort((a, b) => a.anchorY - b.anchorY)
    .forEach((rowGroup, rowIndex) => {
      const rowLabel = rowLetters[rowIndex] || `R${rowIndex + 1}`

      const rowSeats = [...rowGroup.seats].sort((a, b) => {
        return Number(a.x || 0) - Number(b.x || 0)
      })

      rowMap.set(rowLabel, rowSeats)
    })

  const finalSeats = []

  ;[...rowMap.entries()].forEach(([rowLabel, rowSeats]) => {
    rowSeats.forEach((seat, seatIndex) => {
      const number = seatIndex + 1
      const autoCode = `${rowLabel}${number}`

      const normalizedSeat = {
        ...seat,
        row: rowLabel,
        number,
        seat_number: autoCode,
        location_key: `${rowLabel}-${number}`,
        location: autoCode,
        label: autoCode,
        title:
          seat.source_type === "table-generated"
            ? `${seat.seat_class || "Regular"} Seat ${autoCode}`
            : `${seat.seat_class || "Regular"} Seat ${autoCode}`,
      }

      finalSeats.push(normalizedSeat)
    })
  })

  return sortItemsTopLeft(finalSeats)
}

function buildManualSeatDefinitions() {
  const manualCounts = [
    { seatClass: "Regular", total: Number(form.manual_seat_counts.regular || 0) },
    { seatClass: "Special", total: Number(form.manual_seat_counts.special || 0) },
    { seatClass: "VIP", total: Number(form.manual_seat_counts.vip || 0) },
  ]

  const seats = []
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let globalSeatNumber = 1
  let rowIndex = 0

  manualCounts.forEach(group => {
    for (let i = 0; i < group.total; i += 1) {
      const rowLabel = rowLetters[rowIndex] || `R${rowIndex + 1}`
      const number = 1
      seats.push({
        id: createId(),
        kind: "seat",
        source_type: "manual-count",
        source_id: `${group.seatClass.toLowerCase()}-${i + 1}`,
        source_label: `Manual ${group.seatClass}`,
        table_seat_index: null,
        x: 0,
        y: 0,
        width: MANUAL_SEAT_SIZE,
        height: MANUAL_SEAT_SIZE,
        seat_class: group.seatClass,
        color: seatColor(group.seatClass),
        title: `${group.seatClass} Seat ${rowLabel}${number}`,
        row: rowLabel,
        number,
        seat_number: `${rowLabel}${number}`,
        location_key: `${rowLabel}-${number}`,
        location: `${rowLabel}${number}`,
        label: `${rowLabel}${number}`,
      })
      globalSeatNumber += 1
      rowIndex += 1
    }
  })

  return seats
}

function getSerializedDesign() {
  const serializedSeats = form.use_designer
    ? buildNumberedDesignerSeats()
    : buildManualSeatDefinitions()

  const serializedStages = form.design.stages.map(stage => ({
    ...deepClone(stage),
    location: stage.location || stage.title || "Stage",
    type: stage.type || "stage",
  }))

  const serializedScreens = [
    ...form.design.screens.map(screen => ({
      ...deepClone(screen),
      location: screen.location || screen.title || "Screen",
      type: screen.type || "screen",
    })),
    ...serializedStages.map(stage => ({
      ...deepClone(stage),
      type: "stage",
      is_stage: true,
    })),
  ]

  const serializedAudioSources = form.design.audio_sources.map(source => ({
    ...deepClone(source),
    location: source.location || source.title || "Audio Source",
    type: source.type || "audio",
  }))

  const serializedElements = form.design.elements.map(element => ({
    ...deepClone(element),
    seat_equivalent_count:
      element.kind === "table2"
        ? 2
        : element.kind === "table4"
          ? 4
          : 0,
    seat_equivalent_class:
      element.kind === "table2"
        ? "Regular"
        : element.kind === "table4"
          ? "VIP"
          : "",
  }))

  return {
    seats: serializedSeats,
    stages: serializedStages,
    screens: serializedScreens,
    audio_sources: serializedAudioSources,
    elements: serializedElements,
    shapes: [],
    notes: form.design.notes,
  }
}

function validateStep1() {
  if (!form.title.trim()) return "Venue title is required."
  if (!form.location.trim()) return "City is required."
  if (!form.exact_address.trim()) return "Exact address is required."
  if (!form.category.trim()) return "Category is required."
  if (!form.type.trim()) return "Type is required."
  if (!form.contact_info.phone.trim()) return "Phone number is required."
  if (!form.contact_info.email.trim()) return "Email is required."
  if (!form.bank_account_info.account_holder_name.trim()) return "Account holder name is required."
  if (!form.bank_account_info.bank_name.trim()) return "Bank name is required."
  if (!form.bank_account_info.account_number.trim()) return "Account number is required."
  return null
}

function validateStep2() {
  if (Number(form.dimensions.width_m) <= 0 || Number(form.dimensions.height_m) <= 0) {
    return "Venue dimensions must be greater than 0."
  }

  if (
    !form.use_designer &&
    (
      Number(form.manual_seat_counts.regular) < 0 ||
      Number(form.manual_seat_counts.special) < 0 ||
      Number(form.manual_seat_counts.vip) < 0
    )
  ) {
    return "Manual seat counts cannot be negative."
  }

  return null
}

function validateStep3() {
  if (form.use_designer && designedSeatCount.value === 0) {
    return "Add at least one seat, table, or switch to manual seat counts."
  }
  return null
}

function goNext() {
  let error = null
  if (step.value === 1) error = validateStep1()
  if (step.value === 2) error = validateStep2()
  if (step.value === 3) error = validateStep3()

  if (error) {
    notify(error, "error")
    return
  }

  step.value += 1
}

function buildRequestPayload() {
  const currentUser = get_Current_User()
  const serializedDesign = getSerializedDesign()

  const resolvedSeatClasses = Array.from(
    new Set(
      serializedDesign.seats
        .map(seat => String(seat?.seat_class ?? "Regular").trim() || "Regular")
        .filter(Boolean)
    )
  )

  const normalizedSeatClasses = resolvedSeatClasses.length
    ? resolvedSeatClasses
    : ["Regular"]

  const normalizedSeatLayout = {
    width: Number(form.dimensions.width_m || 20),
    height: Number(form.dimensions.height_m || 12),
    seats: serializedDesign.seats.map(seat => ({
      ...seat,
    })),
    screens: serializedDesign.screens.map(screen => ({
      ...screen,
      name: screen.name || screen.title || "Screen",
    })),
    audio_sources: serializedDesign.audio_sources.map(source => ({
      ...source,
      name: source.name || source.title || "Audio Source",
    })),
    stages: serializedDesign.stages.map(stage => ({
      ...stage,
      name: stage.name || stage.title || "Stage",
    })),
    elements: serializedDesign.elements.map(element => ({
      ...element,
    })),
    metadata: {
      shape: form.dimensions.shape,
      notes: serializedDesign.notes,
      mode: form.use_designer ? "designer" : "manual",
      total_seat_count: finalSeatCount.value,
      seat_classes: normalizedSeatClasses,
    },
  }

  return {
    id: createId(),
    created_by_user_id: currentUser?.id ?? null,
    created_at: new Date().toISOString(),
    status: "Pending",
    venue_data: {
      id: createId(),
      title: form.title,
      location: form.location,
      exact_address: form.exact_address,
      availability: form.availability,
      price_per_hour: Number(form.price_per_hour || 0),
      capacity: finalSeatCount.value,
      status: "Pending Approval",
      category: form.category,
      type: form.type,
      review_rating: Number(form.review_rating || 0),
      description: form.description,
      image: form.image || "",
      extra_images: [...form.extra_images],
      contact_info: {
        ...form.contact_info,
        address: form.exact_address,
      },
      featured: false,
      profile_picture: form.image || "",
      owner_user_id: currentUser?.id ?? null,
      bank_account_info: {
        ...form.bank_account_info,
      },
      seat_classes: normalizedSeatClasses,
      seat_layout: normalizedSeatLayout,
      price_per_day: Number(form.price_per_day || 0),
      submitted_at: new Date().toISOString(),
      use_designer: form.use_designer,
      manual_seat_count: finalSeatCount.value,
      manual_seat_counts: {
        regular: Number(form.manual_seat_counts.regular || 0),
        special: Number(form.manual_seat_counts.special || 0),
        vip: Number(form.manual_seat_counts.vip || 0),
      },
    },
    dimensions: {
      width_m: Number(form.dimensions.width_m || 20),
      height_m: Number(form.dimensions.height_m || 12),
      shape: form.dimensions.shape,
    },
    layout: {
      mode: form.use_designer ? "designer" : "manual",
      manual_seat_count: finalSeatCount.value,
      manual_seat_counts: {
        regular: Number(form.manual_seat_counts.regular || 0),
        special: Number(form.manual_seat_counts.special || 0),
        vip: Number(form.manual_seat_counts.vip || 0),
      },
      width: Number(form.dimensions.width_m || 20),
      height: Number(form.dimensions.height_m || 12),
      shape: form.dimensions.shape,
      seats: serializedDesign.seats,
      screens: serializedDesign.screens,
      audio_sources: serializedDesign.audio_sources,
      stages: serializedDesign.stages,
      elements: serializedDesign.elements,
      shapes: serializedDesign.shapes,
      notes: serializedDesign.notes,
      use_designer: form.use_designer,
      seat_classes: normalizedSeatClasses,
      total_seat_count: finalSeatCount.value,
    },
  }
}

function submitVenueRequest() {
  const step1Error = validateStep1()
  const step2Error = validateStep2()
  const step3Error = validateStep3()
  const firstError = step1Error || step2Error || step3Error

  if (firstError) {
    notify(firstError, "error")
    return
  }

  try {
    const currentUser = get_Current_User()
    const savedRequest = add_Venue_Request(buildRequestPayload())

    if (typeof create_Venue_Request_Submitted_Notifications === "function") {
      create_Venue_Request_Submitted_Notifications({
        creatorUserId: currentUser?.id ?? null,
        venueRequestId: savedRequest?.id ?? null,
        venueTitle:
          savedRequest?.venue_data?.title ||
          savedRequest?.title ||
          form.title ||
          "your venue",
      })
    }

    submitDialog.value = true
    notify("Request sent successfully.", "success")
  } catch (error) {
    console.error(error)
    notify(error?.message || "Something went wrong while sending the request.", "error")
  }
}

function closeSubmitDialog() {
  submitDialog.value = false
  resetForm()
  step.value = 1
}

function goHomeAfterSubmit() {
  submitDialog.value = false
  resetForm()
  step.value = 1
  router.push("/n_mainpage")
}

function resetForm() {
  form.title = ""
  form.location = ""
  form.exact_address = ""
  form.availability = true
  form.price_per_hour = 0
  form.price_per_day = 0
  form.capacity = 0
  form.status_label = "Pending Review"
  form.category = ""
  form.type = ""
  form.review_rating = 0
  form.description = ""
  form.image = ""
  form.extra_images = []
  form.contact_info = {
    address: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
  }
  form.bank_account_info = {
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    rib: "",
    iban: "",
    swift: "",
  }
  form.featured = false
  form.dimensions = {
    width_m: 20,
    height_m: 12,
    shape: "rectangle",
  }
  form.manual_seat_count = 0
  form.manual_seat_counts = {
    regular: 0,
    special: 0,
    vip: 0,
  }
  form.use_designer = true
  form.design = {
    seats: [],
    stages: [],
    screens: [],
    audio_sources: [],
    elements: [],
    notes: "",
  }
  clearSelection()
  paintMode.value = "Select"
  historyStack.value = []
  coverImageInput.value = null
  extraImagesInput.value = []
}

onMounted(() => {
  applySavedTheme()
  window.addEventListener("pointerdown", handleGlobalPointerDown)
  window.addEventListener("keydown", onGlobalKeyDown)
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", applySavedTheme)
  window.addEventListener("blassti-theme-updated", handleAppThemeSync)
})

function onGlobalKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault()
    undoLastAction()
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedItems.value.length) {
      event.preventDefault()
      removeSelected()
    }
  }

  if (event.key === "Escape") {
    clearSelection()
    closeContextMenu()
  }
}

onBeforeUnmount(() => {
  stopGlobalDrag()
  clearLongPressTimer()
  window.removeEventListener("pointerdown", handleGlobalPointerDown)
  window.removeEventListener("keydown", onGlobalKeyDown)
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", applySavedTheme)
  window.removeEventListener("blassti-theme-updated", handleAppThemeSync)
})
</script>

<style scoped>
.venue-page-shell {
  min-height: 100vh;
  padding-top: 12px;
  transition: background 0.35s ease, color 0.35s ease;
  --page-glow: rgba(58, 123, 213, 0.10);
  --page-bg-top: rgba(10, 12, 18, 0.98);
  --page-bg-bottom: rgba(12, 14, 22, 1);
  --main-card-bg: linear-gradient(180deg, rgba(18, 20, 29, 0.98), rgba(14, 16, 24, 0.98));
  --card-border: rgba(255, 255, 255, 0.07);
  --card-bg: rgba(255, 255, 255, 0.03);
  --card-bg-strong: rgba(255, 255, 255, 0.045);
  --text-main: rgba(255, 255, 255, 0.96);
  --text-muted: rgba(226, 232, 240, 0.72);
  --shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.34);
  --grid-line: rgba(255, 255, 255, 0.045);
  --canvas-top: rgba(19, 22, 31, 0.98);
  --canvas-bottom: rgba(12, 14, 20, 0.98);
  background:
    radial-gradient(circle at top center, var(--page-glow), transparent 30%),
    linear-gradient(180deg, var(--page-bg-top), var(--page-bg-bottom));
}

.venue-page-shell.browser-theme-light {
  --page-glow: rgba(25, 118, 210, 0.13);
  --page-bg-top: #f5f8ff;
  --page-bg-bottom: #eef4ff;
  --main-card-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 255, 0.98));
  --card-border: rgba(15, 23, 42, 0.08);
  --card-bg: rgba(255, 255, 255, 0.88);
  --card-bg-strong: rgba(255, 255, 255, 0.95);
  --text-main: #18212f;
  --text-muted: rgba(24, 33, 47, 0.7);
  --shadow-lg: 0 18px 45px rgba(63, 94, 131, 0.12);
  --grid-line: rgba(15, 23, 42, 0.06);
  --canvas-top: rgba(255, 255, 255, 0.96);
  --canvas-bottom: rgba(242, 247, 255, 0.96);
}

.venue-main-card {
  background: var(--main-card-bg) !important;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
}

.page-hero {
  padding: 4px 2px 10px;
}

.hero-copy {
  max-width: 760px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-main);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(99, 102, 241, 0.12));
  border: 1px solid rgba(25, 118, 210, 0.18);
  box-shadow: 0 10px 24px rgba(25, 118, 210, 0.08);
}

.hero-title {
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.hero-subtitle,
.section-caption,
.text-medium-emphasis,
.text-body-2.text-medium-emphasis,
.text-caption.text-medium-emphasis {
  color: var(--text-muted) !important;
}

.hero-chip-group {
  align-items: flex-start;
}

.hero-chip {
  backdrop-filter: blur(8px);
}

.hero-mini-stats :deep(.v-chip),
.hero-chip-group :deep(.v-chip) {
  font-weight: 700;
}

.clean-stepper {
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015)) !important;
  border: 1px solid var(--card-border);
  padding: 8px;
}

.clean-section-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.015),
    0 14px 36px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.clean-section-card:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.015),
    0 18px 42px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--text-main);
}

.section-caption {
  font-size: 0.92rem;
  line-height: 1.55;
}

.action-bar {
  padding-top: 4px;
  align-items: center;
}

.preview-box {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  background: var(--card-bg-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.preview-box:hover .preview-image,
.extra-image-card:hover .preview-image {
  transform: scale(1.02);
}

.preview-image.small {
  border-radius: 14px;
}

.extra-image-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: var(--card-bg-strong);
  border: 1px solid var(--card-border);
}

.remove-extra-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
}

.ratio-wrapper {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ratio-preview {
  border: 2px dashed rgba(212, 161, 55, 0.85);
  background: linear-gradient(135deg, rgba(212, 161, 55, 0.09), rgba(25, 118, 210, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.28s ease;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
}

.ratio-preview:hover {
  transform: translateY(-2px) scale(1.01);
}

.ratio-preview.shape-rectangle { border-radius: 20px; }
.ratio-preview.shape-rounded { border-radius: 40px; }
.ratio-preview.shape-trapezoid { clip-path: polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%); }
.ratio-preview.shape-arena { border-radius: 999px; }

.ratio-preview-label {
  font-weight: 800;
  opacity: 0.92;
  color: var(--text-main);
}

.designer-sidebar.sticky-panel {
  position: sticky;
  top: 20px;
}

.tool-grid {
  display: grid;
  gap: 10px;
}

.canvas-stage {
  width: 100%;
  display: flex;
  justify-content: center;
}

.designer-canvas {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    linear-gradient(180deg, var(--canvas-top), var(--canvas-bottom));
  background-size: 24px 24px, 24px 24px, auto;
  border: 1px solid var(--card-border);
  min-height: 420px;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.02),
    0 20px 40px rgba(0, 0, 0, 0.08);
}

.designer-canvas.shape-rectangle { border-radius: 28px; }
.designer-canvas.shape-rounded { border-radius: 52px; }
.designer-canvas.shape-trapezoid { clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%); border-radius: 0; }
.designer-canvas.shape-arena { border-radius: 999px; }

.screen-curve-label {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  color: #d4a137;
  font-weight: 800;
  font-size: 1.75rem;
  pointer-events: none;
  text-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
}

.screen-curve-label::before,
.screen-curve-label::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 140px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 161, 55, 0.65), transparent);
}

.screen-curve-label::before { right: calc(100% + 14px); }
.screen-curve-label::after { left: calc(100% + 14px); }

.canvas-item {
  position: absolute;
  user-select: none;
  transition: transform 0.16s ease, filter 0.16s ease;
}

.canvas-item:hover {
  transform: translateY(-1px);
}

.canvas-item.selected {
  filter: drop-shadow(0 0 0.45rem rgba(80, 170, 255, 0.9));
}

.seat-shape,
.block {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  padding: 6px;
  box-sizing: border-box;
  box-shadow: inset 0 -8px 18px rgba(0, 0, 0, 0.14);
}

.block {
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.16);
}

.resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid #1976d2;
  border-radius: 50%;
  z-index: 5;
  box-shadow: 0 6px 14px rgba(25, 118, 210, 0.22);
}

.resize-br {
  right: -7px;
  bottom: -7px;
  cursor: nwse-resize;
}

.selection-box {
  position: absolute;
  border: 1px dashed #42a5f5;
  background: rgba(66, 165, 245, 0.14);
  z-index: 3;
  border-radius: 12px;
}

.review-list :deep(.v-list-item) {
  border-radius: 16px;
  margin-bottom: 4px;
}

.venue-page-shell :deep(.v-field),
.venue-page-shell :deep(.v-selection-control),
.venue-page-shell :deep(.v-stepper-header) {
  color: var(--text-main);
}

.venue-page-shell :deep(.v-field) {
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.018);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.01);
}

.venue-page-shell.browser-theme-light :deep(.v-field) {
  background: rgba(255, 255, 255, 0.96);
}

.venue-page-shell :deep(.v-field__input),
.venue-page-shell :deep(.v-label),
.venue-page-shell :deep(.v-list-item-title),
.venue-page-shell :deep(.v-list-item-subtitle),
.venue-page-shell :deep(.v-stepper-item__title),
.venue-page-shell :deep(.v-stepper-item__subtitle) {
  color: var(--text-main) !important;
}

.venue-page-shell :deep(.v-list-item-subtitle),
.venue-page-shell :deep(.v-messages__message),
.venue-page-shell :deep(.v-stepper-item--disabled .v-stepper-item__title) {
  color: var(--text-muted) !important;
}

.venue-page-shell :deep(.v-divider) {
  border-color: var(--card-border);
}

.venue-page-shell :deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 700;
}

.venue-page-shell :deep(.v-btn:not(.v-btn--icon)) {
  box-shadow: none;
}

.venue-page-shell :deep(.v-btn:hover) {
  transform: translateY(-1px);
}

.venue-page-shell :deep(.v-chip) {
  border-radius: 999px;
}

@media (max-width: 960px) {
  .hero-chip-group {
    justify-content: flex-start;
  }

  .designer-sidebar.sticky-panel {
    position: static;
  }
}

.designer-canvas {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid var(--card-border);
  background:
    linear-gradient(180deg, var(--canvas-top), var(--canvas-bottom)),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    linear-gradient(180deg, var(--grid-line) 1px, transparent 1px);
  background-size: auto, 24px 24px, 24px 24px;
  min-height: 580px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), 0 16px 40px rgba(0,0,0,0.18);
}

.canvas-item {
  position: absolute;
  transition: transform 0.14s ease, box-shadow 0.18s ease, filter 0.18s ease;
  user-select: none;
}

.canvas-item:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.canvas-item.selected {
  z-index: 3;
}

.seat-shape {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px 12px 9px 9px;
  border: 2px solid rgba(255,255,255,0.22);
  box-shadow: 0 10px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18);
}

.seat-mini-label {
  position: absolute;
  left: 50%;
  top: calc(100% + 4px);
  transform: translateX(-50%);
  font-size: 10px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: white;
  white-space: nowrap;
  pointer-events: none;
}

.browser-theme-light .seat-mini-label {
  background: rgba(255,255,255,0.96);
  color: #18212f;
  border: 1px solid rgba(15,23,42,0.08);
}

.block {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-weight: 700;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 12px 24px rgba(0,0,0,0.18);
  text-align: center;
  padding: 10px;
}

.resize-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #1976d2;
  box-shadow: 0 6px 14px rgba(25,118,210,0.28);
}

.resize-br {
  right: -8px;
  bottom: -8px;
  cursor: nwse-resize;
}

.selection-box {
  position: absolute;
  border: 1px dashed #42a5f5;
  background: rgba(66,165,245,0.12);
  border-radius: 14px;
  z-index: 4;
}

.designer-context-menu {
  position: absolute;
  z-index: 10;
  width: 220px;
  border-radius: 18px;
  padding: 8px;
  border: 1px solid var(--card-border);
  background: rgba(10, 14, 22, 0.94);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgba(0,0,0,0.28);
}

.browser-theme-light .designer-context-menu {
  background: rgba(255,255,255,0.96);
}

.context-menu-btn {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease;
}

.context-menu-btn:hover {
  background: rgba(255,255,255,0.06);
  transform: translateX(2px);
}

.browser-theme-light .context-menu-btn:hover {
  background: rgba(15,23,42,0.05);
}

.context-menu-pop-enter-active,
.context-menu-pop-leave-active {
  transition: all 0.16s ease;
}

.context-menu-pop-enter-from,
.context-menu-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

.success-dialog-pop :deep(.v-overlay__content) {
  animation: successBounce 0.34s ease;
}

@keyframes successBounce {
  0% { transform: translateY(10px) scale(0.96); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}


.mobile-hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stepper-shell {
  margin-bottom: 8px;
}

.mobile-stepper-shell {
  border: 1px solid var(--card-border);
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
  border-radius: 24px;
  padding: 16px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}

.mobile-stepper-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.mobile-stepper-label {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.mobile-stepper-title {
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--text-main);
}

.mobile-stepper-progress {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
  margin-bottom: 14px;
}

.mobile-stepper-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(25,118,210,0.95), rgba(99,102,241,0.95));
  transition: width 0.24s ease;
}

.mobile-stepper-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.mobile-step-card {
  appearance: none;
  border: 1px solid var(--card-border);
  background: rgba(255,255,255,0.035);
  border-radius: 18px;
  padding: 12px 10px;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.mobile-step-card.active {
  border-color: rgba(25,118,210,0.42);
  background: linear-gradient(180deg, rgba(25,118,210,0.16), rgba(99,102,241,0.12));
  transform: translateY(-1px);
}

.mobile-step-card.done {
  background: rgba(76, 175, 80, 0.10);
}

.mobile-step-card-index {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.mobile-step-card-title {
  font-size: 0.88rem;
  font-weight: 700;
}

.media-upload-card,
.ratio-preview-card,
.mobile-designer-studio {
  overflow: hidden;
}

.mobile-tool-toggles {
  display: grid;
  gap: 12px;
}

.mobile-switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mobile-tool-panels :deep(.v-expansion-panel) {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid var(--card-border);
  border-radius: 18px !important;
  overflow: hidden;
}

.mobile-pill-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mobile-pill-grid.compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-bar-mobile {
  position: sticky;
  bottom: 12px;
  z-index: 6;
  padding: 12px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--main-card-bg) 78%, transparent);
  backdrop-filter: blur(14px);
  border: 1px solid var(--card-border);
  box-shadow: 0 18px 36px rgba(0,0,0,0.18);
}

@media (max-width: 960px) {
  .venue-page-shell {
    padding-top: 0;
  }

  .venue-builder-page {
    padding-left: 10px !important;
    padding-right: 10px !important;
    padding-top: 12px !important;
  }

  .venue-main-card {
    border-radius: 24px !important;
    padding: 16px !important;
  }

  .page-hero {
    position: relative;
    padding: 6px 2px 2px;
    gap: 16px !important;
  }

  .hero-copy,
  .hero-chip-group {
    width: 100%;
  }

  .hero-title {
    font-size: clamp(1.7rem, 6vw, 2.15rem) !important;
    line-height: 1.05;
  }

  .hero-subtitle {
    max-width: none;
    font-size: 0.95rem;
  }

  .hero-chip-group {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px !important;
  }

  .hero-chip-group :deep(.v-chip),
  .hero-mini-stats :deep(.v-chip) {
    justify-content: center;
  }

  .step-one-media-col {
    order: -1;
  }

  .step-two-preview-col {
    order: -1;
  }

  .ratio-wrapper {
    min-height: 170px;
  }

  .clean-section-card {
    border-radius: 22px !important;
  }

  .clean-section-card:hover {
    transform: none;
  }

  .tool-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .designer-canvas {
    min-height: 420px;
    border-radius: 24px;
  }

  .screen-curve-label {
    font-size: 1.18rem;
    bottom: 10px;
  }

  .screen-curve-label::before,
  .screen-curve-label::after {
    width: 56px;
  }

  .action-bar {
    align-items: stretch;
  }

  .action-bar > .v-btn,
  .action-bar > div {
    width: 100%;
  }

  .action-bar > div {
    display: grid !important;
    grid-template-columns: 1fr;
  }

  .action-bar :deep(.v-btn) {
    min-height: 48px;
  }

  .review-list :deep(.v-list-item) {
    padding-left: 0;
    padding-right: 0;
  }
}

@media (min-width: 600px) and (max-width: 960px) {
  .hero-chip-group {
    grid-template-columns: repeat(2, max-content);
  }

  .mobile-pill-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .designer-canvas {
    min-height: 500px;
  }
}

@media (max-width: 599px) {
  .mobile-stepper-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-mini-stats,
  .hero-chip-group {
    gap: 8px !important;
  }

  .hero-chip-group {
    grid-template-columns: 1fr;
  }

  .mobile-switch-grid,
  .mobile-pill-grid {
    grid-template-columns: 1fr;
  }

  .preview-box {
    aspect-ratio: 4 / 3;
    border-radius: 20px;
  }

  .designer-canvas {
    min-height: 360px;
  }

  .designer-context-menu {
    width: min(220px, calc(100vw - 36px));
  }
}

</style>
