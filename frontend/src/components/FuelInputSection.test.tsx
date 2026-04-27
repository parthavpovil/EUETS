/**
 * Tests for FuelInputSection Component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FuelInputSection } from "./FuelInputSection";
import type { FuelInput } from "../types";

describe("FuelInputSection", () => {
  const mockFuelTypes = ["HFO", "LFO", "MGO", "LNG Otto (DF medium speed)"];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders fuel input section with title", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 0 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      expect(screen.getByText("Fuel Inputs")).toBeInTheDocument();
    });

    it("renders add fuel button", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 0 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      expect(screen.getByRole("button", { name: /add another fuel/i })).toBeInTheDocument();
    });

    it("renders fuel entries with correct fields", () => {
      const fuels: FuelInput[] = [
        { fuel_type: "HFO", mass_tonnes: 800 },
        { fuel_type: "MGO", mass_tonnes: 50 },
      ];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      // Check fuel type dropdowns
      const fuelTypeSelects = screen.getAllByLabelText(/fuel type/i);
      expect(fuelTypeSelects).toHaveLength(2);
      expect(fuelTypeSelects[0]).toHaveValue("HFO");
      expect(fuelTypeSelects[1]).toHaveValue("MGO");

      // Check mass inputs
      const massInputs = screen.getAllByLabelText(/mass.*tonnes/i);
      expect(massInputs).toHaveLength(2);
      expect(massInputs[0]).toHaveValue(800);
      expect(massInputs[1]).toHaveValue(50);
    });

    it("renders remove button for multiple fuel entries", () => {
      const fuels: FuelInput[] = [
        { fuel_type: "HFO", mass_tonnes: 800 },
        { fuel_type: "MGO", mass_tonnes: 50 },
      ];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const removeButtons = screen.getAllByRole("button", { name: /remove fuel entry/i });
      expect(removeButtons).toHaveLength(2);
    });

    it("does not render remove button for single fuel entry", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      expect(screen.queryByRole("button", { name: /remove fuel entry/i })).not.toBeInTheDocument();
    });

    it("renders fuel types including grouped variants in dropdown", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 0 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      // Core types are always present
      expect(screen.getByRole("option", { name: "HFO" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "LFO" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "MGO" })).toBeInTheDocument();
      // Alias sub-types are grouped under their parent
      expect(screen.getByRole("option", { name: /HSFO/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /VLSFO/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /LSMGO/i })).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onChange when fuel type is changed", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const select = screen.getByLabelText(/fuel type/i);
      fireEvent.change(select, { target: { value: "MGO" } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { fuel_type: "MGO", mass_tonnes: 800 },
      ]);
    });

    it("calls onChange when mass is changed", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const input = screen.getByLabelText(/mass.*tonnes/i);
      fireEvent.change(input, { target: { value: "1000" } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { fuel_type: "HFO", mass_tonnes: 1000 },
      ]);
    });

    it("handles empty mass input", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const input = screen.getByLabelText(/mass.*tonnes/i);
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { fuel_type: "HFO", mass_tonnes: 0 },
      ]);
    });

    it("handles invalid mass input", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const input = screen.getByLabelText(/mass.*tonnes/i);
      fireEvent.change(input, { target: { value: "abc" } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { fuel_type: "HFO", mass_tonnes: 0 },
      ]);
    });

    it("adds new fuel entry when add button is clicked", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const addButton = screen.getByRole("button", { name: /add another fuel/i });
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { fuel_type: "HFO", mass_tonnes: 800 },
        { fuel_type: "HFO", mass_tonnes: 0 },
      ]);
    });

    it("removes fuel entry when remove button is clicked", () => {
      const fuels: FuelInput[] = [
        { fuel_type: "HFO", mass_tonnes: 800 },
        { fuel_type: "MGO", mass_tonnes: 50 },
      ];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      const removeButtons = screen.getAllByRole("button", { name: /remove fuel entry/i });
      fireEvent.click(removeButtons[1]);

      expect(mockOnChange).toHaveBeenCalledWith([
        { fuel_type: "HFO", mass_tonnes: 800 },
      ]);
    });

    it("does not remove last fuel entry", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      // No remove button should be present
      expect(screen.queryByRole("button", { name: /remove fuel entry/i })).not.toBeInTheDocument();
    });
  });

  describe("Validation Errors", () => {
    it("displays fuel type error", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      const errors = { "fuels.0.fuel_type": "Invalid fuel type" };
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
          errors={errors}
        />
      );

      expect(screen.getByText("Invalid fuel type")).toBeInTheDocument();
      expect(screen.getByLabelText(/fuel type/i)).toHaveClass("input-error");
    });

    it("displays mass error", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: -100 }];
      const errors = { "fuels.0.mass_tonnes": "Fuel mass cannot be negative" };
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
          errors={errors}
        />
      );

      expect(screen.getByText("Fuel mass cannot be negative")).toBeInTheDocument();
      expect(screen.getByLabelText(/mass.*tonnes/i)).toHaveClass("input-error");
    });

    it("displays general fuels error", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 0 }];
      const errors = { fuels: "At least one fuel must have mass greater than zero" };
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
          errors={errors}
        />
      );

      expect(
        screen.getByText("At least one fuel must have mass greater than zero")
      ).toBeInTheDocument();
    });

    it("displays multiple errors for different fuel entries", () => {
      const fuels: FuelInput[] = [
        { fuel_type: "HFO", mass_tonnes: -100 },
        { fuel_type: "MGO", mass_tonnes: -50 },
      ];
      const errors = {
        "fuels.0.mass_tonnes": "Fuel mass cannot be negative",
        "fuels.1.mass_tonnes": "Fuel mass cannot be negative",
      };
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
          errors={errors}
        />
      );

      const errorMessages = screen.getAllByText("Fuel mass cannot be negative");
      expect(errorMessages).toHaveLength(2);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for inputs", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: 800 }];
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
        />
      );

      expect(screen.getByLabelText(/fuel type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mass.*tonnes/i)).toBeInTheDocument();
    });

    it("sets aria-invalid when there are errors", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: -100 }];
      const errors = { "fuels.0.mass_tonnes": "Fuel mass cannot be negative" };
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
          errors={errors}
        />
      );

      expect(screen.getByLabelText(/mass.*tonnes/i)).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error messages with inputs using aria-describedby", () => {
      const fuels: FuelInput[] = [{ fuel_type: "HFO", mass_tonnes: -100 }];
      const errors = { "fuels.0.mass_tonnes": "Fuel mass cannot be negative" };
      render(
        <FuelInputSection
          fuels={fuels}
          onChange={mockOnChange}
          fuelTypes={mockFuelTypes}
          errors={errors}
        />
      );

      const input = screen.getByLabelText(/mass.*tonnes/i);
      const errorId = input.getAttribute("aria-describedby");
      expect(errorId).toBeTruthy();
      expect(screen.getByText("Fuel mass cannot be negative")).toHaveAttribute("id", errorId);
    });
  });
});
