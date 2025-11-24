package pe.ahorrape.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    //Por ahora texto plano
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false)
    private LocalDateTime creadoEn;
    
    @Column(nullable = false)
    private LocalDateTime actualizadoEn;

    // Plan del usuario (FREE, PRO, MASTER_DEL_AHORRO)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanUsuario plan;

    //  Rol del usuario (USER, ADMIN)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;
}
