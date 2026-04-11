<template>
  <v-app :theme="browserVuetifyTheme">
    <AppNavbar />

    <v-main class="seat-selection-page" :class="browserThemeClass">
      <v-container fluid class="py-6 py-md-8 px-3 px-sm-4 px-md-6 page-shell">
        <v-row v-if="event && venue" class="ga-0 align-stretch">
          <!-- LEFT PANEL -->
          <v-col cols="12" lg="4" xl="3" class="pr-lg-4 mb-4 mb-lg-0 panel-column panel-column-left">
            <v-card rounded="xl" class="glass-card sidebar-card elevated-card">
              <v-card-text class="pa-5 pa-md-6">
                <div class="d-flex align-start justify-space-between mb-4">
                  <div>
                    <div class="text-h5 font-weight-bold text-white">
                      Select your seats
                    </div>
                    <div class="text-medium-emphasis">
                      {{ event.title }}
                    </div>
                  </div>

                  <v-chip
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-map-marker"
                  >
                    {{ event.city }}
                  </v-chip>
                </div>

                <v-sheet class="info-panel pa-4 rounded-xl mb-4 elevated-panel">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="text-subtitle-1 font-weight-bold">
                      Event info
                    </div>
                    <v-chip size="small" color="success" variant="tonal">
                      {{ event.time }} - {{ event.end_time || "Open end" }}
                    </v-chip>
                  </div>

                  <div class="text-body-2 text-medium-emphasis mb-1">
                    <v-icon size="16" class="mr-1">mdi-calendar-month-outline</v-icon>
                    {{ event.date }}
                  </div>

                  <div class="text-body-2 text-medium-emphasis mb-1">
                    <v-icon size="16" class="mr-1">mdi-map-marker-outline</v-icon>
                    {{ event.venue }}
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    <v-icon size="16" class="mr-1">mdi-account-group-outline</v-icon>
                    {{ accurateRemainingSeats }} seats left
                  </div>
                </v-sheet>

                <v-sheet class="info-panel pa-4 rounded-xl mb-4 elevated-panel">
                  <div class="text-subtitle-1 font-weight-bold mb-3">
                    Seat prices
                  </div>

                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="priceItem in priceLegend"
                      :key="priceItem.name"
                      :color="getClassColor(priceItem.name)"
                      variant="tonal"
                    >
                      {{ priceItem.name }} · {{ formatPrice(priceItem.price) }}
                    </v-chip>
                  </div>
                </v-sheet>

                <v-sheet class="info-panel pa-4 rounded-xl mb-4 elevated-panel">
                  <div class="text-subtitle-1 font-weight-bold mb-3">
                    {{ hasManualSeatLayout ? "Selected seats" : "Choose tickets" }}
                  </div>

                  <template v-if="hasManualSeatLayout">
                    <div v-if="selectedSeatsDetailed.length" class="selected-seat-list">
                      <div
                        v-for="seat in selectedSeatsDetailed"
                        :key="seat.key"
                        class="selected-seat-item"
                      >
                        <div>
                          <div class="font-weight-medium text-white">
                            {{ seat.label }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ seat.seat_class }}
                          </div>
                        </div>

                        <div class="d-flex align-center ga-2">
                          <div class="text-body-2 font-weight-bold text-white">
                            {{ formatPrice(seat.price) }}
                          </div>

                          <v-btn
                            icon
                            size="x-small"
                            variant="text"
                            color="error"
                            @click="toggleSeat(seat)"
                          >
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else
                      class="text-body-2 text-medium-emphasis"
                    >
                      Pick one or more seats from the venue layout.
                    </div>
                  </template>

                  <template v-else>
                    <div class="d-flex flex-column ga-3">
                      <div
                        v-for="seatClass in fallbackSeatClassOptions"
                        :key="seatClass.name"
                        class="fallback-class-row"
                      >
                        <div>
                          <div class="font-weight-medium text-white">
                            {{ seatClass.name }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ formatPrice(seatClass.price) }} ·
                            {{ seatClass.remaining }} left
                          </div>
                        </div>

                        <div class="d-flex align-center ga-2">
                          <v-btn
                            icon
                            size="small"
                            variant="outlined"
                            :disabled="fallbackSelection[seatClass.name] <= 0"
                            @click="changeFallbackQty(seatClass.name, -1)"
                          >
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>

                          <div class="qty-pill">
                            {{ fallbackSelection[seatClass.name] || 0 }}
                          </div>

                          <v-btn
                            icon
                            size="small"
                            variant="outlined"
                            :disabled="(fallbackSelection[seatClass.name] || 0) >= seatClass.remaining"
                            @click="changeFallbackQty(seatClass.name, 1)"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </template>
                </v-sheet>

                <v-sheet class="info-panel pa-4 rounded-xl mb-4 elevated-panel">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="text-subtitle-1 font-weight-bold">
                      Payment summary
                    </div>
                  </div>

                  <div class="summary-row">
                    <span class="text-body-2 text-medium-emphasis">Tickets</span>
                    <span class="text-body-2 text-white font-weight-medium">
                      {{ totalTickets }} ticket<span v-if="totalTickets !== 1">s</span>
                    </span>
                  </div>

                  <div class="summary-row">
                    <span class="text-body-2 text-medium-emphasis">Subtotal</span>
                    <span class="text-body-2 text-white font-weight-medium">
                      {{ formatPrice(totalPrice) }}
                    </span>
                  </div>

                  <div class="summary-row">
                    <span class="text-body-2 text-medium-emphasis">Blassti fee (2%)</span>
                    <span class="text-body-2 text-white font-weight-medium">
                      {{ formatPrice(blasstiFee) }}
                    </span>
                  </div>

                  <v-divider class="my-3 divider-soft" />

                  <div class="d-flex align-center justify-space-between mb-4">
                    <div class="text-subtitle-1 font-weight-bold">
                      Total
                    </div>
                    <div class="text-h6 font-weight-bold text-white">
                      {{ formatPrice(finalTotal) }}
                    </div>
                  </div>

                  <v-btn
                    block
                    size="large"
                    color="primary"
                    rounded="lg"
                    class="primary-cta-btn"
                    prepend-icon="mdi-credit-card-outline"
                    :disabled="!canProceedToPayment"
                    @click="openPaymentDialog"
                  >
                    Proceed to payment
                  </v-btn>

                  <v-btn
                    block
                    size="large"
                    variant="text"
                    class="mt-2 contextual-nav-btn"
                    prepend-icon="mdi-arrow-left"
                    @click="goBack"
                    @contextmenu.prevent="showRouteContextMenu($event, getBackNavigationTarget(), 'Back')"
                    @touchstart.passive="startRouteLongPress($event, getBackNavigationTarget(), 'Back')"
                    @touchend="clearRouteLongPress"
                    @touchcancel="clearRouteLongPress"
                  >
                    Back
                  </v-btn>
                  <div class="text-caption text-medium-emphasis mt-2">
                    {{ isMobile ? 'Long press navigation buttons to open more options.' : 'Right-click navigation buttons to open them in a new tab or window.' }}
                  </div>
                </v-sheet>

                <v-alert
                  v-if="!currentUser"
                  type="warning"
                  variant="tonal"
                  rounded="lg"
                  border="start"
                >
                  Please log in first to buy tickets.
                  <template #append>
                    <v-btn
                      variant="text"
                      color="warning"
                      class="contextual-nav-btn"
                      @click="router.push('/O_login')"
                      @contextmenu.prevent="showRouteContextMenu($event, '/O_login', 'Login')"
                      @touchstart.passive="startRouteLongPress($event, '/O_login', 'Login')"
                      @touchend="clearRouteLongPress"
                      @touchcancel="clearRouteLongPress"
                    >
                      Login
                    </v-btn>
                  </template>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- RIGHT PANEL -->
          <v-col cols="12" lg="8" xl="9" class="panel-column panel-column-right">
            <v-card rounded="xl" class="glass-card canvas-card elevated-card">
              <v-card-text class="pa-4 pa-md-5">
                <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-4 ga-3">
                  <div>
                    <div class="text-h5 font-weight-bold text-white">
                      Venue layout
                    </div>
                    <div class="text-medium-emphasis">
                      {{ venue.title }}
                    </div>
                  </div>

                  <div class="d-flex flex-wrap ga-2 align-center">
                    <v-chip variant="tonal" color="success">
                      Available
                    </v-chip>
                    <v-chip variant="tonal" color="warning">
                      Selected
                    </v-chip>
                    <v-chip variant="tonal" color="default">
                      Reserved
                    </v-chip>
                    <v-chip variant="outlined" color="primary" prepend-icon="mdi-cursor-default-click-outline">
                      Tap or click seats
                    </v-chip>
                  </div>
                </div>

                <v-sheet
                  v-if="hasManualSeatLayout"
                  class="canvas-toolbar mb-4 pa-3 rounded-xl"
                >
                  <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3">
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-seat-outline">
                        {{ manualSeatLayout.length }} seats on map
                      </v-chip>
                      <v-chip size="small" variant="tonal" color="warning" prepend-icon="mdi-check-circle-outline">
                        {{ selectedSeatsDetailed.length }} selected
                      </v-chip>
                      <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-ticket-confirmation-outline">
                        {{ accurateRemainingSeats }} still available
                      </v-chip>
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      {{ isMobile ? 'Tap to select seats, long press a seat for quick details, long press navigation buttons for more options.' : 'Hover for a cleaner seat read, click to select, right-click supported on navigation buttons.' }}
                    </div>
                  </div>
                </v-sheet>

                <div v-if="hasManualSeatLayout" class="venue-canvas-wrapper">
                  <div class="venue-canvas-grid">
                    <div
                      v-for="asset in layoutAssets.screens"
                      :key="asset.id"
                      class="layout-asset layout-screen"
                      :style="getAssetStyle(asset)"
                    >
                      <v-icon size="18" class="mr-1">mdi-projector-screen</v-icon>
                      <span>{{ asset.name || 'Screen' }}</span>
                    </div>

                    <div
                      v-for="asset in layoutAssets.stages"
                      :key="asset.id"
                      class="layout-asset layout-stage"
                      :style="getAssetStyle(asset)"
                    >
                      <v-icon size="18" class="mr-1">mdi-theater</v-icon>
                      <span>{{ asset.name || 'Stage' }}</span>
                    </div>

                    <div
                      v-for="asset in layoutAssets.audioSources"
                      :key="asset.id"
                      class="layout-asset layout-audio"
                      :style="getAssetStyle(asset)"
                    >
                      <v-icon size="16" class="mr-1">mdi-speaker-wireless</v-icon>
                      <span>{{ asset.name || 'Audio' }}</span>
                    </div>

                    <button
                      v-for="seat in manualSeatLayout"
                      :key="seat.key"
                      class="canvas-seat"
                      :class="[
                        `seat-class-${normalizeSeatClassName(seat.seat_class)}`,
                        {
                          reserved: isSeatReserved(seat),
                          selected: isSeatSelected(seat),
                          hovered: hoveredSeatKey === seat.key,
                        }
                      ]"
                      :style="getSeatStyle(seat)"
                      :disabled="isSeatReserved(seat)"
                      :title="buildSeatAriaLabel(seat)"
                      @click="handleSeatClick(seat)"
                      @mouseenter="setHoveredSeat(seat)"
                      @mouseleave="clearHoveredSeat"
                      @focus="setHoveredSeat(seat)"
                      @blur="clearHoveredSeat"
                      @touchstart.passive="handleSeatTouchStart($event, seat)"
                      @touchmove.passive="handleSeatTouchMove($event)"
                      @touchend="handleSeatTouchEnd"
                      @touchcancel="handleSeatTouchCancel"
                    >
                      <div class="seat-shell">
                        <div class="seat-icon-wrap">
                          <v-icon size="18">mdi-seat</v-icon>
                        </div>
                        <span class="seat-label">
                          {{ compactSeatLabel(seat) }}
                        </span>
                      </div>
                    </button>

                    <transition name="seat-hover-card">
                      <div
                        v-if="hoveredSeatDetails"
                        class="seat-hover-card"
                        :style="getSeatHoverCardStyle(hoveredSeatDetails)"
                      >
                        <div class="d-flex align-center justify-space-between ga-2 mb-1">
                          <div class="text-body-2 font-weight-bold text-white">
                            {{ hoveredSeatDetails.seat_number || hoveredSeatDetails.label }}
                          </div>
                          <v-chip
                            size="x-small"
                            :color="getClassColor(hoveredSeatDetails.seat_class)"
                            variant="tonal"
                          >
                            {{ hoveredSeatDetails.seat_class }}
                          </v-chip>
                        </div>

                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ isSeatReserved(hoveredSeatDetails) ? 'Already reserved' : isSeatSelected(hoveredSeatDetails) ? 'Currently selected' : 'Available now' }}
                        </div>

                        <div class="text-body-2 font-weight-bold text-white">
                          {{ formatPrice(hoveredSeatDetails.price) }}
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>

                <div v-else class="fallback-selector pa-4 pa-md-6">
                  <div class="text-subtitle-1 font-weight-bold text-white mb-2">
                    This venue uses class-based ticketing
                  </div>
                  <div class="text-body-2 text-medium-emphasis mb-5">
                    No exact seat map is available for this venue, so buyers can select ticket quantity by class.
                  </div>

                  <v-row>
                    <v-col
                      v-for="seatClass in fallbackSeatClassOptions"
                      :key="seatClass.name"
                      cols="12"
                      md="6"
                      xl="4"
                    >
                      <v-card rounded="xl" class="fallback-class-card elevated-panel">
                        <v-card-text>
                          <div class="d-flex align-center justify-space-between mb-3">
                            <div>
                              <div class="text-h6 font-weight-bold text-white">
                                {{ seatClass.name }}
                              </div>
                              <div class="text-caption text-medium-emphasis">
                                {{ seatClass.remaining }} seats left
                              </div>
                            </div>

                            <v-chip
                              :color="getClassColor(seatClass.name)"
                              variant="tonal"
                            >
                              {{ formatPrice(seatClass.price) }}
                            </v-chip>
                          </div>

                          <div class="d-flex align-center justify-space-between">
                            <v-btn
                              icon
                              variant="outlined"
                              :disabled="fallbackSelection[seatClass.name] <= 0"
                              @click="changeFallbackQty(seatClass.name, -1)"
                            >
                              <v-icon>mdi-minus</v-icon>
                            </v-btn>

                            <div class="fallback-qty-display">
                              {{ fallbackSelection[seatClass.name] || 0 }}
                            </div>

                            <v-btn
                              icon
                              variant="outlined"
                              :disabled="(fallbackSelection[seatClass.name] || 0) >= seatClass.remaining"
                              @click="changeFallbackQty(seatClass.name, 1)"
                            >
                              <v-icon>mdi-plus</v-icon>
                            </v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card rounded="xl" class="glass-card">
              <v-card-text class="pa-8 text-center">
                <v-icon size="56" class="mb-4 text-medium-emphasis">
                  mdi-ticket-off-outline
                </v-icon>
                <div class="text-h5 font-weight-bold mb-2 text-white">
                  Event not found
                </div>
                <div class="text-body-1 text-medium-emphasis mb-5">
                  We could not find the event or its venue.
                </div>
                <v-btn
                  color="primary"
                  rounded="lg"
                  class="contextual-nav-btn"
                  prepend-icon="mdi-home-outline"
                  @click="router.push('/n_mainpage')"
                  @contextmenu.prevent="showRouteContextMenu($event, '/n_mainpage', 'Go home')"
                  @touchstart.passive="startRouteLongPress($event, '/n_mainpage', 'Go home')"
                  @touchend="clearRouteLongPress"
                  @touchcancel="clearRouteLongPress"
                >
                  Go home
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>


      <v-menu
        v-model="routeContextMenu.show"
        :target="[routeContextMenu.x, routeContextMenu.y]"
        location="bottom start"
        origin="top left"
        :close-on-content-click="true"
      >
        <v-card rounded="xl" class="route-context-menu-card">
          <v-list density="comfortable" class="py-2 route-context-menu-list">
            <v-list-subheader class="text-uppercase">
              {{ routeContextMenu.label || "Navigation" }}
            </v-list-subheader>

            <v-list-item
              prepend-icon="mdi-open-in-new"
              title="Open in new tab"
              @click="openRouteInNewTab(routeContextMenu.path)"
            />

            <v-list-item
              prepend-icon="mdi-monitor-share"
              title="Open in new window"
              @click="openRouteInNewWindow(routeContextMenu.path)"
            />

            <v-list-item
              prepend-icon="mdi-arrow-right-circle-outline"
              title="Go now"
              @click="navigateToPath(routeContextMenu.path)"
            />
          </v-list>
        </v-card>
      </v-menu>

      <!-- PAYMENT DIALOG -->
      <v-dialog v-model="paymentDialog" max-width="620" :content-class="`theme-dialog ${browserThemeClass}`">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
            <span class="text-h6 font-weight-bold">Card payment</span>
            <v-btn icon variant="text" @click="paymentDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-5">
            <v-alert
              v-if="paymentError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mb-4"
            >
              {{ paymentError }}
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="paymentForm.cardType"
                  label="Card type"
                  :items="['Visa', 'Mastercard', 'American Express']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="paymentForm.cardHolder"
                  label="Card holder name"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="paymentForm.cardNumber"
                  label="Card number"
                  variant="outlined"
                  density="comfortable"
                  maxlength="19"
                  @update:model-value="formatCardNumber"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="paymentForm.expiry"
                  label="Expiry (MM/YY)"
                  variant="outlined"
                  density="comfortable"
                  maxlength="5"
                  @update:model-value="formatExpiry"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="paymentForm.cvv"
                  label="CVV"
                  variant="outlined"
                  density="comfortable"
                  maxlength="4"
                  type="password"
                />
              </v-col>
            </v-row>

            <v-sheet class="payment-summary pa-4 rounded-xl mt-2">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2">Tickets</span>
                <span class="font-weight-bold">{{ totalTickets }}</span>
              </div>

              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2">Subtotal</span>
                <span class="font-weight-bold">{{ formatPrice(totalPrice) }}</span>
              </div>

              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2">Blassti fee (2%)</span>
                <span class="font-weight-bold">{{ formatPrice(blasstiFee) }}</span>
              </div>

              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2">Total</span>
                <span class="text-h6 font-weight-bold">{{ formatPrice(finalTotal) }}</span>
              </div>
            </v-sheet>
          </v-card-text>

          <v-card-actions class="px-5 pb-5">
            <v-spacer />
            <v-btn variant="text" @click="paymentDialog = false">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              rounded="lg"
              :loading="isPaying"
              @click="confirmPayment"
            >
              Pay now
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- SUCCESS DIALOG -->
      <v-dialog v-model="successDialog" max-width="520" :content-class="`theme-dialog ${browserThemeClass}`">
        <v-card rounded="xl" class="success-dialog-card">
          <v-card-text class="pa-7 text-center">
            <v-avatar size="72" color="success" variant="tonal" class="mb-4 success-pulse-avatar">
              <v-icon size="38">mdi-check-bold</v-icon>
            </v-avatar>

            <div class="text-h5 font-weight-bold mb-2">
              Payment successful
            </div>

            <div class="text-body-1 text-medium-emphasis mb-2">
              Your ticket has been saved successfully. The seat is now reserved and will appear in your bookings.
            </div>

            <div class="text-body-2 text-medium-emphasis mb-5">
              You paid <strong>{{ formatPrice(finalTotal) }}</strong>
              including a Blassti fee of <strong>{{ formatPrice(blasstiFee) }}</strong>.
            </div>

            <div class="d-flex flex-column flex-sm-row ga-3 justify-center">
              <v-btn
                color="primary"
                rounded="lg"
                class="contextual-nav-btn"
                prepend-icon="mdi-ticket-confirmation-outline"
                @click="goToBookings"
                @contextmenu.prevent="showRouteContextMenu($event, '/K_mybookings', 'My bookings')"
                @touchstart.passive="startRouteLongPress($event, '/K_mybookings', 'My bookings')"
                @touchend="clearRouteLongPress"
                @touchcancel="clearRouteLongPress"
              >
                My bookings
              </v-btn>
              <v-btn
                variant="outlined"
                rounded="lg"
                class="contextual-nav-btn"
                prepend-icon="mdi-home-outline"
                @click="goHome"
                @contextmenu.prevent="showRouteContextMenu($event, '/n_mainpage', 'Home')"
                @touchstart.passive="startRouteLongPress($event, '/n_mainpage', 'Home')"
                @touchend="clearRouteLongPress"
                @touchcancel="clearRouteLongPress"
              >
                Home
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import AppNavbar from "@/components/AppNavbar.vue"
import { useDisplay, useTheme } from "vuetify"
import { get_Current_User } from "@/dataModel/user"
import { get_Event_By_Id } from "@/dataModel/event"
import { get_Venue_By_Id } from "@/dataModel/venue"
import { get_Seat_Classes_By_Event_Id } from "@/dataModel/seat_class"
import {
  create_Event_Ticket_Reservation,
  get_Reserved_Seat_Counts_By_Event_Id,
  get_Reserved_Seat_Keys_By_Event_Id,
} from "@/dataModel/reservation"

const BLASSTI_FEE_RATE = 0.02
const BLASSTI_FEE_STORAGE_KEY = "blassti_fee_records"
const BLASSTI_PAYMENT_STORAGE_KEY = "blassti_payment_records"

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const display = useDisplay()
const THEME_STORAGE_KEY = "blassti-theme"
const browserPrefersDark = ref(true)
const liveThemeName = computed(() => {
  return theme?.global?.name?.value === "light" ? "light" : "dark"
})
const seatLongPressTimer = ref(null)
const routeLongPressTimer = ref(null)
const suppressSeatClickKey = ref("")
const routeContextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  path: "",
  label: "",
})

const browserVuetifyTheme = computed(() => liveThemeName.value)
const browserThemeClass = computed(() =>
  liveThemeName.value === "dark" ? "browser-theme-dark" : "browser-theme-light"
)


const eventId = computed(() => String(route.query.id || route.params.id || "").trim())
const event = computed(() => get_Event_By_Id(eventId.value))
const venue = computed(() => {
  if (!event.value?.venue_id) return null
  return get_Venue_By_Id(event.value.venue_id)
})
const currentUser = computed(() => get_Current_User())

const paymentDialog = ref(false)
const successDialog = ref(false)
const isPaying = ref(false)
const paymentError = ref("")
const selectedSeatKeys = ref([])
const hoveredSeatKey = ref("")
const hoveredSeatPointer = ref({ x: 0, y: 0 })
const paymentForm = reactive({
  cardType: "Visa",
  cardHolder: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
})

const fallbackSelection = reactive({})

const isMobile = computed(() => display.mdAndDown.value)

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  browserPrefersDark.value = normalizedTheme === "dark"

  if (theme?.global?.name) {
    theme.global.name.value = normalizedTheme
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function handleStoredThemeChange() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === "light" || savedTheme === "dark") {
    applyThemeChoice(savedTheme)
  }
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    handleStoredThemeChange()
  }
}

function handleThemeBroadcast(event) {
  const nextTheme = event?.detail?.theme
  if (nextTheme === "light" || nextTheme === "dark") {
    applyThemeChoice(nextTheme)
    return
  }

  handleStoredThemeChange()
}

watch(
  () => theme?.global?.name?.value,
  (newTheme) => {
    const normalizedTheme = newTheme === "light" ? "light" : "dark"
    browserPrefersDark.value = normalizedTheme === "dark"

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-app-theme", normalizedTheme)
      document.documentElement.style.colorScheme = normalizedTheme
    }
  },
  { immediate: true }
)

function showRouteContextMenu(event, path, label = "Navigation") {
  routeContextMenu.x = event.clientX
  routeContextMenu.y = event.clientY
  routeContextMenu.path = path || "/n_mainpage"
  routeContextMenu.label = label
  routeContextMenu.show = false

  requestAnimationFrame(() => {
    routeContextMenu.show = true
  })
}

function closeRouteContextMenu() {
  routeContextMenu.show = false
}

function resolveNavigationTarget(path) {
  return router.resolve(path || "/n_mainpage").href
}

function navigateToPath(path) {
  closeRouteContextMenu()
  router.push(path || "/n_mainpage")
}

function openRouteInNewTab(path) {
  const href = resolveNavigationTarget(path)
  closeRouteContextMenu()
  window.open(href, "_blank", "noopener,noreferrer")
}

function openRouteInNewWindow(path) {
  const href = resolveNavigationTarget(path)
  closeRouteContextMenu()
  window.open(href, "_blank", "noopener,noreferrer,width=1280,height=900")
}

function clearRouteLongPress() {
  if (routeLongPressTimer.value) {
    window.clearTimeout(routeLongPressTimer.value)
    routeLongPressTimer.value = null
  }
}

function startRouteLongPress(event, path, label = "Navigation") {
  if (!isMobile.value) return

  const touch = event?.touches?.[0] || event?.changedTouches?.[0]
  if (!touch) return

  const point = {
    x: touch.clientX,
    y: touch.clientY,
  }

  clearRouteLongPress()
  routeLongPressTimer.value = window.setTimeout(() => {
    showRouteContextMenu(
      { clientX: point.x, clientY: point.y },
      path,
      label
    )
  }, 520)
}

function clearSeatLongPress() {
  if (seatLongPressTimer.value) {
    window.clearTimeout(seatLongPressTimer.value)
    seatLongPressTimer.value = null
  }
}

function handleSeatClick(seat) {
  if (suppressSeatClickKey.value && suppressSeatClickKey.value === seat?.key) {
    suppressSeatClickKey.value = ""
    return
  }

  toggleSeat(seat)
}

function handleSeatTouchStart(event, seat) {
  if (!isMobile.value || isSeatReserved(seat)) return

  const touch = event?.touches?.[0] || event?.changedTouches?.[0]
  const point = touch
    ? { x: touch.clientX, y: touch.clientY }
    : null

  clearSeatLongPress()
  seatLongPressTimer.value = window.setTimeout(() => {
    suppressSeatClickKey.value = seat?.key || ""
    setHoveredSeat(seat, point)
  }, 450)
}

function handleSeatTouchMove(event) {
  if (!isMobile.value) return

  const touch = event?.touches?.[0] || event?.changedTouches?.[0]
  if (touch) {
    hoveredSeatPointer.value = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }
}

function handleSeatTouchEnd() {
  clearSeatLongPress()
}

function handleSeatTouchCancel() {
  clearSeatLongPress()
  if (isMobile.value) {
    window.setTimeout(() => {
      clearHoveredSeat()
      suppressSeatClickKey.value = ""
    }, 700)
  }
}

function getBackNavigationTarget() {
  const fallbackPath =
    String(route.query.from || route.query.returnTo || "").trim() || "/n_mainpage"

  if (window.history.length > 1) {
    return fallbackPath
  }

  return fallbackPath
}

onMounted(() => {
  loadSavedTheme()
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", handleStoredThemeChange)
  window.addEventListener("blassti-theme-change", handleThemeBroadcast)
  window.addEventListener("click", closeRouteContextMenu)
  window.addEventListener("blur", closeRouteContextMenu)
  window.addEventListener("scroll", closeRouteContextMenu, true)
})

onBeforeUnmount(() => {
  clearSeatLongPress()
  clearRouteLongPress()
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", handleStoredThemeChange)
  window.removeEventListener("blassti-theme-change", handleThemeBroadcast)
  window.removeEventListener("click", closeRouteContextMenu)
  window.removeEventListener("blur", closeRouteContextMenu)
  window.removeEventListener("scroll", closeRouteContextMenu, true)
})

function loadRawVenueById(venueId) {
  if (!venueId) return null

  try {
    const savedVenues = JSON.parse(localStorage.getItem("venues_v5") || "[]")
    return savedVenues.find(item => item.id === venueId) || null
  } catch (error) {
    console.error("Failed to load raw venue from localStorage.", error)
    return null
  }
}

const rawVenue = computed(() => {
  if (!event.value?.venue_id) return null
  return loadRawVenueById(event.value.venue_id) || venue.value
})

function numeric(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function normalizeSeatClassName(value) {
  return String(value || "regular")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
}

function getEventPrivateMeta() {
  if (!event.value?.id) return null

  try {
    const allMeta = JSON.parse(localStorage.getItem("blassti_event_private_meta_v3") || "{}")
    return Object.values(allMeta).find(item => item?.event_id === event.value.id) || null
  } catch (error) {
    console.error("Failed to load private event meta.", error)
    return null
  }
}

function defaultClassPrice(name) {
  const normalized = String(name || "").trim().toLowerCase()
  const privateMeta = getEventPrivateMeta()
  const ticketPrices = privateMeta?.ticket_prices || {}

  if (normalized.includes("vip")) {
    return numeric(ticketPrices.vip, 75) || 75
  }

  if (normalized.includes("special")) {
    return numeric(ticketPrices.special, 75) || 75
  }

  return numeric(ticketPrices.regular, 40) || 40
}

function normalizeCanvasSeat(seat, index) {
  const row = String(seat?.row ?? seat?.seat_row ?? "").trim()
  const explicitSeatNumber = String(seat?.seat_number ?? "").trim()
  const derivedNumber = explicitSeatNumber && row && explicitSeatNumber.startsWith(row)
    ? explicitSeatNumber.slice(row.length)
    : explicitSeatNumber

  const number = String(
    seat?.number ??
    derivedNumber ??
    seat?.seatNo ??
    `${index + 1}`
  ).trim()

  const seatClass = seat?.seat_class ?? seat?.class ?? seat?.seatType ?? "Regular"
  const rawPrice = Number(seat?.price)

  const safePrice =
    Number.isFinite(rawPrice) && rawPrice > 0
      ? rawPrice
      : defaultClassPrice(seatClass)

  const seatNumber =
    explicitSeatNumber ||
    [row, number].filter(Boolean).join("")

  const label =
    seat?.label ||
    seatNumber ||
    `${seatClass} ${index + 1}`

  return {
    id: seat?.id ?? `venue-seat-${index + 1}`,
    key:
      seat?.key ??
      seat?.location_key ??
      `${seat?.id ?? "seat"}-${row || "row"}-${number || index + 1}`,
    label,
    row,
    number,
    seat_number: seatNumber,
    location_key: seat?.location_key ?? [row, number].filter(Boolean).join("-"),
    seat_class: seatClass,
    price: safePrice,
    x: numeric(seat?.x, 0),
    y: numeric(seat?.y, 0),
    width: Math.max(1.05, numeric(seat?.width, 1.2)),
    height: Math.max(1.05, numeric(seat?.height, 1.2)),
    rotation: numeric(seat?.rotation, 0),
  }
}

function normalizeAsset(asset, index, fallbackName) {
  return {
    id: asset?.id ?? `${fallbackName}-${index + 1}`,
    name: asset?.name ?? fallbackName,
    x: numeric(asset?.x, 0),
    y: numeric(asset?.y, 0),
    width: Math.max(1.2, numeric(asset?.width, fallbackName === "Screen" ? 6 : 3)),
    height: Math.max(0.8, numeric(asset?.height, fallbackName === "Screen" ? 1.4 : 1.4)),
    rotation: numeric(asset?.rotation, 0),
  }
}

function getRawSeatArrays(raw) {
  const arrays = [
    event.value?.seat_layout?.seats,
    raw?.seat_layout?.seats,
    raw?.design_layout?.seats,
    raw?.layout?.seats,
    raw?.manual_seat_map,
    raw?.seat_map,
    raw?.seats,
    Array.isArray(raw?.canvas_items) ? raw.canvas_items.filter(item => item?.type === "seat" || item?.itemType === "seat") : [],
    Array.isArray(raw?.elements) ? raw.elements.filter(item => item?.type === "seat" || item?.itemType === "seat") : [],
  ]

  return arrays.find(arr => Array.isArray(arr) && arr.length) || []
}

function getRawAssetArrays(raw, kind) {
  const map = {
    screens: [
      event.value?.seat_layout?.screens,
      raw?.seat_layout?.screens,
      raw?.design_layout?.screens,
      raw?.layout?.screens,
      raw?.screens,
      Array.isArray(raw?.canvas_items) ? raw.canvas_items.filter(item => item?.type === "screen" || item?.itemType === "screen") : [],
      Array.isArray(raw?.elements) ? raw.elements.filter(item => item?.type === "screen" || item?.itemType === "screen") : [],
    ],
    stages: [
      event.value?.seat_layout?.stages,
      raw?.seat_layout?.stages,
      raw?.design_layout?.stages,
      raw?.layout?.stages,
      raw?.stages,
      Array.isArray(raw?.canvas_items) ? raw.canvas_items.filter(item => item?.type === "stage" || item?.itemType === "stage") : [],
      Array.isArray(raw?.elements) ? raw.elements.filter(item => item?.type === "stage" || item?.itemType === "stage") : [],
    ],
    audioSources: [
      event.value?.seat_layout?.audio_sources,
      raw?.seat_layout?.audio_sources,
      raw?.design_layout?.audio_sources,
      raw?.layout?.audio_sources,
      raw?.audio_sources,
      raw?.audioSources,
      Array.isArray(raw?.canvas_items) ? raw.canvas_items.filter(item => item?.type === "audio" || item?.type === "audio_source" || item?.itemType === "audio" || item?.itemType === "audio_source") : [],
      Array.isArray(raw?.elements) ? raw.elements.filter(item => item?.type === "audio" || item?.type === "audio_source" || item?.itemType === "audio" || item?.itemType === "audio_source") : [],
    ],
  }

  return map[kind].find(arr => Array.isArray(arr) && arr.length) || []
}

const manualSeatLayout = computed(() => {
  const seats = getRawSeatArrays(rawVenue.value)
  return seats.map((seat, index) => normalizeCanvasSeat(seat, index))
})

const layoutAssets = computed(() => ({
  screens: getRawAssetArrays(rawVenue.value, "screens").map((item, index) =>
    normalizeAsset(item, index, "Screen")
  ),
  stages: getRawAssetArrays(rawVenue.value, "stages").map((item, index) =>
    normalizeAsset(item, index, "Stage")
  ),
  audioSources: getRawAssetArrays(rawVenue.value, "audioSources").map((item, index) =>
    normalizeAsset(item, index, "Audio")
  ),
}))

const hasManualSeatLayout = computed(() => manualSeatLayout.value.length > 0)

const canvasBounds = computed(() => {
  const allItems = [
    ...manualSeatLayout.value,
    ...layoutAssets.value.screens,
    ...layoutAssets.value.stages,
    ...layoutAssets.value.audioSources,
  ]

  const metaWidth =
    numeric(event.value?.seat_layout?.width, 0) ||
    numeric(rawVenue.value?.seat_layout?.width, 0) ||
    numeric(rawVenue.value?.design_layout?.width, 0) ||
    numeric(rawVenue.value?.layout?.width, 0) ||
    numeric(rawVenue.value?.dimensions?.width, 0) ||
    numeric(rawVenue.value?.width_meters, 0)

  const metaHeight =
    numeric(event.value?.seat_layout?.height, 0) ||
    numeric(rawVenue.value?.seat_layout?.height, 0) ||
    numeric(rawVenue.value?.design_layout?.height, 0) ||
    numeric(rawVenue.value?.layout?.height, 0) ||
    numeric(rawVenue.value?.dimensions?.height, 0) ||
    numeric(rawVenue.value?.height_meters, 0)

  const maxX = allItems.length
    ? Math.max(...allItems.map(item => numeric(item.x, 0) + numeric(item.width, 1)))
    : 20
  const maxY = allItems.length
    ? Math.max(...allItems.map(item => numeric(item.y, 0) + numeric(item.height, 1)))
    : 12

  return {
    width: Math.max(metaWidth || 0, maxX + 2, 20),
    height: Math.max(metaHeight || 0, maxY + 2, 12),
  }
})

const reservedSeatKeys = computed(() => {
  if (!event.value?.id) return []
  return get_Reserved_Seat_Keys_By_Event_Id(event.value.id)
})

const reservedSeatCounts = computed(() => {
  if (!event.value?.id) return {}
  return get_Reserved_Seat_Counts_By_Event_Id(event.value.id)
})

const reservedSeatKeySet = computed(() => new Set(reservedSeatKeys.value))

function isSeatReserved(seat) {
  return reservedSeatKeySet.value.has(seat.key)
}

function isSeatSelected(seat) {
  return selectedSeatKeys.value.includes(seat.key)
}

function setHoveredSeat(seat, pointer = null) {
  hoveredSeatKey.value = seat?.key || ""

  if (pointer?.x != null && pointer?.y != null) {
    hoveredSeatPointer.value = {
      x: pointer.x,
      y: pointer.y,
    }
  }
}

function clearHoveredSeat() {
  hoveredSeatKey.value = ""
}

function buildSeatAriaLabel(seat) {
  const code = seat?.seat_number || compactSeatLabel(seat)
  const status = isSeatReserved(seat)
    ? "Reserved"
    : isSeatSelected(seat)
      ? "Selected"
      : "Available"

  return `${code} • ${seat?.seat_class || "Regular"} • ${formatPrice(seat?.price)} • ${status}`
}

function toggleSeat(seat) {
  if (isSeatReserved(seat)) return

  const index = selectedSeatKeys.value.indexOf(seat.key)
  if (index >= 0) {
    selectedSeatKeys.value.splice(index, 1)
  } else {
    selectedSeatKeys.value.push(seat.key)
  }
}

const selectedSeatsDetailed = computed(() =>
  manualSeatLayout.value.filter(seat => selectedSeatKeys.value.includes(seat.key))
)

const hoveredSeatDetails = computed(() =>
  manualSeatLayout.value.find(seat => seat.key === hoveredSeatKey.value) || null
)

watch(manualSeatLayout, (nextSeats) => {
  const validKeys = new Set(nextSeats.map(seat => seat.key))
  selectedSeatKeys.value = selectedSeatKeys.value.filter(key => validKeys.has(key))

  if (hoveredSeatKey.value && !validKeys.has(hoveredSeatKey.value)) {
    hoveredSeatKey.value = ""
  }
}, { deep: true })

function compactSeatLabel(seat) {
  return [seat.row, seat.number].filter(Boolean).join("") || seat.label
}

const eventSeatClasses = computed(() => get_Seat_Classes_By_Event_Id(event.value?.id || ""))

const fallbackSeatClassOptions = computed(() => {
  const reservedCounts = reservedSeatCounts.value
  const fromSeatClassModel = eventSeatClasses.value

  if (fromSeatClassModel.length) {
    return fromSeatClassModel.map(item => {
      const reserved = numeric(reservedCounts[item.name], 0)
      const total = Math.max(0, numeric(item.available_seats, 0))

      return {
        name: item.name,
        price: numeric(item.price, defaultClassPrice(item.name)),
        total,
        remaining: Math.max(0, total - reserved),
      }
    })
  }

  if (manualSeatLayout.value.length) {
    const grouped = new Map()

    manualSeatLayout.value.forEach(seat => {
      const className = seat.seat_class || "Regular"
      const current = grouped.get(className) || {
        name: className,
        price: numeric(seat.price, defaultClassPrice(className)),
        total: 0,
      }

      current.total += 1
      if (!current.price || current.price <= 0) {
        current.price = numeric(seat.price, defaultClassPrice(className))
      }

      grouped.set(className, current)
    })

    return Array.from(grouped.values()).map(item => {
      const reserved = numeric(reservedCounts[item.name], 0)

      return {
        ...item,
        remaining: Math.max(0, item.total - reserved),
      }
    })
  }

  const classNames =
    Array.isArray(event.value?.seat_classes) && event.value.seat_classes.length
      ? event.value.seat_classes.map(name => (name === "Normal" ? "Regular" : name))
      : Array.isArray(rawVenue.value?.seat_classes) && rawVenue.value.seat_classes.length
        ? rawVenue.value.seat_classes.map(name => (name === "Normal" ? "Regular" : name))
        : ["Regular"]

  const totalLeft =
    Math.max(0, numeric(event.value?.seats_left, 0)) ||
    Math.max(0, numeric(rawVenue.value?.capacity, 0)) ||
    Math.max(0, numeric(venue.value?.capacity, 0))

  const perClassBase = classNames.length
    ? Math.max(0, Math.floor(totalLeft / classNames.length))
    : totalLeft

  return classNames.map((name, index) => {
    const reserved = numeric(reservedCounts[name], 0)
    const total =
      index === classNames.length - 1
        ? Math.max(0, totalLeft - perClassBase * index)
        : perClassBase

    return {
      name,
      price: defaultClassPrice(name),
      total,
      remaining: Math.max(0, total - reserved),
    }
  })
})

const accurateTotalSeats = computed(() => {
  if (hasManualSeatLayout.value) {
    return manualSeatLayout.value.length
  }

  const fromFallback = fallbackSeatClassOptions.value.reduce(
    (sum, item) => sum + numeric(item.total, 0),
    0
  )

  if (fromFallback > 0) return fromFallback

  return (
    Math.max(0, numeric(event.value?.seats_left, 0)) ||
    Math.max(0, numeric(rawVenue.value?.capacity, 0)) ||
    Math.max(0, numeric(venue.value?.capacity, 0))
  )
})

const accurateRemainingSeats = computed(() => {
  if (hasManualSeatLayout.value) {
    return Math.max(0, accurateTotalSeats.value - reservedSeatKeys.value.length)
  }

  const fromFallback = fallbackSeatClassOptions.value.reduce(
    (sum, item) => sum + numeric(item.remaining, 0),
    0
  )

  if (fromFallback > 0 || fallbackSeatClassOptions.value.length) {
    return Math.max(0, fromFallback)
  }

  return Math.max(0, accurateTotalSeats.value)
})

const priceLegend = computed(() => {
  if (hasManualSeatLayout.value) {
    const grouped = new Map()

    manualSeatLayout.value.forEach(seat => {
      if (!grouped.has(seat.seat_class)) {
        grouped.set(seat.seat_class, seat.price || defaultClassPrice(seat.seat_class))
      }
    })

    return Array.from(grouped.entries()).map(([name, price]) => ({
      name,
      price,
    }))
  }

  return fallbackSeatClassOptions.value.map(item => ({
    name: item.name,
    price: item.price,
  }))
})

function changeFallbackQty(className, amount) {
  const option = fallbackSeatClassOptions.value.find(item => item.name === className)
  if (!option) return

  const current = fallbackSelection[className] || 0
  const next = current + amount

  if (next < 0) return
  if (next > option.remaining) return

  fallbackSelection[className] = next
}

const totalTickets = computed(() => {
  if (hasManualSeatLayout.value) {
    return selectedSeatsDetailed.value.length
  }

  return Object.values(fallbackSelection).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  )
})

const totalPrice = computed(() => {
  if (hasManualSeatLayout.value) {
    return selectedSeatsDetailed.value.reduce(
      (sum, seat) => sum + numeric(seat.price, defaultClassPrice(seat.seat_class)),
      0
    )
  }

  return fallbackSeatClassOptions.value.reduce((sum, option) => {
    const qty = fallbackSelection[option.name] || 0
    return sum + qty * option.price
  }, 0)
})

const blasstiFee = computed(() =>
  Number((numeric(totalPrice.value, 0) * BLASSTI_FEE_RATE).toFixed(2))
)

const finalTotal = computed(() =>
  Number((numeric(totalPrice.value, 0) + numeric(blasstiFee.value, 0)).toFixed(2))
)

const canProceedToPayment = computed(() =>
  Boolean(currentUser.value) && totalTickets.value > 0
)

function getSeatStyle(seat) {
  return {
    left: `${(numeric(seat.x) / canvasBounds.value.width) * 100}%`,
    top: `${(numeric(seat.y) / canvasBounds.value.height) * 100}%`,
    width: `${(numeric(seat.width, 1) / canvasBounds.value.width) * 100}%`,
    height: `${(numeric(seat.height, 1) / canvasBounds.value.height) * 100}%`,
    transform: `rotate(${numeric(seat.rotation, 0)}deg)`,
  }
}

function getAssetStyle(asset) {
  return {
    left: `${(numeric(asset.x) / canvasBounds.value.width) * 100}%`,
    top: `${(numeric(asset.y) / canvasBounds.value.height) * 100}%`,
    width: `${(numeric(asset.width, 2) / canvasBounds.value.width) * 100}%`,
    height: `${(numeric(asset.height, 1.2) / canvasBounds.value.height) * 100}%`,
    transform: `rotate(${numeric(asset.rotation, 0)}deg)`,
  }
}

function getSeatHoverCardStyle(seat) {
  if (isMobile.value && hoveredSeatPointer.value?.x && hoveredSeatPointer.value?.y) {
    return {
      left: `${hoveredSeatPointer.value.x}px`,
      top: `${Math.max(92, hoveredSeatPointer.value.y - 18)}px`,
      position: "fixed",
      transform: "translate(-50%, -100%)",
    }
  }

  const seatX = numeric(seat?.x, 0) + numeric(seat?.width, 1.2) / 2
  const seatY = numeric(seat?.y, 0) - 0.3
  const left = (seatX / canvasBounds.value.width) * 100
  const top = Math.max(4, (seatY / canvasBounds.value.height) * 100)

  return {
    left: `${Math.min(92, Math.max(8, left))}%`,
    top: `${top}%`,
  }
}

function getClassColor(className) {
  const normalized = String(className || "").toLowerCase()

  if (normalized.includes("vip")) return "warning"
  if (normalized.includes("special")) return "error"
  return "primary"
}

function formatPrice(value) {
  return `${numeric(value, 0).toFixed(2)} TND`
}

function openPaymentDialog() {
  if (!currentUser.value) {
    router.push("/O_login")
    return
  }

  paymentError.value = ""
  paymentDialog.value = true
}

function formatCardNumber() {
  const digits = String(paymentForm.cardNumber || "").replace(/\D/g, "").slice(0, 16)
  paymentForm.cardNumber = digits.replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry() {
  const digits = String(paymentForm.expiry || "").replace(/\D/g, "").slice(0, 4)

  if (digits.length <= 2) {
    paymentForm.expiry = digits
  } else {
    paymentForm.expiry = `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
}

function getVirtualSelectedSeats() {
  const now = Date.now()
  const result = []

  fallbackSeatClassOptions.value.forEach(option => {
    const qty = Number(fallbackSelection[option.name] || 0)
    for (let i = 0; i < qty; i += 1) {
      result.push({
        id: `${option.name}-${i + 1}-${now}`,
        key: `${event.value.id}-${option.name}-${now}-${i + 1}-${Math.random().toString(36).slice(2, 7)}`,
        label: `${option.name} #${i + 1}`,
        row: "",
        number: `${i + 1}`,
        seat_class: option.name,
        price: option.price,
        is_virtual: true,
      })
    }
  })

  return result
}

function validatePayment() {
  if (!paymentForm.cardType) return "Please choose a card type."
  if (!String(paymentForm.cardHolder).trim()) return "Please enter the card holder name."

  const rawCard = String(paymentForm.cardNumber || "").replace(/\D/g, "")
  if (rawCard.length < 13) return "Please enter a valid card number."

  if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiry)) {
    return "Please enter a valid expiry date."
  }

  const rawCvv = String(paymentForm.cvv || "").replace(/\D/g, "")
  if (rawCvv.length < 3) return "Please enter a valid CVV."

  return ""
}

function readLocalArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}".`, error)
    return []
  }
}

function writeLocalArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function saveBlasstiFeeRecord({
  reservationId,
  userId,
  eventId,
  venueId,
  subtotal,
  fee,
  finalTotalAmount,
  seatCount,
}) {
  const records = readLocalArray(BLASSTI_FEE_STORAGE_KEY)

  records.push({
    id: crypto.randomUUID(),
    reservation_id: reservationId || null,
    user_id: userId || null,
    event_id: eventId || null,
    venue_id: venueId || null,
    subtotal: Number(numeric(subtotal, 0).toFixed(2)),
    fee_amount: Number(numeric(fee, 0).toFixed(2)),
    fee_rate: BLASSTI_FEE_RATE,
    total_paid: Number(numeric(finalTotalAmount, 0).toFixed(2)),
    seat_count: numeric(seatCount, 0),
    created_at: new Date().toISOString(),
  })

  writeLocalArray(BLASSTI_FEE_STORAGE_KEY, records)
}

function savePaymentRecord({
  reservationId,
  userId,
  eventId,
  venueId,
  selectedSeats,
  seatBreakdown,
  subtotal,
  fee,
  finalTotalAmount,
  paymentBrand,
  cardLast4,
}) {
  const records = readLocalArray(BLASSTI_PAYMENT_STORAGE_KEY)

  records.push({
    id: crypto.randomUUID(),
    reservation_id: reservationId || null,
    user_id: userId || null,
    event_id: eventId || null,
    venue_id: venueId || null,
    selected_seats: Array.isArray(selectedSeats) ? selectedSeats : [],
    seat_breakdown: seatBreakdown || {},
    subtotal: Number(numeric(subtotal, 0).toFixed(2)),
    blassti_fee: Number(numeric(fee, 0).toFixed(2)),
    total_paid: Number(numeric(finalTotalAmount, 0).toFixed(2)),
    payment_method: "card",
    payment_brand: paymentBrand || "",
    card_last4: cardLast4 || "",
    created_at: new Date().toISOString(),
  })

  writeLocalArray(BLASSTI_PAYMENT_STORAGE_KEY, records)
}

async function confirmPayment() {
  const validationError = validatePayment()
  if (validationError) {
    paymentError.value = validationError
    return
  }

  isPaying.value = true
  paymentError.value = ""

  try {
    const selectedSeats = hasManualSeatLayout.value
      ? selectedSeatsDetailed.value.map(seat => ({
          ...seat,
          price: numeric(seat.price, defaultClassPrice(seat.seat_class)),
        }))
      : getVirtualSelectedSeats()

    const seatBreakdown = selectedSeats.reduce((acc, seat) => {
      const key = seat.seat_class || "Regular"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const cardDigits = String(paymentForm.cardNumber || "").replace(/\D/g, "")
    const last4 = cardDigits.slice(-4)

    const response = create_Event_Ticket_Reservation({
      user_id: currentUser.value.id,
      event_id: event.value.id,
      selected_seats: selectedSeats,
      seat_breakdown: seatBreakdown,
      total_price: totalPrice.value,
      payment_method: "card",
      payment_brand: paymentForm.cardType,
      card_last4: last4,
    })

    if (!response?.success) {
      paymentError.value = response?.message || "Payment failed."
      return
    }

    const reservationId =
      response?.reservation?.id ??
      response?.data?.id ??
      response?.id ??
      null

    saveBlasstiFeeRecord({
      reservationId,
      userId: currentUser.value?.id,
      eventId: event.value?.id,
      venueId: venue.value?.id,
      subtotal: totalPrice.value,
      fee: blasstiFee.value,
      finalTotalAmount: finalTotal.value,
      seatCount: totalTickets.value,
    })

    savePaymentRecord({
      reservationId,
      userId: currentUser.value?.id,
      eventId: event.value?.id,
      venueId: venue.value?.id,
      selectedSeats,
      seatBreakdown,
      subtotal: totalPrice.value,
      fee: blasstiFee.value,
      finalTotalAmount: finalTotal.value,
      paymentBrand: paymentForm.cardType,
      cardLast4: last4,
    })

    paymentDialog.value = false
    successDialog.value = true
    selectedSeatKeys.value = []

    Object.keys(fallbackSelection).forEach(key => {
      fallbackSelection[key] = 0
    })

    paymentForm.cardType = "Visa"
    paymentForm.cardHolder = ""
    paymentForm.cardNumber = ""
    paymentForm.expiry = ""
    paymentForm.cvv = ""
  } catch (error) {
    console.error(error)
    paymentError.value = "Something went wrong while processing the payment."
  } finally {
    isPaying.value = false
  }
}

function goHome() {
  successDialog.value = false
  router.push("/n_mainpage")
}

function goToBookings() {
  successDialog.value = false
  router.push("/K_mybookings")
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.seat-selection-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(60, 90, 160, 0.25), transparent 30%),
    radial-gradient(circle at top right, rgba(131, 56, 236, 0.18), transparent 30%),
    linear-gradient(180deg, #070b14 0%, #0b1220 45%, #09111e 100%);
}

.glass-card {
  background: rgba(10, 16, 30, 0.82) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.sidebar-card,
.canvas-card {
  min-height: 760px;
}

.info-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-row + .summary-row {
  margin-top: 8px;
}

.divider-soft {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.venue-canvas-wrapper {
  position: relative;
  width: 100%;
  min-height: 700px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(111, 150, 255, 0.15);
  background:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(180deg, #050a15 0%, #091120 100%);
  background-size: 30px 30px, 30px 30px, cover;
}

.venue-canvas-grid {
  position: relative;
  width: 100%;
  height: 700px;
  isolation: isolate;
}

.canvas-seat,
.layout-asset {
  position: absolute;
  border: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.canvas-seat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  min-height: 38px;
  border-radius: 18px;
  color: white;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
  padding: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}

.seat-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.seat-icon-wrap {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.canvas-seat:hover:not(:disabled) {
  transform: scale(1.05);
}

.canvas-seat.reserved {
  background: rgba(160, 160, 160, 0.35) !important;
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  box-shadow: none;
}

.canvas-seat.selected {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.14), 0 0 18px rgba(255, 255, 255, 0.18);
}

.canvas-seat.hovered:not(:disabled) {
  z-index: 5;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2), 0 14px 28px rgba(2, 6, 23, 0.34);
}

.canvas-seat.seat-class-regular {
  background: linear-gradient(180deg, #2795ff 0%, #1565c0 100%);
}

.canvas-seat.seat-class-normal {
  background: linear-gradient(180deg, #2795ff 0%, #1565c0 100%);
}

.canvas-seat.seat-class-special {
  background: linear-gradient(180deg, #ff5c7c 0%, #c62828 100%);
}

.canvas-seat.seat-class-vip {
  background: linear-gradient(180deg, #ffc857 0%, #d89216 100%);
}

.seat-label {
  font-size: 10px;
  line-height: 1;
  margin-top: 2px;
  font-weight: 700;
  white-space: nowrap;
}


.seat-hover-card {
  position: absolute;
  z-index: 9;
  min-width: 160px;
  max-width: 220px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 15, 29, 0.94);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  transform: translate(-50%, -105%);
  pointer-events: none;
}

.seat-hover-card-enter-active,
.seat-hover-card-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.seat-hover-card-enter-from,
.seat-hover-card-leave-to {
  opacity: 0;
  transform: translate(-50%, -96%);
}

.layout-asset {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  color: white;
  font-weight: 700;
  font-size: 12px;
  padding: 6px 10px;
  text-align: center;
}

.layout-screen {
  background: linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%);
}

.layout-stage {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
}

.layout-audio {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
}

.selected-seat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-seat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.fallback-selector {
  min-height: 700px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03)),
    linear-gradient(180deg, #050a15 0%, #091120 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.fallback-class-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.fallback-class-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.qty-pill,
.fallback-qty-display {
  min-width: 42px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.payment-summary {
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed rgba(0, 0, 0, 0.12);
}

.browser-theme-light .seat-hover-card {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(15, 23, 42, 0.08);
}

.browser-theme-light .seat-icon-wrap {
  background: rgba(15, 23, 42, 0.08);
}
.browser-theme-dark {
  color-scheme: dark;
}

.browser-theme-light {
  color-scheme: light;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 28%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 26%),
    linear-gradient(180deg, #f7faff 0%, #edf3fb 48%, #e8eef8 100%);
}

.browser-theme-light .glass-card {
  background: rgba(255, 255, 255, 0.88) !important;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.browser-theme-light .info-panel,
.browser-theme-light .fallback-class-card,
.browser-theme-light .fallback-class-row,
.browser-theme-light .selected-seat-item,
.browser-theme-light .qty-pill,
.browser-theme-light .fallback-qty-display,
.browser-theme-light .canvas-toolbar,
.browser-theme-light .route-context-menu-card {
  background: rgba(248, 250, 252, 0.9) !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
  color: #0f172a;
}

.browser-theme-light .payment-summary {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(15, 23, 42, 0.12);
}

.browser-theme-light .text-white,
.browser-theme-light .font-weight-bold.text-white,
.browser-theme-light .font-weight-medium.text-white {
  color: #0f172a !important;
}

.browser-theme-light .text-medium-emphasis {
  color: rgba(15, 23, 42, 0.68) !important;
}

.browser-theme-light .venue-canvas-wrapper,
.browser-theme-light .fallback-selector {
  border-color: rgba(59, 130, 246, 0.15);
  background:
    linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
  background-size: 30px 30px, 30px 30px, cover;
}

.browser-theme-light .divider-soft {
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.elevated-card,
.elevated-panel,
.canvas-seat,
.contextual-nav-btn,
.primary-cta-btn,
.route-context-menu-card {
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background-color 0.22s ease;
}

.elevated-card:hover,
.elevated-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.2);
}

.contextual-nav-btn {
  position: relative;
}

.contextual-nav-btn:hover {
  transform: translateY(-1px);
}

.primary-cta-btn {
  box-shadow: 0 14px 30px rgba(25, 118, 210, 0.28);
}

.primary-cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 38px rgba(25, 118, 210, 0.34);
}

.canvas-toolbar {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.route-context-menu-card {
  min-width: 240px;
  background: rgba(11, 18, 32, 0.96) !important;
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.route-context-menu-list {
  background: transparent;
}

.venue-canvas-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 28%);
  pointer-events: none;
}

.venue-canvas-grid::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 28px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  pointer-events: none;
}

.canvas-seat:hover:not(:disabled) {
  transform: scale(1.06) translateY(-1px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.28);
}

.layout-asset:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.22);
}

.selected-seat-item:hover,
.fallback-class-row:hover {
  border-color: rgba(111, 150, 255, 0.22);
}


.success-dialog-card {
  overflow: hidden;
}

.success-dialog-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(34,197,94,0.2), rgba(34,197,94,0.92), rgba(59,130,246,0.6));
}

.success-pulse-avatar {
  animation: successPulse 1.8s ease-in-out infinite;
}

@keyframes successPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.22); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(34, 197, 94, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}


.page-shell {
  max-width: 1800px;
  margin: 0 auto;
}

.panel-column {
  display: flex;
  flex-direction: column;
}

.seat-selection-page :deep(.v-overlay__content.theme-dialog .v-card) {
  background: rgba(10, 16, 30, 0.96) !important;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34);
}

.browser-theme-light :deep(.v-overlay__content.theme-dialog .v-card) {
  background: rgba(255, 255, 255, 0.98) !important;
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.14);
}

.browser-theme-light :deep(.v-overlay__content.theme-dialog .v-divider) {
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.browser-theme-light :deep(.v-overlay__content.theme-dialog .v-field) {
  color: #0f172a;
}

.browser-theme-light :deep(.v-overlay__content.theme-dialog .v-field__outline),
.browser-theme-light :deep(.v-overlay__content.theme-dialog .v-field__overlay) {
  --v-field-border-opacity: 0.18;
}

.browser-theme-light :deep(.v-overlay__content.theme-dialog .v-label),
.browser-theme-light :deep(.v-overlay__content.theme-dialog .text-body-2),
.browser-theme-light :deep(.v-overlay__content.theme-dialog .text-medium-emphasis) {
  color: rgba(15, 23, 42, 0.72) !important;
}

@media (max-width: 1264px) {
  .sidebar-card,
  .canvas-card {
    min-height: auto;
  }

  .venue-canvas-wrapper,
  .venue-canvas-grid,
  .fallback-selector {
    min-height: 620px;
    height: 620px;
  }
}

@media (max-width: 960px) {
  .page-shell {
    padding-top: 20px !important;
  }

  .venue-canvas-wrapper,
  .venue-canvas-grid,
  .fallback-selector {
    min-height: 540px;
    height: 540px;
  }

  .seat-hover-card {
    min-width: 150px;
    max-width: 200px;
  }
}

@media (max-width: 600px) {
  .seat-selection-page {
    padding-bottom: 28px;
  }

  .page-shell {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  .sidebar-card .v-card-text,
  .canvas-card .v-card-text {
    padding: 18px !important;
  }

  .venue-canvas-wrapper,
  .venue-canvas-grid,
  .fallback-selector {
    min-height: 460px;
    height: 460px;
    border-radius: 22px;
  }

  .canvas-seat {
    min-width: 30px;
    min-height: 30px;
    border-radius: 12px;
    padding: 2px;
  }

  .seat-icon-wrap {
    width: 18px;
    height: 18px;
  }

  .seat-label {
    font-size: 8px;
  }

  .selected-seat-item,
  .fallback-class-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .summary-row {
    gap: 10px;
  }

  .seat-hover-card {
    min-width: 144px;
    max-width: min(78vw, 210px);
  }

  .canvas-toolbar .text-caption {
    width: 100%;
  }
}
</style>
