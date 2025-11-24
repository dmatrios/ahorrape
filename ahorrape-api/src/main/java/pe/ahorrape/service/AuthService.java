package pe.ahorrape.service;

import pe.ahorrape.dto.request.LoginRequest;
import pe.ahorrape.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}
