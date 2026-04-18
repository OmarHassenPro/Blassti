import { reactive } from "vue"
import { get_Event_By_Id, get_All_Events, parse_Event_DateTime } from "@/dataModel/event"
import { create_Event_Ticket_Reservation, get_Reserved_Seat_Keys_By_Event_Id } from "@/dataModel/reservation"
import { calculate_Blassti_Fee, get_Blassti_Event_Ticket_Fee_Rate } from "@/dataModel/statistics"

const BUNDLES_STORAGE_KEY = "blassti_bundles_v1"
const BUNDLES_VERSION_KEY = "blassti_bundles_version"
const BUNDLES_VERSION = "v2_bundle_discount_threshold_fee_route_limit9"

export const BUNDLE_DISCOUNT_RATE = 0.13
export const BUNDLE_BLASSTI_FEE_RATE = 0.03
export const BUNDLE_MAX_DAYS = 9
export const BUNDLE_MIN_EVENTS_FOR_DISCOUNT = 3

export const BUNDLE_TIER_OPTIONS = [
  {
    key: "economy",
    label: "Economy",
    icon: "mdi-ticket-outline",
    description: "Uses regular seats across all bundle events.",
  },
  {
    key: "special",
    label: "Special",
    icon: "mdi-ticket-confirmation-outline",
    description: "Uses special seats, then VIP, then regular when needed.",
  },
  {
    key: "luxury",
    label: "Luxury",
    icon: "mdi-crown-outline",
    description: "Uses VIP seats, with the best fallback available.",
  },
]

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.error("Failed to clone bundle data.", error)
    return null
  }
}

function normalizeTier(value = "economy") {
  const normalized = String(value || "").trim().toLowerCase()

  if (normalized === "luxery") return "luxury"
  if (["economy", "special", "luxury"].includes(normalized)) {
    return normalized
  }

  return "economy"
}

function normalizeSeatClass(value = "") {
  const normalized = String(value || "").trim().toLowerCase()

  if (!normalized) return ""
  if (normalized === "regular" || normalized === "normal") return "Normal"
  if (normalized === "special") return "Special"
  if (normalized === "vip") return "VIP"

  return String(value || "").trim()
}

function buildSeatPricingMap(event) {
  const pricing = {}

  const rawSources = [event?.seat_pricing, event?.ticket_prices]

  rawSources.forEach(source => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return

    Object.entries(source).forEach(([seatClass, price]) => {
      const normalizedSeatClass = normalizeSeatClass(seatClass)
      if (normalizedSeatClass) {
        pricing[normalizedSeatClass] = toNumber(price, 0)
      }
    })
  })

  const fallbackOrder = ["Normal", "Special", "VIP"]
  fallbackOrder.forEach(seatClass => {
    if (!Object.prototype.hasOwnProperty.call(pricing, seatClass)) {
      pricing[seatClass] = 0
    }
  })

  return pricing
}

function normalizeDateKey(value) {
  if (!value) return ""

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function normalizeSelectedDates(selectedDates = []) {
  if (!Array.isArray(selectedDates)) return []

  return Array.from(
    new Set(
      selectedDates
        .map(normalizeDateKey)
        .filter(Boolean)
    )
  ).sort()
}

function normalizeTimelineEntries(timelineEntries = [], selectedDates = []) {
  const safeSelectedDates = normalizeSelectedDates(selectedDates)

  if (!Array.isArray(timelineEntries) || !timelineEntries.length) {
    return safeSelectedDates.map(date_key => ({
      date_key,
      event_id: null,
    }))
  }

  const byDate = new Map()
  timelineEntries.forEach(entry => {
    const date_key = normalizeDateKey(entry?.date_key || entry?.date)
    if (!date_key) return

    byDate.set(date_key, {
      date_key,
      event_id: entry?.event_id ?? null,
    })
  })

  return safeSelectedDates.map(date_key => byDate.get(date_key) || {
    date_key,
    event_id: null,
  })
}

function normalizePurchaseHistory(purchaseHistory = []) {
  if (!Array.isArray(purchaseHistory)) return []

  return purchaseHistory.map(entry => ({
    id: entry?.id ?? crypto.randomUUID(),
    tier: normalizeTier(entry?.tier),
    quantity: Math.max(1, Math.floor(toNumber(entry?.quantity, 1))),
    subtotal_before_discount: toNumber(entry?.subtotal_before_discount, 0),
    discount_amount: toNumber(entry?.discount_amount, 0),
    discounted_subtotal: toNumber(entry?.discounted_subtotal, 0),
    fee_amount: toNumber(entry?.fee_amount, 0),
    total_amount: toNumber(entry?.total_amount, 0),
    reservation_ids: Array.isArray(entry?.reservation_ids) ? entry.reservation_ids : [],
    purchased_at: entry?.purchased_at ?? new Date().toISOString(),
  }))
}

export class Bundle {
  constructor({
    id,
    user_id,
    title,
    start_date,
    end_date,
    selected_dates,
    timeline_entries,
    notes,
    purchase_history,
    created_at,
    updated_at,
    last_purchased_at,
  }) {
    const normalizedSelectedDates = normalizeSelectedDates(selected_dates)

    this.id = id ?? crypto.randomUUID()
    this.user_id = user_id ?? null
    this.title = String(title ?? "").trim()
    this.start_date = normalizeDateKey(start_date || normalizedSelectedDates[0] || "")
    this.end_date = normalizeDateKey(end_date || normalizedSelectedDates[normalizedSelectedDates.length - 1] || "")
    this.selected_dates = normalizedSelectedDates
    this.timeline_entries = normalizeTimelineEntries(timeline_entries, normalizedSelectedDates)
    this.notes = String(notes ?? "")
    this.purchase_history = normalizePurchaseHistory(purchase_history)
    this.created_at = created_at ?? new Date().toISOString()
    this.updated_at = updated_at ?? new Date().toISOString()
    this.last_purchased_at = last_purchased_at ?? ""
  }
}

function loadBundles() {
  const savedVersion = localStorage.getItem(BUNDLES_VERSION_KEY)
  const savedBundles = localStorage.getItem(BUNDLES_STORAGE_KEY)

  if (savedVersion !== BUNDLES_VERSION) {
    if (savedBundles) {
      try {
        const migrated = JSON.parse(savedBundles).map(item => new Bundle(item))
        localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(migrated))
        localStorage.setItem(BUNDLES_VERSION_KEY, BUNDLES_VERSION)
        return migrated
      } catch (error) {
        console.error("Failed to migrate bundles. Resetting storage.", error)
      }
    }

    localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify([]))
    localStorage.setItem(BUNDLES_VERSION_KEY, BUNDLES_VERSION)
    return []
  }

  if (savedBundles) {
    try {
      return JSON.parse(savedBundles).map(item => new Bundle(item))
    } catch (error) {
      console.error("Failed to parse bundles. Resetting storage.", error)
    }
  }

  localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify([]))
  localStorage.setItem(BUNDLES_VERSION_KEY, BUNDLES_VERSION)
  return []
}

export const BUNDLE_LIST = reactive(loadBundles())

function saveBundles() {
  localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(BUNDLE_LIST))
}

export function get_All_Bundles() {
  return BUNDLE_LIST
}

export function get_Bundle_By_Id(id) {
  return BUNDLE_LIST.find(bundle => bundle.id === id) || null
}

export function get_Bundles_By_User_Id(userId) {
  return BUNDLE_LIST.filter(bundle => bundle.user_id === userId)
}

export function add_Bundle(bundleData) {
  const bundle = bundleData instanceof Bundle ? bundleData : new Bundle(bundleData)
  BUNDLE_LIST.unshift(bundle)
  saveBundles()
  return bundle
}

export function update_Bundle(id, updatedBundleData = {}) {
  const index = BUNDLE_LIST.findIndex(bundle => bundle.id === id)
  if (index === -1) return null

  BUNDLE_LIST[index] = new Bundle({
    ...BUNDLE_LIST[index],
    ...updatedBundleData,
    id: BUNDLE_LIST[index].id,
    updated_at: new Date().toISOString(),
  })

  saveBundles()
  return BUNDLE_LIST[index]
}

export function upsert_Bundle(bundleData = {}) {
  if (bundleData?.id && get_Bundle_By_Id(bundleData.id)) {
    return update_Bundle(bundleData.id, bundleData)
  }

  return add_Bundle(bundleData)
}

export function delete_Bundle(id) {
  const index = BUNDLE_LIST.findIndex(bundle => bundle.id === id)
  if (index === -1) return null

  const deleted = BUNDLE_LIST[index]
  BUNDLE_LIST.splice(index, 1)
  saveBundles()
  return deleted
}

export function get_Bundle_Event_Ids(bundle) {
  return (bundle?.timeline_entries || [])
    .map(entry => entry?.event_id)
    .filter(Boolean)
}

export function get_Bundle_Events(bundle) {
  return (bundle?.timeline_entries || [])
    .map(entry => get_Event_By_Id(entry?.event_id))
    .filter(Boolean)
}

export function get_Bundle_Filled_Day_Count(bundle) {
  return (bundle?.timeline_entries || []).filter(entry => entry?.event_id).length
}

function getPreferredSeatPrice(event, tier = "economy") {
  const normalizedTier = normalizeTier(tier)
  const pricing = buildSeatPricingMap(event)

  if (normalizedTier === "economy") {
    if (pricing.Normal > 0) return { seatClass: "Normal", unitPrice: pricing.Normal }
    if (pricing.Special > 0) return { seatClass: "Special", unitPrice: pricing.Special }
    if (pricing.VIP > 0) return { seatClass: "VIP", unitPrice: pricing.VIP }
    return { seatClass: "Normal", unitPrice: 0 }
  }

  if (normalizedTier === "special") {
    if (pricing.Special > 0) return { seatClass: "Special", unitPrice: pricing.Special }
    if (pricing.VIP > 0) return { seatClass: "VIP", unitPrice: pricing.VIP }
    if (pricing.Normal > 0) return { seatClass: "Normal", unitPrice: pricing.Normal }
    return { seatClass: "Special", unitPrice: 0 }
  }

  if (pricing.VIP > 0) return { seatClass: "VIP", unitPrice: pricing.VIP }
  if (pricing.Special > 0) return { seatClass: "Special", unitPrice: pricing.Special }
  if (pricing.Normal > 0) return { seatClass: "Normal", unitPrice: pricing.Normal }

  return { seatClass: "VIP", unitPrice: 0 }
}

export function estimate_Bundle_Price(bundle, tier = "economy", quantity = 1) {
  const normalizedTier = normalizeTier(tier)
  const safeQuantity = Math.max(1, Math.floor(toNumber(quantity, 1)))
  const events = get_Bundle_Events(bundle)
  const feeRate = BUNDLE_BLASSTI_FEE_RATE
  const discountEligible = events.length >= BUNDLE_MIN_EVENTS_FOR_DISCOUNT

  const items = events.map(event => {
    const priceInfo = getPreferredSeatPrice(event, normalizedTier)
    const subtotal = toNumber(priceInfo.unitPrice * safeQuantity, 0)
    const discountAmount = discountEligible ? subtotal * BUNDLE_DISCOUNT_RATE : 0
    const discountedSubtotal = Math.max(0, subtotal - discountAmount)
    const feeAmount = calculate_Blassti_Fee(discountedSubtotal, feeRate)
    const finalTotal = discountedSubtotal + feeAmount

    return {
      event_id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      city: event.city,
      venue: event.venue,
      seat_class: priceInfo.seatClass,
      unit_price: toNumber(priceInfo.unitPrice, 0),
      quantity: safeQuantity,
      subtotal,
      discount_amount: discountAmount,
      discounted_subtotal: discountedSubtotal,
      fee_amount: feeAmount,
      total_amount: finalTotal,
      discount_eligible: discountEligible,
      effective_discount_rate: discountEligible ? BUNDLE_DISCOUNT_RATE : 0,
      fee_rate: feeRate,
    }
  })

  const subtotalBeforeDiscount = items.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = items.reduce((sum, item) => sum + item.discount_amount, 0)
  const discountedSubtotal = items.reduce((sum, item) => sum + item.discounted_subtotal, 0)
  const feeAmount = items.reduce((sum, item) => sum + item.fee_amount, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.total_amount, 0)

  return {
    tier: normalizedTier,
    quantity: safeQuantity,
    event_count: items.length,
    items,
    subtotal_before_discount: subtotalBeforeDiscount,
    discount_amount: discountAmount,
    discounted_subtotal: discountedSubtotal,
    fee_amount: feeAmount,
    total_amount: totalAmount,
    discount_eligible: discountEligible,
    discount_threshold: BUNDLE_MIN_EVENTS_FOR_DISCOUNT,
    effective_discount_rate: discountEligible ? BUNDLE_DISCOUNT_RATE : 0,
    fee_rate: feeRate,
  }
}

function formatPerSeatPrices(total, quantity) {
  const safeQuantity = Math.max(1, Math.floor(toNumber(quantity, 1)))
  const totalCents = Math.round(toNumber(total, 0) * 100)
  const baseCents = Math.floor(totalCents / safeQuantity)
  const remainder = totalCents - baseCents * safeQuantity

  return Array.from({ length: safeQuantity }, (_, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0)
    return cents / 100
  })
}

function shuffle(array) {
  const copy = [...array]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function buildVirtualSeats({
  event,
  seatClass,
  quantity,
  perSeatPrices,
  keyPrefix,
}) {
  return Array.from({ length: quantity }, (_, index) => ({
    id: `${event.id}-${keyPrefix}-virtual-${index + 1}`,
    key: `${event.id}-${keyPrefix}-virtual-${index + 1}`,
    label: `${seatClass} #${index + 1}`,
    row: "",
    number: String(index + 1),
    seat_class: seatClass,
    price: perSeatPrices[index] ?? 0,
    is_virtual: true,
  }))
}

function buildRandomSeatsForEvent({
  event,
  seatClass,
  quantity,
  discountedSubtotal,
  purchaseSeed,
}) {
  const safeQuantity = Math.max(1, Math.floor(toNumber(quantity, 1)))
  const perSeatPrices = formatPerSeatPrices(discountedSubtotal, safeQuantity)
  const normalizedSeatClass = normalizeSeatClass(seatClass) || "Normal"
  const allLayoutSeats = Array.isArray(event?.seat_layout?.seats)
    ? event.seat_layout.seats
    : []

  if (!allLayoutSeats.length) {
    return {
      success: true,
      selectedSeats: buildVirtualSeats({
        event,
        seatClass: normalizedSeatClass,
        quantity: safeQuantity,
        perSeatPrices,
        keyPrefix: purchaseSeed,
      }),
    }
  }

  const reservedKeys = new Set(get_Reserved_Seat_Keys_By_Event_Id(event.id))
  const matchingSeats = allLayoutSeats.filter(seat => {
    const seatKey = seat?.location_key || seat?.seat_number || seat?.id
    const seatSeatClass = normalizeSeatClass(seat?.seat_class)

    return seatKey && !reservedKeys.has(seatKey) && seatSeatClass === normalizedSeatClass
  })

  const pool = matchingSeats.length >= safeQuantity
    ? matchingSeats
    : allLayoutSeats.filter(seat => {
        const seatKey = seat?.location_key || seat?.seat_number || seat?.id
        return seatKey && !reservedKeys.has(seatKey)
      })

  if (pool.length < safeQuantity) {
    return {
      success: false,
      message: `Not enough seats left for ${event.title}.`,
      selectedSeats: [],
    }
  }

  const selectedSeats = shuffle(pool)
    .slice(0, safeQuantity)
    .map((seat, index) => {
      const seatKey = seat?.location_key || seat?.seat_number || seat?.id || `${purchaseSeed}-${index + 1}`
      const row = String(seat?.row ?? "")
      const number = String(seat?.number ?? "")
      const label = String(
        seat?.label ??
        seat?.seat_number ??
        [row, number].filter(Boolean).join("") ??
        seatKey
      ).trim() || seatKey

      return {
        id: seat?.id ?? `${event.id}-${purchaseSeed}-seat-${index + 1}`,
        key: seatKey,
        label,
        row,
        number,
        seat_class: normalizeSeatClass(seat?.seat_class) || normalizedSeatClass,
        price: perSeatPrices[index] ?? 0,
        x: toNumber(seat?.x, 0),
        y: toNumber(seat?.y, 0),
        width: toNumber(seat?.width, 1),
        height: toNumber(seat?.height, 1),
        rotation: toNumber(seat?.rotation, 0),
      }
    })

  return {
    success: true,
    selectedSeats,
  }
}

export function purchase_Bundle({
  bundle_id,
  user_id,
  tier = "economy",
  quantity = 1,
  payment_method = "card",
  payment_brand = "",
  card_last4 = "",
}) {
  const bundle = get_Bundle_By_Id(bundle_id)
  if (!bundle) {
    return {
      success: false,
      message: "Bundle not found.",
    }
  }

  if (!user_id || bundle.user_id !== user_id) {
    return {
      success: false,
      message: "You can only purchase your own bundle.",
    }
  }

  const filledEntries = (bundle.timeline_entries || []).filter(entry => entry?.event_id)
  if (!filledEntries.length) {
    return {
      success: false,
      message: "Please add at least one event before buying this bundle.",
    }
  }

  const summary = estimate_Bundle_Price(bundle, tier, quantity)
  const preparedItems = []

  for (const item of summary.items) {
    const event = get_Event_By_Id(item.event_id)

    if (!event) {
      return {
        success: false,
        message: `One of the selected events no longer exists.`,
      }
    }

    if (event.seats_left < summary.quantity) {
      return {
        success: false,
        message: `${event.title} no longer has enough seats left.`,
      }
    }

    const builtSeats = buildRandomSeatsForEvent({
      event,
      seatClass: item.seat_class,
      quantity: summary.quantity,
      discountedSubtotal: item.discounted_subtotal,
      purchaseSeed: `bundle-${bundle.id}-${Date.now()}-${item.event_id}`,
    })

    if (!builtSeats || builtSeats.success !== true) {
      return {
        success: false,
        message: builtSeats?.message || `Failed to prepare seats for ${event.title}.`,
        reservations: [],
      }
    }

    preparedItems.push({
      item,
      event,
      selectedSeats: builtSeats.selectedSeats,
    })
  }

  const reservations = []

  for (const prepared of preparedItems) {
    const breakdown = {}
    prepared.selectedSeats.forEach(seat => {
      const classKey = normalizeSeatClass(seat?.seat_class) || prepared.item.seat_class || "Normal"
      breakdown[classKey] = (breakdown[classKey] || 0) + 1
    })

    const response = create_Event_Ticket_Reservation({
      user_id,
      event_id: prepared.event.id,
      selected_seats: prepared.selectedSeats,
      seat_breakdown: breakdown,
      total_price: prepared.item.discounted_subtotal,
      payment_method,
      payment_brand,
      card_last4,
    })

    if (!response?.success) {
      return {
        success: false,
        message: response?.message || `Failed to buy tickets for ${prepared.event.title}.`,
        reservations,
      }
    }

    reservations.push(response.reservation)
  }

  const purchaseEntry = {
    id: crypto.randomUUID(),
    tier: normalizeTier(tier),
    quantity: Math.max(1, Math.floor(toNumber(quantity, 1))),
    subtotal_before_discount: summary.subtotal_before_discount,
    discount_amount: summary.discount_amount,
    discounted_subtotal: summary.discounted_subtotal,
    fee_amount: summary.fee_amount,
    total_amount: summary.total_amount,
    reservation_ids: reservations.map(reservation => reservation.id),
    purchased_at: new Date().toISOString(),
  }

  update_Bundle(bundle.id, {
    purchase_history: [...(bundle.purchase_history || []), purchaseEntry],
    last_purchased_at: purchaseEntry.purchased_at,
  })

  return {
    success: true,
    message: "Bundle purchased successfully.",
    reservations,
    summary,
    purchase: purchaseEntry,
  }
}

export function get_Events_For_Bundle_Date(dateKey) {
  const normalizedDateKey = normalizeDateKey(dateKey)
  if (!normalizedDateKey) return []

  return get_All_Events()
    .filter(event => {
      const parsed = parse_Event_DateTime(event.date, event.time || "00:00")
      if (!parsed) return false
      return normalizeDateKey(parsed) === normalizedDateKey
    })
    .sort((left, right) => {
      const leftDate = parse_Event_DateTime(left.date, left.time || "00:00")
      const rightDate = parse_Event_DateTime(right.date, right.time || "00:00")
      return (leftDate?.getTime() || 0) - (rightDate?.getTime() || 0)
    })
}

export function duplicate_Bundle(id, userId) {
  const bundle = get_Bundle_By_Id(id)
  if (!bundle) return null

  return add_Bundle({
    ...clone(bundle),
    id: undefined,
    user_id: userId ?? bundle.user_id,
    title: `${bundle.title || "Bundle"} Copy`,
    purchase_history: [],
    last_purchased_at: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}