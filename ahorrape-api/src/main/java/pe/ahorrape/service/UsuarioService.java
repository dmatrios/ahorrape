package pe.ahorrape.service;

import java.util.List;

import pe.ahorrape.dto.request.ActualizarPasswordRequest;
import pe.ahorrape.dto.request.ActualizarUsuarioRequest;
import pe.ahorrape.dto.request.RegistrarUsuarioRequest;
import pe.ahorrape.dto.response.EstadisticasUsuariosResponse;
import pe.ahorrape.dto.response.UsuarioResponse;
import pe.ahorrape.model.PlanUsuario;
import pe.ahorrape.model.RolUsuario;

public interface UsuarioService {

    UsuarioResponse registrarUsuario(RegistrarUsuarioRequest request);

    UsuarioResponse obtenerPorId(Long id);

    List<UsuarioResponse> listarUsuarios();

    UsuarioResponse actualizarUsuario(Long id, ActualizarUsuarioRequest request);

    void desactivarUsuario(Long id);

    void actualizarPassword(Long id, ActualizarPasswordRequest request);

    //Cambiar plan de usuario
    UsuarioResponse actualizarPlanUsuario(Long id, PlanUsuario nuevoPlan);

    //Cambiar rol de usuario
    UsuarioResponse actualizarRolUsuario(Long id, RolUsuario nuevoRol);

    //Estadisticas
    EstadisticasUsuariosResponse obtenerEstadisticasUsuarios();
}
