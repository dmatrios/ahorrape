package pe.ahorrape.service;

import java.util.List;

import pe.ahorrape.dto.request.ActualizarCategoriaRequest;
import pe.ahorrape.dto.request.CrearCategoriaRequest;
import pe.ahorrape.dto.response.CategoriaResponse;

public interface CategoriaService {

    CategoriaResponse crearCategoria(CrearCategoriaRequest request);

    List<CategoriaResponse> listarCategorias();

    CategoriaResponse obtenerPorId(Long id);

    CategoriaResponse actualizarCategoria(Long id, ActualizarCategoriaRequest request);

    void desactivarCategoria(Long id);
}