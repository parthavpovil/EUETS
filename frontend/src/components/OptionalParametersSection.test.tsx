/**
 * Tests for OptionalParametersSection Component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OptionalParametersSection } from "./OptionalParametersSection";

describe("OptionalParametersSection", () => {
  const mockOnWindRewardFactorChange = jest.fn();
  const mockOnEurToUsdChange = jest.fn();

  beforeEach(() => {
    mockOnWindRewardFactorChange.mockClear();
    mockOnEurToUsdChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders optional parameters section with title", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      expect(screen.getByText("Optional Parameters")).toBeInTheDocument();
    });

    it("is collapsed by default", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      expect(screen.queryByLabelText(/wind reward factor/i)).not.toBeInTheDocument();
    });

    it("expands when header is clicked", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      expect(screen.getByLabelText(/wind reward factor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/eur to usd/i)).toBeInTheDocument();
    });

    it("collapses when header is clicked again", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header); // Expand
      fireEvent.click(header); // Collapse

      expect(screen.queryByLabelText(/wind reward factor/i)).not.toBeInTheDocument();
    });

    it("renders all input fields with correct values when expanded", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={0.97}
          eurToUsd={1.15}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      expect(screen.getByLabelText(/wind reward factor/i)).toHaveValue(0.97);
      expect(screen.getByLabelText(/eur to usd/i)).toHaveValue(1.15);
    });
  });

  describe("User Interactions", () => {
    it("calls onWindRewardFactorChange when wind reward factor is changed", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      const input = screen.getByLabelText(/wind reward factor/i);
      fireEvent.change(input, { target: { value: "0.95" } });

      expect(mockOnWindRewardFactorChange).toHaveBeenCalledWith(0.95);
    });

    it("calls onEurToUsdChange when EUR to USD rate is changed", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      const input = screen.getByLabelText(/eur to usd/i);
      fireEvent.change(input, { target: { value: "1.2" } });

      expect(mockOnEurToUsdChange).toHaveBeenCalledWith(1.2);
    });

    it("handles empty wind reward factor input", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      const input = screen.getByLabelText(/wind reward factor/i);
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnWindRewardFactorChange).toHaveBeenCalledWith(1.0);
    });

    it("handles empty EUR to USD input", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      const input = screen.getByLabelText(/eur to usd/i);
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnEurToUsdChange).toHaveBeenCalledWith(1.1);
    });

    it("handles invalid input values", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      const windInput = screen.getByLabelText(/wind reward factor/i);
      fireEvent.change(windInput, { target: { value: "abc" } });
      expect(mockOnWindRewardFactorChange).toHaveBeenCalledWith(1.0);

      const eurUsdInput = screen.getByLabelText(/eur to usd/i);
      fireEvent.change(eurUsdInput, { target: { value: "def" } });
      expect(mockOnEurToUsdChange).toHaveBeenCalledWith(1.1);
    });
  });

  describe("Validation Errors", () => {
    it("displays wind reward factor error", () => {
      const errors = { wind_reward_factor: "Wind reward factor must be between 0 and 1.0" };
      render(
        <OptionalParametersSection
          windRewardFactor={1.5}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
          errors={errors}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      expect(
        screen.getByText("Wind reward factor must be between 0 and 1.0")
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/wind reward factor/i)).toHaveClass("input-error");
    });

    it("displays EUR to USD error", () => {
      const errors = { eur_to_usd: "Exchange rate must be positive" };
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={0}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
          errors={errors}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      expect(screen.getByText("Exchange rate must be positive")).toBeInTheDocument();
      expect(screen.getByLabelText(/eur to usd/i)).toHaveClass("input-error");
    });

    it("hides help text when error is present", () => {
      const errors = { wind_reward_factor: "Wind reward factor must be between 0 and 1.0" };
      render(
        <OptionalParametersSection
          windRewardFactor={1.5}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
          errors={errors}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      expect(screen.queryByText(/range: 0 – 1\.0/i)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-expanded attribute", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      expect(header).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(header);
      expect(header).toHaveAttribute("aria-expanded", "true");
    });

    it("has proper aria-controls attribute", () => {
      render(
        <OptionalParametersSection
          windRewardFactor={1.0}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      expect(header).toHaveAttribute("aria-controls", "optional-parameters-content");
    });

    it("sets aria-invalid when there are errors", () => {
      const errors = { wind_reward_factor: "Wind reward factor must be between 0 and 1.0" };
      render(
        <OptionalParametersSection
          windRewardFactor={1.5}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
          errors={errors}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      expect(screen.getByLabelText(/wind reward factor/i)).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error messages with inputs using aria-describedby", () => {
      const errors = { wind_reward_factor: "Wind reward factor must be between 0 and 1.0" };
      render(
        <OptionalParametersSection
          windRewardFactor={1.5}
          eurToUsd={1.1}
          onWindRewardFactorChange={mockOnWindRewardFactorChange}
          onEurToUsdChange={mockOnEurToUsdChange}
          errors={errors}
        />
      );

      const header = screen.getByRole("button", { name: /optional parameters/i });
      fireEvent.click(header);

      const input = screen.getByLabelText(/wind reward factor/i);
      const errorId = input.getAttribute("aria-describedby");
      expect(errorId).toBe("wind-reward-error");
    });
  });
});
