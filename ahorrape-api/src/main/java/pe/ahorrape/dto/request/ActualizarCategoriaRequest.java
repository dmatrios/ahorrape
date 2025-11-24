package pe.ahorrape.dto.request;

import pe.ahorrape.model.TipoCategoria;


public record ActualizarCategoriaRequest(
        String nombre,
        String descripcion,
        TipoCategoria tipoCategoria
) {}