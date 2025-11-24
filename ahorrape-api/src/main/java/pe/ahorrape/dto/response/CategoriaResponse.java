package pe.ahorrape.dto.response;


import pe.ahorrape.model.TipoCategoria;

public record CategoriaResponse(
        Long id,
        String nombre,
        String descripcion,
        Boolean activa,
        TipoCategoria tipoCategoria
) {}