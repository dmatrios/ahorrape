package pe.ahorrape.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pe.ahorrape.dto.request.LoginRequest;
import pe.ahorrape.dto.response.LoginResponse;
import pe.ahorrape.dto.response.UsuarioResponse;
import pe.ahorrape.model.PlanUsuario;
import pe.ahorrape.model.RolUsuario;
import pe.ahorrape.model.Usuario;
import pe.ahorrape.repository.UsuarioRepository;
import pe.ahorrape.service.AuthService;
import pe.ahorrape.util.JwtUtil;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Buscar usuario por email
        Usuario usuario = usuarioRepository
                .findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Validar que esté activo
        Boolean activo = usuario.getActivo();
        if (activo != null && !activo) {
            throw new RuntimeException("Usuario desactivado");
        }

        // 3. Validar contraseña
        boolean passwordValida = passwordEncoder.matches(
                request.password(),
                usuario.getPassword()
        );

        if (!passwordValida) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // 4. Asegurar plan y rol (por si hay usuarios antiguos con null)
        PlanUsuario plan = usuario.getPlan() != null ? usuario.getPlan() : PlanUsuario.FREE;
        RolUsuario rol = usuario.getRol() != null ? usuario.getRol() : RolUsuario.USER;

        // 5. Generar token JWT
        String token = jwtUtil.generarToken(usuario);

        // 6. Armar DTO de usuario para el response
        UsuarioResponse usuarioResponse = new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                plan.name(),
                rol.name()
        );

        // 7. Devolver token + datos de usuario
        return new LoginResponse(token, usuarioResponse);
    }
}
