export class Audio_Source {
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
    this.name = name ?? "Audio Source"
    this.location = location ?? ""
    this.size = size ?? ""
    this.direction = direction ?? "north"
    this.x = Number(x ?? 0)
    this.y = Number(y ?? 0)
    this.width = Number(width ?? 1.5)
    this.height = Number(height ?? 1.5)
    this.rotation = Number(rotation ?? 0)
    this.type = type ?? "audio"
  }
}

export const AUDIO_SOURCE_LIST = []

export function get_All_Audio_Sources() {
  return AUDIO_SOURCE_LIST
}

export function get_Audio_Source_By_Id(id) {
  return AUDIO_SOURCE_LIST.find(source => source.id === id) || null
}

export function get_Audio_Source_By_Location(location) {
  return AUDIO_SOURCE_LIST.find(source => source.location === location) || null
}

export function add_Audio_Source(audioSource) {
  AUDIO_SOURCE_LIST.push(audioSource)
  return audioSource
}

export function update_Audio_Source(idOrLocation, updatedAudioSourceData) {
  let audioSourceIndex = AUDIO_SOURCE_LIST.findIndex(
    source => source.id === idOrLocation || source.location === idOrLocation
  )

  if (audioSourceIndex !== -1) {
    AUDIO_SOURCE_LIST[audioSourceIndex] = {
      ...AUDIO_SOURCE_LIST[audioSourceIndex],
      ...updatedAudioSourceData,
    }
    return AUDIO_SOURCE_LIST[audioSourceIndex]
  }

  return null
}

export function delete_Audio_Source(idOrLocation) {
  let audioSourceIndex = AUDIO_SOURCE_LIST.findIndex(
    source => source.id === idOrLocation || source.location === idOrLocation
  )

  if (audioSourceIndex !== -1) {
    let deletedAudioSource = AUDIO_SOURCE_LIST[audioSourceIndex]
    AUDIO_SOURCE_LIST.splice(audioSourceIndex, 1)
    return deletedAudioSource
  }

  return null
}

export function delete_All_Audio_Sources() {
  AUDIO_SOURCE_LIST.length = 0
  return AUDIO_SOURCE_LIST
}

export function get_Audio_Source_Count() {
  return AUDIO_SOURCE_LIST.length
}

export function get_Audio_Sources_By_Location_Area(area) {
  return AUDIO_SOURCE_LIST.filter(source => String(source.location).includes(area))
}

export function get_Audio_Sources_By_Venue_Request_Id(venue_request_id) {
  return AUDIO_SOURCE_LIST.filter(source => source.venue_request_id === venue_request_id)
}