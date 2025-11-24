package pe.ahorrape.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.ahorrape.model.PlanUsuario;
import pe.ahorrape.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    long countByActivoTrue();
    long countByActivoFalse();
    long countByPlan(PlanUsuario plan);
}
