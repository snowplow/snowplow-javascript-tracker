const iglu = 'iglu:com.vimeo/';
const jsonschema = '/jsonschema/1-0-0';
export const VimeoSchema = {
  // iglu:com.vimeo/meta/jsonschema/1-0-0
  META: iglu + 'meta' + jsonschema,

  // iglu:com.vimeo/cue_point_event/jsonschema/1-0-0
  CUEPOINT: iglu + 'cue_point_event' + jsonschema,

  // iglu:com.vimeo/chapter_change_event/jsonschema/1-0-0
  CHAPTER_CHANGE: iglu + 'chapter_change_event' + jsonschema,

  // iglu:com.vimeo/text_track_change_event/jsonschema/1-0-0
  TEXT_TRACK_CHANGE: iglu + 'text_track_change_event' + jsonschema,

  // iglu:com.vimeo/interactive_hotspot_click_event/jsonschema/1-0-0
  HOTSPOT_CLICK: iglu + 'interactive_hotspot_click_event' + jsonschema,

  // iglu:com.vimeo/interactive_overlay_click_event/jsonschema/1-0-0
  OVERLAY_CLICK: iglu + 'interactive_overlay_panel_click_event' + jsonschema,

  // iglu:com.vimeo/interaction/jsonschema/1-0-0
  // context schema for HOTSPOT_CLICK and OVERLAY_CLICK
  INTERACTION: iglu + 'interaction' + jsonschema,
};
