import type { RenderedSlot } from "@nuskin/gateway-contracts";
import { buildSlotElement } from "../utils/ids.js";

export function composeSlotsHtml(slots: RenderedSlot[]): string {
  return slots
    .map((slot) =>
      buildSlotElement({
        slotId: slot.slotId,
        mfeId: slot.mfeId,
        mode: slot.mode,
        loaderId: slot.loaderId,
        html: slot.html,
      }),
    )
    .join("\n");
}

export function composeHeadTags(slots: RenderedSlot[]): string {
  return slots
    .map((slot) => slot.head || "")
    .filter(Boolean)
    .join("\n");
}
