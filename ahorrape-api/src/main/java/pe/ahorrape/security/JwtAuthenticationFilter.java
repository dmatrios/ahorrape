package pe.ahorrape.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import pe.ahorrape.model.Usuario;
import pe.ahorrape.repository.UsuarioRepository;
import pe.ahorrape.util.JwtUtil;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String headerAuth = request.getHeader("Authorization");

        if (headerAuth == null || !headerAuth.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = headerAuth.substring(7);

        String email;
        try {
            email = jwtUtil.obtenerEmailDelToken(token);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authContext = SecurityContextHolder.getContext().getAuthentication();

        if (email != null && authContext == null) {

            Usuario usuario = usuarioRepository
                    .findByEmail(email)
                    .orElse(null);

            if (usuario != null && jwtUtil.esTokenValido(token, usuario)) {

                // 🧠 Leer rol desde los claims del token
                Claims claims = jwtUtil.obtenerClaims(token);
                String rolToken = claims.get("rol", String.class); // "ADMIN" o "USER"

                // fallback por si algún token viejo no tiene "rol"
                if (rolToken == null && usuario.getRol() != null) {
                    rolToken = usuario.getRol().name();
                }
                if (rolToken == null) {
                    rolToken = "USER";
                }

                // Spring Security espera "ROLE_ADMIN" o "ROLE_USER"
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_" + rolToken);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                usuario.getEmail(),          // principal
                                null,                        // credentials
                                List.of(authority)           // authorities
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
