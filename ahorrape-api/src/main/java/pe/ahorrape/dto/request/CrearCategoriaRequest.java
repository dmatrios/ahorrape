package pe.ahorrape.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.ahorrape.model.TipoCategoria;

public record CrearCategoriaRequest(
        @NotBlank String nombre,
        String descripcion,
        @NotNull TipoCategoria tipoCategoria
) {}
