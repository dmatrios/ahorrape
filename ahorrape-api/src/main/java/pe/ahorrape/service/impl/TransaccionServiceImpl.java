package pe.ahorrape.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pe.ahorrape.dto.request.ActualizarTransaccionRequest;
import pe.ahorrape.dto.request.CrearTransaccionRequest;
import pe.ahorrape.dto.response.HistorialTransaccionesResponse;
import pe.ahorrape.dto.response.TransaccionResponse;
import pe.ahorrape.exception.RecursoNoEncontradoException;
import pe.ahorrape.model.Categoria;
import pe.ahorrape.model.TipoCategoria;
import pe.ahorrape.model.TipoTransaccion;
import pe.ahorrape.model.Transaccion;
import pe.ahorrape.model.Usuario;
import pe.ahorrape.repository.CategoriaRepository;
import pe.ahorrape.repository.TransaccionRepository;
import pe.ahorrape.repository.UsuarioRepository;
import pe.ahorrape.service.TransaccionService;

@Service
@RequiredArgsConstructor
public class TransaccionServiceImpl implements TransaccionService {

    private final TransaccionRepository transaccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    // ------------------------------------------------------------
    // CREAR TRANSACCIÓN
    // ------------------------------------------------------------
    @Override
    public TransaccionResponse crearTransaccion(CrearTransaccionRequest request) {

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + request.getUsuarioId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoría no encontrada con id: " + request.getCategoriaId()));

        TipoTransaccion tipo;
        try {
            tipo = TipoTransaccion.valueOf(request.getTipo().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Tipo de transacción inválido. Debe ser INGRESO o GASTO.");
        }

        // *** VALIDACIÓN DE CATEGORÍA VS TIPO DE TRANSACCIÓN ***
        validarCategoriaParaTipoTransaccion(categoria, tipo);

        LocalDateTime ahora = LocalDateTime.now();

        Transaccion transaccion = Transaccion.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipo(tipo)
                .monto(request.getMonto())
                .fecha(request.getFecha())
                .descripcion(request.getDescripcion())
                .activa(true)
                .creadoEn(ahora)
                .actualizadoEn(ahora)
                .build();

        transaccionRepository.save(transaccion);

        return mapearATransaccionResponse(transaccion);
    }

    // ------------------------------------------------------------
    // OBTENER POR ID
    // ------------------------------------------------------------
    @Override
    public TransaccionResponse obtenerPorId(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Transacción no encontrada con id: " + id));

        return mapearATransaccionResponse(transaccion);
    }

    // ------------------------------------------------------------
    // LISTAR POR USUARIO
    // ------------------------------------------------------------
    @Override
    public List<TransaccionResponse> listarPorUsuario(Long usuarioId) {
        return transaccionRepository.findByUsuarioIdAndActivaTrue(usuarioId)
                .stream()
                .map(this::mapearATransaccionResponse)
                .toList();
    }

    // ------------------------------------------------------------
    // LISTAR POR RANGO DE FECHAS
    // ------------------------------------------------------------
    @Override
    public List<TransaccionResponse> listarPorUsuarioYRangoFechas(Long usuarioId,
                                                                  LocalDate fechaInicio,
                                                                  LocalDate fechaFin) {
        return transaccionRepository
                .findByUsuarioIdAndFechaBetweenAndActivaTrue(usuarioId, fechaInicio, fechaFin)
                .stream()
                .map(this::mapearATransaccionResponse)
                .toList();
    }

    // ------------------------------------------------------------
    // ACTUALIZAR TRANSACCIÓN
    // ------------------------------------------------------------
    @Override
    public TransaccionResponse actualizarTransaccion(Long id,
                                                     ActualizarTransaccionRequest request) {

        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Transacción no encontrada con id: " + id));

        // Si cambia categoría
        if (request.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Categoría no encontrada con id: " + request.getCategoriaId()));

            // validar categoría con el tipo actual
            validarCategoriaParaTipoTransaccion(categoria, transaccion.getTipo());

            transaccion.setCategoria(categoria);
        }

        // Si cambia tipo
        if (request.getTipo() != null && !request.getTipo().isBlank()) {
            try {
                TipoTransaccion nuevoTipo = TipoTransaccion.valueOf(request.getTipo().toUpperCase());

                // validar usando la categoría actual
                validarCategoriaParaTipoTransaccion(transaccion.getCategoria(), nuevoTipo);

                transaccion.setTipo(nuevoTipo);

            } catch (IllegalArgumentException ex) {
                throw new RuntimeException("Tipo de transacción inválido. Debe ser INGRESO o GASTO.");
            }
        }

        if (request.getMonto() != null) {
            transaccion.setMonto(request.getMonto());
        }

        if (request.getFecha() != null) {
            transaccion.setFecha(request.getFecha());
        }

        if (request.getDescripcion() != null) {
            transaccion.setDescripcion(request.getDescripcion());
        }

        transaccion.setActualizadoEn(LocalDateTime.now());
        transaccionRepository.save(transaccion);

        return mapearATransaccionResponse(transaccion);
    }

    // ------------------------------------------------------------
    // DESACTIVAR (SOFT DELETE)
    // ------------------------------------------------------------
    @Override
    public void desactivarTransaccion(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Transacción no encontrada con id: " + id));

        transaccion.setActiva(false);
        transaccion.setActualizadoEn(LocalDateTime.now());

        transaccionRepository.save(transaccion);
    }

    // ------------------------------------------------------------
    // MAPEAR RESPONSE
    // ------------------------------------------------------------
    private TransaccionResponse mapearATransaccionResponse(Transaccion t) {
        return new TransaccionResponse(
                t.getId(),
                t.getUsuario().getId(),
                t.getUsuario().getNombre(),
                t.getCategoria().getId(),
                t.getCategoria().getNombre(),
                t.getTipo().name(),
                t.getMonto(),
                t.getFecha(),
                t.getDescripcion()
        );
    }

    // ------------------------------------------------------------
    // VALIDACIÓN TIPO CATEGORÍA VS TIPO TRANSACCIÓN
    // ------------------------------------------------------------
    private void validarCategoriaParaTipoTransaccion(Categoria categoria,
                                                     TipoTransaccion tipoTransaccion) {

        TipoCategoria tipoCategoria = categoria.getTipoCategoria();

        switch (tipoTransaccion) {
            case INGRESO -> {
                if (!(tipoCategoria == TipoCategoria.INGRESO || tipoCategoria == TipoCategoria.AMBOS)) {
                    throw new RuntimeException("La categoría no es válida para una transacción de INGRESO");
                }
            }
            case GASTO -> {
                if (!(tipoCategoria == TipoCategoria.GASTO || tipoCategoria == TipoCategoria.AMBOS)) {
                    throw new RuntimeException("La categoría no es válida para una transacción de GASTO");
                }
            }
        }
    }

        // ------------------------------------------------------------
    // HISTORIAL AVANZADO (CON FILTROS + PAGINACIÓN)
    // ------------------------------------------------------------
    @Override
    public HistorialTransaccionesResponse obtenerHistorialUsuario(
            Long usuarioId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            TipoTransaccion tipo,
            Long categoriaId,
            int page,
            int size
    ) {
        // 1. Normalizar page y size (evitar negativos o cero)
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 20; // tamaño por defecto
        }

        // 2. Verificar que el usuario exista
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + usuarioId
                ));

        // (Opcional) Si tu entidad Usuario tiene 'activo', podrías validar aquí:
        // if (Boolean.FALSE.equals(usuario.getActivo())) { ... }

        // 3. Traer todas las transacciones activas del usuario en el rango [fechaInicio, fechaFin]
        List<Transaccion> transacciones = transaccionRepository
                .findByUsuarioIdAndFechaBetweenAndActivaTrue(usuarioId, fechaInicio, fechaFin);

        // 4. Aplicar filtros opcionales en memoria (tipo y categoría)
        List<Transaccion> filtradas = transacciones.stream()
                // filtro por tipo (si viene)
                .filter(t -> tipo == null || t.getTipo() == tipo)
                // filtro por categoría (si viene)
                .filter(t -> categoriaId == null || t.getCategoria().getId().equals(categoriaId))
                // ordenar por fecha DESC y luego por id DESC (para que lo más reciente salga primero)
                .sorted(Comparator
                        .comparing(Transaccion::getFecha).reversed()
                        .thenComparing(Transaccion::getId, Comparator.reverseOrder())
                )
                .collect(Collectors.toList());

        // 5. Paginación manual con subList
        int totalElements = filtradas.size();

        // calcular total de páginas (si no hay elementos, totalPages = 0)
        int totalPages = (totalElements == 0)
                ? 0
                : (int) Math.ceil((double) totalElements / size);

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        // si la página está fuera de rango pero hay elementos, devolvemos lista vacía
        List<Transaccion> paginaTransacciones;
        if (fromIndex >= totalElements || totalElements == 0) {
            paginaTransacciones = List.of();
        } else {
            paginaTransacciones = filtradas.subList(fromIndex, toIndex);
        }

        // 6. Mapear entidades a DTO TransaccionResponse
        List<TransaccionResponse> content = paginaTransacciones.stream()
                .map(this::mapearATransaccionResponse)
                .toList();

        // 7. Construir el DTO de respuesta con Lombok Builder
        return HistorialTransaccionesResponse.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(totalPages == 0 || page >= totalPages - 1)
                .build();
    }

}
