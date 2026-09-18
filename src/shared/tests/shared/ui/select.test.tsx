import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

describe("select", () => {
  it("opens options and reports the selected value", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="fire">
        <SelectTrigger aria-label="Type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fire">Fire</SelectItem>
          <SelectItem value="water">Water</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole("combobox", { name: "Type" }));
    await user.click(screen.getByRole("option", { name: "Water" }));

    expect(screen.getByRole("combobox", { name: "Type" })).toHaveTextContent("Water");
  });
});
