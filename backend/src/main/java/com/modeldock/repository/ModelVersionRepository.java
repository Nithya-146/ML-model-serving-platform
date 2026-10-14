package com.modeldock.repository;

import com.modeldock.model.ModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelVersionRepository extends JpaRepository<ModelVersion, Long> {
    List<ModelVersion> findByModelIdOrderByCreatedAtDesc(Long modelId);

    @Query("SELECT mv FROM ModelVersion mv WHERE mv.model.name = :modelName ORDER BY mv.createdAt DESC")
    List<ModelVersion> findByModelName(@Param("modelName") String modelName);

    @Query("SELECT mv FROM ModelVersion mv WHERE mv.model.name = :modelName AND mv.version = :version")
    Optional<ModelVersion> findByModelNameAndVersion(@Param("modelName") String modelName, @Param("version") String version);
}
