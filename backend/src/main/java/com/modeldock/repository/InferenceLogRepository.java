package com.modeldock.repository;

import com.modeldock.model.InferenceLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface InferenceLogRepository extends JpaRepository<InferenceLog, Long> {

    Page<InferenceLog> findAllByOrderByTimestampDesc(Pageable pageable);

    Page<InferenceLog> findByModelNameOrderByTimestampDesc(String modelName, Pageable pageable);

    @Query("SELECT l FROM InferenceLog l WHERE " +
           "(:modelName IS NULL OR l.modelName = :modelName) AND " +
           "(:version IS NULL OR l.version = :version) AND " +
           "(:statusCode IS NULL OR l.statusCode = :statusCode) " +
           "ORDER BY l.timestamp DESC")
    Page<InferenceLog> findWithFilters(@Param("modelName") String modelName,
                                      @Param("version") String version,
                                      @Param("statusCode") Integer statusCode,
                                      Pageable pageable);

    List<InferenceLog> findTop100ByOrderByTimestampDesc();

    List<InferenceLog> findByTimestampAfter(Instant timestamp);

    @Query("SELECT COUNT(l) FROM InferenceLog l WHERE l.timestamp >= :since")
    Long countRequestsSince(@Param("since") Instant since);

    @Query("SELECT COUNT(l) FROM InferenceLog l WHERE l.timestamp >= :since AND l.statusCode >= 400")
    Long countErrorsSince(@Param("since") Instant since);
}
