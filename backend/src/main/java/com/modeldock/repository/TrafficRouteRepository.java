package com.modeldock.repository;

import com.modeldock.model.TrafficRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrafficRouteRepository extends JpaRepository<TrafficRoute, Long> {
    Optional<TrafficRoute> findByModelName(String modelName);
}
