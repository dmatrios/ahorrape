package pe.ahorrape.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;   // 👈 IMPORTANTE
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import pe.ahorrape.dto.request.ActualizarPasswordRequest;
import pe.ahorrape.dto.request.ActualizarUsuarioRequest;
import pe.ahorrape.dto.request.RegistrarUsuarioRequest;
import pe.ahorrape.dto.response.EstadisticasUsuariosResponse;
import pe.ahorrape.dto.response.UsuarioResponse;
import pe.ahorrape.model.PlanUsuario;
import pe.ahorrape.model.RolUsuario;
import pe.ahorrape.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Registro: público
    @PostMapping
    public UsuarioResponse registrar(@Valid @RequestBody RegistrarUsuarioRequest request) {
        return usuarioService.registrarUsuario(request);
    }

    // Obtener un usuario por id (podría usarse tanto por el mismo usuario como por admin)
    @GetMapping("/{id}")
    public UsuarioResponse obtenerPorId(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id);
    }

    // Listar todos los usuarios – modo ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listarUsuarios();
    }

    // Actualizar datos básicos (nombre/email) – podrías luego limitarlo al propio usuario
    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody ActualizarUsuarioRequest request) {
        return usuarioService.actualizarUsuario(id, request);
    }

    // Desactivar usuario – muy probablemente solo ADMIN, si quieres puedes protegerlo también
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void desactivar(@PathVariable Long id) {
        usuarioService.desactivarUsuario(id);
    }

    // Cambiar contraseña – lo normal es que lo haga el propio usuario
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> actualizarPassword(@PathVariable Long id,
                                                   @Valid @RequestBody ActualizarPasswordRequest request) {
        usuarioService.actualizarPassword(id, request);
        return ResponseEntity.noContent().build(); // 204
    }

    // ------------------------------------------------------------
    // CAMBIAR PLAN DE USUARIO (solo ADMIN)
    // Ejemplos:
    // PUT /api/usuarios/1/plan?plan=PRO
    // PUT /api/usuarios/1/plan?plan=MASTER_DEL_AHORRO
    // ------------------------------------------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/plan")
    public UsuarioResponse actualizarPlan(
            @PathVariable Long id,
            @RequestParam("plan") String plan
    ) {
        PlanUsuario nuevoPlan;
        try {
            nuevoPlan = PlanUsuario.valueOf(plan.toUpperCase()); // FREE, PRO, MASTER_DEL_AHORRO
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Plan inválido. Debe ser FREE, PRO o MASTER_DEL_AHORRO.");
        }

        return usuarioService.actualizarPlanUsuario(id, nuevoPlan);
    }

    // ------------------------------------------------------------
    // CAMBIAR ROL DE USUARIO (solo ADMIN)
    // Ejemplos:
    // PUT /api/usuarios/1/rol?rol=ADMIN
    // PUT /api/usuarios/1/rol?rol=USER
    // ------------------------------------------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/rol")
    public UsuarioResponse actualizarRol(
            @PathVariable Long id,
            @RequestParam("rol") String rol
    ) {
        RolUsuario nuevoRol;
        try {
            nuevoRol = RolUsuario.valueOf(rol.toUpperCase()); // USER, ADMIN
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Rol inválido. Debe ser USER o ADMIN.");
        }

        return usuarioService.actualizarRolUsuario(id, nuevoRol);
    }

    // ------------------------------------------------------------
    // ESTADÍSTICAS DE USUARIOS (solo ADMIN)
    // GET /api/usuarios/estadisticas
    // ------------------------------------------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/estadisticas")
    public EstadisticasUsuariosResponse obtenerEstadisticas() {
        return usuarioService.obtenerEstadisticasUsuarios();
    }
}
