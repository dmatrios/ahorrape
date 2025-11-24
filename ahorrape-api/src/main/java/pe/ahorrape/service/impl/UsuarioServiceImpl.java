package pe.ahorrape.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pe.ahorrape.dto.request.ActualizarPasswordRequest;
import pe.ahorrape.dto.request.ActualizarUsuarioRequest;
import pe.ahorrape.dto.request.RegistrarUsuarioRequest;
import pe.ahorrape.dto.response.EstadisticasUsuariosResponse;
import pe.ahorrape.dto.response.UsuarioResponse;
import pe.ahorrape.exception.RecursoNoEncontradoException;
import pe.ahorrape.model.PlanUsuario;
import pe.ahorrape.model.RolUsuario;
import pe.ahorrape.model.Usuario;
import pe.ahorrape.repository.UsuarioRepository;
import pe.ahorrape.service.UsuarioService;
@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UsuarioResponse registrarUsuario(RegistrarUsuarioRequest request) {

        usuarioRepository.findByEmail(request.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("Ya existe un usuario registrado con ese email.");
                });

        LocalDateTime ahora = LocalDateTime.now();

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Ya encriptada
                .activo(true)
                .creadoEn(ahora)
                .actualizadoEn(ahora)
                .plan(PlanUsuario.FREE)
                .rol(RolUsuario.USER)
                .build();

        usuarioRepository.save(usuario);

        return mapearAUsuarioResponse(usuario);
    }

    @Override
    public UsuarioResponse obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()
                        -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id)
                );

        return mapearAUsuarioResponse(usuario);
    }

    @Override
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::mapearAUsuarioResponse)
                .toList();
    }

    @Override
    public UsuarioResponse actualizarUsuario(Long id, ActualizarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()
                        -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id)
                );

        // Actualizar nombre si vino y no está en blanco
        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            usuario.setNombre(request.getNombre());
        }

        // Actualizar email si vino y no está en blanco
        if (request.getEmail() != null && !request.getEmail().isBlank()) {

            // Si cambió el email, validamos que no lo use otro usuario
            if (!request.getEmail().equalsIgnoreCase(usuario.getEmail())) {
                usuarioRepository.findByEmail(request.getEmail())
                        .ifPresent(u -> {
                            // Si el email pertenece a otro usuario distinto
                            if (!u.getId().equals(id)) {
                                throw new RuntimeException("Ya existe otro usuario con ese email.");
                            }
                        });

                usuario.setEmail(request.getEmail());
            }
        }

        usuario.setActualizadoEn(LocalDateTime.now());

        usuarioRepository.save(usuario);

        return mapearAUsuarioResponse(usuario);
    }

    @Override
    public void desactivarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()
                        -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id)
                );

        usuario.setActivo(false);
        usuario.setActualizadoEn(LocalDateTime.now());

        usuarioRepository.save(usuario);
    }

    @Override
    public void actualizarPassword(Long id, ActualizarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()
                        -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id)
                );

        // Si se maneja activo como Boolean, esto es más seguro:
        if (usuario.getActivo() != null && !usuario.getActivo()) {
            throw new RuntimeException("El usuario está inactivo.");
        }

        boolean passwordActualCorrecta = passwordEncoder.matches(
                request.getPasswordActual(),
                usuario.getPassword()
        );

        if (!passwordActualCorrecta) {
            throw new RuntimeException("La contraseña actual no es correcta.");
        }

        usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
        usuario.setActualizadoEn(LocalDateTime.now());

        usuarioRepository.save(usuario);
    }

    private UsuarioResponse mapearAUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getPlan().name(),
                usuario.getRol().name()
        );
    }

    @Override
    public UsuarioResponse actualizarPlanUsuario(Long id, PlanUsuario nuevoPlan) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()
                        -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id)
                );

        usuario.setPlan(nuevoPlan);
        usuario.setActualizadoEn(LocalDateTime.now());

        usuarioRepository.save(usuario);

        return mapearAUsuarioResponse(usuario);
    }

    @Override
    public UsuarioResponse actualizarRolUsuario(Long id, RolUsuario nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()
                        -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id)
                );

        usuario.setRol(nuevoRol);
        usuario.setActualizadoEn(LocalDateTime.now());

        usuarioRepository.save(usuario);

        return mapearAUsuarioResponse(usuario);
    }

        @Override
    public EstadisticasUsuariosResponse obtenerEstadisticasUsuarios() {

        long totalUsuarios = usuarioRepository.count();
        long totalActivos = usuarioRepository.countByActivoTrue();
        long totalInactivos = usuarioRepository.countByActivoFalse();

        long totalFree = usuarioRepository.countByPlan(PlanUsuario.FREE);
        long totalPro = usuarioRepository.countByPlan(PlanUsuario.PRO);
        long totalMaster = usuarioRepository.countByPlan(PlanUsuario.MASTER_DEL_AHORRO);

        return EstadisticasUsuariosResponse.builder()
                .totalUsuarios(totalUsuarios)
                .totalActivos(totalActivos)
                .totalInactivos(totalInactivos)
                .totalFree(totalFree)
                .totalPro(totalPro)
                .totalMasterDelAhorro(totalMaster)
                .build();
    }

}
