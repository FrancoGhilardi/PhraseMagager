import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPhraseForm from "@features/add-phrase/ui/AddPhraseForm";

const addPhraseMock = vi.fn();

vi.mock("@features/phrases/usecases/usePhrasesFacade", () => {
  return {
    usePhrasesFacade: () => ({
      addPhrase: addPhraseMock,
      dismissError: vi.fn(),
      flags: {
        isLoading: false,
        isLoaded: false,
        isIdle: true,
        isError: false,
      },
      error: null,
    }),
  };
});

describe("features/add-phrase/AddPhraseForm", () => {
  beforeEach(() => {
    addPhraseMock.mockReset();
  });

  it("debe agregar una frase válida, limpiar el input y mantener el foco", async () => {
    const user = userEvent.setup();
    addPhraseMock.mockReturnValue({
      id: "1",
      text: "Hola mundo",
      createdAt: 1700000000000,
    });

    render(<AddPhraseForm />);

    const input = screen.getByRole("textbox", { name: /nueva frase/i });

    await user.type(input, "  Hola mundo  ");
    await user.type(input, "{enter}");

    expect(addPhraseMock).toHaveBeenCalledTimes(1);
    const [[rawArg]] = addPhraseMock.mock.calls;
    expect(String(rawArg).trim()).toBe("Hola mundo");

    expect(input).toHaveValue("");
    expect(document.activeElement).toBe(input);
  });

  it("no debe invocar addPhrase si el input está vacío o solo espacios", async () => {
    const user = userEvent.setup();
    addPhraseMock.mockReturnValue(null);

    render(<AddPhraseForm />);
    const input = screen.getByRole("textbox", { name: /nueva frase/i });

    await user.type(input, "   ");
    await user.type(input, "{enter}");

    expect(addPhraseMock).not.toHaveBeenCalled();
  });
});
