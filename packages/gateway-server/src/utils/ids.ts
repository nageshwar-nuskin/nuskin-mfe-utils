export function buildLoaderId(options: {
  index?: number;
  mfeId: string;
}): string {
  const index =
    Number.isInteger(options.index) && (options.index as number) >= 0
      ? options.index
      : 0;
  return `mfe-loader-${index}-${options.mfeId}`;
}

export function buildSlotElement(options: {
  slotId: string;
  mfeId: string;
  mode: string;
  loaderId: string;
  html: string;
}): string {
  const { slotId, mfeId, mode, loaderId, html } = options;
  return [
    `<div`,
    `id="mfe-slot-${slotId}"`,
    `data-mfe-slot="${slotId}"`,
    `data-mfe-id="${mfeId}"`,
    `data-mfe-mode="${mode}"`,
    `data-mfe-loader-id="${loaderId}"`,
    `>`,
    html,
    `</div>`,
  ].join(" ");
}
