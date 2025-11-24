package pe.ahorrape.service;

import java.time.LocalDate;
import java.util.List;

import pe.ahorrape.dto.request.ActualizarTransaccionRequest;
import pe.ahorrape.dto.request.CrearTransaccionRequest;
import pe.ahorrape.dto.response.HistorialTransaccionesResponse;
import pe.ahorrape.dto.response.TransaccionResponse;
import pe.ahorrape.model.TipoTransaccion;

public interface TransaccionService {

    TransaccionResponse crearTransaccion(CrearTransaccionRequest request);

    TransaccionResponse obtenerPorId(Long id);

    List<TransaccionResponse> listarPorUsuario(Long usuarioId);

    List<TransaccionResponse> listarPorUsuarioYRangoFechas(Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin);

    TransaccionResponse actualizarTransaccion(Long id, ActualizarTransaccionRequest request);

    void desactivarTransaccion(Long id);

    HistorialTransaccionesResponse obtenerHistorialUsuario(
            Long usuarioId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            TipoTransaccion tipo,
            Long categoriaId,
            int page,
            int size
    );
}
