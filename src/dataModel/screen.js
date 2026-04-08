export class Screen {
  constructor({
    id,
    venue_request_id,
    name,
    location,
    size,
    direction,
    x,
    y,
    width,
    height,
    rotation,
    type,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.venue_request_id = venue_request_id ?? null
    this.name = name ?? "Screen"
    this.location = location ?? ""
    this.size = size ?? ""
    this.direction = direction ?? "north"
    this.x = Number(x ?? 0)
    this.y = Number(y ?? 0)
    this.width = Number(width ?? 6)
    this.height = Number(height ?? 1.2)
    this.rotation = Number(rotation ?? 0)
    this.type = type ?? "screen"
  }
}

export const SCREEN_LIST = []

export function get_All_Screens() {
  return SCREEN_LIST
}

export function get_Screen_By_Id(id) {
  return SCREEN_LIST.find(screen => screen.id === id) || null
}

export function get_Screen_By_Location(location) {
  return SCREEN_LIST.find(screen => screen.location === location) || null
}

export function add_Screen(screen) {
  SCREEN_LIST.push(screen)
  return screen
}

export function update_Screen(idOrLocation, updatedScreenData) {
  let screenIndex = SCREEN_LIST.findIndex(
    screen => screen.id === idOrLocation || screen.location === idOrLocation
  )

  if (screenIndex !== -1) {
    SCREEN_LIST[screenIndex] = {
      ...SCREEN_LIST[screenIndex],
      ...updatedScreenData,
    }
    return SCREEN_LIST[screenIndex]
  }

  return null
}

export function delete_Screen(idOrLocation) {
  let screenIndex = SCREEN_LIST.findIndex(
    screen => screen.id === idOrLocation || screen.location === idOrLocation
  )

  if (screenIndex !== -1) {
    let deletedScreen = SCREEN_LIST[screenIndex]
    SCREEN_LIST.splice(screenIndex, 1)
    return deletedScreen
  }

  return null
}

export function delete_All_Screens() {
  SCREEN_LIST.length = 0
  return SCREEN_LIST
}

export function get_Screen_Count() {
  return SCREEN_LIST.length
}

export function get_Screens_By_Location_Area(area) {
  return SCREEN_LIST.filter(screen => String(screen.location).includes(area))
}

export function get_Screens_By_Venue_Request_Id(venue_request_id) {
  return SCREEN_LIST.filter(screen => screen.venue_request_id === venue_request_id)
}