package pe.ahorrape.util;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import pe.ahorrape.model.Usuario;

@Component
public class JwtUtil {

    private final String secret = "nzGwtQLjmUM5GPPLmfzJnR+h7QQe6nBX7ZSKj9tGp/U=";
    private final long expirationMs = 1000 * 60 * 60 * 4;

    public String generarToken(Usuario usuario) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("usuarioId", usuario.getId())
                .claim("rol", usuario.getRol().name())      // 👈 NUEVO
                .claim("plan", usuario.getPlan().name())    // 👈 NUEVO (útil en el front si quieres)
                .setIssuedAt(ahora)
                .setExpiration(expiracion)
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public String obtenerEmailDelToken(String token) {
        return obtenerClaims(token).getSubject();
    }

    // 👇 NUEVO: por si quieres leer el rol directo
    public String obtenerRolDelToken(String token) {
        return obtenerClaims(token).get("rol", String.class);
    }

    public boolean esTokenValido(String token, Usuario usuario) {
        String emailDelToken = obtenerEmailDelToken(token);
        return emailDelToken.equalsIgnoreCase(usuario.getEmail()) && !estaExpirado(token);
    }

    private boolean estaExpirado(String token) {
        Date expiracion = obtenerClaims(token).getExpiration();
        return expiracion.before(new Date());
    }

    // 👈 CAMBIO: lo hacemos public para poder usarlo en el filtro
    public Claims obtenerClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}
