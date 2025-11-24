package pe.ahorrape.dto.response;

public record LoginResponse(
    String token,
    UsuarioResponse usuario
) {

}
