import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import SearchInput from "@features/search-phrases/ui/SearchInput";

/**
 * Helper robusto para obtener el input independientemente del rol.
 */
function getInput(): HTMLInputElement {
  const bySearch = screen.queryByRole("searchbox");
  if (bySearch) return bySearch as HTMLInputElement;

  const byTextbox = screen.queryByRole("textbox");
  if (byTextbox) return byTextbox as HTMLInputElement;

  throw new Error("Search input not found");
}

describe("features/search-phrases/ui/SearchInput", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("onChange", () => {
    it("emite onChange inmediatamente mientras el usuario tipea", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<SearchInput onChange={onChange} debounceMs={300} />);
      const input = getInput();
      await user.type(input, "hola");

      // onChange
      expect(onChange).toHaveBeenCalled();

      // Verificar que se llamó 4 veces
      expect(onChange).toHaveBeenCalledTimes(4);

      // Verificar las llamadas en orden
      expect(onChange).toHaveBeenNthCalledWith(1, "h");
      expect(onChange).toHaveBeenNthCalledWith(2, "ho");
      expect(onChange).toHaveBeenNthCalledWith(3, "hol");
      expect(onChange).toHaveBeenNthCalledWith(4, "hola");
    });

    it("actualiza el valor del input inmediatamente", async () => {
      const user = userEvent.setup();
      render(<SearchInput debounceMs={300} />);
      const input = getInput();
      expect(input).toHaveValue("");
      await user.type(input, "test");
      expect(input).toHaveValue("test");
    });
  });

  describe("onDebouncedChange", () => {
    it("no emite onDebouncedChange antes del debounce", async () => {
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SearchInput onDebouncedChange={onDebouncedChange} debounceMs={300} />
      );
      const input = getInput();
      await user.type(input, "test");

      // Inmediatamente después de tipear, no debe haberse llamado
      expect(onDebouncedChange).not.toHaveBeenCalled();
    });

    it("emite onDebouncedChange solo después de debounceMs de inactividad", async () => {
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SearchInput onDebouncedChange={onDebouncedChange} debounceMs={300} />
      );
      const input = getInput();
      await user.type(input, "sol");

      // Inmediatamente después no debe haberse llamado
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Esperar el debounce
      await waitFor(
        () => {
          expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
      expect(onDebouncedChange).toHaveBeenCalledWith("sol");
    });

    it("reinicia el temporizador si el usuario sigue tipeando", async () => {
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SearchInput onDebouncedChange={onDebouncedChange} debounceMs={300} />
      );
      const input = getInput();
      await user.type(input, "s");

      // Esperar 200ms
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Tipear "o"
      await user.type(input, "o");

      // Esperar otros 200ms
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Esperar a que se complete el debounce desde la última tecla
      await waitFor(
        () => {
          expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
      expect(onDebouncedChange).toHaveBeenCalledWith("so");
    });

    it("emite múltiples veces si hay pausas entre el tipeo", async () => {
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SearchInput onDebouncedChange={onDebouncedChange} debounceMs={200} />
      );
      const input = getInput();
      await user.type(input, "hola");
      await waitFor(
        () => {
          expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        },
        { timeout: 400 }
      );
      expect(onDebouncedChange).toHaveBeenCalledWith("hola");
      await user.type(input, " mundo");
      await waitFor(
        () => {
          expect(onDebouncedChange).toHaveBeenCalledTimes(2);
        },
        { timeout: 400 }
      );
      expect(onDebouncedChange).toHaveBeenNthCalledWith(2, "hola mundo");
    });
  });

  describe("Comportamiento combinado", () => {
    it("puede manejar onChange y onDebouncedChange simultáneamente", async () => {
      const onChange = vi.fn();
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SearchInput
          onChange={onChange}
          onDebouncedChange={onDebouncedChange}
          debounceMs={300}
        />
      );
      const input = getInput();
      await user.type(input, "test");

      // onChange se llama inmediatamente por cada tecla
      expect(onChange).toHaveBeenCalledTimes(4);

      // onDebouncedChange no se ha llamado aún
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Esperar el debounce
      await waitFor(
        () => {
          expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
      expect(onDebouncedChange).toHaveBeenCalledWith("test");

      // onChange sigue en 4 llamadas
      expect(onChange).toHaveBeenCalledTimes(4);
    });
  });

  describe("Componente controlado vs no controlado", () => {
    it("funciona como componente controlado con prop value", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const { rerender } = render(
        <SearchInput value="inicial" onChange={onChange} />
      );
      const input = getInput();
      expect(input).toHaveValue("inicial");

      // Tipear notifica pero no cambia el valor hasta que el padre re-renderice
      await user.type(input, "x");

      expect(onChange).toHaveBeenCalledWith("inicialx");

      // El valor sigue siendo "inicial" porque es controlado
      expect(input).toHaveValue("inicial");

      // Simular actualización del padre
      rerender(<SearchInput value="inicialx" onChange={onChange} />);

      expect(input).toHaveValue("inicialx");
    });

    it("funciona como componente no controlado con defaultValue", async () => {
      const user = userEvent.setup();
      render(<SearchInput defaultValue="inicio" />);
      const input = getInput();
      expect(input).toHaveValue("inicio");

      // El componente maneja su propio estado
      await user.type(input, "x");
      expect(input).toHaveValue("iniciox");
    });
  });

  describe("Props adicionales", () => {
    it("aplica autoFocus cuando se especifica", () => {
      render(<SearchInput autoFocus />);
      const input = getInput();
      expect(document.activeElement).toBe(input);
    });

    it("usa debounceMs por defecto si no se especifica", async () => {
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      render(<SearchInput onDebouncedChange={onDebouncedChange} />);
      const input = getInput();
      await user.type(input, "test");

      // Debe usar algún valor por defecto
      await waitFor(
        () => {
          expect(onDebouncedChange).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Limpieza y cleanup", () => {
    it("limpia el temporizador al desmontar el componente", async () => {
      const onDebouncedChange = vi.fn();
      const user = userEvent.setup();
      const { unmount } = render(
        <SearchInput onDebouncedChange={onDebouncedChange} debounceMs={300} />
      );
      const input = getInput();
      await user.type(input, "test");

      // Desmontar antes del debounce
      unmount();

      // Esperar más del debounce
      await new Promise((resolve) => setTimeout(resolve, 400));

      // No debe haberse llamado porque el componente se desmontó
      expect(onDebouncedChange).not.toHaveBeenCalled();
    });
  });
});
