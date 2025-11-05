import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SearchInput from "@features/search-phrases/ui/SearchInput";

// Utilidad robusta para encontrar el input
function findInput() {
  const bySearch = screen.queryByRole("searchbox", { name: /buscar/i });
  if (bySearch) return bySearch as HTMLInputElement;
  return screen.getByRole("textbox", { name: /buscar/i }) as HTMLInputElement;
}

describe("features/search-phrases/SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("debe invocar onDebouncedChange una sola vez tras 300ms de inactividad", async () => {
    const onDebouncedChange = vi.fn();

    render(<SearchInput onDebouncedChange={onDebouncedChange} />);

    const input = findInput();

    // Simular escritura
    act(() => {
      fireEvent.change(input, { target: { value: "hol" } });
    });

    // Verificar que no se ha llamado aún
    expect(onDebouncedChange).not.toHaveBeenCalled();

    // Avanzar tiempo justo antes de los 300ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onDebouncedChange).not.toHaveBeenCalled();

    // Avanzar el último milisegundo para completar 300ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(onDebouncedChange).toHaveBeenCalledTimes(1);
    expect(onDebouncedChange).toHaveBeenCalledWith("hol");
  });

  it("Escape debe llamar a onChange('') y onDebouncedChange('') inmediatamente", async () => {
    const onChange = vi.fn();
    const onDebouncedChange = vi.fn();

    render(
      <SearchInput onChange={onChange} onDebouncedChange={onDebouncedChange} />
    );

    const input = findInput();

    // Escribir algo
    act(() => {
      fireEvent.change(input, { target: { value: "algo" } });
    });

    // Limpiar los mocks antes de la acción que queremos probar
    onChange.mockClear();
    onDebouncedChange.mockClear();

    // Presionar Escape
    act(() => {
      fireEvent.keyDown(input, { key: "Escape" });
    });

    // onChange debe recibir "" inmediatamente
    expect(onChange).toHaveBeenCalledWith("");

    // onDebouncedChange también debe emitir "" sin esperar debounce
    expect(onDebouncedChange).toHaveBeenCalledWith("");
  });

  it("Enter debe invocar onSubmit con el valor actual", async () => {
    const onSubmit = vi.fn();
    const onDebouncedChange = vi.fn();

    render(
      <SearchInput onSubmit={onSubmit} onDebouncedChange={onDebouncedChange} />
    );

    const input = findInput();

    // Escribir algo
    act(() => {
      fireEvent.change(input, { target: { value: "test" } });
    });

    // Presionar Enter
    act(() => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(onSubmit).toHaveBeenCalledWith("test");
    // Enter también debe llamar a onDebouncedChange inmediatamente
    expect(onDebouncedChange).toHaveBeenCalledWith("test");
  });

  it("debe funcionar en modo controlado", () => {
    const onChange = vi.fn();
    const TestComponent = () => {
      const [value, setValue] = React.useState("");

      return (
        <SearchInput
          value={value}
          onChange={(val) => {
            setValue(val);
            onChange(val);
          }}
        />
      );
    };

    render(<TestComponent />);

    const input = findInput();

    act(() => {
      fireEvent.change(input, { target: { value: "control" } });
    });

    expect(onChange).toHaveBeenCalledWith("control");
    expect(input.value).toBe("control");
  });

  it("debounce debe cancelarse con múltiples cambios rápidos", async () => {
    const onDebouncedChange = vi.fn();

    render(
      <SearchInput onDebouncedChange={onDebouncedChange} debounceMs={300} />
    );

    const input = findInput();

    // Primer cambio
    act(() => {
      fireEvent.change(input, { target: { value: "abc" } });
    });

    // Avanzar solo 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onDebouncedChange).not.toHaveBeenCalled();

    // Segundo cambio
    act(() => {
      fireEvent.change(input, { target: { value: "abcdef" } });
    });

    // Avanzar otros 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onDebouncedChange).not.toHaveBeenCalled();

    // Ahora completar el debounce
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    // Solo debe haberse llamado una vez con el último valor
    expect(onDebouncedChange).toHaveBeenCalledTimes(1);
    expect(onDebouncedChange).toHaveBeenCalledWith("abcdef");
  });

  it("debe funcionar en modo no controlado", async () => {
    const onDebouncedChange = vi.fn();

    render(
      <SearchInput
        defaultValue="inicial"
        onDebouncedChange={onDebouncedChange}
      />
    );

    const input = findInput();

    expect(input.value).toBe("inicial");

    act(() => {
      fireEvent.change(input, { target: { value: "nuevo" } });
    });

    expect(input.value).toBe("nuevo");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(onDebouncedChange).toHaveBeenCalledWith("nuevo");
  });

  it("onChange inmediato cuando debounceMs es 0", () => {
    const onChange = vi.fn();
    const onDebouncedChange = vi.fn();

    render(
      <SearchInput
        onChange={onChange}
        onDebouncedChange={onDebouncedChange}
        debounceMs={0}
      />
    );

    const input = findInput();

    act(() => {
      fireEvent.change(input, { target: { value: "test" } });
    });

    // Con debounceMs=0, onDebouncedChange debe ser llamado inmediatamente
    expect(onChange).toHaveBeenCalledWith("test");
    expect(onDebouncedChange).toHaveBeenCalledWith("test");
  });
});
