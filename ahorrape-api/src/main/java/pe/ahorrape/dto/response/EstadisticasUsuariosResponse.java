package pe.ahorrape.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class EstadisticasUsuariosResponse {

    private long totalUsuarios;
    private long totalActivos;
    private long totalInactivos;

    private long totalFree;
    private long totalPro;
    private long totalMasterDelAhorro;
}