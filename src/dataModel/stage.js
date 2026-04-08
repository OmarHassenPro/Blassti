export class Stage {
  constructor({
    id,
    venue_request_id,
    name,
    x,
    y,
    width,
    height,
    rotation,
    location,
    size,
    shape,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.venue_request_id = venue_request_id ?? null
    this.name = name ?? "Stage"
    this.x = Number(x ?? 0)
    this.y = Number(y ?? 0)
    this.width = Number(width ?? 8)
    this.height = Number(height ?? 3)
    this.rotation = Number(rotation ?? 0)
    this.location = location ?? ""
    this.size = size ?? ""
    this.shape = shape ?? "rectangle"
  }
}

export const STAGE_LIST = []

export function get_All_Stages() {
  return STAGE_LIST
}

export function get_Stage_By_Id(id) {
  return STAGE_LIST.find(stage => stage.id === id) || null
}

export function add_Stage(stage) {
  STAGE_LIST.push(stage)
  return stage
}

export function update_Stage(id, updatedStageData) {
  const index = STAGE_LIST.findIndex(stage => stage.id === id)

  if (index !== -1) {
    STAGE_LIST[index] = {
      ...STAGE_LIST[index],
      ...updatedStageData,
    }
    return STAGE_LIST[index]
  }

  return null
}

export function delete_Stage(id) {
  const index = STAGE_LIST.findIndex(stage => stage.id === id)

  if (index !== -1) {
    const deletedStage = STAGE_LIST[index]
    STAGE_LIST.splice(index, 1)
    return deletedStage
  }

  return null
}