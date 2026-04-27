/**
 * Tests for VoyageParametersSection Component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VoyageParametersSection } from "./VoyageParametersSection";
import type { VoyageType } from "../types";

describe("VoyageParametersSection", () => {
  const mockOnYearChange = jest.fn();
  const mockOnVoyageTypeChange = jest.fn();

  beforeEach(() => {
    mockOnYearChange.mockClear();
    mockOnVoyageTypeChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders voyage parameters section with title", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(screen.getByText("Voyage Parameters")).toBeInTheDocument();
    });

    it("renders year input with correct value", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      const yearInput = screen.getByLabelText(/year.*2025.*2050/i);
      expect(yearInput).toBeInTheDocument();
      expect(yearInput).toHaveValue(2030);
    });

    it("renders voyage type radio buttons", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(screen.getByLabelText(/intra-eu.*100%/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/international.*50%/i)).toBeInTheDocument();
    });

    it("checks correct voyage type radio button", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(screen.getByLabelText(/intra-eu.*100%/i)).toBeChecked();
      expect(screen.getByLabelText(/international.*50%/i)).not.toBeChecked();
    });

    it("checks international radio button when voyageType is international", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="international"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(screen.getByLabelText(/intra-eu.*100%/i)).not.toBeChecked();
      expect(screen.getByLabelText(/international.*50%/i)).toBeChecked();
    });

    it("renders help text for year input", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(
        screen.getByText(/enter a year between 2025 and 2050/i)
      ).toBeInTheDocument();
    });

    it("renders help text for voyage type", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(
        screen.getByText(/intra-eu voyages have 100% coverage/i)
      ).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onYearChange when year is changed", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      const yearInput = screen.getByLabelText(/year.*2025.*2050/i);
      fireEvent.change(yearInput, { target: { value: "2035" } });

      expect(mockOnYearChange).toHaveBeenCalledWith(2035);
    });

    it("handles empty year input", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      const yearInput = screen.getByLabelText(/year.*2025.*2050/i);
      fireEvent.change(yearInput, { target: { value: "" } });

      expect(mockOnYearChange).toHaveBeenCalledWith(2025);
    });

    it("handles invalid year input", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      const yearInput = screen.getByLabelText(/year.*2025.*2050/i);
      fireEvent.change(yearInput, { target: { value: "abc" } });

      expect(mockOnYearChange).toHaveBeenCalledWith(2025);
    });

    it("calls onVoyageTypeChange when intra-EU is selected", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="international"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      const intraEuRadio = screen.getByLabelText(/intra-eu.*100%/i);
      fireEvent.click(intraEuRadio);

      expect(mockOnVoyageTypeChange).toHaveBeenCalledWith("intra-EU");
    });

    it("calls onVoyageTypeChange when international is selected", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      const internationalRadio = screen.getByLabelText(/international.*50%/i);
      fireEvent.click(internationalRadio);

      expect(mockOnVoyageTypeChange).toHaveBeenCalledWith("international");
    });
  });

  describe("Validation Errors", () => {
    it("displays year error", () => {
      const errors = { year: "Year must be between 2025 and 2050" };
      render(
        <VoyageParametersSection
          year={2020}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
          errors={errors}
        />
      );

      expect(screen.getByText("Year must be between 2025 and 2050")).toBeInTheDocument();
      expect(screen.getByLabelText(/year.*2025.*2050/i)).toHaveClass("input-error");
    });

    it("displays voyage type error", () => {
      const errors = { voyage_type: "Voyage type must be 'intra-EU' or 'international'" };
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
          errors={errors}
        />
      );

      expect(
        screen.getByText("Voyage type must be 'intra-EU' or 'international'")
      ).toBeInTheDocument();
    });

    it("sets aria-invalid when there is a year error", () => {
      const errors = { year: "Year must be between 2025 and 2050" };
      render(
        <VoyageParametersSection
          year={2020}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
          errors={errors}
        />
      );

      expect(screen.getByLabelText(/year.*2025.*2050/i)).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-invalid when there is a voyage type error", () => {
      const errors = { voyage_type: "Voyage type must be 'intra-EU' or 'international'" };
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
          errors={errors}
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      radioButtons.forEach((radio) => {
        expect(radio).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for inputs", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(screen.getByLabelText(/year.*2025.*2050/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/intra-eu.*100%/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/international.*50%/i)).toBeInTheDocument();
    });

    it("uses fieldset and legend for radio group", () => {
      render(
        <VoyageParametersSection
          year={2030}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
        />
      );

      expect(screen.getByRole("group", { name: /voyage type/i })).toBeInTheDocument();
    });

    it("associates error messages with inputs using aria-describedby", () => {
      const errors = { year: "Year must be between 2025 and 2050" };
      render(
        <VoyageParametersSection
          year={2020}
          voyageType="intra-EU"
          onYearChange={mockOnYearChange}
          onVoyageTypeChange={mockOnVoyageTypeChange}
          errors={errors}
        />
      );

      const input = screen.getByLabelText(/year.*2025.*2050/i);
      const errorId = input.getAttribute("aria-describedby");
      expect(errorId).toBe("year-error");
      expect(screen.getByText("Year must be between 2025 and 2050")).toHaveAttribute("id", "year-error");
    });
  });
});
