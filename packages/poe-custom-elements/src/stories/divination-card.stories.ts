import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import { Meta } from "@storybook/web-components";

import "../elements/divination-card/poe-divination-card";
import { CARD_SIZE_VARIANTS, DivinationCardElement } from "../elements/divination-card/poe-divination-card.js";

const meta: Meta<DivinationCardElement> = {
  title: "Components/poe-divination-card",
  component: "poe-divination-card",
  args: {
    name: "The Doctor",
    size: "medium",
    hrefPattern: "/card/{{slug}}",
  },
  argTypes: {
    size: {
      control: "select",
      options: CARD_SIZE_VARIANTS,
    },
    baseUrl: {
      control: "text",
    },
  },
  render: (args) =>
    html`<poe-divination-card
      href-pattern=${ifDefined(args.hrefPattern)}
      href=${ifDefined(args.href)}
      base-url=${ifDefined(args.baseUrl)}
      size=${ifDefined(args.size)}
      name=${ifDefined(args.name)}
    ></poe-divination-card>`,
};
export default meta;

export const Default = {};
