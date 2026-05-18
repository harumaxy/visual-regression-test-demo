import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Counter } from "./Counter";

const meta = {
  title: "Components/Counter",
  component: Counter,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IncrementTwice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const incrementBtn = canvas.getByRole("button", { name: "Increment" });

    await userEvent.click(incrementBtn);
    await userEvent.click(incrementBtn);

    await expect(canvas.getByTestId("count")).toHaveTextContent("Count: 2");
  },
};

export const Decrement: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const decrementBtn = canvas.getByRole("button", { name: "Decrement" });

    await userEvent.click(decrementBtn);

    await expect(canvas.getByTestId("count")).toHaveTextContent("Count: -1");
  },
};
